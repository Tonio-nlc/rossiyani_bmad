/**
 * Préremplissage batch de explanation_cache — 11 textes gold Rossiyani.
 *
 * ⚠️ NON EXÉCUTÉ DANS CE TICKET. Préparé et prêt à lancer pour une prochaine
 * étape explicitement validée (génération de masse).
 *
 * Principe : pour chaque couple (mot affiché, phrase) des textes gold —
 * calculé exactement comme scripts/cache-prefill-audit.ts, donc avec les
 * mêmes clés de cache — on appelle `explainWord` (src/lib/orchestrator/index.ts),
 * **exactement** le pipeline utilisé par un clic utilisateur dans le Reader.
 * On ne duplique ni la génération LLM, ni l'écriture cache, ni la résolution
 * de lemme : tout passe par la même fonction que l'API `/api/word/explain`.
 *
 * Idempotent / relançable :
 * - `explainWord` fait lui-même un lookup cache (`context_hash`) avant tout
 *   appel LLM ; un mot déjà en cache revient en ~250 ms sans consommer de quota.
 * - Ce script ne recalcule la liste "manquants" qu'au démarrage : si on le
 *   relance après un arrêt (Ctrl+C, crash, quota), les mots déjà traités lors
 *   du run précédent sont retrouvés en cache et simplement sautés (log "hit").
 * - Aucune donnée n'est perdue en cas d'interruption : chaque écriture cache
 *   est unitaire et déjà commitée par explainWord avant de passer au mot suivant.
 *
 * Usage (une fois validé) :
 *   npx tsx scripts/prefill-explanation-cache.ts                # tout générer
 *   npx tsx scripts/prefill-explanation-cache.ts --dry-run       # liste seulement, 0 appel LLM
 *   npx tsx scripts/prefill-explanation-cache.ts --limit=20      # test sur 20 mots manquants
 *   npx tsx scripts/prefill-explanation-cache.ts --concurrency=3 # parallélisme (def. 2)
 *
 * Journal :
 * - Progression console en continu (compteurs + item courant).
 * - Log structuré append-only : docs/knowledge/cache-prefill-run-log.jsonl
 *   (une ligne JSON par mot traité : hash, surface, texte, résultat, durée).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
config({ path: ".env.local" });

import { explainWord } from "@/lib/orchestrator";
import { LlmResponseParseError } from "@/lib/orchestrator/llm";
import {
  buildWordIndex,
  fetchExistingHashes,
  fetchGoldTexts,
  type WordEntry,
} from "./lib/gold-text-words";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const logPath = path.join(root, "docs/knowledge/cache-prefill-run-log.jsonl");

interface CliOptions {
  dryRun: boolean;
  limit: number | null;
  concurrency: number;
}

function parseCliOptions(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false, limit: null, concurrency: 2 };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number.parseInt(arg.slice("--limit=".length), 10);
    } else if (arg.startsWith("--concurrency=")) {
      options.concurrency = Math.max(
        1,
        Number.parseInt(arg.slice("--concurrency=".length), 10) || 2,
      );
    }
  }

  return options;
}

interface QueueItem extends WordEntry {
  textTitle: string;
}

interface RunLogEntry {
  timestamp: string;
  hash: string;
  surface: string;
  textTitle: string;
  sentence: string;
  result: "cache-hit" | "generated" | "error";
  durationMs: number;
  error?: string;
  /** Réponse brute LLM (parse JSON/Zod) — diagnostic A1. */
  raw?: string;
}

