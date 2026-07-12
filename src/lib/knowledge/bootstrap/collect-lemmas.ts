import { normalizeRussianWord } from "@/lib/vocabulary/normalize-russian-word";
import { ROSSIYANI_TEXT_TITLES } from "@/lib/knowledge/bootstrap/types";
import type { TBootstrapLemma, TBootstrapPriority } from "@/lib/knowledge/bootstrap/types";
import { createAdminClient } from "@/lib/supabase/admin";

const TOKEN_RE = /[\p{L}\p{M}]+/gu;

interface TextRow {
  id: string;
  title: string;
  content: string;
  content_annotated: {
    sentences?: Array<{
      text?: string;
      words?: Array<{ lemmaId?: string; text?: string }>;
    }>;
  } | null;
}

interface LemmaRow {
  id: string;
  form: string;
}

interface WordFormRow {
  lemma_id: string;
  surface: string;
}

interface LessonRow {
  id: string;
  slug: string;
  title: string;
  content_blocks: Array<{
    type?: string;
    russian?: string;
    words?: Array<{ text?: string }>;
  }> | null;
}

interface ExplanationCacheRow {
  lemma_id: string;
  sentence_example: string;
  lemmas: { form: string } | { form: string }[] | null;
}

function extractTokens(text: string): string[] {
  return text.match(TOKEN_RE) ?? [];
}

function uniqueByLemmaId(lemmas: TBootstrapLemma[]): TBootstrapLemma[] {
  const seen = new Set<string>();
  const result: TBootstrapLemma[] = [];

  for (const lemma of lemmas) {
    if (seen.has(lemma.lemmaId)) {
      continue;
    }

    seen.add(lemma.lemmaId);
    result.push(lemma);
  }

  return result;
}

async function buildLemmaLookup(admin: ReturnType<typeof createAdminClient>) {
  const [{ data: lemmas }, { data: wordForms }] = await Promise.all([
    admin.from("lemmas").select("id, form"),
    admin.from("word_forms").select("lemma_id, surface"),
  ]);

  const byNormalized = new Map<string, LemmaRow>();

  for (const lemma of (lemmas ?? []) as LemmaRow[]) {
    const key = normalizeRussianWord(lemma.form);

    if (key && !byNormalized.has(key)) {
      byNormalized.set(key, lemma);
    }
  }

  for (const wordForm of (wordForms ?? []) as WordFormRow[]) {
    const key = normalizeRussianWord(wordForm.surface);
    const existing = byNormalized.get(key);

    if (key && !existing) {
      byNormalized.set(key, {
        id: wordForm.lemma_id,
        form: wordForm.surface,
      });
    }
  }

  return byNormalized;
}

function resolveTokens(
  tokens: string[],
  lookup: Map<string, LemmaRow>,
  priority: TBootstrapPriority,
  source: string,
): TBootstrapLemma[] {
  const results: TBootstrapLemma[] = [];

  for (const token of tokens) {
    const normalized = normalizeRussianWord(token);

    if (!normalized || normalized.length < 2) {
      continue;
    }

    const lemma = lookup.get(normalized);

    if (!lemma) {
      continue;
    }

    results.push({
      lemmaId: lemma.id,
      form: lemma.form,
      priority,
      source,
    });
  }

  return results;
}

function collectAnnotatedLemmaIds(text: TextRow): string[] {
  const ids: string[] = [];
  const sentences = text.content_annotated?.sentences ?? [];

  for (const sentence of sentences) {
    for (const word of sentence.words ?? []) {
      if (word.lemmaId) {
        ids.push(word.lemmaId);
      }
    }
  }

  return ids;
}

export async function collectP0Lemmas(): Promise<TBootstrapLemma[]> {
  const admin = createAdminClient();
  const lookup = await buildLemmaLookup(admin);

  const { data: texts, error } = await admin
    .from("texts")
    .select("id, title, content, content_annotated")
    .in("title", [...ROSSIYANI_TEXT_TITLES]);

  if (error) {
    throw new Error(error.message);
  }

  const textRows = (texts ?? []) as TextRow[];
  const textContents = textRows.map((text) => text.content);
  const collected: TBootstrapLemma[] = [];

  for (const text of textRows) {
    collected.push(
      ...resolveTokens(
        extractTokens(text.content),
        lookup,
        "P0",
        `text:${text.title}`,
      ),
    );

    for (const lemmaId of collectAnnotatedLemmaIds(text)) {
      const lemma = [...lookup.values()].find((row) => row.id === lemmaId);

      collected.push({
        lemmaId,
        form: lemma?.form ?? lemmaId,
        priority: "P0",
        source: `annotated:${text.title}`,
      });
    }
  }

  const { data: cacheRows, error: cacheError } = await admin
    .from("explanation_cache")
    .select("lemma_id, sentence_example, lemmas ( form )");

  if (cacheError) {
    throw new Error(cacheError.message);
  }

  for (const row of (cacheRows ?? []) as ExplanationCacheRow[]) {
    const inRossiyaniText = textContents.some((content) =>
      content.includes(row.sentence_example.slice(0, 24)),
    );

    if (!inRossiyaniText) {
      continue;
    }

    const lemmaRelation = row.lemmas;
    const lemma = Array.isArray(lemmaRelation)
      ? lemmaRelation[0]
      : lemmaRelation;

    collected.push({
      lemmaId: row.lemma_id,
      form: lemma?.form ?? row.lemma_id,
      priority: "P0",
      source: "explanation_cache",
    });
  }

  return uniqueByLemmaId(collected);
}

