/**
 * Audit préremplissage explanation_cache — 11 textes gold Rossiyani.
 *
 * LECTURE SEULE — n'écrit rien en base, ne fait aucun appel LLM.
 * Réutilise exactement la même tokenisation / le même hash que le Reader
 * (voir scripts/lib/gold-text-words.ts) pour que le comptage "manquant"
 * corresponde vraiment à ce qu'un clic déclencherait.
 *
 * Usage : npm run cache:prefill-audit
 * Sortie : docs/knowledge/cache-prefill-audit.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
config({ path: ".env.local" });

import { ROSSIYANI_TEXT_TITLES } from "@/lib/knowledge/bootstrap/types";
import {
  buildWordIndex,
  extractSentences,
  fetchExistingHashes,
  fetchGoldTexts,
  usesFallbackSplit,
  type WordEntry,
} from "./lib/gold-text-words";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "docs/knowledge/cache-prefill-audit.md");

/** ~3,5 s / appel observés en dev (LLM + parsing + resolveOrCreateLemma). */
const ESTIMATED_SECONDS_PER_CALL = 3.5;
/** Sortie JSON typique (lemma, traduction, explication 2-3 phrases, suffixe…). */
const ESTIMATED_OUTPUT_TOKENS_PER_CALL = 200;
/** Repère grossier chars→tokens (valable pour le prompt système en français). */
const CHARS_PER_TOKEN_ESTIMATE = 4;

const OPENAI_PRICE_PER_1M_INPUT_USD = 0.4;
const OPENAI_PRICE_PER_1M_OUTPUT_USD = 1.6;

