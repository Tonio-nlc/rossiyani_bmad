/**
 * M3a — lecture seule : lesquels des 22 conflits sont source=curated ?
 * Usage: npx tsx scripts/morphology-audit/check-conflict-curated.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { createClient } from "@supabase/supabase-js";
import {
  canonicalizeLemmaForm,
  stripStressMark,
} from "@/lib/vocabulary/canonicalize-lemma-form";

/** 24 − дома − болеть */
const CONFLICTS_22: Array<{
  bare: string;
  ross: string;
  or: string;
}> = [
  { bare: "аудитория", ross: "ауди́тория", or: "аудито́рия" },
  { bare: "булочная", ross: "булочна́я", or: "бу́лочная" },
  { bare: "вода", ross: "во́да", or: "вода́" },
  { bare: "дорога", ross: "дорога́", or: "доро́га" },
  { bare: "думать", ross: "дума́ть", or: "ду́мать" },
  { bare: "идти", ross: "и́дти", or: "идти́" },
  { bare: "интересный", ross: "и́нтересный", or: "интере́сный" },
  { bare: "магазин", ross: "мага́зин", or: "магази́н" },
  { bare: "молодой", ross: "моло́дой", or: "молодо́й" },
  { bare: "молоко", ross: "моло́ко", or: "молоко́" },
  { bare: "небольшой", ross: "небо́льшой", or: "небольшо́й" },
  { bare: "окно", ross: "о́кно", or: "окно́" },
  { bare: "осматривать", ross: "осматрива́ть", or: "осма́тривать" },
  { bare: "пальто", ross: "па́льто", or: "пальто́" },
  { bare: "плохо", ross: "плохо́", or: "пло́хо" },
  { bare: "поезд", ross: "пое́зд", or: "по́езд" },
  { bare: "проблема", ross: "про́блема", or: "пробле́ма" },
  { bare: "рано", ross: "рано́", or: "ра́но" },
  { bare: "себя", ross: "се́бя", or: "себя́" },
  { bare: "спрашивать", ross: "спраши́вать", or: "спра́шивать" },
  { bare: "темно", ross: "те́мно", or: "темно́" },
  { bare: "часы", ross: "ча́сы", or: "часы́" },
];

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing env");
  const sb = createClient(url, key);

  const bares = CONFLICTS_22.map((c) => c.bare);
  const { data: morph, error } = await sb
    .from("morphology_lemmas")
    .select(
      "id, lemma_bare, lemma_stressed, stress_status, pos, aspect, source, source_version",
    )
    .in("lemma_bare", bares);
  if (error) throw error;

  // Also catch case variants / capitalisation
  const { data: morphAll } = await sb
    .from("morphology_lemmas")
    .select(
      "id, lemma_bare, lemma_stressed, stress_status, pos, aspect, source, source_version",
    )
    .eq("source", "curated");

  const curatedByBare = new Map<string, typeof morphAll>();
  for (const row of morphAll ?? []) {
    const list = curatedByBare.get(row.lemma_bare) ?? [];
    list.push(row);
    curatedByBare.set(row.lemma_bare, list);
  }

  const { data: lemmas } = await sb.from("lemmas").select("id, form");
  const pubByBare = new Map<string, string[]>();
  for (const row of lemmas ?? []) {
    const bare = stripStressMark(canonicalizeLemmaForm(row.form));
    const list = pubByBare.get(bare) ?? [];
    list.push(row.form);
    pubByBare.set(bare, list);
  }

  const byBare = new Map<string, NonNullable<typeof morph>>();
  for (const row of morph ?? []) {
    const list = byBare.get(row.lemma_bare) ?? [];
    list.push(row);
    byBare.set(row.lemma_bare, list);
  }

  type Line = {
    bare: string;
    ross: string;
    or: string;
    public_lemmas: string[];
    morph_rows: string[];
  };

  const curated: Line[] = [];
  const none: Line[] = [];
  const orOnly: Line[] = [];
  const mixed: Line[] = [];

  for (const c of CONFLICTS_22) {
    const rows = byBare.get(c.bare) ?? [];
    const morph_rows = rows.map(
      (r) =>
        `${r.source}|${r.pos}|stressed=${r.lemma_stressed ?? "NULL"}|status=${r.stress_status}`,
    );
    const line: Line = {
      bare: c.bare,
      ross: c.ross,
      or: c.or,
      public_lemmas: pubByBare.get(c.bare) ?? [],
      morph_rows,
    };
    const hasC = rows.some((r) => r.source === "curated");
    const hasO = rows.some((r) => r.source === "openrussian");
    if (hasC && hasO) mixed.push(line);
    else if (hasC) curated.push(line);
    else if (rows.length === 0) none.push(line);
    else if (hasO) orOnly.push(line);
    else mixed.push(line);
  }

  // Cross-check: себя may be curated as себя́
  const sebyaCurated = (morphAll ?? []).filter(
    (r) => stripStressMark(r.lemma_bare) === "себя" || r.lemma_bare === "себя",
  );

  console.log("=== A — morphology_lemmas pour les 22 conflits ===");
  console.log(`total 22`);
  console.log(`source=curated (seul ou avec autre) : ${curated.length + mixed.filter((m) => m.morph_rows.some((x) => x.startsWith("curated"))).length}`);
  console.log(`  curated only : ${curated.length}`);
  console.log(`  mixed curated+… : ${mixed.length}`);
  console.log(`aucune ligne morphology_lemmas : ${none.length}`);
  console.log(`openrussian only : ${orOnly.length}`);

  console.log("\n--- LISTE curated (précédence les protège) ---");
  for (const c of [...curated, ...mixed.filter((m) => m.morph_rows.some((x) => x.startsWith("curated")))]) {
    console.log(
      `${c.bare}\tR=${c.ross}\tOR=${c.or}\tpublic.lemmas=[${c.public_lemmas.join(" | ")}]\tmorph=[${c.morph_rows.join(" ; ")}]`,
    );
  }

  console.log("\n--- aucune ligne morphology_* ---");
  for (const c of none) {
    console.log(
      `${c.bare}\tR=${c.ross}\tOR=${c.or}\tpublic.lemmas=[${c.public_lemmas.join(" | ")}]`,
    );
  }

  console.log("\n--- openrussian already ---");
  for (const c of orOnly) {
    console.log(`${c.bare}\tmorph=[${c.morph_rows.join(" ; ")}]`);
  }

  console.log("\n--- curated себя (lookup étendu) ---");
  for (const r of sebyaCurated) {
    console.log(
      `${r.lemma_bare} pos=${r.pos} stressed=${r.lemma_stressed} source=${r.source}`,
    );
  }

  // Also check идти / найти style curated from present-verbs
  const interesting = ["идти", "себя", "окно", "дорога", "вода"];
  console.log("\n--- curated table scan for interesting bares ---");
  for (const bare of interesting) {
    const hits = (morphAll ?? []).filter(
      (r) => r.lemma_bare === bare || stripStressMark(r.lemma_bare) === bare,
    );
    console.log(bare, hits.length ? hits.map((h) => `${h.lemma_bare}/${h.lemma_stressed}/${h.source}`).join(" ; ") : "(none)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
