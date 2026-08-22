/**
 * Phase A — dépendances des 10 doublons d'accent lemmas (lecture seule).
 * Usage: npx tsx scripts/morphology-audit/diagnose-lemma-accent-dedup.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { createClient } from "@supabase/supabase-js";
import {
  canonicalizeLemmaForm,
  stripStressMark,
} from "@/lib/vocabulary/canonicalize-lemma-form";

const WINNERS: Record<string, string> = {
  болеть: "боле́ть",
  думать: "ду́мать",
  идти: "идти́",
  интересный: "интере́сный",
  молодой: "молодо́й",
  молоко: "молоко́",
  проблема: "пробле́ма",
  себя: "себя́",
  спрашивать: "спра́шивать",
  темно: "темно́",
};

function toHex(s: string): string {
  return [...s]
    .map((c) => c.codePointAt(0)!.toString(16).padStart(4, "0"))
    .join(" ");
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing env");
  const sb = createClient(url, key);

  const { data: lemmas, error } = await sb.from("lemmas").select("id, form");
  if (error) throw error;

  type L = { id: string; form: string; bare: string };
  const byBare = new Map<string, L[]>();
  for (const row of lemmas ?? []) {
    const form = canonicalizeLemmaForm(row.form);
    const bare = stripStressMark(form);
    if (!(bare in WINNERS)) continue;
    const list = byBare.get(bare) ?? [];
    list.push({ id: row.id, form, bare });
    byBare.set(bare, list);
  }

  const tables = [
    "explanation_cache",
    "user_vocabulary",
    "lemma_concept_links",
    "word_forms",
    "linguistic_knowledge",
  ] as const;

  type DepCounts = Record<(typeof tables)[number], number>;

  async function countsFor(id: string): Promise<DepCounts> {
    const out = {} as DepCounts;
    for (const table of tables) {
      const { count, error: err } = await sb
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("lemma_id", id);
      if (err) {
        // table may not exist / no lemma_id
        out[table] = err.message.includes("does not exist") ? -1 : -2;
        if (out[table] === -2) {
          console.error(`warn ${table}/${id}: ${err.message}`);
        }
      } else {
        out[table] = count ?? 0;
      }
    }
    return out;
  }

  async function vocabDetails(id: string): Promise<
    Array<{ user_id: string; surface?: string; created_at?: string }>
  > {
    const { data, error: err } = await sb
      .from("user_vocabulary")
      .select("user_id, created_at")
      .eq("lemma_id", id);
    if (err) {
      console.error("uv detail:", err.message);
      return [];
    }
    return (data ?? []).map((r) => ({
      user_id: r.user_id,
      created_at: r.created_at,
    }));
  }

  // Check if linguistic_knowledge uses lemma_id
  const { error: lkProbe } = await sb
    .from("linguistic_knowledge")
    .select("lemma_id")
    .limit(1);

  const report = [];

  for (const bare of Object.keys(WINNERS).sort((a, b) =>
    a.localeCompare(b, "ru"),
  )) {
    const winnerForm = WINNERS[bare]!;
    const rows = byBare.get(bare) ?? [];
    const winner = rows.find((r) => r.form === winnerForm);
    const losers = rows.filter((r) => r.form !== winnerForm);

    const lineRows = [];
    for (const r of rows) {
      const deps = await countsFor(r.id);
      const uv = await vocabDetails(r.id);
      const role =
        r.form === winnerForm
          ? "KEEP"
          : "DROP";
      lineRows.push({
        role,
        id: r.id,
        form: r.form,
        hex: toHex(r.form),
        deps,
        user_vocabulary_rows: uv,
      });
    }

    // Uniqueness conflict: same user_id on both KEEP and DROP
    const keepIds = new Set(
      lineRows.filter((r) => r.role === "KEEP").map((r) => r.id),
    );
    const dropIds = new Set(
      lineRows.filter((r) => r.role === "DROP").map((r) => r.id),
    );
    const keepUsers = new Set(
      lineRows
        .filter((r) => keepIds.has(r.id))
        .flatMap((r) => r.user_vocabulary_rows.map((u) => u.user_id)),
    );
    const dropUsers = new Set(
      lineRows
        .filter((r) => dropIds.has(r.id))
        .flatMap((r) => r.user_vocabulary_rows.map((u) => u.user_id)),
    );
    const uvUserOverlap = [...keepUsers].filter((u) => dropUsers.has(u));

    const bothHaveDeps = lineRows.every((r) =>
      Object.values(r.deps).some((n) => n > 0),
    );
    const onlyOneHasDeps =
      lineRows.filter((r) => Object.values(r.deps).some((n) => n > 0))
        .length === 1;

    report.push({
      bare,
      winnerForm,
      winnerFound: Boolean(winner),
      rowCount: rows.length,
      rows: lineRows,
      bothHaveDeps,
      onlyOneHasDeps,
      neitherHasDeps: lineRows.every((r) =>
        Object.values(r.deps).every((n) => n <= 0),
      ),
      uvUserOverlap,
      losersMissing: losers.length === 0 && rows.length < 2,
      unexpectedForms: rows
        .map((r) => r.form)
        .filter((f) => f !== winnerForm && !WINNERS[bare]),
    });
  }

  // Constraint analysis (theoretical — no write)
  const constraintNote = {
    name: "lemmas_no_bare_vs_accented_dup",
    behavior:
      "EXCLUDE gist (form_unaccented=, has_stress_mark<>): blocks bare vs accented pair only",
    fusionSafe:
      "Deleting one accented row while keeping another accented row for same bare: both have has_stress_mark=true, so condition <> is false — constraint never fires on delete of the loser. Insert of winner already present: no new insert needed. Fusion = rewire FKs then DELETE loser — EXCLUDE not involved.",
  };

  console.log(
    JSON.stringify(
      {
        linguistic_knowledge_has_lemma_id: !lkProbe,
        linguistic_knowledge_probe_error: lkProbe?.message ?? null,
        constraintNote,
        report,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
