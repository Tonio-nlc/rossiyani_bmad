import { normalizeToken, toNfc } from "@/lib/utils/russian";

/**
 * Tokenisation / normalisation russe — sans /\p{…}/ (Safari-safe).
 * Accents U+0301 : retirés pour la comparaison, préservés dans findAccentedLemmaForm.
 */

const WORD_CHAR_RE =
  /[A-Za-zÀ-ÿА-Яа-яЁёІіЇїЄєҐґ0-9\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]+/g;

export function normalizeRussianWord(word: string): string {
  return normalizeToken(word)
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .toLowerCase();
}

function tokenizeRussian(text: string): string[] {
  return text.normalize("NFC").match(WORD_CHAR_RE) ?? [];
}

export function sentenceContainsLemma(
  sentence: string,
  lemmaForm: string,
): boolean {
  const normalizedLemma = normalizeRussianWord(lemmaForm);

  if (!normalizedLemma) {
    return false;
  }

  return tokenizeRussian(sentence).some(
    (token) => normalizeRussianWord(token) === normalizedLemma,
  );
}

export function findAccentedLemmaForm(
  lemmaForm: string,
  textContents: string[],
): string | null {
  const normalizedLemma = normalizeRussianWord(lemmaForm);

  if (!normalizedLemma) {
    return null;
  }

  for (const content of textContents) {
    for (const token of tokenizeRussian(content)) {
      if (normalizeRussianWord(token) !== normalizedLemma) {
        continue;
      }

      const hasAccent = token.normalize("NFD").includes("\u0301");

      if (hasAccent) {
        return toNfc(token);
      }
    }
  }

  return null;
}
