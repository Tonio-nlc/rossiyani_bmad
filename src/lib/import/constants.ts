/** Limites V1 — alignées sur docs/import/CONCEPTION_V1.md §5 */

export const IMPORT_LIMITS = {
  minWords: 30,
  maxWords: 15_000,
  maxSentences: 500,
  maxChars: 500_000,
  maxTitleLength: 120,
  maxImportsPerUser: 20,
  maxImportsPerDay: 5,
  russianCyrillicRatio: 0.7,
  wordsPerMinute: 20,
} as const;
