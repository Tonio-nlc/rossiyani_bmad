/**
 * Purge ciblée + régénération de la prose LLM des pronoms curés dans
 * explanation_cache.
 *
 * CONTEXTE : le module curé (src/lib/knowledge/morphology/curated/pronouns.ts)
 * corrige déjà le rôle fonctionnel / la couleur / la terminaison affichés
 * pour les pronoms (overrides appliqués À LA LECTURE, cf. resolve-reader-concept
 * ::derivePronounRoleOverride). Mais la PROSE (`explanation`, champ libre écrit
 * par le LLM) reste celle générée AVANT la curation et n'est jamais réécrite
 * par ces overrides — elle peut donc encore dire des choses fausses comme
 * "меня́ est la forme possessive du pronom je". Ce script purge et régénère
 * cette prose, désormais sous contrainte du fait grammatical curé injecté
 * dans le prompt (cf. orchestrator/llm.ts::generateWordExplanation +
 * concept-graph::buildPronounFactPromptHint).
 *
 * MODES :
 *   npx tsx scripts/purge-pronoun-cache.ts             → dry-run (rapport seul, aucune écriture)
 *   npx tsx scripts/purge-pronoun-cache.ts --execute    → purge + régénération réelles
 *
 * Sécurité : une ligne de cache référencée par `user_vocabulary.explanation_cache_id`
 * (sauvegarde personnelle) NE PEUT PAS être supprimée (contrainte de clé
 * étrangère sans ON DELETE) et ne DOIT pas l'être — elle est régénérée EN
 * PLACE (même id, même context_hash) via `updateExplanationInCache` au lieu
 * d'un DELETE + réinsertion. Les autres lignes sont supprimées puis
 * régénérées via `explainWord`, exactement comme le préremplissage
 * (scripts/prefill-explanation-cache.ts).
 *
 * Rapport écrit AVANT toute suppression, dans les deux modes :
 *   docs/knowledge/pronoun-cache-purge-report.md
 * Journal détaillé (une ligne par mot régénéré) :
 *   docs/knowledge/pronoun-cache-purge-run-log.jsonl
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
config({ path: ".env.local" });

import { createAdminClient } from "@/lib/supabase/admin";
import { isCuratedPronounSurface } from "@/lib/knowledge/morphology/curated/pronouns";
import { explainWord } from "@/lib/orchestrator";
import { generateWordExplanation } from "@/lib/orchestrator/llm";
import { updateExplanationInCache } from "@/lib/orchestrator/cache";
import {
  buildPronounFactPromptHint,
  resolvePronounCuratedFact,
} from "@/lib/knowledge/concept-graph";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const reportPath = path.join(root, "docs/knowledge/pronoun-cache-purge-report.md");
const logPath = path.join(root, "docs/knowledge/pronoun-cache-purge-run-log.jsonl");

interface CacheRow {
  id: string;
  surface_word: string;
  sentence_example: string;
  explanation_fr: string;
  functional_role: string;
  function_color: string;
}

interface ParsedProse {
  explanation: string;
}

function parseProse(explanationFr: string): string {
  try {
    const parsed = JSON.parse(explanationFr) as ParsedProse;
    return parsed.explanation ?? explanationFr;
  } catch {
    return explanationFr;
  }
}

function appendLog(entry: Record<string, unknown>) {
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`, "utf8");
}

async function fetchPronounCacheRows(): Promise<CacheRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("explanation_cache")
    .select(
      "id, surface_word, sentence_example, explanation_fr, functional_role, function_color",
    );

  if (error) {
    throw new Error(`Lecture explanation_cache impossible : ${error.message}`);
  }

  return ((data ?? []) as CacheRow[]).filter((row) =>
    isCuratedPronounSurface(row.surface_word),
  );
}

async function fetchProtectedIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) {
    return new Set();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_vocabulary")
    .select("explanation_cache_id")
    .in("explanation_cache_id", ids);

  if (error) {
    throw new Error(`Lecture user_vocabulary impossible : ${error.message}`);
  }

  return new Set(
    (data ?? [])
      .map((row) => (row as { explanation_cache_id: string | null }).explanation_cache_id)
      .filter((id): id is string => Boolean(id)),
  );
}

function buildReport(params: {
  rows: CacheRow[];
  protectedIds: Set<string>;
}): string {
  const { rows, protectedIds } = params;
  const purgeable = rows.filter((row) => !protectedIds.has(row.id));
  const protectedRows = rows.filter((row) => protectedIds.has(row.id));

  const lines: string[] = [];
  lines.push("# Purge ciblée du cache de prose — pronoms curés");
  lines.push("");
  lines.push(`Généré : ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    `Total des entrées \`explanation_cache\` dont la surface est un pronom curé : **${rows.length}**`,
  );
  lines.push(
    `- À purger + régénérer (DELETE puis réinsertion via \`explainWord\`, comme le préremplissage) : **${purgeable.length}**`,
  );
  lines.push(
    `- Protégées (référencées par une entrée \`user_vocabulary\` sauvegardée — mise à jour EN PLACE, id conservé, jamais de DELETE) : **${protectedRows.length}**`,
  );
  lines.push("");

  if (protectedRows.length > 0) {
    lines.push("## Entrées protégées (référencées par une sauvegarde utilisateur)");
    lines.push("");
    for (const row of protectedRows) {
      lines.push(
        `- \`${row.id}\` — « ${row.surface_word} » dans « ${row.sentence_example} » (rôle actuel : ${row.functional_role}/${row.function_color})`,
      );
      lines.push(`  - Prose actuelle : "${parseProse(row.explanation_fr)}"`);
    }
    lines.push("");
  }

  lines.push("## Entrées à purger (liste complète, avant suppression)");
  lines.push("");
  for (const row of purgeable) {
    lines.push(
      `- \`${row.id}\` — « ${row.surface_word} » dans « ${row.sentence_example} » (rôle actuel : ${row.functional_role}/${row.function_color})`,
    );
    lines.push(`  - Prose actuelle : "${parseProse(row.explanation_fr)}"`);
  }
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const execute = process.argv.includes("--execute");

  console.log("Lecture de explanation_cache — recherche des surfaces de pronoms curés…");
  const rows = await fetchPronounCacheRows();
  console.log(`${rows.length} entrée(s) de cache correspondent à un pronom curé.`);

  const protectedIds = await fetchProtectedIds(rows.map((r) => r.id));
  const purgeable = rows.filter((row) => !protectedIds.has(row.id));
  const protectedRows = rows.filter((row) => protectedIds.has(row.id));

  console.log(
    `  dont ${purgeable.length} purgeable(s) et ${protectedRows.length} protégée(s) (sauvegarde utilisateur).`,
  );

  const report = buildReport({ rows, protectedIds });
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`Rapport écrit AVANT toute suppression : ${reportPath}`);

  if (!execute) {
    console.log(
      "\n--dry-run (défaut) : aucune écriture en base. Relancer avec --execute pour purger + régénérer.",
    );
    return;
  }

  if (rows.length === 0) {
    console.log("Rien à purger.");
    return;
  }

  console.log("\n--execute : purge + régénération en cours…\n");

  // 1) Lignes protégées : régénération EN PLACE (id/context_hash conservés).
  for (const row of protectedRows) {
    const startedAt = Date.now();

    try {
      const fact = resolvePronounCuratedFact({
        surface: row.surface_word,
        sentence: row.sentence_example,
      });
      const hint = fact ? buildPronounFactPromptHint(fact) : undefined;
      const payload = await generateWordExplanation(row.surface_word, row.sentence_example, hint);

      await updateExplanationInCache({ cacheId: row.id, payload });

      const durationMs = Date.now() - startedAt;
      console.log(
        `[protégé] "${row.surface_word}" mis à jour en place (id ${row.id}) — ${durationMs} ms`,
      );
      appendLog({
        timestamp: new Date().toISOString(),
        mode: "update-in-place",
        id: row.id,
        surface: row.surface_word,
        sentence: row.sentence_example,
        result: "ok",
        durationMs,
        newExplanation: payload.explanation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[protégé] ERREUR "${row.surface_word}" (id ${row.id}) — ${message}`);
      appendLog({
        timestamp: new Date().toISOString(),
        mode: "update-in-place",
        id: row.id,
        surface: row.surface_word,
        sentence: row.sentence_example,
        result: "error",
        error: message,
      });
    }
  }

  // 2) Lignes purgeables : DELETE ciblé (par id) puis régénération via explainWord
  //    (même pipeline que le préremplissage — nouvelle ligne, nouvel id).
  if (purgeable.length > 0) {
    const admin = createAdminClient();
    const idsToDelete = purgeable.map((row) => row.id);
    const { error: deleteError } = await admin
      .from("explanation_cache")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      throw new Error(`Suppression ciblée impossible : ${deleteError.message}`);
    }

    console.log(`${idsToDelete.length} entrée(s) supprimée(s). Régénération…\n`);

    let done = 0;
    for (const row of purgeable) {
      done += 1;
      const startedAt = Date.now();

      try {
        const response = await explainWord({
          surface: row.surface_word,
          sentence: row.sentence_example,
        });
        const durationMs = Date.now() - startedAt;

        console.log(
          `[${done}/${purgeable.length}] "${row.surface_word}" régénéré — ${durationMs} ms — role=${response.functionalRole}/${response.functionColor}`,
        );
        appendLog({
          timestamp: new Date().toISOString(),
          mode: "delete-and-regenerate",
          oldId: row.id,
          newId: response.explanationCacheId,
          surface: row.surface_word,
          sentence: row.sentence_example,
          result: "ok",
          durationMs,
          newExplanation: response.explanation,
          functionalRole: response.functionalRole,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[${done}/${purgeable.length}] ERREUR "${row.surface_word}" (ancien id ${row.id}) — ${message}`,
        );
        appendLog({
          timestamp: new Date().toISOString(),
          mode: "delete-and-regenerate",
          oldId: row.id,
          surface: row.surface_word,
          sentence: row.sentence_example,
          result: "error",
          error: message,
        });
      }
    }
  }

  console.log(`\nJournal détaillé : ${logPath}`);
  console.log("Terminé.");
}

main().catch((error) => {
  console.error("Échec de la purge :", error);
  process.exit(1);
});
