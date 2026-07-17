const SENTENCE_SPLIT_RE = /(?<=[.!?…])\s+/u;

export const COGNITIVE_MAX_WORDS = 60;
export const COGNITIVE_MAX_SENTENCES = 2;
export const COGNITIVE_MAX_RETENTION = 3;
export const COGNITIVE_MAX_WHAT_IF = 3;

export function countWords(text: string): number {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

export function constrainCognitiveParagraph(
  text: string,
  maxWords = COGNITIVE_MAX_WORDS,
  maxSentences = COGNITIVE_MAX_SENTENCES,
): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return trimmed;
  }

  const sentences = trimmed.split(SENTENCE_SPLIT_RE).filter(Boolean);
  const limitedSentences = sentences.slice(0, maxSentences);
  let result = limitedSentences.join(" ");

  while (countWords(result) > maxWords && limitedSentences.length > 1) {
    limitedSentences.pop();
    result = limitedSentences.join(" ");
  }

  if (countWords(result) > maxWords) {
    const words = result.split(/\s+/u);
    result = `${words.slice(0, maxWords).join(" ")}…`;
  }

  return result.trim();
}

export function constrainCognitiveList(
  items: string[],
  maxItems: number,
  maxWords = COGNITIVE_MAX_WORDS,
): string[] {
  return items
    .map((item) => constrainCognitiveParagraph(item, maxWords, 1))
    .filter(Boolean)
    .slice(0, maxItems);
}
