import type {
  TVocabularyContextEncounter,
  TVocabularyEntry,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";
import { buildKnowledge } from "@/lib/knowledge/build-knowledge";
import { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
import { deriveInstrumentRoleOverride } from "@/lib/knowledge/concept-graph";
import { ensureKnowledgeExists } from "@/lib/knowledge/get-knowledge";
import { isKnowledgeComplete } from "@/lib/knowledge/is-knowledge-complete";
import { composeConceptLesson } from "@/lib/knowledge/concept/compose-concept-lesson";
import { collectVocabularyExamples } from "@/lib/vocabulary/collect-vocabulary-examples";
import { extractTranslation } from "@/lib/vocabulary/extract-translation";
import { formatReviewLevel } from "@/lib/vocabulary/format-linguistic-labels";
import { parseExplanationCachePayload } from "@/lib/vocabulary/parse-explanation-cache";
import { parsePersistedTeachingScenario } from "@/lib/vocabulary/prepare-and-persist-word-scenario";
import { resolveDisplayLemma } from "@/lib/vocabulary/resolve-display-lemma";
import { getNaturalFunctionalRoleLabel } from "@/lib/utils/russian";
import { createPerfTimer } from "@/lib/utils/perf-timer";
import { createClient } from "@/lib/supabase/server";
import type { TLinguisticKnowledge } from "@/types/knowledge";

interface ExplanationCacheRelation {
  explanation_fr: string;
  surface_word: string;
  sentence_example: string;
  functional_role: string;
  function_color: string | null;
}

interface VocabularyEntryRow {
  id: string;
  lemma_id: string;
  saved_at: string;
  text_id: string | null;
  notes: string | null;
  teaching_scenario: unknown;
  lemmas: { form: string } | { form: string }[] | null;
  explanation_cache:
    | ExplanationCacheRelation
    | ExplanationCacheRelation[]
    | null;
  srs_reviews:
    | {
        repetitions: number;
        next_review_at: string;
        ease_factor: number;
        interval_days: number;
        last_review_at: string | null;
      }
    | {
        repetitions: number;
        next_review_at: string;
        ease_factor: number;
        interval_days: number;
        last_review_at: string | null;
      }[]
    | null;
}

function toNullableString(value: string | null | undefined): string | null {
  if (!value || value === "unknown") {
    return null;
  }

  return value;
}

function getExplanationCacheRelation(
  cacheRelation: VocabularyEntryRow["explanation_cache"],
): ExplanationCacheRelation | null {
  if (!cacheRelation) {
    return null;
  }

  return Array.isArray(cacheRelation) ? cacheRelation[0] ?? null : cacheRelation;
}

function buildVocabularyLinguisticProfile(
  lemma: string,
  displayLemma: string,
  translation: string,
  knowledge: TLinguisticKnowledge,
) {
  const profile = buildLinguisticProfile(knowledge);

  return {
    lemma,
    displayLemma,
    translation,
    partOfSpeech: profile.partOfSpeech,
    gender: profile.gender,
    aspect: profile.aspect,
    movementType: profile.movementType,
    morphology: profile.morphology,
    syntax: profile.syntax,
    semantics: profile.semantics,
    pedagogy: profile.pedagogy,
    paradigms: profile.paradigms,
    profile,
    government: profile.syntax.government ?? [],
    register: toNullableString(
      profile.semantics.register ?? knowledge.register,
    ),
    semanticCategory: toNullableString(
      profile.semantics.semanticCategory ?? knowledge.semanticCategory,
    ),
    notes: toNullableString(profile.pedagogy.takeaway ?? knowledge.notes),
    tags: profile.pedagogy.relatedConcepts ?? knowledge.tags ?? [],
  };
}

async function resolveTranslation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lemmaId: string,
  primaryExplanationFr: string | undefined,
): Promise<string> {
  const fromPrimary = extractTranslation(primaryExplanationFr);

  if (fromPrimary) {
    return fromPrimary;
  }

  const { data } = await supabase
    .from("explanation_cache")
    .select("explanation_fr")
    .eq("lemma_id", lemmaId)
    .order("usage_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  return extractTranslation(data?.explanation_fr);
}

async function resolveContextEncounter(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lemmaId: string,
  linkedCache: ExplanationCacheRelation | null,
) {
  const cacheRow =
    linkedCache ??
    (
      await supabase
        .from("explanation_cache")
        .select(
          "explanation_fr, surface_word, sentence_example, functional_role, function_color",
        )
        .eq("lemma_id", lemmaId)
        .order("usage_count", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data;

  if (!cacheRow) {
    return null;
  }

  const payload = parseExplanationCachePayload(cacheRow.explanation_fr);

  if (!payload?.explanation) {
    return null;
  }

  return {
    surface: cacheRow.surface_word,
    sentence: cacheRow.sentence_example,
    explanation: payload.explanation,
    suffix: payload.suffix,
    suffixExplanation: payload.suffixExplanation,
    functionalRole: cacheRow.functional_role,
    functionColor: cacheRow.function_color,
    roleLabel: getNaturalFunctionalRoleLabel(cacheRow.functional_role),
  };
}

/**
 * Applique le MÊME override "moyen/instrument" que le Reader/Explorer
 * (deriveInstrumentRoleOverride, dérivé du cas confirmé — jamais une devinette
 * LLM). `explanation_cache.functional_role/function_color` restent bruts (rôle
 * LLM d'origine, cf. orchestrator/index.ts) : sans cet override, la carte
 * "rencontre" du vocabulaire afficherait un rôle différent du Reader/Explorer
 * pour un même mot instrumental. Ne modifie que l'affichage — aucune structure
 * de scénario, aucun moteur.
 */
function applyInstrumentOverrideToEncounter(
  encounter: TVocabularyContextEncounter | null,
  profile: TVocabularyLinguisticProfile,
): TVocabularyContextEncounter | null {
  if (!encounter) {
    return encounter;
  }

  const override = deriveInstrumentRoleOverride({
    surface: encounter.surface,
    sentence: encounter.sentence,
    partOfSpeech: profile.partOfSpeech,
    paradigms: profile.paradigms,
    morphology: profile.morphology,
    functionalRole: encounter.functionalRole,
    explanation: encounter.explanation,
  });

  if (!override) {
    return encounter;
  }

  return {
    ...encounter,
    functionalRole: override.functionalRole,
    functionColor: override.functionColor,
    roleLabel: getNaturalFunctionalRoleLabel(override.functionalRole),
  };
}

function resolveLemmaStressed(
  linkedCache: ExplanationCacheRelation | null,
): string | undefined {
  if (!linkedCache) {
    return undefined;
  }

  return parseExplanationCachePayload(linkedCache.explanation_fr)?.lemmaStressed;
}

export async function getVocabularyEntry(
  userId: string,
  lemmaId: string,
): Promise<TVocabularyEntry | null> {
  const supabase = await createClient();
  const mark = createPerfTimer(`vocabulary-entry:${lemmaId}`);

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(
      `
      id,
      lemma_id,
      saved_at,
      text_id,
      notes,
      teaching_scenario,
      lemmas ( form ),
      explanation_cache (
        explanation_fr,
        surface_word,
        sentence_example,
        functional_role,
        function_color
      ),
      srs_reviews ( repetitions, next_review_at, ease_factor, interval_days, last_review_at )
    `,
    )
    .eq("user_id", userId)
    .eq("lemma_id", lemmaId)
    .maybeSingle();
  mark("select user_vocabulary (+ jointures)");

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as VocabularyEntryRow;
  const lemmaRelation = row.lemmas;
  const lemma = Array.isArray(lemmaRelation) ? lemmaRelation[0] : lemmaRelation;

  if (!lemma) {
    return null;
  }

  const linkedCache = getExplanationCacheRelation(row.explanation_cache);

  // RC-PERF — `buildKnowledge` appelle un LLM (génération structurée lourde,
  // ~10-12s mesurés) quand la fiche n'est pas encore complète. L'attendre ici
  // bloquait l'affichage de la fiche (10s au premier chargement après
  // sauvegarde). On affiche la coquille existante immédiatement (dégradée si
  // pas encore enrichie) et on ne déclenche l'enrichissement en arrière-plan
  // que s'il n'est pas déjà en cours (le flux de sauvegarde le lance déjà).
  const knowledge = await ensureKnowledgeExists(lemmaId);
  mark("ensureKnowledgeExists (lecture/coquille — pas de LLM)");

  if (!isKnowledgeComplete(knowledge)) {
    void buildKnowledge(lemmaId).catch((error) => {
      console.warn(
        `[getVocabularyEntry] Enrichissement async impossible pour ${lemmaId}`,
        error instanceof Error ? error.message : error,
      );
    });
  }

  const srsRelation = row.srs_reviews;
  const srsReview = Array.isArray(srsRelation) ? srsRelation[0] : srsRelation;
  const explanationFr = linkedCache?.explanation_fr;

  const [translation, examples, contextEncounter] = await Promise.all([
    resolveTranslation(supabase, lemmaId, explanationFr),
    collectVocabularyExamples(supabase, lemmaId, lemma.form).catch((error) => {
      console.warn(
        `[getVocabularyEntry] Exemples indisponibles pour ${lemmaId}`,
        error instanceof Error ? error.message : error,
      );
      return [] as Awaited<ReturnType<typeof collectVocabularyExamples>>;
    }),
    resolveContextEncounter(supabase, lemmaId, linkedCache),
  ]);
  mark("Promise.all (translation + examples + contextEncounter)");

  const displayLemma = resolveDisplayLemma(
    lemma.form,
    resolveLemmaStressed(linkedCache),
  );

  const linguisticProfile = buildVocabularyLinguisticProfile(
    lemma.form,
    displayLemma,
    translation,
    knowledge,
  );

  // Aligne le rôle affiché sur celui du Reader/Explorer (override "moyen"
  // dérivé du cas fiable) — sans quoi la carte "rencontre" pourrait afficher
  // le rôle LLM brut, incohérent avec les 2 autres surfaces.
  const encounterForDisplay = applyInstrumentOverrideToEncounter(
    contextEncounter,
    linguisticProfile,
  );

  const { lesson: conceptLesson, card: learningCard } = composeConceptLesson({
    profile: linguisticProfile,
    displayLemma,
    translation,
    encounter: encounterForDisplay,
    examples,
    persistedTeachingScenario: parsePersistedTeachingScenario(
      row.teaching_scenario,
    ),
  });
  mark("composeConceptLesson (déterministe, pas de LLM) + total");

  return {
    lemma: lemma.form,
    displayLemma,
    translation,
    linguisticProfile,
    learningCard,
    conceptLesson,
    contextEncounter: encounterForDisplay,
    linguisticData: {
      lemma: lemma.form,
      translation,
      pos: linguisticProfile.partOfSpeech,
      gender: linguisticProfile.gender,
      aspect: linguisticProfile.aspect,
      accent: displayLemma,
      addedAt: row.saved_at,
    },
    userVocabulary: {
      id: row.id,
      lemmaId: row.lemma_id,
      savedAt: row.saved_at,
      textId: row.text_id,
      notes: row.notes,
    },
    review: srsReview
      ? {
          nextReviewAt: srsReview.next_review_at,
          repetitions: srsReview.repetitions,
          currentLevel: formatReviewLevel(srsReview.repetitions),
          easeFactor: srsReview.ease_factor,
          intervalDays: srsReview.interval_days,
          lastReviewAt: srsReview.last_review_at,
        }
      : null,
    examples,
  };
}
