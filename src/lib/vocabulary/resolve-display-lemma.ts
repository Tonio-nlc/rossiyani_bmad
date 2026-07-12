import { toNfc } from "@/lib/utils/russian";

export function resolveDisplayLemma(
  lemma: string,
  lemmaStressed?: string | null,
): string {
  const candidate = lemmaStressed?.trim();

  if (candidate) {
    return toNfc(candidate);
  }

  return toNfc(lemma);
}
