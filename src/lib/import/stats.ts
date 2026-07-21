import { IMPORT_LIMITS } from "./constants";
import {
  isUnicodeLetterChar,
  normalizeToken,
  splitIntoSentences,
  tokenizeSentence,
} from "../utils/russian";

function isWordToken(token: string): boolean {
  const normalized = normalizeToken(token);

  if (!normalized) {
    return false;
  }

  return Array.from(normalized).some((char) => isUnicodeLetterChar(char));
}

export function countWords(text: string): number {
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    return tokenizeSentence(text).filter(isWordToken).length;
  }

  return sentences
    .flatMap((sentence) => tokenizeSentence(sentence))
    .filter(isWordToken)
    .length;
}

export function countSentences(text: string): number {
  const sentences = splitIntoSentences(text);
  return sentences.length > 0 ? sentences.length : text.trim() ? 1 : 0;
}

/** Même ratio que la charte Reader : ~20 mots/minute. */
export function estimateReadingTimeMinutes(wordCount: number): number {
  if (wordCount <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(wordCount / IMPORT_LIMITS.wordsPerMinute));
}
