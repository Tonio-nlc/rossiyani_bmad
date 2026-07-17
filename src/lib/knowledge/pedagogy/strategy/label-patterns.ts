/** Motifs linguistiques réutilisables — stratégies & integrity gate */

export const CASE_LABEL_PATTERNS: RegExp[] = [
  /\bgénitif\b/i,
  /\bdatif\b/i,
  /\baccusatif\b/i,
  /\bnominatif\b/i,
  /\binstrumental\b/i,
  /\bprépositionnel\b/i,
  /\bprépositionel\b/i,
  /\bparadigme des cas\b/i,
  /\bcas gouverné/i,
  /\bcas compatible/i,
];

export const CONJUGATION_LABEL_PATTERNS: RegExp[] = [
  /\bconjugaison\b/i,
  /\bconjugation\b/i,
  /\btype de conjugaison\b/i,
];

export const ASPECT_LABEL_PATTERNS: RegExp[] = [
  /\baspect\b/i,
  /\bimperfectif\b/i,
  /\bperfectif\b/i,
  /\bpaire aspectuelle\b/i,
];

export const TENSE_PERSON_LABEL_PATTERNS: RegExp[] = [
  /\btemps\b/i,
  /\bpersonne\b/i,
  /\bvoix\b/i,
  /\b1re personne\b/i,
  /\b2e personne\b/i,
  /\b3e personne\b/i,
];

export const ANIMACY_LABEL_PATTERNS: RegExp[] = [
  /\banimacité\b/i,
  /\banimé\b/i,
  /\binanimé\b/i,
];

export const NOMINAL_GENDER_LABEL_PATTERNS: RegExp[] = [
  /\bgenre\b/i,
  /\bmasculin\b/i,
  /\bféminin\b/i,
  /\bneutre\b/i,
];

export const DECLENSION_LABEL_PATTERNS: RegExp[] = [
  /\bdéclinaison\b/i,
  /\bdeclension\b/i,
  /\bparadigme nominal\b/i,
];

export const PLURAL_LABEL_PATTERNS: RegExp[] = [/\bpluriel\b/i, /\bplural\b/i];

export const MOVEMENT_VERB_PATTERNS: RegExp[] = [
  /\bverbe de mouvement\b/i,
  /\bpréverbe\b/i,
  /\bschéma de mouvement\b/i,
];

export function textMatchesPatterns(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function findMatchingPattern(
  text: string,
  patterns: RegExp[],
): RegExp | null {
  return patterns.find((pattern) => pattern.test(text)) ?? null;
}

export function collectTextViolations(
  texts: Array<{ field: string; text: string }>,
  patterns: RegExp[],
  code: string,
): Array<{ field: string; text: string; pattern: RegExp }> {
  const violations: Array<{ field: string; text: string; pattern: RegExp }> = [];

  for (const entry of texts) {
    const pattern = findMatchingPattern(entry.text, patterns);

    if (pattern) {
      violations.push({ ...entry, pattern });
    }
  }

  return violations;
}
