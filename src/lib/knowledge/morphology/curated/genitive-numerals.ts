/**
 * Formes de numéraux (et quasi-numéraux) qui imposent le génitif au mot suivant.
 * validé manuellement — ne pas générer par LLM
 *
 * Clés sans accent, minuscules. Matching via stripStressMarks + normalizeToken.
 */

export const CURATED_GENITIVE_GOVERNING_NUMERALS: readonly string[] = [
  "два",
  "две",
  "три",
  "четыре",
  "пять",
  "шесть",
  "семь",
  "восемь",
  "девять",
  "десять",
  "одиннадцать",
  "двенадцать",
  "двадцать",
  "тридцать",
  "сорок",
  "пятьдесят",
  "шестьдесят",
  "семьдесят",
  "восемьдесят",
  "девяносто",
  "сто",
  "двести",
  "триста",
  "четыреста",
  "пятьсот",
  "тысяча",
  "много",
  "мало",
  "несколько",
  "сколько",
];

const numeralSet = new Set(CURATED_GENITIVE_GOVERNING_NUMERALS);

export function isCuratedGenitiveGoverningNumeral(token: string): boolean {
  return numeralSet.has(token);
}
