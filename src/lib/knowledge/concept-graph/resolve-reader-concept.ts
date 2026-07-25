import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import {
  detectPrepositionGovernment,
  type TGovernedCase,
} from "@/lib/knowledge/morphology/curated";
import type { TLinguisticProfile } from "@/types/knowledge";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import {
  inferAnimacyFromCurated,
  inferMorphologicalCase,
  type TMorphologicalCase,
} from "./case-concept-routing";
import {
  matchConceptSignals,
  type TConceptMatchProfile,
} from "./match-signals";
import { getConceptById } from "./registry";
import { NO_CONCEPT_ID, resolveConceptGraph } from "./resolve-concept-graph";

export interface TReliableCaseDetection {
  /** null = cas non déterminé de façon fiable (pas de paradigme/curated/régence). */
  morphologicalCase: TMorphologicalCase | null;
  government: { preposition: string; governedCase: string } | null;
}

/**
 * Détecte le cas morphologique à partir de sources fiables uniquement :
 * paradigmes `linguistic_knowledge`, morphologie curée, ou régence
 * prépositionnelle déterministe. Jamais une prose LLM non sourcée.
 * Réutilisé par la résolution de concept ET par tout override de rôle
 * fonctionnel dérivé du cas (ex. instrumental → "moyen").
 */
export function detectReliableCase(input: {
  surface?: string | null;
  sentence?: string | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  functionalRole?: string | null;
  explanation?: string | null;
}): TReliableCaseDetection {
  const caseEntries = [
    ...(input.paradigms?.cases ?? []),
    ...(input.morphology?.caseParadigm ?? []),
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

  return {
    morphologicalCase,
    government: governmentResolved
      ? {
          preposition: governmentResolved.preposition,
          governedCase: governmentResolved.governedCase,
        }
      : null,
  };
}

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
}): TReaderConceptResolution | null {
  const graph = resolveConceptGraph(
    input.profile,
    input.analysis,
    input.encounter,
  );

  if (graph.primary.id === NO_CONCEPT_ID) {
    // POS invariable / pronom sans traitement dédié : dégradation propre,
    // pas de concept affiché plutôt qu'un concept faux.
    return null;
  }

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

  const { morphologicalCase, government: governmentResolved } = detectReliableCase({
    surface: input.surface,
    sentence: input.sentence,
    paradigms: input.paradigms,
    morphology: morph,
    functionalRole: input.functionalRole,
    explanation: input.explanation,
  });

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

  if (concept.id === NO_CONCEPT_ID) {
    // POS invariable (adverbe…) ou pronom sans traitement dédié : ne pas
    // afficher de concept plutôt qu'un concept d'une autre famille (RC).
    return null;
  }

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
