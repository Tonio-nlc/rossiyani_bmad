/**
 * M3a — Import OpenRussian pour 18 conflits d'accent résolus (OR gagne).
 * Skip les 4 déjà curated (аудитория, идти, окно, себя) — option 1.
 * Exclus : дома, болеть (tickets à part).
 *
 * Usage :
 *   npx tsx scripts/import-openrussian-conflicts.ts           # dry-run
 *   npx tsx scripts/import-openrussian-conflicts.ts --apply
 *
 * morphology_lemmas / morphology_forms only. public.lemmas HORS SCOPE.
 * source=openrussian ; skip si curated sur même bare+pos.
 */

import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  assertLemmaFormCharset,
  canonicalizeLemmaForm,
  countRussianVowels,
  hasStressMark,
  stripMonosyllableStress,
  stripStressMark,
} from "@/lib/vocabulary/canonicalize-lemma-form";

const SOURCE = "openrussian" as const;
const DATA_DIR = path.join(process.cwd(), "scripts/morphology-audit/data");

/** 18 conflits — OR gagne. (22 − 4 curated déjà corrects) */
const CONFLICT_BARES = [
  "булочная",
  "вода",
  "дорога",
  "думать",
  "интересный",
  "магазин",
  "молодой",
  "молоко",
  "небольшой",
  "осматривать",
  "пальто",
  "плохо",
  "поезд",
  "проблема",
  "рано",
  "спрашивать",
  "темно",
  "часы",
] as const;

const CONFLICT_SET = new Set(
  CONFLICT_BARES.map((b) => stripStressMark(canonicalizeLemmaForm(b))),
);

/** Accents OR attendus (contrôle dry-run). */
const EXPECTED_OR: Record<string, string> = {
  булочная: "бу́лочная",
  вода: "вода́",
  дорога: "доро́га",
  думать: "ду́мать",
  интересный: "интере́сный",
  магазин: "магази́н",
  молодой: "молодо́й",
  молоко: "молоко́",
  небольшой: "небольшо́й",
  осматривать: "осма́тривать",
  пальто: "пальто́",
  плохо: "пло́хо",
  поезд: "по́езд",
  проблема: "пробле́ма",
  рано: "ра́но",
  спрашивать: "спра́шивать",
  темно: "темно́",
  часы: "часы́",
};

const NOUN_SLOT_MAP: Record<string, string> = {
  sg_nom: "case.nominative",
  sg_gen: "case.genitive",
  sg_dat: "case.dative",
  sg_acc: "case.accusative",
  sg_inst: "case.instrumental",
  sg_prep: "case.prepositional",
};

const VERB_SLOT_MAP: Record<string, string> = {
  past_m: "past.m",
  past_f: "past.f",
  past_n: "past.n",
  past_pl: "past.pl",
  presfut_sg1: "present.sg1",
  presfut_sg2: "present.sg2",
  presfut_sg3: "present.sg3",
  presfut_pl1: "present.pl1",
  presfut_pl2: "present.pl2",
  presfut_pl3: "present.pl3",
};

const ADJ_SLOT_MAP: Record<string, string> = {
  decl_m_nom: "adj.m.nominative",
  decl_f_nom: "adj.f.nominative",
  decl_n_nom: "adj.n.nominative",
  decl_pl_nom: "adj.pl.nominative",
};

type TStressStatus = "present" | "missing" | "unknown";

type TLemmaOut = {
  lemma_bare: string;
  lemma_stressed: string | null;
  stress_status: TStressStatus;
  pos: string;
  aspect: string | null;
  conjugation_class: number | null;
  app_lemma_id: string | null;
  source: typeof SOURCE;
  source_version: string;
};

type TFormOut = {
  lemma_bare: string;
  lemma_pos: string;
  lemma_aspect: string | null;
  slot: string;
  variant: "plain";
  form_bare: string;
  form_stressed: string | null;
  stress_status: TStressStatus;
  ending: null;
  source: typeof SOURCE;
  source_version: string;
};

function canonicalizeOpenRussian(form: string): string {
  const converted = form.replaceAll("'", "\u0301");
  const nfc = canonicalizeLemmaForm(converted);
  assertLemmaFormCharset(nfc);
  return stripMonosyllableStress(nfc);
}

