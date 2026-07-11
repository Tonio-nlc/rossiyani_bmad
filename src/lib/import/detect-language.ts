import { IMPORT_LIMITS } from "./constants";

const LETTER_RE = /\p{L}/u;
const CYRILLIC_RE = /\p{Script=Cyrillic}/u;
const LATIN_RE = /\p{Script=Latin}/u;

export interface RussianDetection {
  isRussian: boolean;
  ratio: number;
  detectedLanguage: string;
  cyrillicCount: number;
  letterCount: number;
}

/**
 * Ratio cyrillique / alphabétique — seuil V1 = 70 % (CONCEPTION §6.1).
 */
export function detectRussian(text: string): RussianDetection {
  const letters = [...text].filter((char) => LETTER_RE.test(char));

  if (letters.length === 0) {
    return {
      isRussian: false,
      ratio: 0,
      detectedLanguage: "unknown",
      cyrillicCount: 0,
      letterCount: 0,
    };
  }

  const cyrillicCount = letters.filter((char) => CYRILLIC_RE.test(char)).length;
  const latinCount = letters.filter((char) => LATIN_RE.test(char)).length;
  const ratio = cyrillicCount / letters.length;
  const isRussian = ratio >= IMPORT_LIMITS.russianCyrillicRatio;

  let detectedLanguage = "unknown";

  if (isRussian) {
    detectedLanguage = "ru";
  } else if (latinCount / letters.length >= 0.7) {
    detectedLanguage = "latin";
  } else if (cyrillicCount > latinCount) {
    detectedLanguage = "mixed";
  }

  return {
    isRussian,
    ratio,
    detectedLanguage,
    cyrillicCount,
    letterCount: letters.length,
  };
}
