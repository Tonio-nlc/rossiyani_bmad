import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { isKnowledgeComplete } from "../src/lib/knowledge/is-knowledge-complete";
import { mapKnowledgeRow, type LinguisticKnowledgeRow } from "../src/lib/knowledge/types";

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
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: vocab } = await sb
    .from("user_vocabulary")
    .select("lemma_id, lemmas ( form )")
    .limit(50);

  const lemmaIds = (vocab ?? []).map((r) => r.lemma_id as string);
  const { data: knowledgeRows } = await sb
    .from("linguistic_knowledge")
    .select("*")
    .in("lemma_id", lemmaIds);

  const byId = new Map(
    (knowledgeRows ?? []).map((row) => [
      row.lemma_id as string,
      mapKnowledgeRow(row as LinguisticKnowledgeRow),
    ]),
  );

  for (const row of vocab ?? []) {
    const lemmas = row.lemmas as { form: string } | { form: string }[] | null;
    const lemma = Array.isArray(lemmas) ? lemmas[0]?.form : lemmas?.form;
    const k = byId.get(row.lemma_id as string);
    if (!k) {
      console.log(lemma, "| knowledge:MISSING → buildKnowledge will LLM-generate");
      continue;
    }
    console.log(
      lemma,
      "| complete?",
      isKnowledgeComplete(k),
      "| pos=",
      k.partOfSpeech,
      "| aspect=",
      k.aspect,
      "| coreMeaning=",
      Boolean(k.semantics?.coreMeaning),
      "| takeaway=",
      Boolean(k.pedagogy?.takeaway),
    );
  }
}

main().catch(console.error);
