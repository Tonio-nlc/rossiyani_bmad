import { toNfc } from "@/lib/utils/russian";

/**
 * Canonicalisation des formes de lemme à l'insertion en base (`lemmas.form`).
 *
 * RÈGLE D'UNICITÉ (voir docs/knowledge/lemma-canonicalization.md pour le détail) :
 * - La forme canonique d'un lemme POLYSYLLABIQUE est sa forme ACCENTUÉE (U+0301),
 *   normalisée NFC.
 * - Exception monosyllabe : une forme avec une seule voyelle russe ne porte
 *   jamais d'accent tonique noté — U+0301 est retiré (voir
 *   `stripMonosyllableStress`). Règle déterministe, ne pas déléguer au LLM.
 * - Une forme SANS AUCUN accent ("nue") qui désigne le même mot qu'une forme déjà
 *   accentuée en base doit RÉUTILISER la ligne existante — jamais en créer une
 *   nouvelle.
 * - Deux formes qui portent CHACUNE un accent à une position différente
 *   *peuvent* être des mots distincts (му́ка / мука́). `stripStressMark` seul
 *   ne doit jamais les traiter comme équivalents.
 * - Anti-doublon LLM (voir `shouldReuseExistingAccentedLemma`) : si
 *   **exactement une** forme accentuée existe déjà pour le bare et que
 *   l'entrante porte un accent ailleurs, on réutilise la ligne existante
 *   plutôt que d'en créer une seconde. Trade-off temporaire : bloque aussi
 *   l'insertion d'un vrai homographe tant qu'il n'y a pas d'allowlist /
 *   `homograph_key` — préférable à un UNIQUE SQL sur bare.
 *
 * Cette distinction est capitale : "retirer l'accent pour comparer" ne suffit
 * pas seul, il faut aussi savoir SI un accent existe déjà de chaque côté avant
 * de décider si un rapprochement est sûr (voir `resolveOrCreateLemma`).
 */

const STRESS_MARK = "\u0301";
const HYPHEN = "-";

/**
 * true si chaque caractère est autorisé dans `lemmas.form` :
 * alphabet cyrillique (U+0400–U+04FF), trait d'union ASCII, U+0301.
 */
export function isAllowedLemmaFormCharset(form: string): boolean {
  for (const char of form) {
    const cp = char.codePointAt(0)!;
    const isCyrillic = cp >= 0x0400 && cp <= 0x04ff;
    if (!isCyrillic && char !== HYPHEN && char !== STRESS_MARK) {
      return false;
    }
  }

  return form.length > 0;
}

/**
 * Un caractère latin dans une forme russe est invisible à
 * l'œil et casse tout appariement — rejet à l'insertion.
 *
 * Ne corrige PAS (pas de substitution homoglyphe) : une forme corrompue
 * doit faire échouer l'écriture plutôt que d'être masquée.
 */
export function assertLemmaFormCharset(form: string): void {
  if (!isAllowedLemmaFormCharset(form)) {
    throw new Error(
      `Lemme rejeté : caractère non autorisé dans « ${form} » ` +
        `(seuls cyrillique U+0400–U+04FF, « - » et U+0301 sont admis)`,
    );
  }
}

/** Voyelles russes (minuscules + majuscules). Ё/ё compte comme une voyelle. */
const RUSSIAN_VOWELS = new Set([
  "а",
  "е",
  "ё",
  "и",
  "о",
  "у",
  "ы",
  "э",
  "ю",
  "я",
  "А",
  "Е",
  "Ё",
  "И",
  "О",
  "У",
  "Ы",
  "Э",
  "Ю",
  "Я",
]);

/** Forme NFC + trim. Ne touche pas à l'accent (voir stripMonosyllableStress). */
export function canonicalizeLemmaForm(form: string): string {
  return toNfc(form.trim());
}

/**
 * Nombre de voyelles russes dans la forme (pas le nombre de caractères).
 * U+0301 et les consonnes / signes (ь, ъ) ne comptent pas.
 * Ex. « вста́ть » → 1 (а) ; « бо́леть » → 2 (о, е).
 */
export function countRussianVowels(form: string): number {
  let count = 0;

  for (const char of form) {
    if (RUSSIAN_VOWELS.has(char)) {
      count += 1;
    }
  }

  return count;
}

/**
 * Un monosyllabe ne porte jamais d'accent tonique noté —
 * règle déterministe, ne pas déléguer au LLM.
 *
 * À appliquer APRÈS `canonicalizeLemmaForm` (NFC), jamais avant.
 * Comptage sur les voyelles : « вста́ть » (une voyelle) perd son U+0301.
 */
export function stripMonosyllableStress(form: string): string {
  if (countRussianVowels(form) !== 1) {
    return form;
  }

  if (!hasStressMark(form)) {
    return form;
  }

  return stripStressMark(form);
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

/**
 * Anti-doublon d'accent à l'insertion (`resolveOrCreateLemma`).
 *
 * true si l'entrante est accentuée, qu'exactement une forme accentuée existe
 * déjà pour le même bare, et que les formes NFC diffèrent → réutiliser
 * l'existante (logger la divergence côté appelant) au lieu d'INSERT.
 *
 * false si plusieurs formes accentuées coexistent déjà (homographes) : on
 * ne choisit pas arbitrairement ; l'appelant peut alors créer une ligne.
 */
export function shouldReuseExistingAccentedLemma(
  incomingForm: string,
  accentedExistingForms: readonly string[],
): boolean {
  if (!hasStressMark(incomingForm)) {
    return false;
  }

  const distinct = [...new Set(accentedExistingForms)];
  if (distinct.length !== 1) {
    return false;
  }

  return distinct[0] !== incomingForm;
}
