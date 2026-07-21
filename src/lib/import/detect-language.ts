import { IMPORT_LIMITS } from "./constants";
import { isUnicodeLetterChar } from "../utils/russian";

export interface RussianDetection {
  isRussian: boolean;
  ratio: number;
  detectedLanguage: string;
  cyrillicCount: number;
  letterCount: number;
}

function isCyrillicChar(char: string): boolean {
  const codePoint = char.codePointAt(0) ?? 0;

  return (
    (codePoint >= 0x0400 && codePoint <= 0x04ff) ||
    (codePoint >= 0x0500 && codePoint <= 0x052f) ||
    (codePoint >= 0x2de0 && codePoint <= 0x2dff) ||
    (codePoint >= 0xa640 && codePoint <= 0xa69f)
  );
}

function isLatinChar(char: string): boolean {
  const codePoint = char.codePointAt(0) ?? 0;

  return (
    (codePoint >= 0x0041 && codePoint <= 0x005a) ||
    (codePoint >= 0x0061 && codePoint <= 0x007a) ||
    (codePoint >= 0x00c0 && codePoint <= 0x024f) ||
    (codePoint >= 0x1e00 && codePoint <= 0x1eff)
  );
}

/**
 * Ratio cyrillique / alphabétique — seuil V1 = 70 % (CONCEPTION §6.1).
 * Sans /\p{Script=…}/ (Safari-safe).
 */
export function detectRussian(text: string): RussianDetection {
  const letters = [...text].filter((char) => isUnicodeLetterChar(char));

  if (letters.length === 0) {
    return {
      isRussian: false,
      ratio: 0,
      detectedLanguage: "unknown",
      cyrillicCount: 0,
      letterCount: 0,
    };
  }

  const cyrillicCount = letters.filter((char) => isCyrillicChar(char)).length;
  const latinCount = letters.filter((char) => isLatinChar(char)).length;
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
