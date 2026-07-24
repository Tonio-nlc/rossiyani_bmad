import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import {
  detectPrepositionGovernment,
  type TGovernedCase,
} from "@/lib/knowledge/morphology/curated";
import type { TLinguisticProfile } from "@/types/knowledge";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import { inferAnimacyFromCurated, inferMorphologicalCase } from "./case-concept-routing";
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
  /** Régence détectée — pour illustration alignée sur la rencontre. */
  prepositionGovernment?: {
    preposition: string;
    governedCase: string;
  } | null;
}

function readAnimacy(
  morph: TLinguisticProfile["morphology"] | null | undefined,
): "animate" | "inanimate" | null {
  const raw = morph?.animacy;

  if (raw === "animate" || raw === "inanimate") {
    return raw;
  }

  return null;
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
    prepositionGovernment: input.profile.prepositionGovernment ?? null,
  };
}

/**
 * Résolution Reader : POS / aspect / morphologie viennent de linguistic_knowledge
 * (via le profil), jamais d'heuristiques sur la prose LLM.
 * Régence : préposition immédiatement avant le mot + table curée.
 * Cas précis : table cas→concept (repli noun-declension).
 */
export function resolveReaderConceptFromSignals(input: {
  partOfSpeech?: string | null;
  aspect?: string | null;
  gender?: string | null;
  movementType?: string | null;
  animacy?: "animate" | "inanimate" | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  explanation?: string;
  suffixExplanation?: string;
  surface?: string;
  lemma?: string;
  functionalRole?: string | null;
  /** Phrase d'origine — requise pour détecter la préposition précédente. */
  sentence?: string | null;
}): TReaderConceptResolution | null {
  const morph = input.morphology;
  const aspect = input.aspect ?? morph?.aspect ?? null;

  const caseEntries = [
    ...(input.paradigms?.cases ?? []),
    ...(morph?.caseParadigm ?? []),
  ];

  const government =
    input.surface && input.sentence
      ? detectPrepositionGovernment({
          surface: input.surface,
          sentence: input.sentence,
          morphologicalCase: null,
        })
      : null;

  const morphologicalCase = input.surface
    ? inferMorphologicalCase({
        surface: input.surface,
        caseEntries,
        functionalRole: input.functionalRole,
        governmentCase: (government?.governedCase ?? null) as TGovernedCase | null,
        explanation: input.explanation ?? null,
      })
    : null;

  // Re-détecte la régence avec le cas connu (в/на sense-dependent).
  const governmentResolved =
    input.surface && input.sentence
      ? detectPrepositionGovernment({
          surface: input.surface,
          sentence: input.sentence,
          morphologicalCase:
            morphologicalCase && morphologicalCase !== "nominative"
              ? morphologicalCase
              : null,
        })
      : null;

  const animacy =
    input.animacy ??
    readAnimacy(morph) ??
    inferAnimacyFromCurated({
      surface: input.surface,
      lemma: input.lemma,
    });

  const profile: TConceptMatchProfile = {
    partOfSpeech: input.partOfSpeech ?? null,
    aspect,
    gender: input.gender ?? morph?.gender ?? null,
    movementType: input.movementType ?? morph?.movementType ?? null,
    animacy,
    morphologicalCase,
    functionalRole: input.functionalRole ?? null,
    prepositionGovernment: governmentResolved
      ? {
          preposition: governmentResolved.preposition,
          governedCase: governmentResolved.governedCase,
        }
      : null,
    morphology: {
      aspect,
      tense: morph?.tense ?? null,
      person: morph?.person ?? null,
      gender: morph?.gender ?? input.gender ?? null,
      animacy,
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
    sentence: input.sentence ?? null,
    morphSignals: [
      ...(governmentResolved
        ? [`régence:${governmentResolved.preposition}+${governmentResolved.governedCase}`]
        : []),
      ...(morphologicalCase ? [`cas:${morphologicalCase}`] : []),
    ],
    alternativeForms: [],
    encounterExplanation: input.explanation ?? null,
    suffixExplanation: input.suffixExplanation ?? null,
  };

  const encounter = input.explanation
    ? ({
        surface: input.surface ?? "",
        sentence: input.sentence ?? "",
        explanation: input.explanation,
        suffix: "",
        suffixExplanation: input.suffixExplanation ?? "",
        functionalRole: input.functionalRole ?? "",
        functionColor: null,
        roleLabel: "",
      } as TVocabularyContextEncounter)
    : null;

  // Même chemin que le graphe (hiérarchie déclarative + liens secondaires).
  const graph = resolveConceptGraph(profile, analysis, encounter);
  const concept = graph.primary;

  if (!concept?.id) {
    const signals = matchConceptSignals(profile, analysis, encounter);
    const best = signals[0];

    if (!best) {
      return null;
    }

    const fallback = getConceptById(best.conceptId);

    if (!fallback) {
      return null;
    }

    return {
      conceptId: fallback.id,
      conceptSlug: fallback.slug,
      conceptTitle: fallback.title,
      conceptSummary: fallback.summary,
      prepositionGovernment: profile.prepositionGovernment ?? null,
    };
  }

  return {
    conceptId: concept.id,
    conceptSlug: concept.slug,
    conceptTitle: concept.title,
    conceptSummary: concept.summary,
    prepositionGovernment: profile.prepositionGovernment ?? null,
  };
}
