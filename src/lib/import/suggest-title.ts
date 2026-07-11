import { IMPORT_LIMITS } from "./constants";

const TITLE_PUNCTUATION_RE = /[.!?…:;]/;

/**
 * UX §4.2 — première ligne courte sans ponctuation forte, sinon « Mon texte ».
 */
export function suggestImportTitle(rawText: string): string {
  const firstLine = rawText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return "Mon texte";
  }

  if (
    firstLine.length <= 80 &&
    !TITLE_PUNCTUATION_RE.test(firstLine)
  ) {
    return firstLine.slice(0, IMPORT_LIMITS.maxTitleLength);
  }

  return "Mon texte";
}
