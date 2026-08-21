/**
 * M1 — Import des paradigmes curés TS → morphology_lemmas / _forms / _sense_overrides.
 *
 * Le TypeScript reste la source active (M2 basculera la lecture). Ce script
 * ne lit QUE les modules curated existants — aucune donnée dupliquée ici.
 *
 * Usage :
 *   npx tsx scripts/import-curated-morphology.ts              # dry-run (défaut)
 *   npx tsx scripts/import-curated-morphology.ts --apply      # écriture réelle
 *
 * Idempotent : --apply efface d'abord les lignes source='curated' puis
 * réinsère (transaction logique : en cas d'échec, relancer --apply).
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  CURATED_SOURCE,
  buildExpectedCuratedPayload,
  lemmaKey,
  toBare,
  type TFormRow,
  type TLemmaRow,
  type TSenseRow,
} from "./lib/curated-morphology-expected";

const SOURCE = CURATED_SOURCE;
const SOURCE_VERSION = new Date().toISOString().slice(0, 10);

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

function printDryRun(payload: {
  lemmas: TLemmaRow[];
  forms: TFormRow[];
  senses: TSenseRow[];
  endingsAttached: number;
}): void {
  const monoLemmas = payload.lemmas.filter((l) => l.stress_status === "missing");
  const monoForms = payload.forms.filter((f) => f.stress_status === "missing");
  const withApp = payload.lemmas.filter((l) => l.app_lemma_id);
  const withEnding = payload.forms.filter((f) => f.ending);

  console.log("=== DRY-RUN import curated morphology ===");
  console.log(`source=${SOURCE} source_version=${SOURCE_VERSION}`);
  console.log("");
  console.log(`morphology_lemmas : ${payload.lemmas.length}`);
  console.log(
    `  dont stress_status=missing (monosyllabes / sans accent) : ${monoLemmas.length}`,
  );
  console.log(`  dont app_lemma_id rempli : ${withApp.length}`);
  console.log(`morphology_forms  : ${payload.forms.length}`);
  console.log(`  dont stress_status=missing : ${monoForms.length}`);
  console.log(`  dont ending non NULL     : ${withEnding.length}`);
  console.log(`morphology_sense_overrides : ${payload.senses.length}`);
  console.log("");
  console.log("ENDINGS → colonne morphology_forms.ending (présent curé) :");
  for (const f of withEnding) {
    console.log(
      `  ${f.lemma_bare} ${f.slot} → form=${f.form_stressed ?? f.form_bare} ending=${f.ending}`,
    );
  }
  console.log("");
  console.log(
    "Aucune écriture. Pour appliquer : npx tsx scripts/import-curated-morphology.ts --apply",
  );
}

async function applyPayload(
  supabase: SupabaseClient,
  payload: {
    lemmas: TLemmaRow[];
    forms: TFormRow[];
    senses: TSenseRow[];
  },
): Promise<void> {
  console.log("=== APPLY : purge source=curated puis insert ===");

  const delSense = await supabase
    .from("morphology_sense_overrides")
    .delete()
    .eq("source", SOURCE);
  if (delSense.error) {
    throw new Error(
      `DELETE sense_overrides : ${delSense.error.message} (${delSense.error.code ?? ""})`,
    );
  }
  const delForms = await supabase
    .from("morphology_forms")
    .delete()
    .eq("source", SOURCE);
  if (delForms.error) {
    throw new Error(
      `DELETE forms : ${delForms.error.message} (${delForms.error.code ?? ""})`,
    );
  }
  const delLemmas = await supabase
    .from("morphology_lemmas")
    .delete()
    .eq("source", SOURCE);
  if (delLemmas.error) {
    throw new Error(
      `DELETE lemmas : ${delLemmas.error.message} (${delLemmas.error.code ?? ""})`,
    );
  }

  const lemmaIdByKey = new Map<string, string>();

  for (const row of payload.lemmas) {
    const { data, error } = await supabase
      .from("morphology_lemmas")
      .insert(row)
      .select("id, lemma_bare, pos, aspect")
      .single();
    if (error || !data) {
      throw new Error(
        `INSERT morphology_lemmas échoué pour ${JSON.stringify(row)}\n` +
          `Contrainte / erreur : ${error?.message ?? "no data"} [${error?.code ?? ""}] ${error?.details ?? ""}`,
      );
    }
    lemmaIdByKey.set(
      lemmaKey(data.lemma_bare, data.pos, data.aspect),
      data.id,
    );
  }
  console.log(`lemmas insérés : ${payload.lemmas.length}`);

  for (const row of payload.forms) {
    const mid = lemmaIdByKey.get(
      lemmaKey(row.lemma_bare, row.lemma_pos, row.lemma_aspect),
    );
    if (!mid) {
      throw new Error(
        `Pas de morphology_lemma_id pour form ${JSON.stringify(row)}`,
      );
    }
    const insertRow = {
      morphology_lemma_id: mid,
      slot: row.slot,
      variant: row.variant,
      form_bare: row.form_bare,
      form_stressed: row.form_stressed,
      stress_status: row.stress_status,
      ending: row.ending,
      source: row.source,
      source_version: row.source_version,
    };
    const { error } = await supabase.from("morphology_forms").insert(insertRow);
    if (error) {
      throw new Error(
        `INSERT morphology_forms échoué pour ${JSON.stringify(insertRow)}\n` +
          `Contrainte / erreur : ${error.message} [${error.code ?? ""}] ${error.details ?? ""}`,
      );
    }
  }
  console.log(`forms insérées : ${payload.forms.length}`);

  for (const row of payload.senses) {
    const mid = lemmaIdByKey.get(
      lemmaKey(row.lemma_bare, row.lemma_pos, row.lemma_aspect),
    );
    if (!mid) {
      throw new Error(
        `Pas de morphology_lemma_id pour sense ${JSON.stringify(row)}`,
      );
    }
    const insertRow = {
      morphology_lemma_id: mid,
      sense_key: row.sense_key,
      label_fr: row.label_fr,
      allowed_slots: row.allowed_slots,
      notes_fr: row.notes_fr,
      validated: row.validated,
      source: row.source,
      source_version: row.source_version,
    };
    const { error } = await supabase
      .from("morphology_sense_overrides")
      .insert(insertRow);
    if (error) {
      throw new Error(
        `INSERT morphology_sense_overrides échoué pour ${JSON.stringify(insertRow)}\n` +
          `Contrainte / erreur : ${error.message} [${error.code ?? ""}] ${error.details ?? ""}`,
      );
    }
  }
  console.log(`sense_overrides insérés : ${payload.senses.length}`);
  console.log("OK — import curated terminé.");
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants (.env.local)",
    );
  }

  const supabase = createClient(url, key);

  // Même en dry-run : lecture lemmas pour app_lemma_id (29 uniques).
  const appMap = await loadAppLemmaMap(supabase);
  const payload = buildExpectedCuratedPayload(SOURCE_VERSION, appMap);

  // Garde-fous volume Phase 1
  if (payload.lemmas.length !== 50 || payload.forms.length !== 161) {
    console.warn(
      `Attention : compte ${payload.lemmas.length} lemmes / ${payload.forms.length} forms ` +
        `(Phase 1 attendait 50 / 161). Vérifier le collecteur.`,
    );
  }

  if (!apply) {
    printDryRun(payload);
    return;
  }

  try {
    await applyPayload(supabase, payload);
  } catch (error) {
    console.error("\nÉCHEC — arrêt immédiat.");
    console.error(error instanceof Error ? error.message : error);
    console.error(
      "État : lignes source=curated peut-être partiellement absentes après purge. Relancer avec --apply (idempotent).",
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
