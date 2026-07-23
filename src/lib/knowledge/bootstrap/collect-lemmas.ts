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

  return uniqueByLemmaId(collected);
}

/**
 * Lemmes rencontrés dans le Reader (clics → explanation_cache).
 * Inclut найти́ / прочитать même s'ils n'apparaissent pas dans les textes P0.
 * Priorité P0 : même file d'attente bootstrap que la bibliothèque.
 */
export async function collectReaderEncounterLemmas(): Promise<TBootstrapLemma[]> {
  const admin = createAdminClient();

  const { data: cacheRows, error: cacheError } = await admin
    .from("explanation_cache")
    .select("lemma_id, lemmas ( form )");

  if (cacheError) {
    throw new Error(cacheError.message);
  }

  const collected: TBootstrapLemma[] = [];

  for (const row of (cacheRows ?? []) as ExplanationCacheRow[]) {
    if (!row.lemma_id) {
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
      source: "explanation_cache:reader",
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

const PRIORITY_RANK: Record<TBootstrapPriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
};

/**
 * Fusionne les buckets pour la génération.
 *
 * Ancien bug : P0 puis P1 puis P2 + `seen` gardait toujours P0 → les lemmes
 * user_vocabulary (P2) aussi présents en P0 disparaissaient du compteur P2
 * (couverture P2 = 0) même s'ils étaient bien candidats via P0.
 *
 * Nouveau : on déduplique pour la file d'exécution (une seule génération / lemme,
 * priorité la plus haute), et la couverture P0/P1/P2 se calcule séparément
 * via `countEnrichedByPriority` sur chaque bucket source.
 */
export async function collectBootstrapLemmas(
  only?: TBootstrapPriority,
): Promise<TBootstrapLemma[]> {
  const buckets: TBootstrapLemma[] = [];

  if (!only || only === "P0") {
    buckets.push(...(await collectP0Lemmas()));
    buckets.push(...(await collectReaderEncounterLemmas()));
  }

  if (!only || only === "P1") {
    buckets.push(...(await collectP1Lemmas()));
  }

  if (!only || only === "P2") {
    buckets.push(...(await collectP2Lemmas()));
  }

  const byId = new Map<string, TBootstrapLemma>();

  for (const lemma of buckets) {
    const existing = byId.get(lemma.lemmaId);

    if (!existing || PRIORITY_RANK[lemma.priority] < PRIORITY_RANK[existing.priority]) {
      byId.set(lemma.lemmaId, lemma);
    }
  }

  return [...byId.values()].sort(
    (left, right) =>
      PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] ||
      left.form.localeCompare(right.form, "ru"),
  );
}

export async function countEnrichedByPriority(): Promise<{
  p0: { total: number; enriched: number };
  p1: { total: number; enriched: number };
  p2: { total: number; enriched: number };
}> {
  const admin = createAdminClient();

  const [p0Lemmas, readerLemmas, p1Lemmas, p2Lemmas] = await Promise.all([
    collectP0Lemmas(),
    collectReaderEncounterLemmas(),
    collectP1Lemmas(),
    collectP2Lemmas(),
  ]);

  /** P0 couverture = textes Rossiyani ∪ rencontres Reader. */
  const p0All = uniqueByLemmaId([...p0Lemmas, ...readerLemmas]);

  const allIds = uniqueByLemmaId([
    ...p0All,
    ...p1Lemmas,
    ...p2Lemmas,
  ]).map((lemma) => lemma.lemmaId);

  const { data, error } = await admin
    .from("linguistic_knowledge")
    .select("lemma_id, profile_version, validated")
    .in("lemma_id", allIds.length > 0 ? allIds : ["00000000-0000-0000-0000-000000000000"]);

  if (error) {
    if (error.message.includes("profile_version")) {
      const { data: fallback, error: fallbackError } = await admin
        .from("linguistic_knowledge")
        .select("lemma_id, validated")
        .in(
          "lemma_id",
          allIds.length > 0 ? allIds : ["00000000-0000-0000-0000-000000000000"],
        );

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      const enriched = new Set(
        (fallback ?? [])
          .filter((row) => row.validated === true)
          .map((row) => row.lemma_id as string),
      );

      const count = (lemmas: TBootstrapLemma[]) => ({
        total: lemmas.length,
        enriched: lemmas.filter((lemma) => enriched.has(lemma.lemmaId)).length,
      });

      return {
        p0: count(p0All),
        p1: count(p1Lemmas),
        p2: count(p2Lemmas),
      };
    }

    throw new Error(error.message);
  }

  const enriched = new Set(
    (data ?? [])
      .filter((row) => (row.profile_version ?? 1) >= 2)
      .map((row) => row.lemma_id as string),
  );

  const count = (lemmas: TBootstrapLemma[]) => ({
    total: lemmas.length,
    enriched: lemmas.filter((lemma) => enriched.has(lemma.lemmaId)).length,
  });

  return {
    p0: count(p0All),
    p1: count(p1Lemmas),
    p2: count(p2Lemmas),
  };
}
