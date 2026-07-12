import type {
  TKnowledgeFormEntry,
  TKnowledgeMorphology,
  TKnowledgeParadigms,
  TKnowledgePedagogy,
  TKnowledgePreverb,
  TKnowledgeSemantics,
  TKnowledgeSyntax,
  TLinguisticKnowledge,
  TLinguisticProfile,
} from "@/types/knowledge";
import {
  EMPTY_KNOWLEDGE_MORPHOLOGY,
  EMPTY_KNOWLEDGE_PARADIGMS,
  EMPTY_KNOWLEDGE_PEDAGOGY,
  EMPTY_KNOWLEDGE_SEMANTICS,
  EMPTY_KNOWLEDGE_SYNTAX,
} from "@/types/knowledge";

function toNullableString(value: string | null | undefined): string | null {
  if (!value || value === "unknown") {
    return null;
  }

  return value;
}

function parseGovernment(government: string | null | undefined): string[] {
  if (!government) {
    return [];
  }

  try {
    const parsed = JSON.parse(government) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return [government];
  }

  return [];
}

function hasStructuredProfile(knowledge: TLinguisticKnowledge): boolean {
  return knowledge.profileVersion >= 2;
}

function synthesizeMorphologyFromLegacy(
  knowledge: TLinguisticKnowledge,
): TKnowledgeMorphology {
  return {
    ...EMPTY_KNOWLEDGE_MORPHOLOGY,
    gender: knowledge.gender,
    aspect: knowledge.aspect,
    movementType: knowledge.movementType,
  };
}

function synthesizeSyntaxFromLegacy(
  knowledge: TLinguisticKnowledge,
): TKnowledgeSyntax {
  const government = parseGovernment(knowledge.government);

  return {
    ...EMPTY_KNOWLEDGE_SYNTAX,
    government: government.length > 0 ? government : undefined,
  };
}

function synthesizeSemanticsFromLegacy(
  knowledge: TLinguisticKnowledge,
): TKnowledgeSemantics {
  return {
    ...EMPTY_KNOWLEDGE_SEMANTICS,
    semanticCategory: knowledge.semanticCategory,
    register: knowledge.register,
  };
}

function synthesizePedagogyFromLegacy(
  knowledge: TLinguisticKnowledge,
): TKnowledgePedagogy {
  return {
    ...EMPTY_KNOWLEDGE_PEDAGOGY,
    takeaway: knowledge.notes,
    progression: knowledge.difficulty,
    relatedConcepts: knowledge.tags.length > 0 ? knowledge.tags : undefined,
  };
}

export function buildLinguisticProfile(
  knowledge: TLinguisticKnowledge,
): TLinguisticProfile {
  const morphology = hasStructuredProfile(knowledge)
    ? { ...EMPTY_KNOWLEDGE_MORPHOLOGY, ...knowledge.morphology }
    : synthesizeMorphologyFromLegacy(knowledge);

  const syntax = hasStructuredProfile(knowledge)
    ? { ...EMPTY_KNOWLEDGE_SYNTAX, ...knowledge.syntax }
    : synthesizeSyntaxFromLegacy(knowledge);

  const semantics = hasStructuredProfile(knowledge)
    ? { ...EMPTY_KNOWLEDGE_SEMANTICS, ...knowledge.semantics }
    : synthesizeSemanticsFromLegacy(knowledge);

  const pedagogy = hasStructuredProfile(knowledge)
    ? { ...EMPTY_KNOWLEDGE_PEDAGOGY, ...knowledge.pedagogy }
    : synthesizePedagogyFromLegacy(knowledge);

  const paradigms = hasStructuredProfile(knowledge)
    ? { ...EMPTY_KNOWLEDGE_PARADIGMS, ...knowledge.paradigms }
    : EMPTY_KNOWLEDGE_PARADIGMS;

  return {
    lemmaId: knowledge.lemmaId,
    partOfSpeech: toNullableString(knowledge.partOfSpeech),
    gender: toNullableString(morphology.gender ?? knowledge.gender),
    aspect: toNullableString(morphology.aspect ?? knowledge.aspect),
    movementType: toNullableString(
      morphology.movementType ?? knowledge.movementType,
    ),
    morphology,
    syntax,
    semantics,
    pedagogy,
    paradigms,
    profileVersion: knowledge.profileVersion,
  };
}

export function formatFormEntries(entries: TKnowledgeFormEntry[] | undefined): string[] {
  if (!entries?.length) {
    return [];
  }

  return entries.map((entry) =>
    entry.label ? `${entry.label} : ${entry.form}` : entry.form,
  );
}

export function formatPreverbs(preverbs: TKnowledgePreverb[] | undefined): string[] {
  if (!preverbs?.length) {
    return [];
  }

  return preverbs.map((item) => {
    if (item.meaning) {
      return `${item.prefix}${item.verb} — ${item.meaning}`;
    }

    return `${item.prefix}${item.verb}`;
  });
}

export function formatErrorPairs(
  pairs: Array<{ wrong: string; correct: string }> | undefined,
): string[] {
  if (!pairs?.length) {
    return [];
  }

  return pairs.map((pair) => `× ${pair.wrong} → ✓ ${pair.correct}`);
}

export function collectParadigmForms(paradigms: TKnowledgeParadigms): string[] {
  const forms = [
    ...(paradigms.forms ?? []),
    ...(paradigms.cases ?? []),
    ...(paradigms.conjugation ?? []),
  ];

  return forms.map((entry) => entry.form);
}
