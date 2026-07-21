import { generateKnowledgeFromLlm } from "@/lib/knowledge/generate-knowledge-llm";
import { getKnowledgeByLemmaId } from "@/lib/knowledge/get-knowledge";
import { isKnowledgeComplete } from "@/lib/knowledge/is-knowledge-complete";
import { logKnowledge } from "@/lib/knowledge/log-knowledge";
import {
  buildUpsertFromLlmPayload,
  createEmptyKnowledge,
  upsertKnowledge,
} from "@/lib/knowledge/upsert-knowledge";
import { createClient } from "@/lib/supabase/server";
import type { TLinguisticKnowledge } from "@/types/knowledge";

async function getLemmaForm(lemmaId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lemmas")
    .select("form")
    .eq("id", lemmaId)
    .maybeSingle();

  if (error || !data?.form) {
    console.warn(`[buildKnowledge] Lemme introuvable: ${lemmaId}`, error?.message);
    return null;
  }

  return data.form;
}

/**
 * Charge ou génère la connaissance linguistique.
 * Au RENDU : ne throw jamais — retourne une coquille vide si génération impossible.
 */
export async function buildKnowledge(
  lemmaId: string,
): Promise<TLinguisticKnowledge> {
  const existing = await getKnowledgeByLemmaId(lemmaId);

  if (existing && isKnowledgeComplete(existing)) {
    logKnowledge("Cache hit");
    return existing;
  }

  if (existing) {
    logKnowledge("Cache incomplete — attempting enrichment");
  } else {
    logKnowledge("Generating");
  }

  try {
    const lemmaForm = await getLemmaForm(lemmaId);

    if (!lemmaForm) {
      return existing ?? (await createEmptyKnowledge(lemmaId));
    }

    const generated = await generateKnowledgeFromLlm(lemmaForm);

    const recheck = await getKnowledgeByLemmaId(lemmaId);

    if (recheck && isKnowledgeComplete(recheck)) {
      logKnowledge("Cache hit");
      return recheck;
    }

    const saved = await upsertKnowledge(
      buildUpsertFromLlmPayload(lemmaId, generated.payload),
    );

    logKnowledge("Saved");

    return saved;
  } catch (error) {
    console.warn(
      `[buildKnowledge] Génération impossible pour ${lemmaId} — fiche dégradée`,
      error instanceof Error ? error.message : error,
    );

    return existing ?? (await createEmptyKnowledge(lemmaId));
  }
}
