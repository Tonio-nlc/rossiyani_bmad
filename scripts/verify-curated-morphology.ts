/**
 * M1 Phase 3 — Vérifie la fidélité TS ↔ morphology_* (source=curated).
 * Rapport seulement : aucune écriture, aucune correction.
 *
 * Usage :
 *   npx tsx scripts/verify-curated-morphology.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { CURATED_PRESENT_VERBS } from "@/lib/knowledge/morphology/curated";
import { stripStressMark } from "@/lib/vocabulary/canonicalize-lemma-form";

import {
  CURATED_SOURCE,
  buildExpectedCuratedPayload,
  formKey,
  lemmaKey,
  toBare,
  type TFormRow,
  type TLemmaRow,
  type TSenseRow,
} from "./lib/curated-morphology-expected";

type TDbLemma = {
  id: string;
  lemma_bare: string;
  lemma_stressed: string | null;
  stress_status: string;
  pos: string;
  aspect: string | null;
  conjugation_class: number | null;
  app_lemma_id: string | null;
  source: string;
  source_version: string;
};

type TDbForm = {
  id: string;
  morphology_lemma_id: string;
  slot: string;
  variant: string;
  form_bare: string;
  form_stressed: string | null;
  stress_status: string;
  ending: string | null;
  source: string;
  source_version: string;
};

type TDbSense = {
  id: string;
  morphology_lemma_id: string;
  sense_key: string;
  label_fr: string | null;
  allowed_slots: string[] | null;
  notes_fr: string | null;
  validated: boolean;
  source: string;
  source_version: string;
};

/** Perfectifs curés dont le « présent » morphologique = futur (aspect). */
const PERFECTIVE_NONPAST_LEMMAS: ReadonlyArray<{
  bare: string;
  stressed: string;
  note: string;
}> = [
  {
    bare: "пойти",
    stressed: "пойти́",
    note: "Perfectif de mouvement : пойду́ / пойдёшь… = futur, pas présent.",
  },
  {
    bare: "случиться",
    stressed: "случи́ться",
    note: "Perfectif défectif : слу́чится / слу́чатся = futur (événement).",
  },
];

function toHex(value: string | null | undefined): string {
  if (value == null) return "NULL";
  return [...value]
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      return cp.toString(16).padStart(4, "0");
    })
    .join(" ");
}

function sameNullable(a: string | null, b: string | null): boolean {
  return a === b;
}

function sameNumberNullable(
  a: number | null | undefined,
  b: number | null | undefined,
): boolean {
  return (a ?? null) === (b ?? null);
}

function slotsEqual(a: string[] | null | undefined, b: string[]): boolean {
  const left = [...(a ?? [])].sort().join("\0");
  const right = [...b].sort().join("\0");
  return left === right;
}

async function loadAppLemmaMap(
  supabase: SupabaseClient,
): Promise<Map<string, string | "ambiguous" | null>> {
  const { data, error } = await supabase.from("lemmas").select("id, form");
  if (error) {
    throw new Error(`Lecture lemmas : ${error.message}`);
  }
  const byBare = new Map<string, { id: string; form: string }[]>();
  for (const row of data ?? []) {
    const bare = toBare(row.form);
    const list = byBare.get(bare) ?? [];
    list.push({ id: row.id, form: row.form });
    byBare.set(bare, list);
  }
  const result = new Map<string, string | "ambiguous" | null>();
  for (const [bare, hits] of byBare) {
    const distinct = [...new Set(hits.map((h) => h.form))];
    if (distinct.length === 1) {
      result.set(bare, hits[0]!.id);
    } else {
      result.set(bare, "ambiguous");
    }
  }
  return result;
}

