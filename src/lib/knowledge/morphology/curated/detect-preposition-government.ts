/**
 * Détection déterministe de la régence prépositionnelle.
 * validé manuellement — ne pas générer par LLM
 *
 * Règle : préposition immédiatement avant le mot dans la phrase + table curée.
 * Aucune lecture de la prose LLM.
 */

import {
  getPrepositionGovernmentEntry,
  type TGovernedCase,
  type TPrepositionGovernmentEntry,
} from "@/lib/knowledge/morphology/curated/preposition-government";
import { stripStressMarks } from "@/lib/knowledge/morphology/curated/present-verbs";
import { normalizeToken, tokenizeSentence } from "@/lib/utils/russian";

export interface TDetectedPrepositionGovernment {
  preposition: string;
  governedCase: TGovernedCase;
  entry: TPrepositionGovernmentEntry;
}

const CASE_LABEL_TO_CANONICAL: Record<string, TGovernedCase> = {
  genitive: "genitive",
  genitif: "genitive",
  génitif: "genitive",
  gen: "genitive",
  dative: "dative",
  datif: "dative",
  dat: "dative",
  accusative: "accusative",
  accusatif: "accusative",
  acc: "accusative",
  instrumental: "instrumental",
  instrumentalny: "instrumental",
  instr: "instrumental",
  prepositional: "prepositional",
  prépositionnel: "prepositional",
  prepositionnel: "prepositional",
  locatif: "prepositional",
  locative: "prepositional",
  prep: "prepositional",
};

export function normalizeGovernedCaseLabel(
  label: string | null | undefined,
): TGovernedCase | null {
  if (!label?.trim()) {
    return null;
  }

  const key = label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zа-яё]/gi, "");

  return CASE_LABEL_TO_CANONICAL[key] ?? null;
}

/**
 * Cas morphologique du mot depuis paradigmes knowledge (forme = surface).
 */
export function inferMorphologicalCaseFromParadigms(
  surface: string,
  cases: Array<{ label: string; form: string }> | null | undefined,
): TGovernedCase | null {
  if (!cases?.length) {
    return null;
  }

  const surfaceKey = stripStressMarks(normalizeToken(surface));

  for (const entry of cases) {
    if (stripStressMarks(normalizeToken(entry.form)) !== surfaceKey) {
      continue;
    }

    const governed = normalizeGovernedCaseLabel(entry.label);

    if (governed) {
      return governed;
    }
  }

  return null;
}

function findPrecedingToken(
  surface: string,
  sentence: string,
): string | null {
  const tokens = tokenizeSentence(sentence);
  const surfaceKey = stripStressMarks(normalizeToken(surface));

  if (!surfaceKey) {
    return null;
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const tokenKey = stripStressMarks(normalizeToken(tokens[index] ?? ""));

    if (tokenKey !== surfaceKey) {
      continue;
    }

    if (index === 0) {
      return null;
    }

    return normalizeToken(tokens[index - 1] ?? "");
  }

  return null;
}

/**
 * Si le mot est gouverné par une préposition curée immédiatement avant lui.
 * в/на (et assimilés senseDependent) : exige un cas morphologique connu
 * parmi les cas de la table — sinon null (reste sur noun-declension).
 */
export function detectPrepositionGovernment(input: {
  surface: string;
  sentence: string;
  morphologicalCase?: TGovernedCase | null;
}): TDetectedPrepositionGovernment | null {
  const preceding = findPrecedingToken(input.surface, input.sentence);

  if (!preceding) {
    return null;
  }

  const prepKey = stripStressMarks(preceding);
  const entry = getPrepositionGovernmentEntry(prepKey);

  if (!entry) {
    return null;
  }

  if (!entry.senseDependent && entry.cases.length === 1) {
    return {
      preposition: entry.preposition,
      governedCase: entry.cases[0]!,
      entry,
    };
  }

  const morphCase = input.morphologicalCase ?? null;

  if (morphCase && entry.cases.includes(morphCase)) {
    return {
      preposition: entry.preposition,
      governedCase: morphCase,
      entry,
    };
  }

  /** Régence ambiguë sans cas morphologique → ne pas forcer. */
  return null;
}
