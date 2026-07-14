const SENTENCE_SPLIT_RE = /(?<=[.!?…])\s+/u;

/**
 * Découpe un texte long en blocs lisibles (max ~70 mots par bloc).
 * Présentation uniquement — ne modifie pas les données métier.
 */
export function splitEditorialText(
  text: string,
  maxWords = 70,
): string[] {
  const trimmed = text.trim();

  if (!trimmed) {
    return [];
  }

  const words = trimmed.split(/\s+/u);

  if (words.length <= maxWords) {
    return [trimmed];
  }

  const sentences = trimmed.split(SENTENCE_SPLIT_RE).filter(Boolean);
  const blocks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    const candidateWords = candidate.split(/\s+/u).length;

    if (candidateWords > maxWords && current) {
      blocks.push(current.trim());
      current = sentence;
      continue;
    }

    current = candidate;
  }

  if (current.trim()) {
    blocks.push(current.trim());
  }

  if (blocks.length === 0) {
    return [trimmed];
  }

  return blocks;
}
