import type { TVocabularyEntry } from "@/types/vocabulary";
import { buildKnowledge } from "@/lib/knowledge/build-knowledge";
import { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
import { composeConceptLesson } from "@/lib/knowledge/concept/compose-concept-lesson";
import { collectVocabularyExamples } from "@/lib/vocabulary/collect-vocabulary-examples";
import { extractTranslation } from "@/lib/vocabulary/extract-translation";
import { formatReviewLevel } from "@/lib/vocabulary/format-linguistic-labels";
import { parseExplanationCachePayload } from "@/lib/vocabulary/parse-explanation-cache";
import { resolveDisplayLemma } from "@/lib/vocabulary/resolve-display-lemma";
import { getNaturalFunctionalRoleLabel } from "@/lib/utils/russian";
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

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(
      `
      id,
      lemma_id,
      saved_at,
      text_id,
      notes,
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
  const knowledge = await buildKnowledge(lemmaId);

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

  const { lesson: conceptLesson, card: learningCard } = composeConceptLesson({
    profile: linguisticProfile,
    displayLemma,
    translation,
    encounter: contextEncounter,
    examples,
  });

  return {
    lemma: lemma.form,
    displayLemma,
    translation,
    linguisticProfile,
    learningCard,
    conceptLesson,
    contextEncounter,
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
