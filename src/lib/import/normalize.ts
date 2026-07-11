import { toNfc } from "../utils/russian";

const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
const HTML_TAG_RE = /<[^>]*>/g;
const HORIZONTAL_SPACE_RE = /[^\S\n]+/g;

/**
 * Nettoie le texte brut avant analyse : NFC, HTML basique, espaces et retours ligne.
 */
export function cleanImportText(raw: string): string {
  const nfc = toNfc(raw.trim());
  const withoutHtml = nfc.replace(HTML_TAG_RE, "");
  const unifiedBreaks = withoutHtml.replace(/\r\n?/g, "\n");
  const lines = unifiedBreaks
    .split("\n")
    .map((line) => line.replace(HORIZONTAL_SPACE_RE, " ").trim())
    .filter(Boolean);

  return lines.join(" ").replace(HORIZONTAL_SPACE_RE, " ").trim();
}

export function hasInvalidControlCharacters(raw: string): boolean {
  return CONTROL_CHAR_RE.test(raw);
}
