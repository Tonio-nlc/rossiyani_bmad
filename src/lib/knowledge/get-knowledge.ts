import type { TLinguisticKnowledge } from "@/types/knowledge";
import {
  mapKnowledgeRow,
  type LinguisticKnowledgeRow,
} from "@/lib/knowledge/types";
import { createEmptyKnowledge } from "@/lib/knowledge/upsert-knowledge";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeRussianWord } from "@/lib/vocabulary/normalize-russian-word";

function hasUsablePartOfSpeech(
  knowledge: TLinguisticKnowledge | null,
): knowledge is TLinguisticKnowledge {
  return Boolean(
    knowledge?.partOfSpeech && knowledge.partOfSpeech !== "unknown",
  );
}

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

/**
 * Knowledge pour la résolution de concept Reader.
 * Lecture seule (service role) — pas de LLM.
 * Si le lemme exact n'a pas de POS, tente la variante d'accent
 * (читать ↔ чита́ть) : même identité orthographique, pas une heuristique sémantique.
 */
export async function getKnowledgeForConceptResolution(input: {
  lemmaId: string;
  lemmaForm: string;
}): Promise<TLinguisticKnowledge | null> {
  const admin = createAdminClient();

  const { data: directRow, error: directError } = await admin
    .from("linguistic_knowledge")
    .select("*")
    .eq("lemma_id", input.lemmaId)
    .maybeSingle();

  if (directError) {
    throw new Error(directError.message);
  }

  const direct = directRow
    ? mapKnowledgeRow(directRow as LinguisticKnowledgeRow)
    : null;

  if (hasUsablePartOfSpeech(direct)) {
    return direct;
  }

  const normalized = normalizeRussianWord(input.lemmaForm);

  if (!normalized) {
    return null;
  }

  const prefix = normalized.slice(0, Math.min(4, normalized.length));
  const { data: candidates, error: candidatesError } = await admin
    .from("lemmas")
    .select("id, form")
    .like("form", `${prefix}%`);

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  const equivalents = (candidates ?? []).filter(
    (row) =>
      row.id !== input.lemmaId &&
      normalizeRussianWord(row.form as string) === normalized,
  );

  if (equivalents.length === 0) {
    return null;
  }

  // Perf : un seul aller-retour pour tous les candidats équivalents (accent,
  // variantes) au lieu d'une requête séquentielle par candidat — le résultat
  // (premier candidat utilisable, dans l'ordre de `equivalents`) est identique.
  const { data: rows, error: rowsError } = await admin
    .from("linguistic_knowledge")
    .select("*")
    .in(
      "lemma_id",
      equivalents.map((candidate) => candidate.id as string),
    );

  if (rowsError) {
    throw new Error(rowsError.message);
  }

  const knowledgeByLemmaId = new Map(
    (rows ?? []).map((row) => [
      (row as LinguisticKnowledgeRow).lemma_id,
      mapKnowledgeRow(row as LinguisticKnowledgeRow),
    ]),
  );

  for (const candidate of equivalents) {
    const knowledge = knowledgeByLemmaId.get(candidate.id as string);

    if (knowledge && hasUsablePartOfSpeech(knowledge)) {
      return knowledge;
    }
  }

  return null;
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