function appendLog(entry: RunLogEntry) {
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`, "utf8");
}

/** Petit pool de concurrence maison — pas de dépendance supplémentaire. */
async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;

  async function runNext(): Promise<void> {
    const index = cursor;
    cursor += 1;

    if (index >= items.length) {
      return;
    }

    await worker(items[index]!, index);
    await runNext();
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runNext()),
  );
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));

  console.log("Lecture des 11 textes gold Rossiyani…");
  const { texts, missingTitles } = await fetchGoldTexts();

  if (missingTitles.length > 0) {
    console.warn(
      `⚠️  ${missingTitles.length} texte(s) gold introuvable(s) en base : ${missingTitles.join(", ")}`,
    );
  }

  const { global: globalEntries, perText: perTextEntries } = buildWordIndex(texts);
  const allHashes = [...globalEntries.keys()];

  console.log(
    `${allHashes.length} couples (mot, phrase) distincts — vérification du cache existant…`,
  );

  const cachedHashes = await fetchExistingHashes(allHashes);

  const queue: QueueItem[] = [];

  for (const [textTitle, entries] of perTextEntries) {
    for (const entry of entries.values()) {
      if (cachedHashes.has(entry.hash)) {
        continue;
      }

      queue.push({ ...entry, textTitle });
    }
  }

  const totalMissing = queue.length;
  const toProcess = options.limit !== null ? queue.slice(0, options.limit) : queue;

  console.log(
    `Manquants : ${totalMissing} (dont ${toProcess.length} traité(s) dans ce run${options.limit !== null ? `, limite --limit=${options.limit}` : ""}).`,
  );

  if (options.dryRun) {
    console.log("\n--dry-run : aucune génération, liste des mots qui seraient traités :\n");

    for (const item of toProcess) {
      console.log(`  [${item.textTitle}] "${item.surface}" — ${item.sentence}`);
    }

    console.log(`\n${toProcess.length} mot(s) seraient générés. Aucun appel LLM effectué.`);
    return;
  }

  if (toProcess.length === 0) {
    console.log("Rien à générer — le cache est déjà complet pour les textes gold.");
    return;
  }

  let done = 0;
  let generated = 0;
  let hits = 0;
  let errors = 0;
  const startedAt = Date.now();

  await runWithConcurrency(toProcess, options.concurrency, async (item) => {
    const startedItemAt = Date.now();

    try {
      const response = await explainWord({
        surface: item.surface,
        sentence: item.sentence,
      });

      const durationMs = Date.now() - startedItemAt;
      // explainWord ne distingue pas hit/miss dans sa réponse ; une réponse
      // rapide (<800 ms) trahit très probablement un cache déjà chaud
      // (race avec un autre worker du même run, ou run précédent partiel).
      const wasLikelyCacheHit = durationMs < 800;

      if (wasLikelyCacheHit) {
        hits += 1;
      } else {
        generated += 1;
      }

      appendLog({
        timestamp: new Date().toISOString(),
        hash: item.hash,
        surface: item.surface,
        textTitle: item.textTitle,
        sentence: item.sentence,
        result: wasLikelyCacheHit ? "cache-hit" : "generated",
        durationMs,
      });

      done += 1;
      console.log(
        `[${done}/${toProcess.length}] ${wasLikelyCacheHit ? "hit " : "gen "} "${item.surface}" (${item.textTitle}) — ${durationMs} ms — lemme=${response.lemma}`,
      );
    } catch (error) {
      const durationMs = Date.now() - startedItemAt;
      errors += 1;
      done += 1;

      const message = error instanceof Error ? error.message : String(error);
      const raw =
        error instanceof LlmResponseParseError ? error.raw : undefined;

      appendLog({
        timestamp: new Date().toISOString(),
        hash: item.hash,
        surface: item.surface,
        textTitle: item.textTitle,
        sentence: item.sentence,
        result: "error",
        durationMs,
        error: message,
        ...(raw !== undefined ? { raw } : {}),
      });

      console.error(
        `[${done}/${toProcess.length}] ERREUR "${item.surface}" (${item.textTitle}) — ${message}`,
      );
    }
  });

  const totalSeconds = (Date.now() - startedAt) / 1000;

  console.log("\n--- Résumé du run ---");
  console.log(`Traités     : ${done}/${toProcess.length}`);
  console.log(`Générés     : ${generated}`);
  console.log(`Déjà en cache (détecté pendant le run) : ${hits}`);
  console.log(`Erreurs     : ${errors}`);
  console.log(`Durée totale : ${totalSeconds.toFixed(1)} s`);
  console.log(`Journal détaillé : ${logPath}`);

  if (errors > 0) {
    console.log(
      "\nDes erreurs sont survenues — relancer ce script (idempotent) régénérera uniquement les mots encore manquants.",
    );
  }
}

main().catch((error) => {
  console.error("Échec du préremplissage :", error);
  process.exit(1);
});
