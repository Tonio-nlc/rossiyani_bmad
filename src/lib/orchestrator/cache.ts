import { createAdminClient } from "@/lib/supabase/admin";
import {
  canonicalizeLemmaForm,
  hasStressMark,
  stripStressMark,
} from "@/lib/vocabulary/canonicalize-lemma-form";
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
 * Résout un lemme existant ou en crée un — canonicalisation à l'insertion.
 *
 * Règle d'unicité (voir canonicalize-lemma-form.ts et
 * docs/knowledge/lemma-canonicalization.md) : la forme canonique est la forme
 * ACCENTUÉE en NFC. Une forme SANS accent qui désigne le même mot qu'une forme
 * déjà accentuée en base réutilise cette ligne (jamais de nouvelle ligne).
 * Deux formes accentuées à des positions DIFFÉRENTES (ex. му́ка / мука́) ne sont
 * JAMAIS fusionnées : ce sont des mots distincts.
 */
export async function resolveOrCreateLemma(lemmaFormRaw: string): Promise<string> {
  const admin = createAdminClient();
  const lemmaForm = canonicalizeLemmaForm(lemmaFormRaw);

  // 1. Correspondance exacte (NFC) — cas le plus fréquent, un aller simple.
  const { data: existing } = await admin
    .from("lemmas")
    .select("id")
    .eq("form", lemmaForm)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  // 2. Repli "accent manquant ↔ accent présent" pour le MÊME mot.
  const strippedIncoming = stripStressMark(lemmaForm);
  const incomingHasStress = hasStressMark(lemmaForm);

  if (strippedIncoming) {
    // Préfixe de sécurité : 1 SEUL caractère. L'accent (U+0301) est toujours un
    // caractère combinant séparé placé APRÈS la voyelle accentuée (le russe n'a
    // pas de lettre accentuée précomposée) : la toute première lettre d'une
    // forme n'est donc jamais déplacée par l'accent, quelle que soit sa position
    // dans le mot — contrairement à un préfixe de plusieurs lettres, qui peut
    // "sauter" au-dessus d'un accent placé tôt (ex. и́мя) et manquer la ligne
    // existante.
    const prefix = strippedIncoming.slice(0, 1);
    const { data: candidates } = await admin
      .from("lemmas")
      .select("id, form")
      .ilike("form", `${prefix}%`);

    const sameBase = (candidates ?? []).filter(
      (row) => stripStressMark(row.form as string) === strippedIncoming,
    );

    const bareExisting = sameBase.filter((row) => !hasStressMark(row.form as string));
    const accentedExisting = sameBase.filter((row) => hasStressMark(row.form as string));
    const distinctAccentedForms = new Set(accentedExisting.map((row) => row.form as string));

    if (incomingHasStress && bareExisting.length === 1) {
      // La forme entrante est accentuée et une ligne "nue" existe déjà pour ce
      // même mot : on la fait enfin porter sa forme canonique (accentuée) au
      // lieu de créer une ligne séparée.
      const target = bareExisting[0]!;
      await admin.from("lemmas").update({ form: lemmaForm }).eq("id", target.id);
      return target.id as string;
    }

    if (!incomingHasStress && bareExisting.length === 0 && distinctAccentedForms.size === 1) {
      // La forme entrante est nue et EXACTEMENT une forme accentuée existe déjà
      // pour ce même mot (aucune ambiguïté) : on réutilise cette ligne.
      return accentedExisting[0]!.id as string;
    }

    // Sinon : soit aucune correspondance sûre, soit plusieurs formes accentuées
    // distinctes partagent la même base (ex. му́ка / мука́) — dans ce cas, une
    // forme nue entrante ne permettrait pas de savoir laquelle est visée : on
    // ne fusionne jamais, on crée une nouvelle ligne (étape 3).
  }

  // 3. Aucune correspondance sûre : créer une nouvelle ligne avec la forme canonique.
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
