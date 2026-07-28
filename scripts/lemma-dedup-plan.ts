/**
 * Plan de déduplication des lemmes — DRY-RUN uniquement.
 *
 * Usage:
 *   npx tsx scripts/lemma-dedup-plan.ts
 *
 * Produit : docs/knowledge/lemma-dedup-remap-report.md
 * N'exécute AUCUNE écriture / suppression.
 *
 * Exécution réelle (ticket ultérieur) :
 *   npx tsx scripts/lemma-dedup-plan.ts --execute
 *   (refusé tant que --execute n'est pas explicitement demandé + revue du rapport)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { computeDedupGroups, type DedupGroup } from "./lemma-dedup/compute-groups";

config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

interface RemapPlan {
  groupKey: string;
  reason: "accent-duplicate" | "corrupt-spelling";
  keep: { id: string; form: string; hasKnowledgeV2: boolean };
  drop: Array<{
    id: string;
    form: string;
    hasKnowledgeV2: boolean;
    migrateKnowledge?: boolean;
  }>;
  /** true si le lemme conservé doit en plus être renommé (lemmas.form) vers keep.form. */
  renameKeep: boolean;
  remaps: {
    user_vocabulary: number;
    /**
     * srs_reviews n'a pas de lemma_id (FK sur user_vocabulary_id uniquement).
     * Compté indirectement : lignes srs_reviews rattachées aux user_vocabulary
     * du/des lemme(s) supprimé(s). Donnée personnelle — vigilance maximale.
     */
    srs_reviews: number;
    /** Même remarque que srs_reviews : indirect via user_vocabulary_id. */
    review_history: number;
    explanation_cache: number;
    word_forms: number;
    content_annotated_words: number;
    linguistic_knowledge_drop: number;
    lemma_concept_links: number;
  };
  /**
   * Nombre d'utilisateurs ayant DÉJÀ le lemme conservé ET un lemme supprimé
   * dans user_vocabulary (viole UNIQUE(user_id, lemma_id) en cas de simple
   * UPDATE) → nécessite une fusion manuelle (garder 1 ligne, migrer ses
   * srs_reviews/review_history, supprimer l'autre). Point de vigilance maximale.
   */
  userVocabularyConflicts: number;
}

// Cache le contenu de `texts` (lu une seule fois, réutilisé pour chaque lemme).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let textsCache: any[] | null = null;

async function countRefs(
  // Client admin typé lâche — script one-shot hors du graphe d'app.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  lemmaId: string,
): Promise<RemapPlan["remaps"]> {
  if (textsCache === null) {
    const { data } = await sb.from("texts").select("id, content_annotated");
    textsCache = data ?? [];
  }

  const [
    { data: uvRows },
    { count: cache },
    { count: wf },
    { count: knowledge },
    { count: lcl },
  ] = await Promise.all([
    sb.from("user_vocabulary").select("id").eq("lemma_id", lemmaId),
    sb
      .from("explanation_cache")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
    sb
      .from("word_forms")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
    sb
      .from("linguistic_knowledge")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
    sb
      .from("lemma_concept_links")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
  ]);

  const uvIds = ((uvRows ?? []) as Array<{ id: string }>).map((r) => r.id);
  let srsCount = 0;
  let reviewHistoryCount = 0;

  if (uvIds.length > 0) {
    const [{ count: srs }, { count: rh }] = await Promise.all([
      sb
        .from("srs_reviews")
        .select("*", { count: "exact", head: true })
        .in("user_vocabulary_id", uvIds),
      sb
        .from("review_history")
        .select("*", { count: "exact", head: true })
        .in("user_vocabulary_id", uvIds),
    ]);
    srsCount = srs ?? 0;
    reviewHistoryCount = rh ?? 0;
  }

  let annotated = 0;

  for (const text of textsCache as Array<{
    content_annotated?: {
      sentences?: Array<{ words?: Array<{ lemmaId?: string }> }>;
    } | null;
  }>) {
    const sentences = text.content_annotated?.sentences ?? [];

    for (const sentence of sentences) {
      for (const word of sentence.words ?? []) {
        if (word.lemmaId === lemmaId) {
          annotated += 1;
        }
      }
    }
  }

  return {
    user_vocabulary: uvIds.length,
    srs_reviews: srsCount,
    review_history: reviewHistoryCount,
    explanation_cache: cache ?? 0,
    word_forms: wf ?? 0,
    content_annotated_words: annotated,
    linguistic_knowledge_drop: knowledge ?? 0,
    lemma_concept_links: lcl ?? 0,
  };
}

