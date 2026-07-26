/**
 * Hiérarchie DÉCLARATIVE de résolution de concept.
 *
 * Les scores de matchConceptSignals ne départagent QU'À L'INTÉRIEUR d'une famille.
 * Entre familles, l'ordre ci-dessous tranche — jamais un écart de 2–3 points.
 *
 * Voir docs/knowledge/concept-resolution-hierarchy.md
 */

import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { CURATED_MOTION } from "@/lib/knowledge/morphology/curated";
import type { TConceptSignalMatch } from "@/types/linguistic-concept";

import {
  resolveCaseConceptId,
  type TMorphologicalCase,
} from "./case-concept-routing";

/** Sous-ensemble du profil nécessaire à la hiérarchie (évite import circulaire). */
export interface THierarchyProfile {
  movementType?: string | null;
  morphologicalCase?: TMorphologicalCase | null;
  prepositionGovernment?: { preposition: string; governedCase: string } | null;
  functionalRole?: string | null;
  /**
   * true si le concept cible du cas existe dans le registry
   * (injecté par matchConceptSignals pour éviter un import circulaire).
   */
  caseConceptAvailable?: boolean;
}

/**
 * Familles pédagogiques — priorité décroissante (rang plus élevé = plus prioritaire).
 */
export type TConceptFamily =
  | "preposition-government"
  | "motion"
  | "specific-case"
  | "conjugation"
  | "agreement"
  | "pronoun"
  | "aspect"
  | "noun-umbrella"
  | "animacy"
  | "gender"
  | "other";

/** Rang déclaratif entre familles (pas un score de règle). */
export const FAMILY_PRIORITY: Record<TConceptFamily, number> = {
  "preposition-government": 100,
  motion: 90,
  "specific-case": 80,
  conjugation: 70,
  agreement: 65,
  pronoun: 60,
  aspect: 50,
  "noun-umbrella": 40,
  animacy: 35,
  gender: 30,
  other: 10,
};

/** Ordre intra-famille (plus haut = préféré). Les scores de règle affinent ensuite. */
const INTRA_FAMILY_ORDER: Record<string, number> = {
  "verbs-of-motion": 20,
  "verb-movement-prefixes": 10,
  "case-accusative": 20,
  "case-genitive": 20,
  "case-dative": 20,
  "case-instrumental": 20,
  "case-prepositional": 20,
  "case-nominative": 20,
  "noun-animacy": 5,
};

export const MOTION_CONCEPT_IDS = [
  "verbs-of-motion",
  "verb-movement-prefixes",
] as const;

export const ASPECT_CONCEPT_IDS = [
  "verb-perfective-aspect",
  "verb-imperfective-aspect",
  "aspect-pairs",
] as const;

export const SPECIFIC_CASE_CONCEPT_IDS = [
  "case-accusative",
  "case-genitive",
  "case-dative",
  "case-instrumental",
  "case-prepositional",
  "case-nominative",
] as const;

const ASPECT_SET = new Set<string>(ASPECT_CONCEPT_IDS);
const MOTION_SET = new Set<string>(MOTION_CONCEPT_IDS);
const SPECIFIC_CASE_SET = new Set<string>(SPECIFIC_CASE_CONCEPT_IDS);

export function familyOfConcept(conceptId: string): TConceptFamily {
  if (conceptId === "preposition-government") {
    return "preposition-government";
  }

  if (MOTION_SET.has(conceptId)) {
    return "motion";
  }

  if (SPECIFIC_CASE_SET.has(conceptId)) {
    return "specific-case";
  }

  if (conceptId === "noun-animacy") {
    return "animacy";
  }

  if (conceptId === "noun-declension") {
    return "noun-umbrella";
  }

  if (conceptId === "verb-present-conjugation" || conceptId === "verb-past-tense") {
    return "conjugation";
  }

  if (conceptId === "adjective-agreement") {
    return "agreement";
  }

  if (conceptId === "reflexive-possessive") {
    return "pronoun";
  }

  if (ASPECT_SET.has(conceptId)) {
    return "aspect";
  }

  if (conceptId === "noun-gender") {
    return "gender";
  }

  return "other";
}

function stripStress(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .normalize("NFC")
    .toLowerCase()
    .trim();
}

const CURATED_MOTION_LEMMAS = new Set(
  Object.values(CURATED_MOTION).map((form) => stripStress(form)),
);

