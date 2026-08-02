/**
 * Expressions figées — rôle serveur `fixed_expression` (sans couleur).
 * validé manuellement — ne pas générer par LLM
 *
 * Matching multi-mots : token immédiatement avant + surface cliquée
 * (clés via stripStressMarks(normalizeToken(…)) chez l'appelant).
 * Liste explicite, aucune heuristique.
 */

export interface TCuratedFixedExpression {
  /**
   * Premier mot de l'expression (sans accent, minuscules) —
   * préposition (до) ou autre déclencheur figé (очень).
   */
  preposition: string;
  /** Second mot (sans accent, minuscules) — la surface cliquée. */
  governedSurface: string;
  /** Citation avec accent (documentation). */
  citation: string;
}

export const CURATED_FIXED_EXPRESSIONS: readonly TCuratedFixedExpression[] = [
  {
    preposition: "до",
    governedSurface: "свидания",
    citation: "до свида́ния",
  },
  {
    preposition: "очень",
    governedSurface: "приятно",
    citation: "о́чень прия́тно",
  },
];

const byPrepAndSurface = new Map<string, TCuratedFixedExpression>();

for (const entry of CURATED_FIXED_EXPRESSIONS) {
  byPrepAndSurface.set(`${entry.preposition}\0${entry.governedSurface}`, entry);
}

/**
 * Retourne l'entrée curée si (préposition, surface) matche une expression figée.
 * Les deux clés doivent déjà être normalisées (sans accent, minuscules).
 */
export function findCuratedFixedExpression(
  preposition: string,
  governedSurface: string,
): TCuratedFixedExpression | null {
  return byPrepAndSurface.get(`${preposition}\0${governedSurface}`) ?? null;
}
