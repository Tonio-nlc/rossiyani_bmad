const FUNCTION_COLOR_MAP = {
  blue: "#3B82F6",
  coral: "#EF7C5A",
  green: "#22C55E",
  violet: "#A78BFA",
  amber: "#F59E0B",
} as const;

export type TReaderFunctionColor = keyof typeof FUNCTION_COLOR_MAP;

const COMBINING_ACUTE = "\u0301";

function segmentGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ru", { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((part) => part.segment);
  }

  const graphemes: string[] = [];

  for (const char of text) {
    if (char === COMBINING_ACUTE && graphemes.length > 0) {
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
  const normalizedSuffix = apiSuffix.replace(/^-+/, "").trim();

  if (!normalizedSuffix) {
    return null;
  }

  const trailingMatch = surface.match(/([^\p{L}\p{N}]+)$/u);
  const trailingPunctuation = trailingMatch?.[1] ?? "";
  const wordPart = trailingPunctuation
    ? surface.slice(0, -trailingPunctuation.length)
    : surface;

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
  const trailingMatch = surface.match(/([^\p{L}\p{N}]+)$/u);
  const trailingPunctuation = trailingMatch?.[1] ?? "";
  const wordPart = trailingPunctuation
    ? surface.slice(0, -trailingPunctuation.length)
    : surface;

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

  return /^[^\p{L}\p{N}]+$/u.test(trimmed);
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

export function splitIntoSentences(content: string): string[] {
  return content
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function tokenizeSentence(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

export function normalizeToken(token: string): string {
  return token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
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
