import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing supabase env");

  const sb = createClient(url, key);

  const { data: vocab, error } = await sb
    .from("user_vocabulary")
    .select(
      `
      lemma_id,
      explanation_cache_id,
      lemmas ( form ),
      explanation_cache ( surface_word, sentence_example )
    `,
    )
    .limit(100);

  if (error) {
    console.error("vocab err", error);
    process.exit(1);
  }

  const lemmaIds = [...new Set((vocab ?? []).map((r) => r.lemma_id as string))];
  const { data: knowledge } = await sb
    .from("linguistic_knowledge")
    .select("lemma_id, part_of_speech, aspect")
    .in("lemma_id", lemmaIds);

  const { data: caches } = await sb
    .from("explanation_cache")
    .select("lemma_id, surface_word, sentence_example")
    .in("lemma_id", lemmaIds);

  const knowledgeById = new Map(
    (knowledge ?? []).map((k) => [k.lemma_id as string, k]),
  );
  const cacheByLemma = new Map<string, Array<{ surface_word: string; sentence_example: string }>>();
  for (const c of caches ?? []) {
    const list = cacheByLemma.get(c.lemma_id as string) ?? [];
    list.push(c as { surface_word: string; sentence_example: string });
    cacheByLemma.set(c.lemma_id as string, list);
  }

  console.log("user_vocab rows:", vocab?.length);
  console.log("unique lemmas:", lemmaIds.length);
  console.log("---");

  let noKnowledge = 0;
  let noEncounter = 0;
  let complete = 0;

  for (const row of vocab ?? []) {
    const lemmas = row.lemmas as { form: string } | { form: string }[] | null;
    const lemma = Array.isArray(lemmas) ? lemmas[0]?.form : lemmas?.form;
    const k = knowledgeById.get(row.lemma_id as string);
    const linked = Boolean(row.explanation_cache_id);
    const cacheRows = cacheByLemma.get(row.lemma_id as string) ?? [];
    const linkedCache = Array.isArray(row.explanation_cache)
      ? row.explanation_cache[0]
      : row.explanation_cache;
    const surface =
      (linkedCache as { surface_word?: string } | null)?.surface_word ||
      cacheRows[0]?.surface_word ||
      "";
    const sentence =
      (linkedCache as { sentence_example?: string } | null)?.sentence_example ||
      cacheRows[0]?.sentence_example ||
      "";

    if (!k) noKnowledge += 1;
    if (!surface || !sentence) noEncounter += 1;
    if (k && surface && sentence) complete += 1;

    console.log(
      [
        lemma,
        k
          ? `knowledge:Y(${(k as { part_of_speech?: string }).part_of_speech || "?"}/${(k as { aspect?: string }).aspect || "-"})`
          : "knowledge:N",
        linked ? "cacheLink:Y" : "cacheLink:N",
        `cacheRows:${cacheRows.length}`,
        surface ? `surface:${surface}` : "surface:-",
        sentence ? "sentence:Y" : "sentence:N",
      ].join(" | "),
    );
  }

  console.log("---");
  console.log("complete (knowledge+encounter):", complete);
  console.log("missing knowledge:", noKnowledge);
  console.log("missing encounter surface/sentence:", noEncounter);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
