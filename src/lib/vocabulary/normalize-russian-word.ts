export function normalizeRussianWord(word: string): string {
  return word
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .toLowerCase();
}

export function sentenceContainsLemma(
  sentence: string,
  lemmaForm: string,
): boolean {
  const normalizedLemma = normalizeRussianWord(lemmaForm);

  if (!normalizedLemma) {
    return false;
  }

  const tokens = sentence.match(/[\p{L}\p{M}]+/gu) ?? [];

  return tokens.some(
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
    const tokens = content.match(/[\p{L}\p{M}]+/gu) ?? [];

    for (const token of tokens) {
      if (normalizeRussianWord(token) !== normalizedLemma) {
        continue;
      }

      const hasAccent = token.normalize("NFD").includes("\u0301");

      if (hasAccent) {
        return token.normalize("NFC");
      }
    }
  }

  return null;
}