function collectLessonTokens(lesson: LessonRow): string[] {
  const tokens: string[] = [];

  for (const block of lesson.content_blocks ?? []) {
    if (block.russian) {
      tokens.push(...extractTokens(block.russian));
    }

    for (const word of block.words ?? []) {
      if (word.text) {
        tokens.push(...extractTokens(word.text));
      }
    }
  }

  return tokens;
}

export async function collectP1Lemmas(): Promise<TBootstrapLemma[]> {
  const admin = createAdminClient();
  const lookup = await buildLemmaLookup(admin);

  const { data: lessons, error } = await admin
    .from("lessons")
    .select("id, slug, title, content_blocks")
    .not("content_blocks", "eq", "[]");

  if (error) {
    throw new Error(error.message);
  }

  const collected: TBootstrapLemma[] = [];

  for (const lesson of (lessons ?? []) as LessonRow[]) {
    collected.push(
      ...resolveTokens(
        collectLessonTokens(lesson),
        lookup,
        "P1",
        `lesson:${lesson.slug}`,
      ),
    );
  }

  return uniqueByLemmaId(collected);
}

export async function collectP2Lemmas(): Promise<TBootstrapLemma[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("user_vocabulary")
    .select("lemma_id, lemmas ( form )");

  if (error) {
    throw new Error(error.message);
  }

  const collected: TBootstrapLemma[] = [];

  for (const row of data ?? []) {
    const lemmaRelation = row.lemmas as
      | { form: string }
      | { form: string }[]
      | null;
    const lemma = Array.isArray(lemmaRelation)
      ? lemmaRelation[0]
      : lemmaRelation;

    if (!row.lemma_id) {
      continue;
    }

    collected.push({
      lemmaId: row.lemma_id,
      form: lemma?.form ?? row.lemma_id,
      priority: "P2",
      source: "user_vocabulary",
    });
  }

  return uniqueByLemmaId(collected);
}

export async function collectBootstrapLemmas(
  only?: TBootstrapPriority,
): Promise<TBootstrapLemma[]> {
  const buckets: TBootstrapLemma[] = [];

  if (!only || only === "P0") {
    buckets.push(...(await collectP0Lemmas()));
  }

  if (!only || only === "P1") {
    buckets.push(...(await collectP1Lemmas()));
  }

  if (!only || only === "P2") {
    buckets.push(...(await collectP2Lemmas()));
  }

  const seen = new Set<string>();
  const merged: TBootstrapLemma[] = [];

  for (const lemma of buckets) {
    if (seen.has(lemma.lemmaId)) {
      continue;
    }

    seen.add(lemma.lemmaId);
    merged.push(lemma);
  }

  return merged;
}

export async function countEnrichedByPriority(
  lemmas: TBootstrapLemma[],
): Promise<{
  p0: { total: number; enriched: number };
  p1: { total: number; enriched: number };
  p2: { total: number; enriched: number };
}> {
  const admin = createAdminClient();
  const lemmaIds = lemmas.map((lemma) => lemma.lemmaId);

  const { data, error } = await admin
    .from("linguistic_knowledge")
    .select("lemma_id, profile_version, validated")
    .in("lemma_id", lemmaIds);

  if (error) {
    if (error.message.includes("profile_version")) {
      const { data: fallback, error: fallbackError } = await admin
        .from("linguistic_knowledge")
        .select("lemma_id, validated")
        .in("lemma_id", lemmaIds);

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      const enriched = new Set(
        (fallback ?? [])
          .filter((row) => row.validated === true)
          .map((row) => row.lemma_id as string),
      );

      const count = (priority: TBootstrapPriority) => {
        const subset = lemmas.filter((lemma) => lemma.priority === priority);
        return {
          total: subset.length,
          enriched: subset.filter((lemma) => enriched.has(lemma.lemmaId)).length,
        };
      };

      return {
        p0: count("P0"),
        p1: count("P1"),
        p2: count("P2"),
      };
    }

    throw new Error(error.message);
  }

  const enriched = new Set(
    (data ?? [])
      .filter((row) => (row.profile_version ?? 1) >= 2)
      .map((row) => row.lemma_id as string),
  );

  const count = (priority: TBootstrapPriority) => {
    const subset = lemmas.filter((lemma) => lemma.priority === priority);
    return {
      total: subset.length,
      enriched: subset.filter((lemma) => enriched.has(lemma.lemmaId)).length,
    };
  };

  return {
    p0: count("P0"),
    p1: count("P1"),
    p2: count("P2"),
  };
}
