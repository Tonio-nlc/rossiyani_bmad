/**
 * Audit : concepts du catalogue jamais atteignables par la résolution.
 * Empêche d'écrire des concepts invisibles à l'utilisateur.
 */

import {
  CASE_CONCEPT_BY_CASE,
  type TMorphologicalCase,
} from "./case-concept-routing";
import { listSignalRuleConceptIds } from "./match-signals";
import { getAllConcepts, isKnownConceptId } from "./registry";

export interface TOrphanConceptReport {
  /** Concepts seed / registry. */
  catalogIds: string[];
  /** Peuvent devenir primary via une règle ou la table cas→concept. */
  reachableAsPrimary: string[];
  /** Peuvent apparaître en secondaire (règle secondary ou relatedConcepts d'un primary). */
  reachableAsSecondary: string[];
  /** Absents de toute voie de résolution (primary + secondary). */
  orphans: string[];
  /** Dans le catalogue mais jamais primary (OK s'ils sont secondary, sinon orphelin). */
  neverPrimary: string[];
}

function collectRelatedConceptIds(catalogIds: string[]): Set<string> {
  const related = new Set<string>();

  for (const id of catalogIds) {
    const concept = getAllConcepts().find((item) => item.id === id);

    if (!concept) {
      continue;
    }

    for (const relatedId of concept.relatedConcepts) {
      if (isKnownConceptId(relatedId)) {
        related.add(relatedId);
      }
    }
  }

  return related;
}

/**
 * Liste les concepts du registry qui ne peuvent être atteints
 * ni comme primary ni comme secondary par la résolution.
 */
export function auditOrphanConcepts(): TOrphanConceptReport {
  const catalogIds = getAllConcepts().map((concept) => concept.id);
  const signalIds = new Set(listSignalRuleConceptIds());

  const caseRouteIds = new Set(
    (Object.keys(CASE_CONCEPT_BY_CASE) as TMorphologicalCase[])
      .map((key) => CASE_CONCEPT_BY_CASE[key])
      .filter((id): id is string => typeof id === "string" && isKnownConceptId(id)),
  );

  const reachableAsPrimary = new Set<string>([
    ...signalIds,
    ...caseRouteIds,
  ]);

  // relatedConcepts des concepts primary-atteignables
  const relatedFromPrimary = collectRelatedConceptIds([...reachableAsPrimary]);

  const reachableAsSecondary = new Set<string>([
    ...relatedFromPrimary,
    // règles explicitement secondary
    "noun-animacy",
    "noun-gender",
    "verb-imperfective-aspect",
    "aspect-pairs",
  ]);

  const neverPrimary = catalogIds.filter((id) => !reachableAsPrimary.has(id));
  const orphans = catalogIds.filter(
    (id) => !reachableAsPrimary.has(id) && !reachableAsSecondary.has(id),
  );

  return {
    catalogIds,
    reachableAsPrimary: [...reachableAsPrimary].sort(),
    reachableAsSecondary: [...reachableAsSecondary].sort(),
    orphans: orphans.sort(),
    neverPrimary: neverPrimary.sort(),
  };
}

export function formatOrphanConceptsMarkdown(
  report: TOrphanConceptReport = auditOrphanConcepts(),
): string {
  const lines = [
    "# Concepts orphelins — audit de résolution",
    "",
    "> Généré par `auditOrphanConcepts()` — un concept orphelin est dans le catalogue",
    "> mais **jamais** atteint comme primary ni secondary par le routeur.",
    "",
    `Catalogue : **${report.catalogIds.length}** concepts.`,
    "",
    "## Orphelins (invisibles)",
    "",
  ];

  if (report.orphans.length === 0) {
    lines.push("_Aucun orphelin._", "");
  } else {
    for (const id of report.orphans) {
      lines.push(`- \`${id}\``);
    }
    lines.push("");
  }

  lines.push(
    "## Jamais primary (OK si secondary / lié)",
    "",
  );

  if (report.neverPrimary.length === 0) {
    lines.push("_Tous les concepts peuvent être primary._", "");
  } else {
    for (const id of report.neverPrimary) {
      const viaSecondary = report.reachableAsSecondary.includes(id)
        ? "secondary OK"
        : "⚠️ orphelin";
      lines.push(`- \`${id}\` — ${viaSecondary}`);
    }
    lines.push("");
  }

  lines.push(
    "## Primary atteignables",
    "",
    ...report.reachableAsPrimary.map((id) => `- \`${id}\``),
    "",
  );

  return lines.join("\n");
}
