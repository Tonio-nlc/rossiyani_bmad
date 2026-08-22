/**
 * Lecture seule — paires lemmas.form même bare, accents différents.
 * Usage: npx tsx scripts/morphology-audit/measure-lemma-accent-pairs.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  canonicalizeLemmaForm,
  hasStressMark,
  stripStressMark,
} from "@/lib/vocabulary/canonicalize-lemma-form";

/** Homographes lexicaux légitimes connus (deux mots, deux accents). */
const LEGITIMATE_BARES = new Set([
  "мука", // му́ка torment / мука́ flour
  "замок", // за́мок castle / замо́к lock
  "уже", // у́же narrower / уже́ already — sometimes listed
  "потом", // по́том instrumental sweat / пото́м then — borderline
  "атлас", // а́тлас atlas / атла́с satin
  "белки", // бе́лки squirrels / белки́ whites
]);

async function countForIds(
  sb: SupabaseClient,
  table: string,
  ids: string[],
): Promise<number> {
  if (ids.length === 0) return 0;
  // chunk to avoid URL limits
  let total = 0;
  for (let i = 0; i < ids.length; i += 80) {
    const chunk = ids.slice(i, i + 80);
    const { count, error } = await sb
      .from(table)
      .select("*", { count: "exact", head: true })
      .in("lemma_id", chunk);
    if (error) {
      console.error(`count ${table}:`, error.message);
      return -1;
    }
    total += count ?? 0;
  }
  return total;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing env");
  const sb = createClient(url, key);

  const { data: lemmas, error } = await sb.from("lemmas").select("id, form");
  if (error) throw error;

  type Row = { id: string; form: string; bare: string };
  const rows: Row[] = [];
  for (const row of lemmas ?? []) {
    const form = canonicalizeLemmaForm(row.form);
    const bare = stripStressMark(form);
    rows.push({ id: row.id, form, bare });
  }

  const byBare = new Map<string, Row[]>();
  for (const r of rows) {
    const list = byBare.get(r.bare) ?? [];
    list.push(r);
    byBare.set(r.bare, list);
  }

  type PairGroup = {
    bare: string;
    forms: Row[];
    stressedDistinct: string[];
    legitimate: boolean;
  };

  const conflictGroups: PairGroup[] = [];
  const legitimateGroups: PairGroup[] = [];

  for (const [bare, list] of byBare) {
    const stressed = list.filter((r) => hasStressMark(r.form));
    const distinctStressed = [...new Set(stressed.map((r) => r.form))];
    if (distinctStressed.length < 2) continue;

    const group: PairGroup = {
      bare,
      forms: list,
      stressedDistinct: distinctStressed.sort(),
      legitimate: LEGITIMATE_BARES.has(bare),
    };
    if (group.legitimate) legitimateGroups.push(group);
    else conflictGroups.push(group);
  }

  conflictGroups.sort((a, b) => a.bare.localeCompare(b.bare, "ru"));
  legitimateGroups.sort((a, b) => a.bare.localeCompare(b.bare, "ru"));

  const report: Array<{
    bare: string;
    forms: string[];
    ids: string[];
    legitimate: boolean;
    explanation_cache: number;
    user_vocabulary: number;
    lemma_concept_links: number;
    word_forms: number;
  }> = [];

  for (const g of [...conflictGroups, ...legitimateGroups]) {
    const ids = g.forms.map((f) => f.id);
    const [ec, uv, lcl, wf] = await Promise.all([
      countForIds(sb, "explanation_cache", ids),
      countForIds(sb, "user_vocabulary", ids),
      countForIds(sb, "lemma_concept_links", ids),
      countForIds(sb, "word_forms", ids),
    ]);
    report.push({
      bare: g.bare,
      forms: g.forms.map((f) => f.form),
      ids,
      legitimate: g.legitimate,
      explanation_cache: ec,
      user_vocabulary: uv,
      lemma_concept_links: lcl,
      word_forms: wf,
    });
  }

  console.log(
    JSON.stringify(
      {
        total_lemmas: rows.length,
        conflict_pairs: conflictGroups.length,
        legitimate_pairs: legitimateGroups.length,
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
