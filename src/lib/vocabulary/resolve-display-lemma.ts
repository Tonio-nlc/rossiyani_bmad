import { toNfc } from "@/lib/utils/russian";

/**
 * Lemme affiché : `lemmas.form` (curé) d'abord.
 * `lemmaStressed` (cache LLM) seulement si la forme curée est absente.
 * Sans cette précédence, le LLM peut réécrire des accents inventés
 * (ex. « послé ») alors que la base porte déjà la forme correcte.
 */
export function resolveDisplayLemma(
  lemma: string | null | undefined,
  lemmaStressed?: string | null,
): string {
  const fromDb = lemma?.trim();

  if (fromDb) {
    return toNfc(fromDb);
  }

  const fromCache = lemmaStressed?.trim();

  if (fromCache) {
    return toNfc(fromCache);
  }

  return "";
}
