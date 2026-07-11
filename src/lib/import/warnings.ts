import { IMPORT_LIMITS } from "./constants";
import { splitIntoSentences, tokenizeSentence } from "../utils/russian";
import type { ImportWarning } from "./types";

const SENTENCE_END_RE = /[.!?…]["')\]]*$/u;
const UNUSUAL_PUNCTUATION_RE = /[{}[\]<>|\\^`~@#$%&*_=+]/;

export function collectWarnings(
  normalizedText: string,
  wordCount: number,
  sentences: string[],
): ImportWarning[] {
  const warnings: ImportWarning[] = [];

  if (wordCount < 100) {
    warnings.push({
      code: "SHORT_TEXT",
      message: "Texte court — la lecture sera rapide.",
    });
  }

  if (sentences.length > 0 && !SENTENCE_END_RE.test(normalizedText.trim())) {
    warnings.push({
      code: "NO_FINAL_PUNCTUATION",
      message: "Le texte ne se termine pas par une ponctuation de phrase.",
    });
  }

  const endingPunctuationCount = (normalizedText.match(/[.!?…]/gu) ?? []).length;
  const punctuationRatio = endingPunctuationCount / Math.max(wordCount, 1);

  if (wordCount >= 80 && punctuationRatio < 0.01) {
    warnings.push({
      code: "LOW_PUNCTUATION",
      message: "Peu de ponctuation détectée — le découpage en phrases peut être imprécis.",
    });
  }

  const longSentence = sentences.find(
    (sentence) => tokenizeSentence(sentence).length > 40,
  );

  if (longSentence) {
    warnings.push({
      code: "LONG_SENTENCES",
      message: "Certaines phrases sont très longues — la lecture peut être plus difficile.",
    });
  }

  if (UNUSUAL_PUNCTUATION_RE.test(normalizedText)) {
    warnings.push({
      code: "UNUSUAL_PUNCTUATION",
      message: "Caractères de ponctuation inhabituels détectés.",
    });
  }

  if (sentences.length === 1 && wordCount >= IMPORT_LIMITS.minWords * 2) {
    warnings.push({
      code: "LOW_PUNCTUATION",
      message: "Une seule phrase longue — vérifiez la ponctuation du texte source.",
    });
  }

  const seen = new Set<ImportWarning["code"]>();

  return warnings.filter((warning) => {
    if (seen.has(warning.code)) {
      return false;
    }

    seen.add(warning.code);
    return true;
  });
}
