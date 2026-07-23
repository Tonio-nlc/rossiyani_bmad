import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeRussianWord } from "@/lib/vocabulary/normalize-russian-word";
import type {
  TCachedExplanationPayload,
  TLlmExplanationPayload,
} from "@/lib/orchestrator/types";

interface ExplanationCacheRow {
  id: string;
  context_hash: string;
  lemma_id: string;
  surface_word: string;
  sentence_example: string;
  explanation_fr: string;
  functional_role: string;
  function_color: string;
  source: "api" | "proprio";
  confidence_score: number;
  usage_count: number;
  lemmas: { form: string } | { form: string }[] | null;
}

function parseCachedPayload(
  explanationFr: string,
): TCachedExplanationPayload {
  try {
    const parsed = JSON.parse(explanationFr) as TCachedExplanationPayload;

    if (parsed.explanation) {
      return parsed;
    }
  } catch {
    // explanation_fr est du texte brut
  }

  return {
    explanation: explanationFr,
    translation: "",
    suffix: "",
    suffixExplanation: "",
  };
}

function serializeCachedPayload(payload: TLlmExplanationPayload): string {
  return JSON.stringify({
    explanation: payload.explanation,
    translation: payload.translation,
    suffix: payload.suffix,
    suffixExplanation: payload.suffixExplanation,
    lemmaStressed: payload.lemmaStressed,
  });
}

export async function getCachedExplanation(contextHash: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("explanation_cache")
    .select(
      "id, context_hash, lemma_id, surface_word, sentence_example, explanation_fr, functional_role, function_color, source, confidence_score, usage_count, lemmas(form)",
    )
    .eq("context_hash", contextHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ExplanationCacheRow;
  const lemmaRelation = row.lemmas;
  const lemmaForm = Array.isArray(lemmaRelation)
    ? lemmaRelation[0]?.form
    : lemmaRelation?.form;

  return {
    id: row.id,
    lemmaId: row.lemma_id,
    lemma: lemmaForm ?? "",
    surface: row.surface_word,
    sentence: row.sentence_example,
    functionalRole: row.functional_role,
    functionColor: row.function_color,
    source: row.source,
    confidenceScore: row.confidence_score,
    usageCount: row.usage_count,
    payload: parseCachedPayload(row.explanation_fr),
  };
}

export async function incrementUsageCount(cacheId: string, usageCount: number) {
  const admin = createAdminClient();
  const nextUsageCount = usageCount + 1;
  const updates: {
    usage_count: number;
    confidence_score?: number;
    source?: "proprio";
    updated_at: string;
  } = {
    usage_count: nextUsageCount,
    updated_at: new Date().toISOString(),
  };

  if (nextUsageCount >= 20) {
    updates.confidence_score = 0.85;
    updates.source = "proprio";
  }

  await admin.from("explanation_cache").update(updates).eq("id", cacheId);
}

export async function storeExplanationInCache(params: {
  contextHash: string;
  lemmaId: string;
  surface: string;
  sentence: string;
  payload: TLlmExplanationPayload;
}) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("explanation_cache")
    .insert({
      context_hash: params.contextHash,
      lemma_id: params.lemmaId,
      surface_word: params.surface,
      sentence_example: params.sentence,
      explanation_fr: serializeCachedPayload(params.payload),
      functional_role: params.payload.functionalRole,
      function_color: params.payload.functionColor,
      source: "api",
      confidence_score: 0.5,
      usage_count: 1,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Impossible de stocker l'explication");
  }

  return data.id as string;
}

/**
 * Résout un lemme existant (y compris variante d'accent) ou en crée un.
 * Préfère le lemme qui a déjà une linguistic_knowledge avec POS
 * (ex. чита́ть plutôt que читать sans fiche).
 */
export async function resolveOrCreateLemma(lemmaForm: string): Promise<string> {
  const admin = createAdminClient();
  const normalized = normalizeRussianWord(lemmaForm);

  if (normalized) {
    const prefix = normalized.slice(0, Math.min(4, normalized.length));
    const { data: candidates } = await admin
      .from("lemmas")
      .select("id, form, linguistic_knowledge(part_of_speech)")
      .like("form", `${prefix}%`);

    const equivalents = (candidates ?? []).filter(
      (row) => normalizeRussianWord(row.form as string) === normalized,
    );

    const withKnowledge = equivalents.find((row) => {
      const knowledge = row.linguistic_knowledge as
        | { part_of_speech: string | null }
        | { part_of_speech: string | null }[]
        | null;
      const pos = Array.isArray(knowledge)
        ? knowledge[0]?.part_of_speech
        : knowledge?.part_of_speech;
      return Boolean(pos && pos !== "unknown");
    });

    if (withKnowledge?.id) {
      return withKnowledge.id as string;
    }

    const withAccent = equivalents.find((row) =>
      (row.form as string).normalize("NFD").includes("\u0301"),
    );

    if (withAccent?.id) {
      return withAccent.id as string;
    }

    const exact = equivalents.find((row) => row.form === lemmaForm);

    if (exact?.id) {
      return exact.id as string;
    }
  }

  const { data: existing } = await admin
    .from("lemmas")
    .select("id")
    .eq("form", lemmaForm)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: created, error } = await admin
    .from("lemmas")
    .insert({
      form: lemmaForm,
      pos: "unknown",
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Impossible de créer le lemme");
  }

  return created.id as string;
}