async function loadDb(supabase: SupabaseClient): Promise<{
  lemmas: TDbLemma[];
  forms: TDbForm[];
  senses: TDbSense[];
}> {
  const lemmasRes = await supabase
    .from("morphology_lemmas")
    .select(
      "id, lemma_bare, lemma_stressed, stress_status, pos, aspect, conjugation_class, app_lemma_id, source, source_version",
    )
    .eq("source", CURATED_SOURCE);
  if (lemmasRes.error) {
    throw new Error(`Lecture morphology_lemmas : ${lemmasRes.error.message}`);
  }

  const formsRes = await supabase
    .from("morphology_forms")
    .select(
      "id, morphology_lemma_id, slot, variant, form_bare, form_stressed, stress_status, ending, source, source_version",
    )
    .eq("source", CURATED_SOURCE);
  if (formsRes.error) {
    throw new Error(`Lecture morphology_forms : ${formsRes.error.message}`);
  }

  const sensesRes = await supabase
    .from("morphology_sense_overrides")
    .select(
      "id, morphology_lemma_id, sense_key, label_fr, allowed_slots, notes_fr, validated, source, source_version",
    )
    .eq("source", CURATED_SOURCE);
  if (sensesRes.error) {
    throw new Error(
      `Lecture morphology_sense_overrides : ${sensesRes.error.message}`,
    );
  }

  return {
    lemmas: (lemmasRes.data ?? []) as TDbLemma[],
    forms: (formsRes.data ?? []) as TDbForm[],
    senses: (sensesRes.data ?? []) as TDbSense[],
  };
}

function printAccentDiff(
  label: string,
  expected: string | null,
  actual: string | null,
): void {
  console.log(`  ${label}`);
  console.log(`    TS : ${JSON.stringify(expected)} hex=[${toHex(expected)}]`);
  console.log(`    DB : ${JSON.stringify(actual)} hex=[${toHex(actual)}]`);
}

function reportEndings(expectedForms: TFormRow[], dbForms: TDbForm[]): void {
  const tsWith = expectedForms.filter((f) => f.ending).length;
  const dbWith = dbForms.filter((f) => f.ending).length;

  console.log("");
  console.log("=== VÉRIF 1 — ENDINGS (terminaisons colorées) ===");
  console.log(`TS ending non-null : ${tsWith} / ${expectedForms.length}`);
  console.log(`DB ending non-null : ${dbWith} / ${dbForms.length}`);

  console.log("");
  console.log("Où atterrissent les endings aujourd’hui :");
  console.log(
    "  • Colonne morphology_forms.ending = uniquement les endings curés",
  );
  console.log(
    "    explicites (TCuratedVerbPresent.endings / CURATED_CHITAT) sur",
  );
  console.log("    les slots present.* — typiquement 16 lignes.");
  console.log("");
  console.log("Comment l’app colore les 145 autres (runtime, hors colonne) :");
  console.log(
    "  1. Passé curé : getCuratedPastTenseSuffix() mappe la surface →",
  );
  console.log(
    "     -л / -ла / -ло / -ли (orchestrator/index.ts). Pas stocké en DB.",
  );
  console.log(
    "  2. Présent sans ending curé : inferPresentPersonFromSurface()",
  );
  console.log("     (regex de désinence) dans present-verbs.ts.");
  console.log(
    "  3. Noms / adj / cas : suffix + suffixExplanation viennent du LLM",
  );
  console.log(
    "     (explanation_cache) ; Word.tsx colore via splitWordByApiSuffix.",
  );
  console.log(
    "  4. Pronoms (+ adverbes, particules…) : POS_WITHOUT_RELIABLE_SUFFIX",
  );
  console.log(
    "     force suffix=\"\" côté orchestrateur → pas de coloration de",
  );
  console.log("     désinence (volontaire).");
  console.log(
    "  5. Filet UI : si apiSuffix est undefined, Word.tsx utilise",
  );
  console.log(
    "     splitWordStemAndSuffix() (heuristique 2–3 graphèmes) — pas le",
  );
  console.log("     paradigme curé.");
  console.log("");
  console.log(
    "M2 : oui — même runtime. La colonne ending couvre le présent curé ;",
  );
  console.log(
    "le passé reste dérivé du slot past.* (+ getCuratedPastTenseSuffix) ;",
  );
  console.log(
    "noms/adj restent LLM (ou heuristique) tant qu’on n’a pas de découpe",
  );
  console.log("déterministe en base. Rien à « perdre » si M2 réutilise ces");
  console.log("chemins plutôt que d’exiger ending NOT NULL partout.");
}

