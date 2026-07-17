import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
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

export function resolveReaderConceptFromSignals(input: {
  partOfSpeech?: string | null;
  aspect?: string | null;
  explanation?: string;
  suffixExplanation?: string;
  surface?: string;
  lemma?: string;
}): TReaderConceptResolution | null {
  const profile: TConceptMatchProfile = {
    partOfSpeech: input.partOfSpeech ?? null,
    aspect: input.aspect ?? null,
    gender: null,
    movementType: null,
    morphology: {
      aspect: input.aspect ?? null,
      tense: null,
      person: null,
      gender: null,
      preverbs: [],
      caseParadigm: [],
      governedCases: [],
      agreement: null,
      pronounType: null,
      aspectPair: null,
    },
    paradigms: { cases: [] },
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