export function isMotionVerbLemma(
  profile: THierarchyProfile,
  analysis: TLinguisticAnalysis,
): boolean {
  if (profile.movementType) {
    return true;
  }

  const lemma = stripStress(analysis.baseLemma || "");
  const surface = stripStress(analysis.surfaceForm || "");

  if (CURATED_MOTION_LEMMAS.has(lemma) || CURATED_MOTION_LEMMAS.has(surface)) {
    return true;
  }

  return (
    /^(по|при|у|вы|пере)?(йти|идти|ходить|ехать|ездить|бежать|лететь|плыть|нести|везти)/u.test(
      lemma,
    ) || /^(ид|ход|ех|езд|бег|лет|плыв|нес|вез|полз)/u.test(lemma)
  );
}

function compareMatches(
  left: TConceptSignalMatch,
  right: TConceptSignalMatch,
): number {
  const familyDelta =
    FAMILY_PRIORITY[familyOfConcept(right.conceptId)] -
    FAMILY_PRIORITY[familyOfConcept(left.conceptId)];

  if (familyDelta !== 0) {
    return familyDelta;
  }

  const intraDelta =
    (INTRA_FAMILY_ORDER[right.conceptId] ?? 0) -
    (INTRA_FAMILY_ORDER[left.conceptId] ?? 0);

  if (intraDelta !== 0) {
    return intraDelta;
  }

  return right.score - left.score;
}

/**
 * Applique la hiérarchie déclarative :
 * régence > cas spécifique > déclinaison ;
 * mouvement > aspect > conjugaison.
 * Les scores ne départagent qu'à l'intérieur d'une famille.
 */
export function applyPedagogicalHierarchy(
  matches: TConceptSignalMatch[],
  profile: THierarchyProfile,
  analysis: TLinguisticAnalysis,
): TConceptSignalMatch[] {
  if (matches.length === 0) {
    return matches;
  }

  let result = [...matches];

  const caseConceptId = resolveCaseConceptId(profile.morphologicalCase ?? null);
  const wantsSpecificCase =
    Boolean(caseConceptId) &&
    profile.caseConceptAvailable !== false &&
    (Boolean(profile.morphologicalCase && profile.morphologicalCase !== "nominative") ||
      profile.functionalRole === "object_direct");

  if (
    wantsSpecificCase &&
    caseConceptId &&
    !result.some((item) => item.conceptId === caseConceptId)
  ) {
    result.push({
      conceptId: caseConceptId,
      score: 88,
      weight: "primary",
      signal: `cas ${profile.morphologicalCase ?? "objet"} · table cas→concept`,
    });
  }

  const isMotion = isMotionVerbLemma(profile, analysis);
  const hasMotionFamily = result.some(
    (item) => familyOfConcept(item.conceptId) === "motion",
  );
  const hasSpecificCase = result.some(
    (item) => familyOfConcept(item.conceptId) === "specific-case",
  );
  const hasPrep = result.some(
    (item) => item.conceptId === "preposition-government",
  );

  result = result.map((item) => {
    let next = { ...item };

    if (
      item.conceptId === "noun-declension" &&
      (hasSpecificCase || hasPrep || wantsSpecificCase)
    ) {
      next = {
        ...next,
        weight: "secondary",
        signal: `${item.signal} · parapluie (cas précis prioritaire)`,
      };
    }

    if (isMotion && hasMotionFamily && ASPECT_SET.has(item.conceptId)) {
      next = {
        ...next,
        weight: "secondary",
        signal: `${item.signal} · secondaire (sous mouvement)`,
      };
    }

    return next;
  });

  if (isMotion && hasMotionFamily) {
    result = result.filter((item) => {
      if (ASPECT_SET.has(item.conceptId)) {
        return true;
      }

      return true;
    });
  }

  result.sort(compareMatches);

  return result.map((item, index) => ({
    ...item,
    weight: index === 0 ? ("primary" as const) : ("secondary" as const),
  }));
}

/** @deprecated Conservé pour le diagnostic documentaire. */
export const HIERARCHY_PRIMARY_SCORE = 200;

/** Écarts de scores bruts < 10 pts — pourquoi la hiérarchie par familles existe. */
export const FRAGILE_SCORE_PAIRS: Array<{
  a: string;
  b: string;
  scores: [number, number];
  delta: number;
}> = [
  {
    a: "verb-perfective-aspect",
    b: "verb-movement-prefixes",
    scores: [95, 92],
    delta: 3,
  },
  {
    a: "verb-movement-prefixes",
    b: "verb-present-conjugation",
    scores: [92, 90],
    delta: 2,
  },
  {
    a: "noun-declension",
    b: "case-accusative",
    scores: [80, 88],
    delta: 8,
  },
  {
    a: "verbs-of-motion",
    b: "noun-declension",
    scores: [80, 80],
    delta: 0,
  },
];
