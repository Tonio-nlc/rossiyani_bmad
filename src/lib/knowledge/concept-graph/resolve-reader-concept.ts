import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import type { TLinguisticProfile } from "@/types/knowledge";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import {
  matchConceptSignals,
  type TConceptMatchProfile,
} from "./match-signals";
import { getConceptById } from "./registry";
import { resolveConceptGraph } from "./resolve-concept-graph";

export interface TReaderConceptResolution {
  conceptId: string;
  conceptSlug: string;
  conceptTitle: string;
  conceptSummary: string;
}

export function resolveReaderConcept(input: {
  profile: TConceptMatchProfile;
  analysis: TLinguisticAnalysis;
  encounter: TVocabularyContextEncounter | null;
}): TReaderConceptResolution {
  const graph = resolveConceptGraph(
    input.profile,
    input.analysis,
    input.encounter,
  );

  return {
    conceptId: graph.primary.id,
    conceptSlug: graph.primary.slug,
    conceptTitle: graph.primary.title,
    conceptSummary: graph.primary.summary,
  };
}

/**
 * Résolution Reader : POS / aspect / morphologie viennent de linguistic_knowledge
 * (via le profil), jamais d'heuristiques sur la prose LLM.
 */
export function resolveReaderConceptFromSignals(input: {
  partOfSpeech?: string | null;
  aspect?: string | null;
  gender?: string | null;
  movementType?: string | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  explanation?: string;
  suffixExplanation?: string;
  surface?: string;
  lemma?: string;
}): TReaderConceptResolution | null {
  const morph = input.morphology;
  const aspect = input.aspect ?? morph?.aspect ?? null;

  const profile: TConceptMatchProfile = {
    partOfSpeech: input.partOfSpeech ?? null,
    aspect,
    gender: input.gender ?? morph?.gender ?? null,
    movementType: input.movementType ?? morph?.movementType ?? null,
    morphology: {
      aspect,
      tense: morph?.tense ?? null,
      person: morph?.person ?? null,
      gender: morph?.gender ?? input.gender ?? null,
      preverbs: morph?.preverbs ?? [],
      caseParadigm: morph?.caseParadigm ?? [],
      governedCases: morph?.governedCases ?? [],
      agreement: morph?.agreement ?? null,
      pronounType: morph?.pronounType ?? null,
      aspectPair: morph?.aspectPair ?? null,
    },
    paradigms: {
      cases: input.paradigms?.cases ?? [],
    },
    pedagogy: { concept: undefined },
  };

  const analysis: TLinguisticAnalysis = {
    baseLemma: input.lemma ?? input.surface ?? "",
    surfaceForm: input.surface ?? null,
    partOfSpeech: input.partOfSpeech ?? null,
    suffix: null,
    roleLabel: null,
    sentence: null,
    morphSignals: [],
    alternativeForms: [],
    encounterExplanation: input.explanation ?? null,
    suffixExplanation: input.suffixExplanation ?? null,
  };

  const encounter = input.explanation
    ? ({
        surface: input.surface ?? "",
        sentence: "",
        explanation: input.explanation,
        suffix: "",
        suffixExplanation: input.suffixExplanation ?? "",
        functionalRole: "",
        functionColor: null,
        roleLabel: "",
      } as TVocabularyContextEncounter)
    : null;

  const signals = matchConceptSignals(profile, analysis, encounter);
  const best = signals[0];

  if (!best) {
    return null;
  }

  const concept = getConceptById(best.conceptId);

  if (!concept) {
    return null;
  }

  return {
    conceptId: concept.id,
    conceptSlug: concept.slug,
    conceptTitle: concept.title,
    conceptSummary: concept.summary,
  };
}
