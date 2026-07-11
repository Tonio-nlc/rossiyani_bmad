import type { TTextWithProgress } from "@/types/reader";

export function isImportedText(text: TTextWithProgress): boolean {
  return text.source === "imported";
}

export function isCuratedText(text: TTextWithProgress): boolean {
  return text.source !== "imported";
}

export function splitLibraryTexts(texts: TTextWithProgress[]) {
  const curatedTexts = texts.filter(isCuratedText);
  const importedTexts = texts.filter(isImportedText);

  return { curatedTexts, importedTexts };
}
