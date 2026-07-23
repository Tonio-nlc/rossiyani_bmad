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

import { normalizeRussianWord } from "../src/lib/vocabulary/normalize-russian-word";
import { toNfc } from "../src/lib/utils/russian";

config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

interface LemmaRow {
  id: string;
  form: string;
}

interface KnowledgeRow {
  lemma_id: string;
  profile_version: number | null;
  part_of_speech: string | null;
}

interface RemapPlan {
  groupKey: string;
  reason: "accent-duplicate" | "corrupt-spelling";
  keep: { id: string; form: string; hasKnowledgeV2: boolean };
  drop: Array<{ id: string; form: string; hasKnowledgeV2: boolean }>;
  remaps: {
    user_vocabulary: number;
    explanation_cache: number;
    word_forms: number;
    content_annotated_words: number;
    linguistic_knowledge_drop: number;
  };
}

function hasStress(form: string): boolean {
  return form.normalize("NFD").includes("\u0301");
}

function preferCanonicalForm(forms: string[]): string {
  const stressed = forms.filter(hasStress).map(toNfc);
  if (stressed.length > 0) {
    return stressed.sort((a, b) => b.length - a.length)[0];
  }

  return toNfc(forms[0]);
}

async function countRefs(
  // Client admin typé lâche — script one-shot hors du graphe d'app.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  lemmaId: string,
): Promise<RemapPlan["remaps"]> {
  const [
    { count: uv },
    { count: cache },
    { count: wf },
    { data: texts },
    { count: knowledge },
  ] = await Promise.all([
    sb
      .from("user_vocabulary")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
    sb
      .from("explanation_cache")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
    sb
      .from("word_forms")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
    sb.from("texts").select("id, content_annotated"),
    sb
      .from("linguistic_knowledge")
      .select("*", { count: "exact", head: true })
      .eq("lemma_id", lemmaId),
  ]);

  let annotated = 0;

  for (const text of (texts ?? []) as Array<{
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
    user_vocabulary: uv ?? 0,
    explanation_cache: cache ?? 0,
    word_forms: wf ?? 0,
    content_annotated_words: annotated,
    linguistic_knowledge_drop: knowledge ?? 0,
  };
}

function sumRemaps(
  parts: RemapPlan["remaps"][],
): RemapPlan["remaps"] {
  return parts.reduce(
    (acc, part) => ({
      user_vocabulary: acc.user_vocabulary + part.user_vocabulary,
      explanation_cache: acc.explanation_cache + part.explanation_cache,
      word_forms: acc.word_forms + part.word_forms,
      content_annotated_words:
        acc.content_annotated_words + part.content_annotated_words,
      linguistic_knowledge_drop:
        acc.linguistic_knowledge_drop + part.linguistic_knowledge_drop,
    }),
    {
      user_vocabulary: 0,
      explanation_cache: 0,
      word_forms: 0,
      content_annotated_words: 0,
      linguistic_knowledge_drop: 0,
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

  const { data: lemmas, error } = await sb.from("lemmas").select("id, form");

  if (error) {
    throw error;
  }

  const { data: knowledgeRows } = await sb
    .from("linguistic_knowledge")
    .select("lemma_id, profile_version, part_of_speech");

  const knowledgeByLemma = new Map<string, KnowledgeRow>();

  for (const row of (knowledgeRows ?? []) as KnowledgeRow[]) {
    knowledgeByLemma.set(row.lemma_id, row);
  }

  const isV2 = (lemmaId: string) =>
    (knowledgeByLemma.get(lemmaId)?.profile_version ?? 0) >= 2;

  const byNorm = new Map<string, LemmaRow[]>();

  for (const lemma of (lemmas ?? []) as LemmaRow[]) {
    const key = normalizeRussianWord(lemma.form);

    if (!key) {
      continue;
    }

    const list = byNorm.get(key) ?? [];
    list.push(lemma);
    byNorm.set(key, list);
  }

  const plans: RemapPlan[] = [];

  for (const [normalized, group] of byNorm) {
    if (group.length < 2) {
      continue;
    }

    const ranked = [...group].sort((left, right) => {
      const leftV2 = isV2(left.id) ? 1 : 0;
      const rightV2 = isV2(right.id) ? 1 : 0;

      if (leftV2 !== rightV2) {
        return rightV2 - leftV2;
      }

      const leftStress = hasStress(left.form) ? 1 : 0;
      const rightStress = hasStress(right.form) ? 1 : 0;

      if (leftStress !== rightStress) {
        return rightStress - leftStress;
      }

      return left.form.localeCompare(right.form, "ru");
    });

    const keep = ranked[0];
    const drop = ranked.slice(1);
    const dropRemaps = await Promise.all(drop.map((item) => countRefs(sb, item.id)));

    plans.push({
      groupKey: normalized,
      reason: "accent-duplicate",
      keep: {
        id: keep.id,
        form: preferCanonicalForm(group.map((item) => item.form)),
        hasKnowledgeV2: isV2(keep.id),
      },
      drop: drop.map((item) => ({
        id: item.id,
        form: item.form,
        hasKnowledgeV2: isV2(item.id),
      })),
      remaps: sumRemaps(dropRemaps),
    });
  }

  /** Orthographes corrompues → cible correcte (par forme normalisée). */
  const corruptFixes: Array<{ fromNorm: string; toForm: string }> = [
    { fromNorm: "идити", toForm: "идти́" },
    { fromNorm: "здораваться", toForm: "здоро́ваться" },
  ];

  for (const fix of corruptFixes) {
    const corruptGroup = byNorm.get(fix.fromNorm) ?? [];

    if (corruptGroup.length === 0) {
      continue;
    }

    const targetNorm = normalizeRussianWord(fix.toForm);
    const targetGroup = byNorm.get(targetNorm) ?? [];
    const target =
      targetGroup.find((item) => isV2(item.id)) ??
      targetGroup.find((item) => hasStress(item.form)) ??
      targetGroup[0] ??
      null;

    for (const corrupt of corruptGroup) {
      if (target && corrupt.id === target.id) {
        continue;
      }

      if (!target) {
        /** Pas de lemme correct : plan = renommer la forme (pas de drop). */
        plans.push({
          groupKey: `${fix.fromNorm}→${targetNorm}`,
          reason: "corrupt-spelling",
          keep: {
            id: corrupt.id,
            form: toNfc(fix.toForm),
            hasKnowledgeV2: isV2(corrupt.id),
          },
          drop: [],
          remaps: {
            user_vocabulary: 0,
            explanation_cache: 0,
            word_forms: 0,
            content_annotated_words: 0,
            linguistic_knowledge_drop: 0,
          },
        });
        continue;
      }

      const remaps = await countRefs(sb, corrupt.id);

      plans.push({
        groupKey: `${fix.fromNorm}→${targetNorm}`,
        reason: "corrupt-spelling",
        keep: {
          id: target.id,
          form: toNfc(target.form.includes("\u0301") ? target.form : fix.toForm),
          hasKnowledgeV2: isV2(target.id),
        },
        drop: [
          {
            id: corrupt.id,
            form: corrupt.form,
            hasKnowledgeV2: isV2(corrupt.id),
          },
        ],
        remaps,
      });
    }
  }

  const totals = sumRemaps(plans.map((plan) => plan.remaps));

  const lines: string[] = [
    "# Rapport de remappage — déduplication des lemmes",
    "",
    `> Généré le ${new Date().toLocaleString("fr-FR")} — **DRY-RUN** (aucune écriture)`,
    "",
    "## Règles",
    "",
    "1. Forme canonique = forme **avec accent tonique** (NFC), si disponible.",
    "2. Conserver l'entrée qui a une `linguistic_knowledge` v2 ; sinon la forme accentuée.",
    "3. Remapper `user_vocabulary`, `explanation_cache`, `word_forms`, `texts.content_annotated`",
    "   vers le lemme conservé **avant** suppression du doublon.",
    "4. `srs_reviews` référence `user_vocabulary_id` (pas `lemma_id`) : pas de remap direct ;",
    "   la cohérence passe par le remap de `user_vocabulary`.",
    "5. Corrompus : `иди́ти` → `идти́` ; `здора́ваться` → `здоро́ваться`.",
    "",
    "## Totaux de remappage prévus",
    "",
    `| Table | Lignes / occurrences à remapper ou supprimer |`,
    `|-------|-----------------------------------------------|`,
    `| user_vocabulary | ${totals.user_vocabulary} |`,
    `| explanation_cache | ${totals.explanation_cache} |`,
    `| word_forms | ${totals.word_forms} |`,
    `| texts.content_annotated (mots) | ${totals.content_annotated_words} |`,
    `| linguistic_knowledge (sur doublons drop) | ${totals.linguistic_knowledge_drop} |`,
    "",
    `**Groupes planifiés : ${plans.length}**`,
    "",
    "## Détail par groupe",
    "",
  ];

  for (const plan of plans) {
    lines.push(`### \`${plan.groupKey}\` (${plan.reason})`);
    lines.push("");
    lines.push(
      `- **Conserver** : « ${plan.keep.form} » (\`${plan.keep.id}\`) — knowledge v2 : ${plan.keep.hasKnowledgeV2 ? "oui" : "non"}`,
    );

    if (plan.drop.length === 0) {
      lines.push(
        `- **Action** : renommer la forme du lemme conservé → « ${plan.keep.form} » (pas de fusion)`,
      );
    } else {
      for (const drop of plan.drop) {
        lines.push(
          `- **Supprimer après remap** : « ${drop.form} » (\`${drop.id}\`) — knowledge v2 : ${drop.hasKnowledgeV2 ? "oui" : "non"}`,
        );
      }
    }

    lines.push(
      `- Remaps : uv=${plan.remaps.user_vocabulary}, cache=${plan.remaps.explanation_cache}, word_forms=${plan.remaps.word_forms}, annotated=${plan.remaps.content_annotated_words}, knowledge_drop=${plan.remaps.linguistic_knowledge_drop}`,
    );
    lines.push("");
  }

  lines.push(
    "## Plan d'exécution (ticket suivant)",
    "",
    "1. Relire ce rapport et valider les totaux.",
    "2. Transaction / script `--execute` :",
    "   - pour chaque drop : UPDATE refs → keep.id (gérer UNIQUE user_id+lemma_id en fusionnant)",
    "   - UPDATE `lemmas.form` du keep vers la forme canonique accentuée si besoin",
    "   - DELETE `linguistic_knowledge` orpheline du drop si keep a déjà v2",
    "   - DELETE lemme drop",
    "3. Relancer `npm run knowledge:bootstrap` et vérifier P0/P2.",
    "",
    "## Script",
    "",
    "```bash",
    "npx tsx scripts/lemma-dedup-plan.ts          # dry-run (ce rapport)",
    "# npx tsx scripts/lemma-dedup-plan.ts --execute  # interdit tant que non revu",
    "```",
    "",
  );

  const out = path.join(root, "docs/knowledge/lemma-dedup-remap-report.md");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${out}`);
  console.log(`Plans: ${plans.length}`);
  console.log("Totals", totals);
}

void main();
