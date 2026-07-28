/**
 * Extraction des couples (mot affiché, phrase) des 11 textes gold Rossiyani.
 *
 * Partagé entre `cache-prefill-audit.ts` (audit, lecture seule) et
 * `prefill-explanation-cache.ts` (génération), pour garantir que les deux
 * scripts voient exactement les mêmes clés de cache.
 *
 * Reproduit fidèlement la logique du Reader :
 * - phrases : `content_annotated.sentences[].text`, repli `splitIntoSentences`
 *   (même repli que `TextBody.tsx`)
 * - mots cliquables : `tokenizeSentence` + filtre `normalizeToken(...).length > 0`
 *   (même règle que `Sentence.tsx`)
 * - clé de cache : `computeContextHash(surface, phrase)` (même hash que
 *   `explainWord`)
 */

import { createClient } from "@supabase/supabase-js";

import { ROSSIYANI_TEXT_TITLES } from "@/lib/knowledge/bootstrap/types";
import {
  normalizeToken,
  splitIntoSentences,
  tokenizeSentence,
} from "@/lib/utils/russian";
import { computeContextHash } from "@/lib/orchestrator/hasher";

export interface GoldTextRow {
  id: string;
  title: string;
  content: string;
  content_annotated: { sentences?: Array<{ text?: string }> } | null;
  word_count: number | null;
}

export interface WordEntry {
  hash: string;
  surface: string;
  sentence: string;
}

let cachedClient: ReturnType<typeof createClient> | null = null;

/**
 * Client admin partagé par les deux scripts — créé une seule fois, ici,
 * pour éviter de faire circuler une instance typée entre modules (source
 * d'incompatibilités de types génériques avec cette version de supabase-js).
 */
function getSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  cachedClient = createClient(url, serviceRoleKey);

  return cachedClient;
}

export async function fetchGoldTexts(): Promise<{
  texts: GoldTextRow[];
  missingTitles: string[];
}> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("texts")
    .select("id, title, content, content_annotated, word_count")
    .in("title", [...ROSSIYANI_TEXT_TITLES]);

  if (error) {
    throw new Error(`Lecture texts impossible : ${error.message}`);
  }

  const rows = (data ?? []) as GoldTextRow[];
  const missingTitles = ROSSIYANI_TEXT_TITLES.filter(
    (title) => !rows.some((row) => row.title === title),
  );

  // Ordonne selon ROSSIYANI_TEXT_TITLES pour des rapports/logs stables.
  const ordered = ROSSIYANI_TEXT_TITLES.map((title) =>
    rows.find((row) => row.title === title),
  ).filter((row): row is GoldTextRow => Boolean(row));

  return { texts: ordered, missingTitles };
}

/**
 * Hashes déjà présents dans explanation_cache, par lots de 150
 * (limite raisonnable pour une clause `.in(...)`).
 */
export async function fetchExistingHashes(hashes: string[]): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  const found = new Set<string>();
  const BATCH_SIZE = 150;

  for (let i = 0; i < hashes.length; i += BATCH_SIZE) {
    const batch = hashes.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("explanation_cache")
      .select("context_hash")
      .in("context_hash", batch);

    if (error) {
      throw new Error(`Lecture explanation_cache impossible : ${error.message}`);
    }

    for (const row of data ?? []) {
      found.add((row as { context_hash: string }).context_hash);
    }
  }

  return found;
}

/** Repli identique à TextBody.tsx (Reader) quand content_annotated est absent. */
export function extractSentences(text: GoldTextRow): string[] {
  const annotated = text.content_annotated?.sentences;

  if (annotated?.length) {
    return annotated.map((sentence) => sentence.text ?? "").filter(Boolean);
  }

  return splitIntoSentences(text.content);
}

export function usesFallbackSplit(text: GoldTextRow): boolean {
  return !text.content_annotated?.sentences?.length;
}

/** Mots cliquables d'un texte, identique à la règle de Sentence.tsx. */
export function extractWordEntries(text: GoldTextRow): WordEntry[] {
  const entries: WordEntry[] = [];

  for (const sentence of extractSentences(text)) {
    for (const token of tokenizeSentence(sentence)) {
      if (normalizeToken(token).length === 0) {
        continue;
      }

      entries.push({
        hash: computeContextHash(token, sentence),
        surface: token,
        sentence,
      });
    }
  }

  return entries;
}

export interface GoldTextsWordIndex {
  /** Toutes les entrées, dédupliquées globalement par context_hash. */
  global: Map<string, WordEntry>;
  /** Entrées dédupliquées par texte (clé = titre du texte). */
  perText: Map<string, Map<string, WordEntry>>;
}

export function buildWordIndex(texts: GoldTextRow[]): GoldTextsWordIndex {
  const global = new Map<string, WordEntry>();
  const perText = new Map<string, Map<string, WordEntry>>();

  for (const text of texts) {
    const forText = new Map<string, WordEntry>();

    for (const entry of extractWordEntries(text)) {
      forText.set(entry.hash, entry);
      global.set(entry.hash, entry);
    }

    perText.set(text.title, forText);
  }

  return { global, perText };
}
