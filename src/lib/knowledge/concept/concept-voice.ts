import { constrainCognitiveParagraph } from "@/lib/knowledge/teaching/cognitive-limits";

const VAGUE_PATTERNS: Array<[RegExp, string]> = [
  [/le russe choisit cette forme\b/gi, "Ici, la phrase exige"],
  [/le russe veut exprimer\b/gi, "Ici, le locuteur met l'accent sur"],
  [/cette terminaison indique\b/gi, "La terminaison -"],
  [/cette forme montre\b/gi, "La forme"],
  [/le russe choisit\b/gi, "La phrase utilise"],
  [/le russe n'utilise pas\b/gi, "On n'emploie pas ici"],
];

function capitalize(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return trimmed;
  }

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

export function rewriteConceptVoice(text: string): string {
  let result = text.trim();

  if (!result) {
    return result;
  }

  for (const [pattern, replacement] of VAGUE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  return capitalize(result);
}

export function toConceptParagraph(text: string, maxWords = 60): string {
  return constrainCognitiveParagraph(rewriteConceptVoice(text), maxWords, 2);
}

export function toConceptParagraphs(
  texts: string[],
  maxParagraphs = 2,
): string[] {
  return texts
    .map((text) => toConceptParagraph(text))
    .filter(Boolean)
    .slice(0, maxParagraphs);
}
