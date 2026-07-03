import { generateKnowledgeFromLlm } from "@/lib/knowledge/generate-knowledge-llm";
import { getKnowledgeByLemmaId } from "@/lib/knowledge/get-knowledge";
import { isKnowledgeComplete } from "@/lib/knowledge/is-knowledge-complete";
import { logKnowledge } from "@/lib/knowledge/log-knowledge";
import { upsertKnowledge } from "@/lib/knowledge/upsert-knowledge";
import { createClient } from "@/lib/supabase/server";
import type { TLinguisticKnowledge } from "@/types/knowledge";

function serializeGovernment(government: string[]): string | null {
  if (government.length === 0) {
    return null;
  }

  return JSON.stringify(government);
}

async function getLemmaForm(lemmaId: string): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lemmas")
    .select("form")
    .eq("id", lemmaId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.form) {
    throw new Error("Lemme introuvable");
  }

  return data.form;
}

export async function buildKnowledge(
  lemmaId: string,
): Promise<TLinguisticKnowledge> {
  const existing = await getKnowledgeByLemmaId(lemmaId);

  if (existing && isKnowledgeComplete(existing)) {
    logKnowledge("Cache hit");
    return existing;
  }

  logKnowledge("Generating");

  const lemmaForm = await getLemmaForm(lemmaId);
  const generated = await generateKnowledgeFromLlm(lemmaForm);

  const recheck = await getKnowledgeByLemmaId(lemmaId);

  if (recheck && isKnowledgeComplete(recheck)) {
    logKnowledge("Cache hit");
    return recheck;
  }

  const saved = await upsertKnowledge({
    lemmaId,
    partOfSpeech: generated.partOfSpeech,
    gender: generated.gender,
    aspect: generated.aspect,
    movementType: generated.movementType,
    government: serializeGovernment(generated.government),
    semanticCategory: generated.semanticCategory,
    register: generated.register,
    difficulty: generated.difficulty,
    notes: generated.notes || null,
    tags: generated.tags,
    generatedBy: "llm",
    validated: true,
  });

  logKnowledge("Saved");

  return saved;
}
