import type {
  TLemmaConceptLink,
  TLinguisticConcept,
  TResolvedConceptGraph,
} from "@/types/linguistic-concept";
import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import {
  buildLemmaConceptLinks,
  type TConceptMatchProfile,
} from "./match-signals";
import {
  getAllConcepts,
  getConceptById,
  getConceptsByIds,
  isKnownConceptId,
} from "./registry";
import { buildTeachingPath, getRelatedConceptIds } from "./teaching-graph";

function normalizeConceptId(rawId: string | null | undefined): string | null {
  if (!rawId?.trim()) {
    return null;
  }

  const id = rawId.trim();

  if (isKnownConceptId(id)) {
    return id;
  }

  const legacyMap: Record<string, string> = {
    verb_present_conjugation: "verb-present-conjugation",
    verb_perfective_aspect: "verb-perfective-aspect",
    verb_movement_prefix: "verb-movement-prefixes",
    pronoun_reflexive_possessive: "reflexive-possessive",
    noun_declension: "noun-declension",
    adjective_agreement: "adjective-agreement",
    preposition_government: "preposition-government",
    llm_concept: "",
  };

  const mapped = legacyMap[id];

  if (mapped && isKnownConceptId(mapped)) {
    return mapped;
  }

  return null;
}

/**
 * Concept id du primary, ou `null` si aucun concept ne s'applique légitimement.
 *
 * RC — Résolution non-nominale (adverbes, pronoms non couverts) : un POS sans
 * signal dédié ne doit JAMAIS retomber sur un concept d'une autre famille
 * grammaticale (ex. adverbe → "Conjugaison du présent", pronom → "Possessif
 * réfléchi"). Seuls verbe/nom/adjectif/préposition ont un repli « parapluie »
 * défendable dans leur PROPRE famille ; les autres POS renvoient `null`
 * (dégradation propre) tant qu'aucun concept dédié n'existe au catalogue.
 */
function pickPrimaryConceptId(
  profile: TConceptMatchProfile,
  signals: ReturnType<typeof buildLemmaConceptLinks>,
): string | null {
  const fromKnowledge = normalizeConceptId(profile.pedagogy?.concept?.phenomenonId);

  if (fromKnowledge) {
    return fromKnowledge;
  }

  const primarySignal = signals.find((item) => item.weight === "primary");

  if (primarySignal && isKnownConceptId(primarySignal.conceptId)) {
    return primarySignal.conceptId;
  }

  const bestSignal = signals.find((item) => isKnownConceptId(item.conceptId));

  if (bestSignal) {
    return bestSignal.conceptId;
  }

  const pos = profile.partOfSpeech ?? null;

  if (pos === "verb") {
    return "verb-imperfective-aspect";
  }

  if (pos === "noun") {
    return "noun-declension";
  }

  if (pos === "adjective") {
    return "adjective-agreement";
  }

  if (pos === "preposition") {
    return "preposition-government";
  }

  // pronom sans signal dédié (ex. никто́, кто, что…), adverbe, conjonction,
  // particule, interjection, numéral, POS inconnu : aucun concept de cas/
  // conjugaison n'existe pour ces mots — ne pas en fabriquer un.
  return null;
}

/** Id synthétique — jamais un concept du catalogue, jamais persisté comme tel. */
export const NO_CONCEPT_ID = "no-concept";

/**
 * Coquille honnête quand aucun concept ne s'applique (POS invariable, pronom
 * non couvert…). Remplace un concept fabriqué faux par une absence assumée.
 */
function buildNoConceptPlaceholder(): TLinguisticConcept {
  return {
    id: NO_CONCEPT_ID,
    slug: NO_CONCEPT_ID,
    title: "Notion linguistique",
    category: "General",
    difficulty: "A1",
    summary: "Ce mot n'a pas encore de concept dédié dans le catalogue.",
    coreIdea: "Ce mot n'a pas encore de concept dédié dans le catalogue.",
    whyItExists: "",
    mentalModel: "",
    visualModel: { type: "diagram", nodes: [] },
    canonicalExplanation: {
      understand: ["Ce mot n'a pas encore de concept dédié dans le catalogue."],
      scheme: [],
      contrasts: [],
      miniTable: null,
      retentionPoints: [],
      family: [],
    },
    commonMistakes: [],
    relatedConcepts: [],
    relatedLemmas: [],
    examples: [],
    progression: { beginner: "À compléter." },
  };
}

function buildLinks(
  signals: ReturnType<typeof buildLemmaConceptLinks>,
  primaryId: string,
): TLemmaConceptLink[] {
  const links: TLemmaConceptLink[] = [];
  const seen = new Set<string>();

  for (const signal of signals) {
    if (!isKnownConceptId(signal.conceptId) || seen.has(signal.conceptId)) {
      continue;
    }

    seen.add(signal.conceptId);

    links.push({
      conceptId: signal.conceptId,
      weight:
        signal.conceptId === primaryId
          ? "primary"
          : signal.weight === "advanced"
            ? "advanced"
            : "secondary",
      signal: signal.signal,
    });
  }

  const primary = getConceptById(primaryId);

  if (primary) {
    for (const relatedId of primary.relatedConcepts) {
      if (seen.has(relatedId) || !isKnownConceptId(relatedId)) {
        continue;
      }

      seen.add(relatedId);

      links.push({
        conceptId: relatedId,
        weight: "secondary",
        signal: "concept lié",
      });
    }
  }

  return links;
}

export function resolveConceptGraph(
  profile: TConceptMatchProfile,
  analysis: TLinguisticAnalysis,
  encounter: TVocabularyContextEncounter | null,
): TResolvedConceptGraph {
  // Expression figée curée : libellé + sens suffisent — pas de concept de cas
  // ni de régence (sinon « до свида́ния » → « Régence des prépositions »).
  if (encounter?.functionalRole === "fixed_expression") {
    return {
      primary: buildNoConceptPlaceholder(),
      secondary: [],
      advanced: [],
      teachingPath: [],
      links: [],
    };
  }

  const signals = buildLemmaConceptLinks(profile, analysis, encounter);
  const primaryId = pickPrimaryConceptId(profile, signals);

  if (!primaryId) {
    // POS invariable / pronom sans traitement dédié : dégradation propre,
    // pas de concept fabriqué (voir pickPrimaryConceptId).
    return {
      primary: buildNoConceptPlaceholder(),
      secondary: [],
      advanced: [],
      teachingPath: [],
      links: [],
    };
  }

  const primary = getConceptById(primaryId) ?? getAllConcepts()[0];

  if (!primary) {
    console.warn(
      `[Concept Graph] Aucun concept disponible (primaryId=${primaryId}) — graphe vide`,
    );

    return {
      primary: buildNoConceptPlaceholder(),
      secondary: [],
      advanced: [],
      teachingPath: [],
      links: [],
    };
  }

  const links = buildLinks(signals, primaryId);

  const secondaryIds = links
    .filter((link) => link.weight === "secondary")
    .map((link) => link.conceptId);

  const advancedIds = links
    .filter((link) => link.weight === "advanced")
    .map((link) => link.conceptId);

  const teachingPathIds = [
    ...new Set([
      ...buildTeachingPath(primaryId),
      ...getRelatedConceptIds(primaryId),
    ]),
  ];

  return {
    primary,
    secondary: getConceptsByIds(secondaryIds).filter(
      (concept) => concept.id !== primaryId,
    ),
    advanced: getConceptsByIds(advancedIds).filter(
      (concept) => concept.id !== primaryId,
    ),
    links,
    teachingPath: getConceptsByIds(teachingPathIds),
  };
}
