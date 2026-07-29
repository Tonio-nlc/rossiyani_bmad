import { toNfc } from "@/lib/utils/russian";

/**
 * Canonicalisation des formes de lemme à l'insertion en base (`lemmas.form`).
 *
 * RÈGLE D'UNICITÉ (voir docs/knowledge/lemma-canonicalization.md pour le détail) :
 * - La forme canonique d'un lemme est sa forme ACCENTUÉE (U+0301), normalisée NFC.
 * - Une forme SANS AUCUN accent ("nue") qui désigne le même mot qu'une forme déjà
 *   accentuée en base doit RÉUTILISER la ligne existante — jamais en créer une
 *   nouvelle.
 * - Deux formes qui portent CHACUNE un accent, mais à une position différente,
 *   sont des mots DIFFÉRENTS (ex. му́ка "tourment" / мука́ "farine", за́мок
 *   "château" / замо́к "serrure") et ne doivent JAMAIS être fusionnées, même si
 *   leurs lettres de base sont identiques une fois l'accent retiré.
 *
 * Cette distinction est capitale : "retirer l'accent pour comparer" ne suffit
 * pas seul, il faut aussi savoir SI un accent existe déjà de chaque côté avant
 * de décider si un rapprochement est sûr (voir `resolveOrCreateLemma`).
 */

const STRESS_MARK = "\u0301";

/** Forme canonique à stocker : NFC, espaces de bord retirés. Ne touche pas à l'accent. */
export function canonicalizeLemmaForm(form: string): string {
  return toNfc(form.trim());
}

/**
 * true si la forme porte un accent tonique (U+0301). Le russe n'a pas de lettre
 * accentuée précomposée : même en NFC, l'accent reste un caractère combinant
 * séparé placé juste après la voyelle accentuée (ex. "ваго́н" = в-а-г-о-◌́-н).
 */
export function hasStressMark(form: string): boolean {
  return form.normalize("NFD").includes(STRESS_MARK);
}

/** Retire uniquement l'accent tonique (U+0301) — ne touche à aucune autre lettre. */
export function stripStressMark(form: string): string {
  return toNfc(form.normalize("NFD").replaceAll(STRESS_MARK, ""));
}