/**
 * Utilisateurs ayant déjà le lemme CONSERVÉ et un lemme SUPPRIMÉ dans
 * user_vocabulary : un simple UPDATE lemma_id violerait UNIQUE(user_id, lemma_id).
 * Il faudra fusionner ces lignes manuellement (garder une entrée, migrer/fusionner
 * ses srs_reviews et review_history, supprimer l'autre).
 */
async function countUserVocabularyConflicts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  keepId: string,
  dropIds: string[],
): Promise<number> {
  if (dropIds.length === 0) {
    return 0;
  }

  const [{ data: keepRows }, { data: dropRows }] = await Promise.all([
    sb.from("user_vocabulary").select("user_id").eq("lemma_id", keepId),
    sb.from("user_vocabulary").select("user_id").in("lemma_id", dropIds),
  ]);

  const keepUsers = new Set(
    ((keepRows ?? []) as Array<{ user_id: string }>).map((r) => r.user_id),
  );

  let conflicts = 0;

  for (const row of (dropRows ?? []) as Array<{ user_id: string }>) {
    if (keepUsers.has(row.user_id)) {
      conflicts += 1;
    }
  }

  return conflicts;
}

function sumRemaps(
  parts: RemapPlan["remaps"][],
): RemapPlan["remaps"] {
  return parts.reduce(
    (acc, part) => ({
      user_vocabulary: acc.user_vocabulary + part.user_vocabulary,
      srs_reviews: acc.srs_reviews + part.srs_reviews,
      review_history: acc.review_history + part.review_history,
      explanation_cache: acc.explanation_cache + part.explanation_cache,
      word_forms: acc.word_forms + part.word_forms,
      content_annotated_words:
        acc.content_annotated_words + part.content_annotated_words,
      linguistic_knowledge_drop:
        acc.linguistic_knowledge_drop + part.linguistic_knowledge_drop,
      lemma_concept_links: acc.lemma_concept_links + part.lemma_concept_links,
    }),
    {
      user_vocabulary: 0,
      srs_reviews: 0,
      review_history: 0,
      explanation_cache: 0,
      word_forms: 0,
      content_annotated_words: 0,
      linguistic_knowledge_drop: 0,
      lemma_concept_links: 0,
    },
  );
}

