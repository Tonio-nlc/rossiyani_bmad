const FUNCTION_COLOR_MAP = {
  blue: "#3B82F6",
  coral: "#EF7C5A",
  green: "#22C55E",
  violet: "#A78BFA",
  amber: "#F59E0B",
} as const;

export type TReaderFunctionColor = keyof typeof FUNCTION_COLOR_MAP;

export function toNfc(text: string): string {
  return text.normalize("NFC");
}

/**
 * Combining marks (Mn) — Safari-safe substitute for /\p{M}/u.
 * Couvre U+0301 (accent tonique russe) et les diacritiques courants.
 */
function isCombiningMarkCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) ||
    (codePoint >= 0x1ab0 && codePoint <= 0x1aff) ||
    (codePoint >= 0x1dc0 && codePoint <= 0x1dff) ||
    (codePoint >= 0x20d0 && codePoint <= 0x20ff) ||
    (codePoint >= 0xfe20 && codePoint <= 0xfe2f)
  );
}

/** Lettres Latin + Cyrillique — substitute Safari-safe pour /\p{L}/u (périmètre app). */
function isLetterCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x0041 && codePoint <= 0x005a) ||
    (codePoint >= 0x0061 && codePoint <= 0x007a) ||
    (codePoint >= 0x00c0 && codePoint <= 0x024f) ||
    (codePoint >= 0x0400 && codePoint <= 0x04ff) ||
    (codePoint >= 0x0500 && codePoint <= 0x052f) ||
    (codePoint >= 0x1e00 && codePoint <= 0x1eff) ||
    (codePoint >= 0x2de0 && codePoint <= 0x2dff) ||
    (codePoint >= 0xa640 && codePoint <= 0xa69f)
  );
}

function isNumberCodePoint(codePoint: number): boolean {
  return codePoint >= 0x0030 && codePoint <= 0x0039;
}

function isWordChar(char: string): boolean {
  const codePoint = char.codePointAt(0) ?? 0;

  return (
    isLetterCodePoint(codePoint) ||
    isNumberCodePoint(codePoint) ||
    isCombiningMarkCodePoint(codePoint)
  );
}

function isCombiningMarkChar(char: string): boolean {
  return isCombiningMarkCodePoint(char.codePointAt(0) ?? 0);
}

/** Exporté pour les modules client (import) — Safari-safe vs /\p{L}/u. */
export function isUnicodeLetterChar(char: string): boolean {
  return isLetterCodePoint(char.codePointAt(0) ?? 0);
}

/** Découpe en code points (sépare correctement les paires UTF-16). */
function toChars(text: string): string[] {
  return Array.from(text);
}

export function splitTrailingPunctuation(surface: string): {
  wordPart: string;
  trailingPunctuation: string;
} {
  const chars = toChars(surface);
  let end = chars.length;

  while (end > 0 && !isWordChar(chars[end - 1]!)) {
    end -= 1;
  }

  return {
    wordPart: chars.slice(0, end).join(""),
    trailingPunctuation: chars.slice(end).join(""),
  };
}

/**
 * Segmentation graphème déterministe (NFC + Mn collés au caractère de base).
 * Équivalent Safari-safe de l'ancien /\p{M}/u — accents U+0301 préservés.
 */
export function segmentGraphemes(text: string): string[] {
  const normalized = toNfc(text);
  const graphemes: string[] = [];

  for (const char of normalized) {
    if (isCombiningMarkChar(char) && graphemes.length > 0) {
      graphemes[graphemes.length - 1] += char;
    } else {
      graphemes.push(char);
    }
  }

  return graphemes;
}

function stripCombiningMarks(text: string): string {
  return text.replace(/\u0301/g, "");
}

function splitWordPartByGraphemeCount(
  wordPart: string,
  suffixGraphemeCount: number,
): { stem: string; suffix: string } {
  const graphemes = segmentGraphemes(wordPart);
  const stemGraphemes = graphemes.slice(0, -suffixGraphemeCount);
  const suffixGraphemes = graphemes.slice(-suffixGraphemeCount);

  return {
    stem: stemGraphemes.join(""),
    suffix: suffixGraphemes.join(""),
  };
}

function splitWordPartByNormalizedSuffix(
  wordPart: string,
  normalizedSuffix: string,
): { stem: string; suffix: string } | null {
  const wordNorm = stripCombiningMarks(wordPart);

  if (!wordNorm.endsWith(normalizedSuffix)) {
    return null;
  }

  const suffixGraphemeCount = segmentGraphemes(normalizedSuffix).length;
  return splitWordPartByGraphemeCount(wordPart, suffixGraphemeCount);
}