function reportPerfectiveSlots(expectedForms: TFormRow[]): void {
  console.log("");
  console.log("=== VÉRIF 2 — SLOT DES PERFECTIFS (présent vs futur) ===");

  const perfectiveBares = new Set(PERFECTIVE_NONPAST_LEMMAS.map((p) => p.bare));
  const presentOnPerfective = expectedForms.filter(
    (f) =>
      f.lemma_pos === "verb" &&
      perfectiveBares.has(f.lemma_bare) &&
      f.slot.startsWith("present."),
  );

  // Cross-check against CURATED_PRESENT_VERBS (no aspect field in TS → liste manuelle)
  for (const verb of CURATED_PRESENT_VERBS) {
    const bare = stripStressMark(verb.lemma.normalize("NFC"));
    const nPresent = Object.values(verb.present).filter(Boolean).length;
    const listed = perfectiveBares.has(bare);
    if (listed && nPresent === 0) {
      console.log(
        `  note : ${bare} listé perfectif mais present={} (ex. найти́) — OK, 0 slot present.`,
      );
    }
  }

  console.log(
    `Lemmes perfectifs avec slots present.* : ${PERFECTIVE_NONPAST_LEMMAS.length}`,
  );
  for (const p of PERFECTIVE_NONPAST_LEMMAS) {
    const forms = presentOnPerfective.filter((f) => f.lemma_bare === p.bare);
    console.log(`  • ${p.stressed} (${p.bare}) — ${forms.length} forme(s)`);
    for (const f of forms.sort((a, b) => a.slot.localeCompare(b.slot))) {
      console.log(
        `      ${f.slot} → ${f.form_stressed ?? f.form_bare}` +
          (f.ending ? ` ending=${f.ending}` : ""),
      );
    }
    console.log(`      ${p.note}`);
  }
  console.log(
    `Total formes present.* sur perfectifs : ${presentOnPerfective.length}`,
  );
  console.log("");
  console.log("Convention proposée (NON APPLIQUÉE) :");
  console.log(
    "  A) Renommer present.* → future.* pour les lemmes perfectifs",
  );
  console.log(
    "     (clair produit ; casse les lecteurs qui attendent present.*).",
  );
  console.log(
    "  B) Garder present.* = « non-passé personnel » (tradition russe",
  );
  console.log(
    "     présent/futur selon aspect) + documenter ; tense = f(aspect).",
  );
  console.log(
    "  C) Slot neutre nonpast.sg1…pl3 pour imperfectifs et perfectifs,",
  );
  console.log("     label pédagogique dérivé de aspect.");
  console.log(
    "Recommandation M1→M2 : B court terme (zéro migration), C si on",
  );
  console.log(
    "généralise OpenRussian/pymorphy ; A seulement si le produit doit",
  );
  console.log("afficher explicitement « futur » dans l’Explorer.");
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants (.env.local)",
    );
  }

  const supabase = createClient(url, key);
  const appMap = await loadAppLemmaMap(supabase);
  // source_version TS factice : non comparé à la DB
  const expected = buildExpectedCuratedPayload("verify", appMap);
  const db = await loadDb(supabase);

  const lemmaById = new Map(db.lemmas.map((l) => [l.id, l]));

  console.log("=== M1 Phase 3 — verify curated morphology ===");
  console.log(`source filtre DB = ${CURATED_SOURCE}`);
  console.log(
    `TS attendu : ${expected.lemmas.length} lemmes / ${expected.forms.length} forms / ${expected.senses.length} overrides`,
  );
  console.log(
    `DB trouvé  : ${db.lemmas.length} lemmes / ${db.forms.length} forms / ${db.senses.length} overrides`,
  );

  let issues = 0;

  // --- Lemmas ---
  console.log("");
  console.log("--- Lemmas ---");
  const expLemmaMap = new Map<string, TLemmaRow>();
  for (const l of expected.lemmas) {
    expLemmaMap.set(lemmaKey(l.lemma_bare, l.pos, l.aspect), l);
  }
  const dbLemmaMap = new Map<string, TDbLemma>();
  for (const l of db.lemmas) {
    dbLemmaMap.set(lemmaKey(l.lemma_bare, l.pos, l.aspect), l);
  }

  for (const [key, exp] of expLemmaMap) {
    const row = dbLemmaMap.get(key);
    if (!row) {
      issues += 1;
      console.log(`MISSING lemma DB ← TS : ${exp.lemma_bare} pos=${exp.pos}`);
      continue;
    }
    if (!sameNullable(exp.lemma_stressed, row.lemma_stressed)) {
      issues += 1;
      console.log(`ACCENT lemma mismatch : ${exp.lemma_bare}`);
      printAccentDiff("lemma_stressed", exp.lemma_stressed, row.lemma_stressed);
    }
    if (exp.stress_status !== row.stress_status) {
      issues += 1;
      console.log(
        `stress_status lemma : ${exp.lemma_bare} TS=${exp.stress_status} DB=${row.stress_status}`,
      );
    }
    if (!sameNumberNullable(exp.conjugation_class, row.conjugation_class)) {
      issues += 1;
      console.log(
        `conjugation_class : ${exp.lemma_bare} TS=${exp.conjugation_class} DB=${row.conjugation_class}`,
      );
    }
    if (!sameNullable(exp.app_lemma_id, row.app_lemma_id)) {
      issues += 1;
      console.log(
        `app_lemma_id : ${exp.lemma_bare} TS=${exp.app_lemma_id} DB=${row.app_lemma_id}`,
      );
    }
  }
  for (const [key, row] of dbLemmaMap) {
    if (!expLemmaMap.has(key)) {
      issues += 1;
      console.log(
        `ORPHAN lemma DB (pas dans TS) : ${row.lemma_bare} pos=${row.pos}`,
      );
    }
  }
  if (issues === 0) {
    console.log("OK — tous les lemmes TS ↔ DB (contenu).");
  }

  // --- Forms ---
  console.log("");
  console.log("--- Forms ---");
  let formIssuesBefore = issues;

  const expFormMap = new Map<string, TFormRow>();
  for (const f of expected.forms) {
    expFormMap.set(
      formKey(f.lemma_bare, f.lemma_pos, f.lemma_aspect, f.slot, f.variant),
      f,
    );
  }

  const dbFormMap = new Map<string, TDbForm & { lemma_bare: string; lemma_pos: string; lemma_aspect: string | null }>();
  for (const f of db.forms) {
    const lemma = lemmaById.get(f.morphology_lemma_id);
    if (!lemma) {
      issues += 1;
      console.log(
        `FORM sans lemma parent : id=${f.id} slot=${f.slot} form=${f.form_bare}`,
      );
      continue;
    }
    const key = formKey(
      lemma.lemma_bare,
      lemma.pos,
      lemma.aspect,
      f.slot,
      f.variant as "plain" | "with_n" | "alt",
    );
    dbFormMap.set(key, {
      ...f,
      lemma_bare: lemma.lemma_bare,
      lemma_pos: lemma.pos,
      lemma_aspect: lemma.aspect,
    });
  }

  for (const [key, exp] of expFormMap) {
    const row = dbFormMap.get(key);
    if (!row) {
      issues += 1;
      console.log(
        `MISSING form DB ← TS : ${exp.lemma_bare} ${exp.slot}/${exp.variant} « ${exp.form_stressed ?? exp.form_bare} »`,
      );
      continue;
    }
    if (exp.form_bare !== row.form_bare) {
      issues += 1;
      console.log(
        `form_bare mismatch : ${exp.lemma_bare} ${exp.slot}/${exp.variant}`,
      );
      printAccentDiff("form_bare", exp.form_bare, row.form_bare);
    }
    if (!sameNullable(exp.form_stressed, row.form_stressed)) {
      issues += 1;
      console.log(
        `ACCENT form mismatch : ${exp.lemma_bare} ${exp.slot}/${exp.variant}`,
      );
      printAccentDiff("form_stressed", exp.form_stressed, row.form_stressed);
    }
    if (exp.stress_status !== row.stress_status) {
      issues += 1;
      console.log(
        `stress_status form : ${exp.lemma_bare} ${exp.slot} TS=${exp.stress_status} DB=${row.stress_status}`,
      );
    }
    if (!sameNullable(exp.ending, row.ending)) {
      issues += 1;
      console.log(
        `ending mismatch : ${exp.lemma_bare} ${exp.slot} TS=${exp.ending} DB=${row.ending}`,
      );
    }
  }
  for (const [key, row] of dbFormMap) {
    if (!expFormMap.has(key)) {
      issues += 1;
      console.log(
        `ORPHAN form DB (pas dans TS) : ${row.lemma_bare} ${row.slot}/${row.variant} « ${row.form_stressed ?? row.form_bare} »`,
      );
    }
  }
  if (issues === formIssuesBefore) {
    console.log("OK — toutes les formes TS ↔ DB (slot, variant, accent, ending).");
  }

  // --- Senses ---
  console.log("");
  console.log("--- Sense overrides ---");
  let senseIssuesBefore = issues;
  const expSenseMap = new Map<string, TSenseRow>();
  for (const s of expected.senses) {
    expSenseMap.set(
      `${lemmaKey(s.lemma_bare, s.lemma_pos, s.lemma_aspect)}\0${s.sense_key}`,
      s,
    );
  }
  const dbSenseMap = new Map<string, TDbSense & { lemma_bare: string }>();
  for (const s of db.senses) {
    const lemma = lemmaById.get(s.morphology_lemma_id);
    if (!lemma) {
      issues += 1;
      console.log(`SENSE sans lemma parent : ${s.sense_key}`);
      continue;
    }
    dbSenseMap.set(
      `${lemmaKey(lemma.lemma_bare, lemma.pos, lemma.aspect)}\0${s.sense_key}`,
      { ...s, lemma_bare: lemma.lemma_bare },
    );
  }
  for (const [key, exp] of expSenseMap) {
    const row = dbSenseMap.get(key);
    if (!row) {
      issues += 1;
      console.log(
        `MISSING sense DB ← TS : ${exp.lemma_bare} ${exp.sense_key}`,
      );
      continue;
    }
    if (!slotsEqual(row.allowed_slots, exp.allowed_slots)) {
      issues += 1;
      console.log(
        `allowed_slots : ${exp.lemma_bare} ${exp.sense_key} TS=${JSON.stringify(exp.allowed_slots)} DB=${JSON.stringify(row.allowed_slots)}`,
      );
    }
    if (!sameNullable(exp.notes_fr, row.notes_fr)) {
      issues += 1;
      console.log(`notes_fr mismatch : ${exp.sense_key}`);
    }
  }
  for (const [key, row] of dbSenseMap) {
    if (!expSenseMap.has(key)) {
      issues += 1;
      console.log(
        `ORPHAN sense DB : ${row.lemma_bare} ${row.sense_key}`,
      );
    }
  }
  if (issues === senseIssuesBefore) {
    console.log("OK — sense overrides TS ↔ DB.");
  }

  reportEndings(expected.forms, db.forms);
  reportPerfectiveSlots(expected.forms);

  console.log("");
  console.log("=== RÉSUMÉ ===");
  if (issues === 0) {
    console.log("PASS — aucun écart TS ↔ DB (source=curated).");
  } else {
    console.log(`FAIL — ${issues} écart(s) listé(s) ci-dessus.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
