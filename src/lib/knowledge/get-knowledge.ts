import type { TLinguisticKnowledge } from "@/types/knowledge";
import {
  mapKnowledgeRow,
  type LinguisticKnowledgeRow,
} from "@/lib/knowledge/types";
import { createEmptyKnowledge } from "@/lib/knowledge/upsert-knowledge";
import { createClient } from "@/lib/supabase/server";

export async function getKnowledgeByLemmaId(
  lemmaId: string,
): Promise<TLinguisticKnowledge | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("linguistic_knowledge")
    .select("*")
    .eq("lemma_id", lemmaId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapKnowledgeRow(data as LinguisticKnowledgeRow);
}

export async function ensureKnowledgeExists(
  lemmaId: string,
): Promise<TLinguisticKnowledge> {
  const existing = await getKnowledgeByLemmaId(lemmaId);

  if (existing) {
    return existing;
  }

  return createEmptyKnowledge(lemmaId);
}