export function getFunctionColorHex(
  functionColor?: TReaderFunctionColor,
): string | undefined {
  if (!functionColor) {
    return undefined;
  }

  return FUNCTION_COLOR_MAP[functionColor];
}

export function splitWordByApiSuffix(
  surface: string,
  apiSuffix: string,
): {
  stem: string;
  suffix: string;
  trailingPunctuation: string;
} | null {
  const nfcSurface = toNfc(surface);
  const normalizedSuffix = apiSuffix.replace(/^-+/, "").trim();

  if (!normalizedSuffix) {
    return null;
  }

  const { wordPart, trailingPunctuation } = splitTrailingPunctuation(nfcSurface);

  const split = splitWordPartByNormalizedSuffix(wordPart, normalizedSuffix);

  if (!split) {
    return null;
  }

  return {
    ...split,
    trailingPunctuation,
  };
}

export function splitWordStemAndSuffix(surface: string): {
  stem: string;
  suffix: string;
  trailingPunctuation: string;
} {
  const nfcSurface = toNfc(surface);
  const { wordPart, trailingPunctuation } = splitTrailingPunctuation(nfcSurface);

  const graphemeCount = segmentGraphemes(wordPart).length;

  if (graphemeCount <= 3) {
    return { stem: "", suffix: wordPart, trailingPunctuation };
  }

  if (graphemeCount <= 6) {
    return {
      ...splitWordPartByGraphemeCount(wordPart, 2),
      trailingPunctuation,
    };
  }

  return {
    ...splitWordPartByGraphemeCount(wordPart, 3),
    trailingPunctuation,
  };
}

export function isPunctuationToken(token: string): boolean {
  const trimmed = token.trim();

  if (!trimmed) {
    return false;
  }

  return toChars(trimmed).every((char) => {
    const codePoint = char.codePointAt(0) ?? 0;

    return !isLetterCodePoint(codePoint) && !isNumberCodePoint(codePoint);
  });
}

export function shouldAddSpaceAfterToken(
  index: number,
  tokens: string[],
): boolean {
  if (index >= tokens.length - 1) {
    return false;
  }

  const nextToken = tokens[index + 1];

  return !isPunctuationToken(nextToken);
}

/**
 * Découpe en phrases — équivalent Safari-safe de /(?<=[.!?…])\s+/
 * (lookbehind non supporté avant Safari 16.4).
 */
export function splitIntoSentences(content: string): string[] {
  return content
    .replace(/([.!?…])\s+/g, "$1\n")
    .split("\n")
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function tokenizeSentence(sentence: string): string[] {
  return toNfc(sentence).split(/\s+/).filter(Boolean);
}

export function normalizeToken(token: string): string {
  const chars = toChars(toNfc(token));
  let start = 0;
  let end = chars.length;

  while (start < end && !isWordChar(chars[start]!)) {
    start += 1;
  }

  while (end > start && !isWordChar(chars[end - 1]!)) {
    end -= 1;
  }

  return chars.slice(start, end).join("");
}

/** Retire les marques combinantes (accents) — Safari-safe vs /\p{M}/gu. */
export function stripAllCombiningMarks(text: string): string {
  return toChars(text)
    .filter((char) => !isCombiningMarkChar(char))
    .join("");
}

export const FUNCTIONAL_ROLE_LABELS: Record<string, string> = {
  subject: "Sujet",
  object_direct: "Objet direct",
  object_indirect: "Objet indirect",
  possession: "Possession",
  location: "Lieu",
  time: "Temps",
  manner: "Manière",
};

export const NATURAL_FUNCTIONAL_ROLE_LABELS: Record<string, string> = {
  subject: "fait l'action",
  object_direct: "reçoit l'action",
  object_indirect: "concerné par l'action",
  possession: "appartient à",
  location: "indique où",
  time: "indique quand",
  manner: "indique comment",
  subject_complement: "décrit le sujet",
  predicate: "dit quelque chose du sujet",
  attribute: "qualifie le nom",
  modifier: "précise le sens",
  complement: "complète la phrase",
  predicate_adjective: "décrit le sujet",
  adverbial: "indique comment ou où",
  apposition: "précise le nom",
};

export function getNaturalFunctionalRoleLabel(role: string): string {
  return (
    NATURAL_FUNCTIONAL_ROLE_LABELS[role] ??
    NATURAL_FUNCTIONAL_ROLE_LABELS[role.toLowerCase()] ??
    "précise la phrase"
  );
}

export function stripTrailingPunctuationForDisplay(surface: string): string {
  return surface.replace(/[.,!?:;…]+$/, "");
}
