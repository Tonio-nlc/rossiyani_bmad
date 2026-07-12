import { segmentGraphemes, toNfc } from "@/lib/utils/russian";

/**
 * Pipeline unique d'affichage du russe (RC-020).
 * Normalise NFC puis segmente en graphèmes pour un rendu accent-safe.
 */
export function displayRussian(text: string): string {
  return segmentGraphemes(text).join("");
}

export function displayRussianGraphemes(text: string): string[] {
  return segmentGraphemes(text);
}

export function normalizeRussianDisplay(text: string): string {
  return toNfc(text);
}
