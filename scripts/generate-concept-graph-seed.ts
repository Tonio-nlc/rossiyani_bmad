/**
 * Génère le seed SQL du Concept Graph depuis le registry TypeScript.
 * Source de vérité : seed-concepts.ts + teaching-graph.ts (+ scénarios d'enseignement).
 *
 * Usage : npx tsx scripts/generate-concept-graph-seed.ts
 * Sortie :
 *   - supabase/migrations/021_seed_linguistic_concept_graph.sql
 *   - docs/knowledge/missing-concepts.md
 *
 * N'applique RIEN en base — fichier à coller dans le SQL Editor après 019.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SEED_LINGUISTIC_CONCEPTS } from "../src/lib/knowledge/concept-graph/registry/seed-concepts";
import { TEACHING_GRAPH_EDGES } from "../src/lib/knowledge/concept-graph/teaching-graph";
import { SEED_TEACHING_SCENARIOS } from "../src/lib/knowledge/teaching-engine/seed-teaching-scenarios";
import type {
  TConceptGraphEdge,
  TLinguisticConcept,
} from "../src/types/linguistic-concept";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sqlOutPath = path.join(
  root,
  "supabase/migrations/021_seed_linguistic_concept_graph.sql",
);
const reportOutPath = path.join(root, "docs/knowledge/missing-concepts.md");

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJson(value: unknown): string {
  return sqlString(JSON.stringify(value));
}

function buildPayload(concept: TLinguisticConcept): Record<string, unknown> {
  const teachingScenario =
    concept.teachingScenario ?? SEED_TEACHING_SCENARIOS[concept.id] ?? null;

  return {
    coreIdea: concept.coreIdea,
    whyItExists: concept.whyItExists,
    mentalModel: concept.mentalModel,
    visualModel: concept.visualModel,
    canonicalExplanation: concept.canonicalExplanation,
    teachingScenario,
    commonMistakes: concept.commonMistakes,
    relatedConcepts: concept.relatedConcepts,
    relatedLemmas: concept.relatedLemmas,
    examples: concept.examples,
    progression: concept.progression,
    teacherNotes: concept.teacherNotes ?? null,
  };
}

function formatEdge(edge: TConceptGraphEdge): string {
  return `${edge.fromId} --[${edge.relation}]--> ${edge.toId}`;
}

function main() {
  const seededIds = new Set(SEED_LINGUISTIC_CONCEPTS.map((c) => c.id));
  const generatedAt = new Date().toISOString();

  const emittedEdges: TConceptGraphEdge[] = [];
  const skippedEdges: TConceptGraphEdge[] = [];

  for (const edge of TEACHING_GRAPH_EDGES) {
    if (seededIds.has(edge.fromId) && seededIds.has(edge.toId)) {
      emittedEdges.push(edge);
    } else {
      skippedEdges.push(edge);
    }
  }

  /** Concepts référencés (relatedConcepts ou extrémité d'arête) mais absents du seed. */
  const missingConceptIds = new Set<string>();

  for (const edge of skippedEdges) {
    if (!seededIds.has(edge.fromId)) {
      missingConceptIds.add(edge.fromId);
    }
    if (!seededIds.has(edge.toId)) {
      missingConceptIds.add(edge.toId);
    }
  }

  const relatedRefs: Array<{ fromConceptId: string; relatedId: string }> = [];

  for (const concept of SEED_LINGUISTIC_CONCEPTS) {
    for (const relatedId of concept.relatedConcepts) {
      if (!seededIds.has(relatedId)) {
        missingConceptIds.add(relatedId);
        relatedRefs.push({ fromConceptId: concept.id, relatedId });
      }
    }
  }

  const missingSorted = [...missingConceptIds].sort();

  const lines: string[] = [
    "-- ============================================",
    "-- Seed Concept Graph — généré depuis le registry TypeScript",
    "-- NE PAS éditer à la main : relancer",
    "--   npm run concept-graph:generate-seed",
    "--",
    "-- Prérequis : migration 019_linguistic_concept_graph.sql déjà exécutée.",
    "-- Idempotent / rejouable : ON CONFLICT + INSERT … SELECT … WHERE EXISTS.",
    "-- Aucune suppression de données.",
    "-- À coller dans le SQL Editor Supabase (après 019).",
    `-- Généré le ${generatedAt}`,
    "-- ============================================",
    "",
    `-- Concepts seed : ${SEED_LINGUISTIC_CONCEPTS.length}`,
    `-- Relations émises : ${emittedEdges.length} / ${TEACHING_GRAPH_EDGES.length}`,
    `-- Relations ignorées (extrémité absente) : ${skippedEdges.length}`,
    `-- Concepts manquants référencés : ${missingSorted.length}`,
    "",
    "-- Upsert des concepts seed (statut a-valider = relecture professeur)",
    "-- validation_status / validated existants sont préservés (relecture professeur).",
    "",
  ];

  for (const concept of SEED_LINGUISTIC_CONCEPTS) {
    const payload = buildPayload(concept);

    lines.push(
      `INSERT INTO linguistic_concepts (`,
      `  id, slug, title, category, difficulty, summary,`,
      `  payload, validation_status, validated, updated_at`,
      `) VALUES (`,
      `  ${sqlString(concept.id)},`,
      `  ${sqlString(concept.slug)},`,
      `  ${sqlString(concept.title)},`,
      `  ${sqlString(concept.category)},`,
      `  ${sqlString(concept.difficulty)},`,
      `  ${sqlString(concept.summary)},`,
      `  ${sqlJson(payload)}::jsonb,`,
      `  'a-valider',`,
      `  false,`,
      `  now()`,
      `)`,
      `ON CONFLICT (id) DO UPDATE SET`,
      `  slug = EXCLUDED.slug,`,
      `  title = EXCLUDED.title,`,
      `  category = EXCLUDED.category,`,
      `  difficulty = EXCLUDED.difficulty,`,
      `  summary = EXCLUDED.summary,`,
      `  payload = EXCLUDED.payload,`,
      `  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),`,
      `  validated = linguistic_concepts.validated,`,
      `  updated_at = now();`,
      "",
    );
  }

  lines.push(
    "-- Relations concept ↔ concept (teaching path)",
    "-- Uniquement si les deux extrémités existent déjà en base.",
    "",
  );

  for (const edge of emittedEdges) {
    lines.push(
      `INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)`,
      `SELECT`,
      `  ${sqlString(edge.fromId)},`,
      `  ${sqlString(edge.toId)},`,
      `  ${sqlString(edge.relation)}`,
      `WHERE EXISTS (`,
      `  SELECT 1 FROM linguistic_concepts c WHERE c.id = ${sqlString(edge.fromId)}`,
      `)`,
      `AND EXISTS (`,
      `  SELECT 1 FROM linguistic_concepts c WHERE c.id = ${sqlString(edge.toId)}`,
      `)`,
      `ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;`,
      "",
    );
  }

  lines.push(
    "-- Liaison lemme ↔ concept (relatedLemmas du seed)",
    "-- weight = secondary : illustration, pas le phénomène primaire du lemme",
    "-- Insert seulement si le lemme ET le concept existent.",
    "",
  );

  for (const concept of SEED_LINGUISTIC_CONCEPTS) {
    for (const lemmaForm of concept.relatedLemmas) {
      lines.push(
        `INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)`,
        `SELECT l.id, ${sqlString(concept.id)}, 'secondary', 'seed:relatedLemmas'`,
        `FROM lemmas l`,
        `WHERE l.form = ${sqlString(lemmaForm)}`,
        `  AND EXISTS (`,
        `    SELECT 1 FROM linguistic_concepts c WHERE c.id = ${sqlString(concept.id)}`,
        `  )`,
        `ON CONFLICT (lemma_id, concept_id) DO NOTHING;`,
        "",
      );
    }
  }

  lines.push(
    "-- ============================================",
    "-- Relations ignorées (extrémité absente du seed 11)",
    "-- Feuille de route : docs/knowledge/missing-concepts.md",
    "-- ============================================",
  );

  if (skippedEdges.length === 0) {
    lines.push("-- (aucune)");
  } else {
    for (const edge of skippedEdges) {
      const missing = [
        !seededIds.has(edge.fromId) ? `from manquant=${edge.fromId}` : null,
        !seededIds.has(edge.toId) ? `to manquant=${edge.toId}` : null,
      ]
        .filter(Boolean)
        .join("; ");
      lines.push(`-- SKIP: ${formatEdge(edge)}  (${missing})`);
    }
  }

  lines.push(
    "",
    "-- Concepts référencés dans relatedConcepts mais absents du seed :",
  );

  if (relatedRefs.length === 0) {
    lines.push("-- (aucun)");
  } else {
    for (const ref of relatedRefs) {
      lines.push(
        `-- REF: ${ref.fromConceptId} → relatedConcepts[${ref.relatedId}] (concept non seedé)`,
      );
    }
  }

  lines.push("", "-- Fin du seed Concept Graph", "");

  fs.writeFileSync(sqlOutPath, lines.join("\n"), "utf8");

  const reportLines = [
    "# Concepts manquants — feuille de route catalogue",
    "",
    "> Généré automatiquement par `npm run concept-graph:generate-seed`.",
    `> Date : ${generatedAt}`,
    "",
    "Les **11 concepts seed** référencent (via `TEACHING_GRAPH_EDGES` ou `relatedConcepts`)",
    "des concepts qui ne sont **pas encore écrits** dans le registry / la base.",
    "Cette liste guide l’extension du catalogue (objectif 50, puis 200–300).",
    "",
    "## Concepts seed présents (11)",
    "",
    ...SEED_LINGUISTIC_CONCEPTS.map((c) => `- \`${c.id}\` — ${c.title}`),
    "",
    "## Concepts référencés mais absents",
    "",
  ];

  if (missingSorted.length === 0) {
    reportLines.push("_Aucun concept manquant._", "");
  } else {
    reportLines.push(
      "| Concept manquant | Référencé par | Source |",
      "|------------------|---------------|--------|",
    );

    for (const missingId of missingSorted) {
      const edgeSources = skippedEdges
        .filter((e) => e.fromId === missingId || e.toId === missingId)
        .map((e) => `\`${formatEdge(e)}\``);
      const relatedSources = relatedRefs
        .filter((r) => r.relatedId === missingId)
        .map((r) => `\`${r.fromConceptId}\`.relatedConcepts`);

      const sources = [...new Set([...edgeSources, ...relatedSources])];
      const by = [
        ...skippedEdges
          .filter((e) => e.fromId === missingId || e.toId === missingId)
          .flatMap((e) =>
            [e.fromId, e.toId].filter((id) => id !== missingId && seededIds.has(id)),
          ),
        ...relatedRefs
          .filter((r) => r.relatedId === missingId)
          .map((r) => r.fromConceptId),
      ];
      const byUnique = [...new Set(by)].map((id) => `\`${id}\``).join(", ");

      reportLines.push(
        `| \`${missingId}\` | ${byUnique || "—"} | ${sources.join("<br>") || "—"} |`,
      );
    }

    reportLines.push("");
  }

  reportLines.push(
    "## Relations teaching-graph ignorées au seed",
    "",
    "Ces arêtes ne sont **pas** insérées en base tant que l’extrémité manquante n’existe pas.",
    "",
  );

  if (skippedEdges.length === 0) {
    reportLines.push("_Aucune relation ignorée._", "");
  } else {
    for (const edge of skippedEdges) {
      reportLines.push(`- \`${formatEdge(edge)}\``);
    }
    reportLines.push("");
  }

  reportLines.push(
    "## Comment étendre",
    "",
    "1. Ajouter le concept manquant dans `src/lib/knowledge/concept-graph/registry/seed-concepts.ts`.",
    "2. Relancer `npm run concept-graph:generate-seed`.",
    "3. Coller le nouveau `021_seed_linguistic_concept_graph.sql` dans le SQL Editor.",
    "",
  );

  fs.writeFileSync(reportOutPath, reportLines.join("\n"), "utf8");

  console.log(`Wrote ${sqlOutPath}`);
  console.log(`Wrote ${reportOutPath}`);
  console.log(
    `Concepts: ${SEED_LINGUISTIC_CONCEPTS.length}, relations emitted: ${emittedEdges.length}, skipped: ${skippedEdges.length}, missing concepts: ${missingSorted.length}`,
  );
}

main();
