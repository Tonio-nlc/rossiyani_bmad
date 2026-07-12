import type { TImportanceLevel } from "@/types/learning-card";

export type { TImportanceLevel };

export const PEDAGOGY_LIMITS = {
  takeaways: 5,
  nextForms: 5,
  examples: 3,
  synonyms: 3,
  antonyms: 3,
  collocations: 5,
  confusions: 3,
  commonErrors: 3,
  commonPatterns: 5,
  referenceItems: 5,
} as const;

const REFERENCE_BLOCK_TITLES = new Set([
  "Conjugaison",
  "Paradigme des cas",
  "Paradigme",
  "Formes principales",
  "Préverbes",
  "Irrégularités",
  "Progression",
  "Concepts liés",
  "Sens élargi",
]);

const IMPORTANT_BLOCK_TITLES = new Set([
  "Aspect",
  "Paire aspectuelle",
  "Genre",
  "Animacité",
  "Déclinaison",
  "Pluriel",
  "Mouvement",
  "Transitivité",
  "Régimes",
  "Constructions",
  "Cas gouvernés",
  "Collocations",
  "Faux amis",
  "Confusions",
  "Erreurs fréquentes",
]);

export function rankBlockImportance(title: string): TImportanceLevel {
  if (REFERENCE_BLOCK_TITLES.has(title)) {
    return "REFERENCE";
  }

  if (IMPORTANT_BLOCK_TITLES.has(title)) {
    return "IMPORTANT";
  }

  return "CRITICAL";
}

export function limitList<T>(items: T[], max: number): T[] {
  return items.slice(0, max);
}

export function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
