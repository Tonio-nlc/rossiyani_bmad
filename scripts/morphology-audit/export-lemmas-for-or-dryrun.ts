/**
 * M3a — export read-only lemmas + curated + pending pour dry-run OR.
 * Aucune écriture. Sortie JSON sur stdout.
 *
 * Usage :
 *   npx tsx scripts/morphology-audit/export-lemmas-for-or-dryrun.ts
 */

import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { createClient } from "@supabase/supabase-js";

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env");
  }
  const supabase = createClient(url, key);

  const lemmasRes = await supabase.from("lemmas").select("id, form");
  if (lemmasRes.error) {
    throw new Error(`lemmas: ${lemmasRes.error.message}`);
  }

  const pendingRes = await supabase
    .from("morphology_pending")
    .select("lemma_bare, surface, status");
  const pendingRows = pendingRes.error ? [] : (pendingRes.data ?? []);

  const byForm = new Map<
    string,
    { id: string | null; form: string; sources: string[] }
  >();

  for (const row of lemmasRes.data ?? []) {
    byForm.set(row.form, {
      id: row.id,
      form: row.form,
      sources: ["lemmas"],
    });
  }

  for (const row of pendingRows) {
    const form = row.lemma_bare || row.surface;
    if (!form) continue;
    const existing = [...byForm.values()].find((e) => e.form === form);
    if (existing) {
      if (!existing.sources.includes("pending")) {
        existing.sources.push("pending");
      }
    } else {
      byForm.set(`pending:${form}`, {
        id: null,
        form,
        sources: ["pending"],
      });
    }
  }

  const curatedRes = await supabase
    .from("morphology_lemmas")
    .select("lemma_bare, lemma_stressed, pos")
    .eq("source", "curated");
  if (curatedRes.error) {
    throw new Error(`morphology_lemmas: ${curatedRes.error.message}`);
  }

  const payload = {
    lemmas: [...byForm.values()],
    curated_lemmas: curatedRes.data ?? [],
    pending_error: pendingRes.error?.message ?? null,
    pending_count: pendingRows.length,
    lemmas_table_count: (lemmasRes.data ?? []).length,
  };

  process.stdout.write(JSON.stringify(payload));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
