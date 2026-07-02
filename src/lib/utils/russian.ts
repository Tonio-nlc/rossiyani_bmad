const FUNCTION_COLOR_MAP = {
  blue: "#3B82F6",
  coral: "#EF7C5A",
  green: "#22C55E",
  violet: "#A78BFA",
  amber: "#F59E0B",
} as const;

export type TReaderFunctionColor = keyof typeof FUNCTION_COLOR_MAP;

export function getFunctionColorHex(
  functionColor?: TReaderFunctionColor,
): string | undefined {
  if (!functionColor) {
    return undefined;
  }

  return FUNCTION_COLOR_MAP[functionColor];
}

export function splitWordStemAndSuffix(surface: string): {
  stem: string;
  suffix: string;
} {
  const cleanSurface = surface.trim();

  if (cleanSurface.length <= 3) {
    return { stem: "", suffix: cleanSurface };
  }

  const suffixLength = cleanSurface.length <= 5 ? 2 : 3;

  return {
    stem: cleanSurface.slice(0, -suffixLength),
    suffix: cleanSurface.slice(-suffixLength),
  };
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