function splitStress(formRaw: string): {
  bare: string;
  stressed: string | null;
  stress_status: TStressStatus;
} {
  const form = canonicalizeLemmaForm(formRaw);
  assertLemmaFormCharset(form);
  const bare = stripStressMark(form);
  if (countRussianVowels(form) === 1) {
    return { bare, stressed: null, stress_status: "missing" };
  }
  if (hasStressMark(form)) {
    return { bare, stressed: form, stress_status: "present" };
  }
  return { bare, stressed: null, stress_status: "missing" };
}

function lemmaKey(bare: string, pos: string, aspect: string | null): string {
  return `${bare}\0${pos}\0${aspect ?? ""}`;
}

async function resolveSourceVersion(): Promise<string> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/Badestrand/russian-dictionary/commits?path=nouns.csv&per_page=1",
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Array<{
      sha: string;
      commit: { committer: { date: string } };
    }>;
    const row = data[0];
    if (!row) throw new Error("empty");
    return `${row.commit.committer.date.slice(0, 10)}+${row.sha.slice(0, 12)}`;
  } catch {
    return `local-${new Date().toISOString().slice(0, 10)}+unknown`;
  }
}

async function readTsv(filePath: string): Promise<Record<string, string>[]> {
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  let headers: string[] | null = null;
  const rows: Record<string, string>[] = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = line.split("\t");
    if (!headers) {
      headers = cols;
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function mapPos(file: string): string {
  if (file === "nouns.csv") return "noun";
  if (file === "verbs.csv") return "verb";
  if (file === "adjectives.csv") return "adjective";
  return "other";
}

function collectForms(
  file: string,
  row: Record<string, string>,
  sourceVersion: string,
  lemmaBare: string,
  pos: string,
  aspect: string | null,
): TFormOut[] {
  const out: TFormOut[] = [];
  const slotMap =
    file === "nouns.csv"
      ? NOUN_SLOT_MAP
      : file === "verbs.csv"
        ? VERB_SLOT_MAP
        : file === "adjectives.csv"
          ? ADJ_SLOT_MAP
          : {};

  const pushCell = (slot: string, raw: string) => {
    for (const part of raw
      .split(/[,;]/)
      .map((p) => p.trim())
      .filter(Boolean)) {
      try {
        const canon = canonicalizeOpenRussian(part);
        const split = splitStress(canon);
        out.push({
          lemma_bare: lemmaBare,
          lemma_pos: pos,
          lemma_aspect: aspect,
          slot,
          variant: "plain",
          form_bare: split.bare,
          form_stressed: split.stressed,
          stress_status: split.stress_status,
          ending: null,
          source: SOURCE,
          source_version: sourceVersion,
        });
      } catch {
        /* skip corrupt */
      }
    }
  };

  for (const [col, slot] of Object.entries(slotMap)) {
    const raw = row[col]?.trim();
    if (raw) pushCell(slot, raw);
  }

  const accented = row.accented?.trim();
  if (accented) {
    pushCell(pos === "verb" ? "inf" : "case.nominative", accented);
  }

  const seen = new Set<string>();
  return out.filter((f) => {
    const k = `${f.slot}\0${f.variant}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function buildPayload(
  supabase: SupabaseClient,
  sourceVersion: string,
): Promise<{
  lemmas: TLemmaOut[];
  forms: TFormOut[];
  skippedCurated: string[];
  skippedMissingOr: string[];
  skippedHomonym: string[];
  logs: string[];
}> {
  const curatedRes = await supabase
    .from("morphology_lemmas")
    .select("lemma_bare, pos, aspect")
    .eq("source", "curated");
  if (curatedRes.error) {
    throw new Error(`curated: ${curatedRes.error.message}`);
  }
  const curatedKeys = new Set(
    (curatedRes.data ?? []).map((r) =>
      lemmaKey(r.lemma_bare, r.pos, r.aspect),
    ),
  );

  // app_lemma_id : préférer la forme public.lemmas qui matche déjà OR si présente
  const lemmasRes = await supabase.from("lemmas").select("id, form");
  if (lemmasRes.error) throw new Error(lemmasRes.error.message);
  const appCandidates = new Map<string, { id: string; form: string }[]>();
  for (const row of lemmasRes.data ?? []) {
    const bare = stripStressMark(canonicalizeLemmaForm(row.form));
    if (!CONFLICT_SET.has(bare)) continue;
    const list = appCandidates.get(bare) ?? [];
    list.push({ id: row.id, form: row.form });
    appCandidates.set(bare, list);
  }

  const files = [
    "nouns.csv",
    "verbs.csv",
    "adjectives.csv",
    "others.csv",
  ] as const;

  type Acc = { lemma: TLemmaOut; forms: TFormOut[]; file: string };
  const byBare = new Map<string, Acc[]>();

  for (const file of files) {
    const rows = await readTsv(path.join(DATA_DIR, file));
    for (const row of rows) {
      const bareRaw = (row.bare ?? "").trim();
      if (!bareRaw || !CONFLICT_SET.has(bareRaw)) continue;
      const accented = (row.accented ?? "").trim();
      if (!accented) continue;
      let lemmaCanon: string;
      try {
        lemmaCanon = canonicalizeOpenRussian(accented);
      } catch {
        continue;
      }
      if (!hasStressMark(lemmaCanon)) continue;

      const pos = mapPos(file);
      const aspect =
        file === "verbs.csv" && row.aspect?.trim()
          ? row.aspect.trim()
          : null;
      const split = splitStress(lemmaCanon);

      const cands = appCandidates.get(bareRaw) ?? [];
      const matchOr = cands.find((c) => c.form === split.stressed);
      const appId = matchOr?.id ?? (cands.length === 1 ? cands[0]!.id : null);

      const lemma: TLemmaOut = {
        lemma_bare: split.bare,
        lemma_stressed: split.stressed,
        stress_status: "present",
        pos,
        aspect,
        conjugation_class: null,
        app_lemma_id: appId,
        source: SOURCE,
        source_version: sourceVersion,
      };
      const forms = collectForms(
        file,
        row,
        sourceVersion,
        split.bare,
        pos,
        aspect,
      );
      const list = byBare.get(bareRaw) ?? [];
      list.push({ lemma, forms, file });
      byBare.set(bareRaw, list);
    }
  }

  const lemmas: TLemmaOut[] = [];
  const forms: TFormOut[] = [];
  const skippedCurated: string[] = [];
  const skippedMissingOr: string[] = [];
  const skippedHomonym: string[] = [];
  const logs: string[] = [];

  // Existing openrussian rows for log old→new
  const existingOr = await supabase
    .from("morphology_lemmas")
    .select("lemma_bare, lemma_stressed, pos, aspect")
    .eq("source", SOURCE)
    .in("lemma_bare", [...CONFLICT_BARES]);
  const existingMap = new Map(
    (existingOr.data ?? []).map((r) => [
      lemmaKey(r.lemma_bare, r.pos, r.aspect),
      r.lemma_stressed,
    ]),
  );

  for (const bare of CONFLICT_BARES) {
    const hits = byBare.get(bare) ?? [];
    if (hits.length === 0) {
      skippedMissingOr.push(bare);
      continue;
    }
    if (hits.length > 1) {
      skippedHomonym.push(
        `${bare} (${hits.map((h) => h.lemma.pos).join(",")})`,
      );
      continue;
    }
    const hit = hits[0]!;
    const ck = lemmaKey(hit.lemma.lemma_bare, hit.lemma.pos, hit.lemma.aspect);
    if (
      curatedKeys.has(ck) ||
      curatedKeys.has(
        lemmaKey(hit.lemma.lemma_bare, hit.lemma.pos, null),
      )
    ) {
      skippedCurated.push(`${bare} (${hit.lemma.pos})`);
      logs.push(
        `SKIP curated ${bare}/${hit.lemma.pos} (déjà protégé, non modifié)`,
      );
      continue;
    }

    const expected = EXPECTED_OR[bare];
    if (expected && hit.lemma.lemma_stressed !== expected) {
      logs.push(
        `WARN ${bare}: OR CSV=${hit.lemma.lemma_stressed} ≠ attendu ${expected}`,
      );
    }

    const old = existingMap.get(ck) ?? null;
    logs.push(
      `WRITE lemma ${bare}/${hit.lemma.pos}: ` +
        `${old === null ? "(absent)" : old} → ${hit.lemma.lemma_stressed} ` +
        `(${hit.forms.length} forms)`,
    );

    lemmas.push(hit.lemma);
    forms.push(...hit.forms);
  }

  return {
    lemmas,
    forms,
    skippedCurated,
    skippedMissingOr,
    skippedHomonym,
    logs,
  };
}

async function applyPayload(
  supabase: SupabaseClient,
  lemmas: TLemmaOut[],
  forms: TFormOut[],
): Promise<void> {
  const bares = [...new Set(lemmas.map((l) => l.lemma_bare))];
  if (bares.length === 0) return;

  const existing = await supabase
    .from("morphology_lemmas")
    .select("id")
    .eq("source", SOURCE)
    .in("lemma_bare", bares);
  if (existing.error) throw new Error(existing.error.message);
  const ids = (existing.data ?? []).map((r) => r.id);
  if (ids.length > 0) {
    const delF = await supabase
      .from("morphology_forms")
      .delete()
      .eq("source", SOURCE)
      .in("morphology_lemma_id", ids);
    if (delF.error) throw new Error(`DELETE forms: ${delF.error.message}`);
    const delL = await supabase
      .from("morphology_lemmas")
      .delete()
      .eq("source", SOURCE)
      .in("id", ids);
    if (delL.error) throw new Error(`DELETE lemmas: ${delL.error.message}`);
  }

  const idByKey = new Map<string, string>();
  for (const row of lemmas) {
    const { data, error } = await supabase
      .from("morphology_lemmas")
      .insert(row)
      .select("id, lemma_bare, pos, aspect")
      .single();
    if (error || !data) {
      throw new Error(
        `INSERT lemma ${JSON.stringify(row)}: ${error?.message ?? "no data"}`,
      );
    }
    idByKey.set(lemmaKey(data.lemma_bare, data.pos, data.aspect), data.id);
  }

  for (const row of forms) {
    const mid = idByKey.get(
      lemmaKey(row.lemma_bare, row.lemma_pos, row.lemma_aspect),
    );
    if (!mid) throw new Error(`no lemma for ${JSON.stringify(row)}`);
    const { error } = await supabase.from("morphology_forms").insert({
      morphology_lemma_id: mid,
      slot: row.slot,
      variant: row.variant,
      form_bare: row.form_bare,
      form_stressed: row.form_stressed,
      stress_status: row.stress_status,
      ending: row.ending,
      source: row.source,
      source_version: row.source_version,
    });
    if (error) {
      throw new Error(`INSERT form: ${error.message}`);
    }
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const supabase = createClient(url, key);
  const sourceVersion = await resolveSourceVersion();
  const payload = await buildPayload(supabase, sourceVersion);

  console.log("=== M3a OpenRussian CONFLICTS import (18) ===");
  console.log(`source=${SOURCE} source_version=${sourceVersion}`);
  console.log(`Lemmes : ${payload.lemmas.length} / forms : ${payload.forms.length}`);
  if (payload.skippedCurated.length) {
    console.log(`Skip curated : ${payload.skippedCurated.join(", ")}`);
  }
  if (payload.skippedHomonym.length) {
    console.log(`Skip homonym D3 : ${payload.skippedHomonym.join(", ")}`);
  }
  if (payload.skippedMissingOr.length) {
    console.log(`Skip absent OR : ${payload.skippedMissingOr.join(", ")}`);
  }
  console.log("");
  for (const line of payload.logs) {
    console.log(`  ${line}`);
  }

  if (!apply) {
    console.log("");
    console.log(
      "Dry-run. Appliquer : npx tsx scripts/import-openrussian-conflicts.ts --apply",
    );
    return;
  }

  try {
    await applyPayload(supabase, payload.lemmas, payload.forms);
    console.log("OK — 18 conflits OR importés (openrussian).");
  } catch (error) {
    console.error("ÉCHEC", error instanceof Error ? error.message : error);
    console.error(
      "Relancer --apply ou DELETE WHERE source='openrussian' pour les bares concernés.",
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
