/**
 * Compose et persiste le scénario d'enseignement à l'enregistrement d'un mot.
 * Principe = concept partagé (RC-025). Démonstration + bridge = ce lemme / cette forme.
 */

import { buildKnowledge } from "@/lib/knowledge/build-knowledge";
import { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
import { ensureKnowledgeExists } from "@/lib/knowledge/get-knowledge";
import { composeTeachingScenario } from "@/lib/knowledge/teaching-engine/compose-teaching-scenario";
import { validateTeachingScenario } from "@/lib/knowledge/teaching-engine/scenario-quality-rules";
import { resolveConceptGraph } from "@/lib/knowledge/concept-graph";
import { analyzeLinguisticContext } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { normalizeEncounterSurface } from "@/lib/knowledge/concept/build-hero-chips";
import {
  detectPrepositionGovernment,
  inferMorphologicalCaseFromParadigms,
} from "@/lib/knowledge/morphology/curated";
import { stripTrailingPunctuationForDisplay } from "@/lib/utils/russian";
import { getNaturalFunctionalRoleLabel } from "@/lib/utils/russian";
import { parseExplanationCachePayload } from "@/lib/vocabulary/parse-explanation-cache";
import { resolveDisplayLemma } from "@/lib/vocabulary/resolve-display-lemma";
import { extractTranslation } from "@/lib/vocabulary/extract-translation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TTeachingScenario } from "@/types/teaching-scenario";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

function toNullableString(value: string | null | undefined): string | null {
  if (!value || value === "unknown") {
    return null;
  }

  return value;
}

async function loadEncounterFromCache(
  explanationCacheId: string | null | undefined,
  lemmaId: string,
): Promise<{
  encounter: TVocabularyContextEncounter | null;
  lemmaStressed?: string;
  explanationFr?: string;
}> {
  const admin = createAdminClient();

  if (explanationCacheId) {
    const { data } = await admin
      .from("explanation_cache")
      .select(
        "explanation_fr, surface_word, sentence_example, functional_role, function_color",
      )
      .eq("id", explanationCacheId)
      .maybeSingle();

    if (data) {
      const payload = parseExplanationCachePayload(data.explanation_fr);

      return {
        encounter: payload?.explanation
          ? {
              surface: data.surface_word,
              sentence: data.sentence_example,
              explanation: payload.explanation,
              suffix: payload.suffix,
              suffixExplanation: payload.suffixExplanation,
              functionalRole: data.functional_role,
              functionColor: data.function_color,
              roleLabel: getNaturalFunctionalRoleLabel(data.functional_role),
            }
          : null,
        lemmaStressed: payload?.lemmaStressed,
        explanationFr: data.explanation_fr,
      };
    }
  }

  const { data } = await admin
    .from("explanation_cache")
    .select(
      "explanation_fr, surface_word, sentence_example, functional_role, function_color",
    )
    .eq("lemma_id", lemmaId)
    .order("usage_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return { encounter: null };
  }

  const payload = parseExplanationCachePayload(data.explanation_fr);

  return {
    encounter: payload?.explanation
      ? {
          surface: data.surface_word,
          sentence: data.sentence_example,
          explanation: payload.explanation,
          suffix: payload.suffix,
          suffixExplanation: payload.suffixExplanation,
          functionalRole: data.functional_role,
          functionColor: data.function_color,
          roleLabel: getNaturalFunctionalRoleLabel(data.functional_role),
        }
      : null,
    lemmaStressed: payload?.lemmaStressed,
    explanationFr: data.explanation_fr,
  };
}

/**
 * Bootstrap knowledge (coquille) + composition scénario + gate + persistance.
 * Ne throw jamais vers le client — log et continue.
 */
export async function prepareAndPersistWordTeachingScenario(input: {
  userVocabularyId: string;
  lemmaId: string;
  explanationCacheId?: string | null;
}): Promise<TTeachingScenario | null> {
  const admin = createAdminClient();

  try {
    const { data: lemmaRow, error: lemmaError } = await admin
      .from("lemmas")
      .select("form")
      .eq("id", input.lemmaId)
      .maybeSingle();

    if (lemmaError || !lemmaRow?.form) {
      console.warn(
        `[teaching-scenario] Lemme introuvable à l'enregistrement: ${input.lemmaId}`,
        lemmaError?.message,
      );
      return null;
    }

    // 1. Garantir linguistic_knowledge (coquille) — pas de LLM synchrone
    await ensureKnowledgeExists(input.lemmaId);

    // Enrichissement LLM en arrière-plan (ne bloque pas l'enregistrement)
    void buildKnowledge(input.lemmaId).catch((error) => {
      console.warn(
        `[teaching-scenario] Enrichissement async impossible pour ${input.lemmaId}`,
        error instanceof Error ? error.message : error,
      );
    });

    const knowledge = await ensureKnowledgeExists(input.lemmaId);
    const { encounter, lemmaStressed, explanationFr } =
      await loadEncounterFromCache(
        input.explanationCacheId,
        input.lemmaId,
      );

    const translation = extractTranslation(explanationFr) || "";
    const displayLemma = resolveDisplayLemma(lemmaRow.form, lemmaStressed);
    const built = buildLinguisticProfile(knowledge);

    const profile = {
      lemma: lemmaRow.form,
      displayLemma,
      translation,
      partOfSpeech: built.partOfSpeech,
      gender: built.gender,
      aspect: built.aspect,
      movementType: built.movementType,
      morphology: built.morphology,
      syntax: built.syntax,
      semantics: built.semantics,
      pedagogy: built.pedagogy,
      paradigms: built.paradigms,
      profile: built,
      government: built.syntax.government ?? [],
      register: toNullableString(built.semantics.register ?? knowledge.register),
      semanticCategory: toNullableString(
        built.semantics.semanticCategory ?? knowledge.semanticCategory,
      ),
      notes: toNullableString(built.pedagogy.takeaway ?? knowledge.notes),
      tags: built.pedagogy.relatedConcepts ?? knowledge.tags ?? [],
    };

    const analysis = analyzeLinguisticContext(
      profile,
      displayLemma,
      encounter,
    );
    const graph = resolveConceptGraph(profile, analysis, encounter);

    const encounteredForm =
      normalizeEncounterSurface(encounter) ??
      (encounter?.surface
        ? stripTrailingPunctuationForDisplay(encounter.surface)
        : null);

    const caseEntries = [
      ...(built.paradigms.cases ?? []),
      ...(built.morphology.caseParadigm ?? []),
    ];
    const morphologicalCase = encounteredForm
      ? inferMorphologicalCaseFromParadigms(encounteredForm, caseEntries)
      : null;
    const government =
      encounteredForm && encounter?.sentence
        ? detectPrepositionGovernment({
            surface: encounteredForm,
            sentence: encounter.sentence,
            morphologicalCase,
          })
        : null;

    // 2–3. Concept (principe) + démonstration composée pour CE lemme
    const scenario = composeTeachingScenario({
      concept: graph.primary,
      lemma: displayLemma || lemmaRow.form,
      encounteredForm,
      encounterExample: encounter?.sentence
        ? {
            sentence: encounter.sentence,
            note: encounter.explanation || undefined,
            surface: encounter.surface,
          }
        : null,
      nextConcept: graph.secondary[0]
        ? {
            id: graph.secondary[0].id,
            slug: graph.secondary[0].slug,
            title: graph.secondary[0].title,
          }
        : null,
      profile,
      illustrationHint: government
        ? {
            preposition: government.preposition,
            governedCase: government.governedCase,
          }
        : null,
    });

    // Gate : bloquer uniquement les formes d'un autre lemme (SCENARIO_FOREIGN_LEMMA_FORM).
    // Les autres issues qualité restent en warning — ne doivent pas empêcher la persistance.
    const report = validateTeachingScenario(scenario);
    const foreignLemmaErrors = report.issues.filter(
      (issue) =>
        issue.severity === "error" &&
        issue.code === "SCENARIO_FOREIGN_LEMMA_FORM",
    );

    if (foreignLemmaErrors.length > 0) {
      console.warn(
        `[teaching-scenario] Gate FOREIGN_LEMMA rejeté pour ${lemmaRow.form}`,
        foreignLemmaErrors,
      );
      return null;
    }

    if (!report.valid) {
      console.warn(
        `[teaching-scenario] Avertissements qualité pour ${lemmaRow.form} — scénario persisté quand même`,
        report.issues.filter((issue) => issue.severity === "error"),
      );
    }

    // 4. Persister sur le mot enregistré
    const { error: updateError } = await admin
      .from("user_vocabulary")
      .update({ teaching_scenario: scenario })
      .eq("id", input.userVocabularyId);

    if (updateError) {
      console.warn(
        `[teaching-scenario] Persistance impossible pour ${input.userVocabularyId}`,
        updateError.message,
      );
      return null;
    }

    return scenario;
  } catch (error) {
    console.warn(
      `[teaching-scenario] Échec composition à l'enregistrement (${input.lemmaId})`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export function parsePersistedTeachingScenario(
  value: unknown,
): TTeachingScenario | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TTeachingScenario>;

  if (
    typeof candidate.conceptId !== "string" ||
    typeof candidate.fact !== "string" ||
    !Array.isArray(candidate.contrast)
  ) {
    return null;
  }

  return candidate as TTeachingScenario;
}