async function main() {
  if (process.argv.includes("--execute")) {
    console.error(
      "Refus : --execute désactivé dans ce ticket. Relire le rapport de remappage d'abord.",
    );
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const groups: DedupGroup[] = await computeDedupGroups(sb);
  const plans: RemapPlan[] = [];

  for (const group of groups) {
    const dropRemaps = await Promise.all(
      group.drop.map((item) => countRefs(sb, item.id)),
    );
    const userVocabularyConflicts = await countUserVocabularyConflicts(
      sb,
      group.keep.id,
      group.drop.map((item) => item.id),
    );

    plans.push({
      groupKey: group.groupKey,
      reason: group.reason,
      keep: group.keep,
      drop: group.drop,
      renameKeep: group.renameKeep,
      remaps: sumRemaps(dropRemaps),
      userVocabularyConflicts,
    });
  }

  const totals = sumRemaps(plans.map((plan) => plan.remaps));
  const totalConflicts = plans.reduce(
    (sum, plan) => sum + plan.userVocabularyConflicts,
    0,
  );
  const totalRowsDropped = plans.reduce((sum, plan) => sum + plan.drop.length, 0);
  const sensitiveHit =
    totals.user_vocabulary > 0 ||
    totals.srs_reviews > 0 ||
    totals.review_history > 0 ||
    totalConflicts > 0;

  const lines: string[] = [
    "# Rapport de remappage — déduplication des lemmes",
    "",
    `> Généré le ${new Date().toLocaleString("fr-FR")} — **DRY-RUN** (aucune écriture)`,
    "",
    "## Règles",
    "",
    "1. Forme canonique = forme **avec accent tonique** (NFC), si disponible.",
    "2. Conserver l'entrée qui a une `linguistic_knowledge` v2 ; sinon la forme accentuée.",
    "3. Remapper `user_vocabulary`, `explanation_cache`, `word_forms`, `lemma_concept_links`,",
    "   `texts.content_annotated` (colonne JSONB, pas une table séparée) vers le lemme",
    "   conservé **avant** suppression du doublon.",
    "4. `srs_reviews` et `review_history` référencent `user_vocabulary_id` (pas `lemma_id`) :",
    "   pas de remap direct sur ces tables ; leur exposition est **indirecte**, via les lignes",
    "   `user_vocabulary` qui référencent un lemme supprimé (comptées ci-dessous quand même,",
    "   car ce sont des données personnelles/historique — vigilance maximale demandée).",
    "5. Corrompus : `иди́ти` → `идти́` ; `здора́ваться` → `здоро́ваться`.",
    "",
    "## ⚠️ Vigilance données personnelles",
    "",
    sensitiveHit
      ? "**Au moins un groupe touche `user_vocabulary`, `srs_reviews`, `review_history`, " +
        "ou crée un conflit d'unicité — voir détail par groupe ci-dessous avant toute exécution.**"
      : "Aucun remap détecté sur `user_vocabulary`, `srs_reviews` ou `review_history`, et " +
        "aucun conflit d'unicité `user_id`+`lemma_id` sur les groupes analysés. Risque faible " +
        "pour les données personnelles sur ce dry-run.",
    "",
    "## Totaux de remappage prévus",
    "",
    `| Table | Lignes / occurrences à remapper ou supprimer |`,
    `|-------|-----------------------------------------------|`,
    `| **user_vocabulary** ${totals.user_vocabulary > 0 ? "⚠️" : ""} | ${totals.user_vocabulary} |`,
    `| **srs_reviews** (indirect, via user_vocabulary) ${totals.srs_reviews > 0 ? "⚠️" : ""} | ${totals.srs_reviews} |`,
    `| **review_history** (indirect, via user_vocabulary) ${totals.review_history > 0 ? "⚠️" : ""} | ${totals.review_history} |`,
    `| explanation_cache | ${totals.explanation_cache} |`,
    `| word_forms | ${totals.word_forms} |`,
    `| lemma_concept_links | ${totals.lemma_concept_links} |`,
    `| texts.content_annotated (mots, colonne JSONB) | ${totals.content_annotated_words} |`,
    `| linguistic_knowledge (sur doublons supprimés) | ${totals.linguistic_knowledge_drop} |`,
    `| **Conflits UNIQUE(user_id, lemma_id)** ${totalConflicts > 0 ? "⚠️" : ""} | ${totalConflicts} |`,
    `| **Lignes lemmas supprimées au total** | ${totalRowsDropped} |`,
    "",
    `**Groupes planifiés : ${plans.length}**`,
    "",
    "## Détail par groupe",
    "",
  ];

  for (const plan of plans) {
    const groupSensitive =
      plan.remaps.user_vocabulary > 0 ||
      plan.remaps.srs_reviews > 0 ||
      plan.remaps.review_history > 0 ||
      plan.userVocabularyConflicts > 0;

    lines.push(
      `### \`${plan.groupKey}\` (${plan.reason})${groupSensitive ? " ⚠️ données personnelles" : ""}`,
    );
    lines.push("");
    lines.push(
      `- **Conserver** : « ${plan.keep.form} » (\`${plan.keep.id}\`) — knowledge v2 (après migration éventuelle) : ${plan.keep.hasKnowledgeV2 ? "oui" : "non"}`,
    );

    if (plan.drop.length === 0) {
      lines.push(
        `- **Action** : renommer la forme du lemme conservé → « ${plan.keep.form} » (pas de fusion : aucune autre ligne n'occupe déjà cette forme)`,
      );
    } else {
      lines.push(
        plan.renameKeep
          ? `- **Action** : FUSION + renommage du lemme conservé → « ${plan.keep.form} » (aucune autre ligne n'occupait déjà cette forme)`
          : `- **Action** : FUSION (le lemme conservé porte déjà exactement la forme canonique « ${plan.keep.form} » — aucun renommage, donc aucun risque de collision UNIQUE(lemmas.form))`,
      );

      for (const drop of plan.drop) {
        const knowledgeNote = drop.migrateKnowledge
          ? " — ⚠️ savoir **migré** vers le lemme conservé (celui-ci n'en avait pas)"
          : "";

        lines.push(
          `- **Supprimer après remap** : « ${drop.form} » (\`${drop.id}\`) — knowledge v2 : ${drop.hasKnowledgeV2 ? "oui" : "non"}${knowledgeNote}`,
        );
      }
    }

    lines.push(
      `- Remaps : uv=${plan.remaps.user_vocabulary}, srs_reviews=${plan.remaps.srs_reviews}, review_history=${plan.remaps.review_history}, cache=${plan.remaps.explanation_cache}, word_forms=${plan.remaps.word_forms}, lemma_concept_links=${plan.remaps.lemma_concept_links}, annotated=${plan.remaps.content_annotated_words}, knowledge_drop=${plan.remaps.linguistic_knowledge_drop}`,
    );
    lines.push(
      `- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : ${plan.userVocabularyConflicts}${plan.userVocabularyConflicts > 0 ? " ⚠️" : ""}`,
    );
    lines.push("");
  }

  lines.push(
    "## Plan d'exécution",
    "",
    "0. **Préalable obligatoire** : exécuter le backup manuel",
    "   (`supabase/seed/lemma_dedup_backup_20260727.sql`) dans le SQL Editor Supabase",
    "   AVANT toute écriture — pas de backup automatique sur le plan gratuit.",
    "1. Relire ce rapport et valider les totaux, en particulier les lignes ⚠️.",
    "2. Relancer ce dry-run juste avant exécution (les données changent chaque jour) :",
    "   si `user_vocabulary`/`srs_reviews`/`review_history` ou les conflits ne sont plus",
    "   à 0, ne pas exécuter.",
    "3. Exécuter `supabase/seed/lemma_dedup_execute_20260727.sql` (transaction",
    "   `BEGIN`/`COMMIT` unique, générée par",
    "   `npx tsx scripts/lemma-dedup-generate-execute-sql.ts` depuis les MÊMES groupes",
    "   que ce rapport) dans le SQL Editor Supabase. Contient ses propres garde-fous",
    "   (abandon si une donnée personnelle ou un savoir serait perdu).",
    "4. Lancer les requêtes de vérification en fin de ce même fichier (comptes,",
    "   doublons restants, lemmes orphelins — tout doit être à 0).",
    "5. Relancer `npm run knowledge:bootstrap` et vérifier P0/P2.",
    "",
    "## Script",
    "",
    "```bash",
    "npx tsx scripts/lemma-dedup-plan.ts                    # dry-run (ce rapport)",
    "npx tsx scripts/lemma-dedup-generate-execute-sql.ts     # génère le SQL d'exécution",
    "# Exécution réelle : coller supabase/seed/lemma_dedup_execute_20260727.sql",
    "# dans le SQL Editor Supabase (transaction atomique, hors de la portée de ce script).",
    "```",
    "",
  );

  const out = path.join(root, "docs/knowledge/lemma-dedup-remap-report.md");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${out}`);
  console.log(`Plans: ${plans.length}`);
  console.log("Totals", totals);
  console.log("User_vocabulary conflicts (UNIQUE user_id+lemma_id):", totalConflicts);
}

void main();
