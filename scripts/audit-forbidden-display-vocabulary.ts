/**
 * Audit du vocabulaire de conception interdit dans les scénarios seed.
 * Usage : npx tsx scripts/audit-forbidden-display-vocabulary.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getAllConcepts } from "../src/lib/knowledge/concept-graph/registry";
import { findForbiddenDisplayVocabularyInFields } from "../src/lib/knowledge/teaching-engine/forbidden-display-vocabulary";
import { validateTeachingScenarioContent } from "../src/lib/knowledge/teaching-engine/scenario-quality-rules";
import { SEED_TEACHING_SCENARIOS } from "../src/lib/knowledge/teaching-engine/seed-teaching-scenarios";
import type { TTeachingScenarioContent } from "../src/types/teaching-scenario";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  "../docs/knowledge/forbidden-display-vocabulary-audit.md",
);

function collectFields(
  content: TTeachingScenarioContent,
): Array<{ field: string; text: string | null | undefined }> {
  const fields: Array<{ field: string; text: string | null | undefined }> = [
    { field: "principle", text: content.principle },
    { field: "fact", text: content.fact },
    { field: "memoryAnchor", text: content.memoryAnchor },
    { field: "hook", text: content.hook },
    { field: "intuition", text: content.intuition },
    { field: "commonMistake", text: content.commonMistake },
    { field: "visual.caption", text: content.visual?.caption },
  ];

  for (const [i, node] of (content.visual?.nodes ?? []).entries()) {
    fields.push({ field: `visual.nodes[${i}]`, text: node });
  }

  for (const [i, item] of (content.contrast ?? []).entries()) {
    fields.push({ field: `contrast[${i}].explanation`, text: item.explanation });
  }

  for (const [i, line] of (content.reuse ?? []).entries()) {
    fields.push({ field: `reuse[${i}]`, text: line });
  }

  for (const [v, variant] of (content.illustrationVariants ?? []).entries()) {
    fields.push({ field: `variant[${v}].fact`, text: variant.fact });
    for (const [i, item] of (variant.contrast ?? []).entries()) {
      fields.push({
        field: `variant[${v}].contrast[${i}].explanation`,
        text: item.explanation,
      });
    }
  }

  if (content.illustration) {
    fields.push({ field: "illustration.fact", text: content.illustration.fact });
  }

  return fields;
}

function main() {
  const concepts = getAllConcepts();
  const lines: string[] = [
    "# Audit — vocabulaire de conception interdit",
    "",
    `> Généré le ${new Date().toISOString()}`,
    `> Règle : \`SCENARIO_FORBIDDEN_DISPLAY_VOCAB\` — docs/knowledge/forbidden-display-vocabulary.md`,
    "",
    "## Synthèse",
    "",
  ];

  const nonCompliant: Array<{
    id: string;
    title: string;
    hits: ReturnType<typeof findForbiddenDisplayVocabularyInFields>;
    gateErrors: string[];
  }> = [];

  for (const concept of concepts) {
    const content =
      concept.teachingScenario ?? SEED_TEACHING_SCENARIOS[concept.id];

    if (!content) {
      continue;
    }

    const hits = findForbiddenDisplayVocabularyInFields(collectFields(content));
    const report = validateTeachingScenarioContent(content, concept.id);
    const gateErrors = report.issues
      .filter((issue) => issue.code === "SCENARIO_FORBIDDEN_DISPLAY_VOCAB")
      .map((issue) => issue.message);

    if (hits.length > 0 || gateErrors.length > 0) {
      nonCompliant.push({
        id: concept.id,
        title: concept.title,
        hits,
        gateErrors,
      });
    }
  }

  lines.push(
    `| Métrique | Valeur |`,
    `|----------|--------|`,
    `| Concepts audités | ${concepts.length} |`,
    `| Non conformes | ${nonCompliant.length} |`,
    `| Conformes | ${concepts.length - nonCompliant.length} |`,
    "",
    "## Concepts non conformes",
    "",
  );

  if (nonCompliant.length === 0) {
    lines.push("_Tous les scénarios seed passent la règle._", "");
  } else {
    for (const item of nonCompliant) {
      lines.push(`### \`${item.id}\` — ${item.title}`, "");
      for (const hit of item.hits) {
        lines.push(`- **${hit.term}** dans \`${hit.field}\` : « ${hit.excerpt} »`);
      }
      lines.push("");
    }
  }

  lines.push(
    "## Concepts conformes",
    "",
    ...concepts
      .filter((concept) => !nonCompliant.some((item) => item.id === concept.id))
      .map((concept) => `- \`${concept.id}\` — ${concept.title}`),
    "",
    "## Note (lot purge 2026-07-25)",
    "",
    "Lors de l'activation de la règle, les hits suivants ont été corrigés en même temps",
    "que le lot 01 (sinon l'audit les aurait listés ici) :",
    "",
    "- `case-accusative` / `noun-animacy` — corail, citation, explication circulaire",
    "- `noun-declension` — « citation » dans le contraste du scénario",
    "- `verb-present-conjugation` — « lemme » dans `visualModel.caption` du registry",
    "- UI `TeachingScenarioView` — « ce lemme » → « ce mot »",
    "",
  );

  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(
    `Non-conformes: ${nonCompliant.length}/${concepts.length}`,
    nonCompliant.map((item) => item.id).join(", ") || "(aucun)",
  );
}

main();
