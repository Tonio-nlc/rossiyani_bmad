/**
 * Mots invariables — aucun badge de rôle / aucune couleur.
 * validé manuellement — mots sans terminaison fléchie, aucun badge
 *
 * Appariement : stripStressMarks(normalizeToken(surface)) — formes nues
 * uniquement dans la liste ; ponctuation / majuscule gérées à l'appariement.
 * Ne dépend PAS du POS (souvent absent ou unknown en base).
 */

import { normalizeToken } from "@/lib/utils/russian";

import { stripStressMarks } from "./present-verbs";

/**
 * Formes nues (minuscules, sans accent, sans ponctuation).
 * EXCLUS volontairement : больше (comparatif / génitif), без (table
 * déclencheur), verbes (chemin verbe), ка́ртой (instrument), прия́тно
 * (expression figée « о́чень прия́тно »).
 */
export const CURATED_INVARIABLE_WORDS: readonly string[] = [
  // Conjonctions
  "и",
  "а",
  "но",
  "или",
  // Particules
  "не",
  "ни",
  "же",
  "ли",
  "только",
  "тоже",
  "ещё",
  // Adverbes invariables
  "очень",
  "быстро",
  "громко",
  "медленно",
  "часто",
  "сразу",
  "немного",
  "много",
  "вместе",
  "пешком",
  "плохо",
  "хорошо",
  "прямо",
  "темно",
  "нужно",
  "по-французски",
];

const invariableSet = new Set(
  CURATED_INVARIABLE_WORDS.map((word) => stripStressMarks(word)),
);

function invariableSurfaceKey(surface: string): string {
  return stripStressMarks(normalizeToken(surface));
}

/** true si la surface (éventuellement ponctuée / capitalisée) est curée invariable. */
export function isCuratedInvariableSurface(surface: string): boolean {
  const key = invariableSurfaceKey(surface);

  return Boolean(key) && invariableSet.has(key);
}
