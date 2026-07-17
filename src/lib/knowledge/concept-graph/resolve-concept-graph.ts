import type {
  TLemmaConceptLink,
  TResolvedConceptGraph,
} from "@/types/linguistic-concept";
import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import {
  buildLemmaConceptLinks,
  type TConceptMatchProfile,
} from "./match-signals";
import {
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

function pickPrimaryConceptId(
  profile: TConceptMatchProfile,
  signals: ReturnType<typeof buildLemmaConceptLinks>,
): string {
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

  const pos = profile.partOfSpeech ?? "word";

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

  if (pos === "pronoun") {
    return "reflexive-possessive";
  }

  return "verb-present-conjugation";
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
  const signals = buildLemmaConceptLinks(profile, analysis, encounter);
  const primaryId = pickPrimaryConceptId(profile, signals);
  const primary = getConceptById(primaryId);

  if (!primary) {
    throw new Error(`Concept graph: concept introuvable (${primaryId})`);
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
