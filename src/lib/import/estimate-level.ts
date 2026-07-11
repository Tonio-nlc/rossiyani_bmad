import { normalizeToken, splitIntoSentences, tokenizeSentence } from "../utils/russian";
import type { TTextLevel } from "./types";

const CYRILLIC_RE = /\p{Script=Cyrillic}/u;
const LEVELS: TTextLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function cyrillicWords(text: string): string[] {
  const sentences = splitIntoSentences(text);
  const parts = sentences.length > 0 ? sentences : [text];

  return parts
    .flatMap((sentence) => tokenizeSentence(sentence))
    .map((token) => normalizeToken(token).toLowerCase())
    .filter((token) => CYRILLIC_RE.test(token));
}

/**
 * Heuristique sans LLM — suggestion affichée à l'utilisateur, pas une vérité absolue.
 */
export function estimateLevel(text: string, wordCount: number, sentenceCount: number): TTextLevel {
  const words = cyrillicWords(text);

  if (words.length === 0) {
    return "A1";
  }

  const uniqueRatio = new Set(words).size / words.length;
  const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
  const avgWordLength =
    words.reduce((sum, word) => sum + [...word].length, 0) / words.length;

  let score = 0;

  if (avgSentenceLength >= 9) score += 1;
  if (avgSentenceLength >= 14) score += 1;
  if (avgSentenceLength >= 20) score += 1;
  if (avgSentenceLength >= 28) score += 1;
  if (avgWordLength >= 5.2) score += 1;
  if (avgWordLength >= 6.5) score += 1;
  if (uniqueRatio >= 0.55) score += 1;
  if (uniqueRatio >= 0.72) score += 1;

  return LEVELS[Math.min(score, LEVELS.length - 1)];
}
