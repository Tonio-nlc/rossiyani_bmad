/**
 * Dry-run de la fusion des 15 doublons résiduels curatés (PROMPT CURSOR
 * 28/07/2026). N'écrit RIEN en base. Produit :
 *   docs/knowledge/lemma-residual-dedup-report.md
 *
 * Usage : npx tsx scripts/lemma-residual-dedup-plan.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { resolveCuratedGroups, type ResolvedGroup } from "./lemma-residual-dedup/resolve";

config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function sumRemaps(groups: ResolvedGroup[]) {
  return groups.reduce(
    (acc, g) => ({
      user_vocabulary: acc.user_vocabulary + g.remaps.user_vocabulary,
      srs_reviews: acc.srs_reviews + g.remaps.srs_reviews,
      review_history: acc.review_history + g.remaps.review_history,
      explanation_cache: acc.explanation_cache + g.remaps.explanation_cache,
      word_forms: acc.word_forms + g.remaps.word_forms,
      lemma_concept_links: acc.lemma_concept_links + g.remaps.lemma_concept_links,
      content_annotated_words: acc.content_annotated_words + g.remaps.content_annotated_words,
    }),
    {
      user_vocabulary: 0,
      srs_reviews: 0,
      review_history: 0,
      explanation_cache: 0,
      word_forms: 0,
      lemma_concept_links: 0,
      content_annotated_words: 0,
    },
  );
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { groups, excludedPairStatus, missingForms } = await resolveCuratedGroups(sb);

  if (missingForms.length > 0) {
    console.error("ABANDON : formes attendues introuvables en base :", missingForms);
    process.exit(1);
  }

  const totals = sumRemaps(groups);
  const totalConflicts = groups.reduce((sum, g) => sum + g.userVocabularyConflicts, 0);
  const sensitiveHit =
    totals.user_vocabulary > 0 ||
    totals.srs_reviews > 0 ||
    totals.review_history > 0 ||
    totalConflicts > 0;

  const bareAccent = groups.filter((g) => g.reason === "bare-accent");
  const corrections = groups.filter((g) => g.reason === "accent-correction");

  const lines: string[] = [
    "# Rapport dry-run — nettoyage des doublons de lemmes résiduels",
    "",
    `> Généré le ${new Date().toLocaleString("fr-FR")} — **DRY-RUN** (aucune écriture)`,
    "",
    "## ⚠️ Confirmation d'exclusion — бо́леть / боле́ть",
    "",
    `- Forme 1 : « ${excludedPairStatus.forms[0]} » → id \`${excludedPairStatus.ids[0] ?? "INTROUVABLE"}\``,
    `- Forme 2 : « ${excludedPairStatus.forms[1]} » → id \`${excludedPairStatus.ids[1] ?? "INTROUVABLE"}\``,
    excludedPairStatus.bothPresentAsDistinctRows
      ? "- **✅ CONFIRMÉ** : les deux formes existent en base comme **deux lignes distinctes**, et **n'apparaissent dans AUCUN groupe de fusion ci-dessous** (vérifié par `assertExclusionIsRespected()` avant tout calcul — le script échoue si l'une des deux apparaît dans la liste curatée)."
      : "- **❌ ANOMALIE** : l'état attendu (deux lignes distinctes) n'est plus vérifié — NE PAS EXÉCUTER avant investigation.",
    "",
    "## Règles appliquées (arbitrage fondateur, russophone)",
    "",
    "1. 12 doublons **forme nue / forme accentuée** du même mot → fusion vers la forme accentuée déjà existante.",
    "2. 3 doublons **accent erroné** (mot inexistant) → fusion vers la forme correcte déjà existante (дума́ть→ду́мать, у́рок→уро́к, до́мой→домо́й).",
    "3. **бо́леть / боле́ть exclus** : deux mots distincts (« avoir mal » vs « être malade ») — intacts, aucune fusion.",
    "",
    "## ⚠️ Vigilance données personnelles",
    "",
    sensitiveHit
      ? "**Au moins un groupe touche `user_vocabulary`, `srs_reviews`, `review_history`, " +
        "ou crée un conflit d'unicité — voir détail par groupe ci-dessous avant toute exécution.**"
      : "Aucun remap détecté sur `user_vocabulary`, `srs_reviews` ou `review_history`, et " +
        "aucun conflit d'unicité `user_id`+`lemma_id` sur les 15 groupes. Risque faible pour " +
        "les données personnelles sur ce dry-run.",
    "",
    "## Totaux de remappage prévus",
    "",
    "| Table | Lignes / occurrences à remapper ou supprimer |",
    "|-------|-----------------------------------------------|",
    `| **user_vocabulary** ${totals.user_vocabulary > 0 ? "⚠️" : ""} | ${totals.user_vocabulary} |`,
    `| **srs_reviews** (indirect, via user_vocabulary) ${totals.srs_reviews > 0 ? "⚠️" : ""} | ${totals.srs_reviews} |`,
    `| **review_history** (indirect, via user_vocabulary) ${totals.review_history > 0 ? "⚠️" : ""} | ${totals.review_history} |`,
    `| explanation_cache | ${totals.explanation_cache} |`,
    `| word_forms | ${totals.word_forms} |`,
    `| lemma_concept_links | ${totals.lemma_concept_links} |`,
    `| texts.content_annotated (mots, colonne JSONB) | ${totals.content_annotated_words} |`,
    `| **Conflits UNIQUE(user_id, lemma_id)** ${totalConflicts > 0 ? "⚠️" : ""} | ${totalConflicts} |`,
    `| **Lignes lemmas supprimées au total** | ${groups.length} |`,
    "",
    `**Groupes planifiés : ${groups.length}** (${bareAccent.length} nu/accentué + ${corrections.length} corrections d'accent)`,
    "",
    "## Détail par groupe",
    "",
    "| # | Type | Conserver (keep) | Supprimer (drop) | knowledge keep/drop | uv | srs | review_hist | cache | word_forms | concept_links | annotated | Conflit UNIQUE |",
    "|---|------|-------------------|-------------------|----------------------|----|----|-------------|-------|------------|----------------|-----------|-----------------|",
  ];

  let i = 1;
  for (const g of groups) {
    const groupSensitive =
      g.remaps.user_vocabulary > 0 ||
      g.remaps.srs_reviews > 0 ||
      g.remaps.review_history > 0 ||
      g.userVocabularyConflicts > 0;

    lines.push(
      `| ${i} | ${g.reason === "bare-accent" ? "nu→accent" : "correction"} | « ${g.keep.form} » (\`${g.keep.id.slice(0, 8)}\`) | « ${g.drop.form} » (\`${g.drop.id.slice(0, 8)}\`) | ${g.keep.hasKnowledge ? "✓" : "✗"}/${g.drop.hasKnowledge ? "✓" : "✗"}${g.migrateKnowledge ? " (migration)" : ""} | ${g.remaps.user_vocabulary} | ${g.remaps.srs_reviews} | ${g.remaps.review_history} | ${g.remaps.explanation_cache} | ${g.remaps.word_forms} | ${g.remaps.lemma_concept_links} | ${g.remaps.content_annotated_words} | ${g.userVocabularyConflicts}${groupSensitive ? " ⚠️" : ""} |`,
    );
    i += 1;
  }

  lines.push(
    "",
    "## Plan d'exécution",
    "",
    "0. **Préalable obligatoire** : backup manuel déjà confirmé par le fondateur",
    "   (`scripts/db-backup-manual.sql`).",
    "1. Relire ce rapport, en particulier la confirmation d'exclusion бо́леть/боле́ть",
    "   et les lignes ⚠️.",
    "2. Relancer ce dry-run juste avant exécution (les données changent chaque jour) :",
    "   si l'exclusion n'est plus confirmée, ou si `user_vocabulary`/`srs_reviews`/",
    "   `review_history`/conflits ont changé, ne pas exécuter sans revérifier.",
    "3. Exécuter `supabase/seed/lemma_residual_dedup_execute_20260728.sql`",
    "   (transaction `BEGIN`/`COMMIT` unique, générée par",
    "   `npx tsx scripts/lemma-residual-dedup-generate-execute-sql.ts` depuis les MÊMES",
    "   groupes que ce rapport) dans le SQL Editor Supabase.",
    "4. Lancer le bloc de vérification en fin de ce même fichier SQL (comptes,",
    "   0 doublon nu/accentué, бо́леть ET боле́ть toujours 2 lignes distinctes, 0 orphelin).",
    "5. Relancer `npm run lemma:audit-accents` : doit afficher 0 doublon nu/accentué",
    "   (les 4 paires ambiguës doivent tomber à 1 seule — бо́леть/боле́ть restant).",
    "6. Une fois propre, appliquer le garde-fou DB",
    "   (`supabase/seed/lemma_canonicalization_guardrail.sql`, étape 2).",
    "",
    "## Script",
    "",
    "```bash",
    "npx tsx scripts/lemma-residual-dedup-plan.ts                    # dry-run (ce rapport)",
    "npx tsx scripts/lemma-residual-dedup-generate-execute-sql.ts     # génère le SQL d'exécution",
    "# Exécution réelle : coller supabase/seed/lemma_residual_dedup_execute_20260728.sql",
    "# dans le SQL Editor Supabase (transaction atomique, hors de la portée de ce script).",
    "```",
    "",
  );

  const out = path.join(root, "docs/knowledge/lemma-residual-dedup-report.md");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${out}`);
  console.log(`Groupes : ${groups.length}`);
  console.log("Totaux remaps :", totals);
  console.log("Conflits UNIQUE(user_id, lemma_id) :", totalConflicts);
  console.log("Exclusion бо́леть/боле́ть confirmée :", excludedPairStatus.bothPresentAsDistinctRows);
}

void main();