/** Repère le prompt système réel (llm.ts) sans l'exporter — audit lecture seule. */
function estimateSystemPromptChars(): number {
  const llmSourcePath = path.join(root, "src/lib/orchestrator/llm.ts");
  const source = fs.readFileSync(llmSourcePath, "utf8");
  const match = source.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);

  return match ? match[1].length : 2000;
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(0)} s`;
  }

  const minutes = totalSeconds / 60;

  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  }

  const hours = minutes / 60;

  return `${hours.toFixed(1)} h (${minutes.toFixed(0)} min)`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

async function main() {
  console.log("Lecture des 11 textes gold Rossiyani…");

  const { texts: orderedTexts, missingTitles } = await fetchGoldTexts();

  if (missingTitles.length > 0) {
    console.warn(
      `⚠️  ${missingTitles.length} texte(s) gold introuvable(s) en base : ${missingTitles.join(", ")}`,
    );
  }

  const { global: globalEntries, perText: perTextEntries } = buildWordIndex(orderedTexts);

  interface PerTextStats {
    title: string;
    sentenceCount: number;
    distinct: number;
    cached: number;
    missing: number;
    usedFallbackSplit: boolean;
  }

  const perText: PerTextStats[] = orderedTexts.map((text) => ({
    title: text.title,
    sentenceCount: extractSentences(text).length,
    distinct: perTextEntries.get(text.title)?.size ?? 0,
    cached: 0,
    missing: 0,
    usedFallbackSplit: usesFallbackSplit(text),
  }));

  console.log(
    `${formatNumber(globalEntries.size)} couples (mot, phrase) distincts au total — interrogation d'explanation_cache…`,
  );

  const allHashes = [...globalEntries.keys()];
  const cachedHashes = await fetchExistingHashes(allHashes);

  for (const stats of perText) {
    const entries = perTextEntries.get(stats.title)!;
    let cached = 0;

    for (const hash of entries.keys()) {
      if (cachedHashes.has(hash)) {
        cached += 1;
      }
    }

    stats.cached = cached;
    stats.missing = stats.distinct - cached;
  }

  const globalDistinct = globalEntries.size;
  const globalCached = allHashes.filter((hash) => cachedHashes.has(hash)).length;
  const globalMissing = globalDistinct - globalCached;
  const sumPerTextDistinct = perText.reduce((sum, t) => sum + t.distinct, 0);

  // Estimation coût / temps / tokens pour les entrées manquantes.
  const missingEntries: WordEntry[] = allHashes
    .filter((hash) => !cachedHashes.has(hash))
    .map((hash) => globalEntries.get(hash)!);

  const systemPromptChars = estimateSystemPromptChars();
  const avgUserInputChars =
    missingEntries.length > 0
      ? missingEntries.reduce(
          (sum, e) => sum + `Mot : ${e.surface}\nPhrase : ${e.sentence}`.length,
          0,
        ) / missingEntries.length
      : 0;

  const estimatedInputTokensPerCall = Math.ceil(
    (systemPromptChars + avgUserInputChars) / CHARS_PER_TOKEN_ESTIMATE,
  );
  const estimatedOutputTokensPerCall = ESTIMATED_OUTPUT_TOKENS_PER_CALL;

  const totalInputTokens = estimatedInputTokensPerCall * globalMissing;
  const totalOutputTokens = estimatedOutputTokensPerCall * globalMissing;
  const totalTokens = totalInputTokens + totalOutputTokens;

  const estimatedCostUsd =
    (totalInputTokens / 1_000_000) * OPENAI_PRICE_PER_1M_INPUT_USD +
    (totalOutputTokens / 1_000_000) * OPENAI_PRICE_PER_1M_OUTPUT_USD;

  const estimatedSeconds = globalMissing * ESTIMATED_SECONDS_PER_CALL;

  const generatedAt = new Date().toISOString();

  const lines: string[] = [
    "# Audit préremplissage — explanation_cache (11 textes gold)",
    "",
    `> Généré le ${generatedAt} par \`scripts/cache-prefill-audit.ts\`.`,
    "> Lecture seule — aucune écriture en base, aucun appel LLM dans ce ticket.",
    "",
    "## Objectif",
    "",
    "Mesurer, avant toute génération de masse, combien de couples (mot affiché,",
    "phrase) des 11 textes gold ont déjà une explication en cache et combien",
    "manquent — pour chiffrer le coût d'un préremplissage complet du pilote.",
    "",
    "## Méthodologie",
    "",
    "- **Périmètre** : les 11 textes Rossiyani (`ROSSIYANI_TEXT_TITLES`,",
    "  `src/lib/knowledge/bootstrap/types.ts`), identifiés par `texts.title`",
    "  (pas de colonne `is_gold` dédiée — ce sont les seuls textes `source = 'curated'`",
    "  de la bibliothèque pilote).",
    "- **Phrases** : `content_annotated.sentences[].text` si présent, sinon repli",
    "  `splitIntoSentences(content)` — exactement le même repli que `TextBody.tsx`",
    "  (Reader).",
    "- **Mots cliquables** : `tokenizeSentence(phrase)` (découpe sur les espaces,",
    "  garde la ponctuation collée au mot, ex. `окна́.`) puis ne retient que les",
    "  tokens où `normalizeToken(token).length > 0` — identique à `Sentence.tsx`.",
    "  La ponctuation isolée (`—`, `«`, `»`…) n'est pas cliquable et n'est donc",
    "  pas comptée.",
    "- **Clé de cache** : `context_hash = sha256(surface.toLowerCase() + \"::\" +",
    "  phrase.trim().toLowerCase())` (`computeContextHash`,",
    "  `src/lib/orchestrator/hasher.ts`) — **identique** au calcul fait par",
    "  `explainWord` sur un vrai clic. Une même surface dans deux phrases",
    "  différentes = deux clés distinctes. La casse est neutralisée mais pas",
    "  l'accent tonique (´) : `А́нной` ≠ `Анной`.",
    "- **Cache existant** : lecture de `explanation_cache.context_hash` par lots",
    "  de 150 (`.in(...)`), aucune écriture.",
    "",
    "## Résultat global",
    "",
    "| Indicateur | Valeur |",
    "|---|---|",
    `| Textes gold trouvés en base | ${orderedTexts.length} / ${ROSSIYANI_TEXT_TITLES.length} |`,
    `| Couples (mot, phrase) distincts (dédupliqués globalement) | ${formatNumber(globalDistinct)} |`,
    `| Déjà en cache (hit) | ${formatNumber(globalCached)} (${globalDistinct > 0 ? ((globalCached / globalDistinct) * 100).toFixed(1) : "0"} %) |`,
    `| Manquants (à générer) | ${formatNumber(globalMissing)} (${globalDistinct > 0 ? ((globalMissing / globalDistinct) * 100).toFixed(1) : "0"} %) |`,
    `| Somme des colonnes "distinct" par texte (avant dédup inter-textes) | ${formatNumber(sumPerTextDistinct)} |`,
    "",
    sumPerTextDistinct !== globalDistinct
      ? `> ${formatNumber(sumPerTextDistinct - globalDistinct)} couple(s) identique(s) (même mot, même phrase exacte) apparaissent dans plusieurs textes — d'où l'écart avec le total dédupliqué.`
      : "> Aucun couple identique partagé entre deux textes (somme par texte = total global).",
    ...(missingTitles.length > 0
      ? [
          `> ⚠️ Texte(s) gold introuvable(s) en base, exclus de l'audit : ${missingTitles.join(", ")}.`,
        ]
      : []),
    "",
    "## Répartition par texte",
    "",
    "| Texte | Phrases | Distinct | Déjà en cache | Manquants | Source phrases |",
    "|---|---:|---:|---:|---:|---|",
    ...perText.map(
      (t) =>
        `| ${t.title} | ${t.sentenceCount} | ${t.distinct} | ${t.cached} | ${t.missing} | ${t.usedFallbackSplit ? "repli `splitIntoSentences`" : "`content_annotated`"} |`,
    ),
    "",
    "## Coût estimé du préremplissage complet",
    "",
    "Estimation grossière — un appel LLM manquant ≈ le pipeline `explainWord`",
    "au clic (cache miss) : `generateWordExplanation` (1 à 3 tentatives) +",
    "`resolveOrCreateLemma` + écriture cache.",
    "",
    "| Indicateur | Valeur |",
    "|---|---|",
    `| Appels LLM nécessaires | ${formatNumber(globalMissing)} |`,
    `| Temps total estimé (${ESTIMATED_SECONDS_PER_CALL} s / appel, séquentiel) | ${formatDuration(estimatedSeconds)} |`,
    `| Tokens d'entrée estimés / appel (prompt système + mot + phrase) | ~${formatNumber(estimatedInputTokensPerCall)} |`,
    `| Tokens de sortie estimés / appel (JSON réponse) | ~${formatNumber(estimatedOutputTokensPerCall)} |`,
    `| Volume total de tokens estimé | ~${formatNumber(totalTokens)} (${formatNumber(totalInputTokens)} entrée + ${formatNumber(totalOutputTokens)} sortie) |`,
    `| Coût indicatif (modèle ${process.env.OPENAI_MODEL ?? "gpt-4.1-mini"} — $${OPENAI_PRICE_PER_1M_INPUT_USD}/1M entrée, $${OPENAI_PRICE_PER_1M_OUTPUT_USD}/1M sortie) | ~$${estimatedCostUsd.toFixed(2)} |`,
    "",
    "> Estimation approximative (règle chars/4, propre au prompt système en",
    "> français) — le russe (cyrillique) consomme généralement plus de tokens",
    "> par caractère que le français ; le volume réel peut être un peu",
    "> supérieur. Prix indicatif au tarif standard (hors Batch API, qui",
    "> diviserait le coût par 2, et hors cache de prompt).",
    "",
    "## Prochaine étape",
    "",
    globalMissing > 0
      ? "Le script `scripts/prefill-explanation-cache.ts` peut générer les entrées " +
        "manquantes en réutilisant `explainWord` tel quel — voir son en-tête pour " +
        "le mode d'emploi (`--dry-run` pour prévisualiser, `--limit=N` pour tester)."
      : "Aucune entrée manquante — le cache des 11 textes gold est complet. " +
        "Un clic sur n'importe quel mot de ces textes est un cache hit (~250 ms).",
    "",
  ];

  fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");

  console.log(`\nRapport écrit : ${outPath}`);
  console.log(
    `Distinct=${globalDistinct} | Cache=${globalCached} | Manquants=${globalMissing} | Temps estimé=${formatDuration(estimatedSeconds)} | Coût estimé=$${estimatedCostUsd.toFixed(2)}`,
  );
}

main().catch((error) => {
  console.error("Échec de l'audit :", error);
  process.exit(1);
});
