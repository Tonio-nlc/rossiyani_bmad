import fs from "node:fs";
import path from "node:path";

import type { TBootstrapReport } from "@/lib/knowledge/bootstrap/types";

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);

  if (seconds < 60) {
    return `${seconds} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes} min ${remainder} s`;
}

export function renderBootstrapReportMarkdown(report: TBootstrapReport): string {
  const { totals, normalization, coverage, options, errors } = report;

  const lines = [
    "# Knowledge Bootstrap Report",
    "",
    `> Généré le ${new Date(report.finishedAt).toLocaleString("fr-FR")}`,
    "",
    "## Résumé",
    "",
    `| Métrique | Valeur |`,
    `|----------|--------|`,
    `| Lemmes candidats | ${totals.candidates} |`,
    `| Générés (v2) | ${totals.generated} |`,
    `| Ignorés (déjà v2) | ${totals.skipped} |`,
    `| Dry-run | ${totals.dryRun} |`,
    `| Erreurs validation | ${totals.validation} |`,
    `| Timeouts | ${totals.timeout} |`,
    `| Autres erreurs | ${totals.error} |`,
    `| Payloads normalisés | ${normalization.payloadsNormalized} |`,
    `| Événements de normalisation | ${normalization.totalEvents} |`,
    `| Durée totale | ${formatDuration(report.durationMs)} |`,
    "",
  ];

  const normalizationCategories = Object.entries(normalization.byCategory).sort(
    ([left], [right]) => left.localeCompare(right, "fr"),
  );

  if (normalizationCategories.length > 0) {
    lines.push("## Normalisation", "");
    lines.push("| Catégorie | Occurrences |");
    lines.push("|-----------|-------------|");

    for (const [category, count] of normalizationCategories) {
      lines.push(`| ${category} | ${count} |`);
    }

    lines.push("");
  }

  lines.push(
    "## Options",
    "",
    `- force : ${options.force}`,
    `- dry-run : ${options.dryRun}`,
    `- only : ${options.only ?? "P0+P1+P2"}`,
    `- limit : ${options.limit ?? "aucune"}`,
    "",
    "## Couverture finale",
    "",
    `| Priorité | Total | Enrichis (v2) | Taux |`,
    `|----------|-------|---------------|------|`,
    `| P0 — textes Rossiyani | ${coverage.p0.total} | ${coverage.p0.enriched} | ${pct(coverage.p0)} |`,
    `| P1 — leçons | ${coverage.p1.total} | ${coverage.p1.enriched} | ${pct(coverage.p1)} |`,
    `| P2 — vocabulaire utilisateur | ${coverage.p2.total} | ${coverage.p2.enriched} | ${pct(coverage.p2)} |`,
    "",
  );

  if (errors.length > 0) {
    lines.push("## Erreurs", "");

    for (const item of errors) {
      lines.push(
        `- **${item.form}** (\`${item.lemmaId}\`) — ${item.status} : ${item.error}`,
      );
    }

    lines.push("");
  }

  const ignored = report.results.filter((item) => item.status === "skipped");

  if (ignored.length > 0) {
    lines.push("## Lemmes ignorés (déjà v2)", "");
    lines.push(ignored.map((item) => `- ${item.form}`).join("\n"));
    lines.push("");
  }

  return lines.join("\n");
}

function pct(bucket: { total: number; enriched: number }): string {
  if (bucket.total === 0) {
    return "—";
  }

  return `${Math.round((bucket.enriched / bucket.total) * 100)} %`;
}

export function writeBootstrapReport(
  report: TBootstrapReport,
  rootDir = process.cwd(),
): string {
  const reportPath = path.join(rootDir, "docs/knowledge/bootstrap-report.md");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, renderBootstrapReportMarkdown(report), "utf8");

  return reportPath;
}
