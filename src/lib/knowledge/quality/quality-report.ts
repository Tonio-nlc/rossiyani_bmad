import fs from "node:fs";
import path from "node:path";

import { formatQualityIssueBullet } from "@/lib/knowledge/quality/quality-analyzer";
import type {
  TKnowledgeQualityAggregateReport,
  TKnowledgeQualityLemmaEntry,
} from "@/lib/knowledge/quality/quality-types";

function averageScore(entries: TKnowledgeQualityLemmaEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }

  const total = entries.reduce((sum, entry) => sum + entry.score, 0);

  return Math.round(total / entries.length);
}

export function buildQualityAggregateReport(
  entries: TKnowledgeQualityLemmaEntry[],
): TKnowledgeQualityAggregateReport {
  const byStatus = {
    excellent: 0,
    good: 0,
    review: 0,
    poor: 0,
  };

  for (const entry of entries) {
    byStatus[entry.status] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalLemmas: entries.length,
    averageScore: averageScore(entries),
    byStatus,
    entries: [...entries].sort((left, right) => left.form.localeCompare(right.form, "ru")),
  };
}

export function renderQualityReportMarkdown(
  report: TKnowledgeQualityAggregateReport,
): string {
  const lines = [
    "# Knowledge Quality Report",
    "",
    `> Généré le ${new Date(report.generatedAt).toLocaleString("fr-FR")}`,
    "",
    "## Bootstrap",
    "",
    `${report.totalLemmas} lemmes`,
    "",
    `Average score : ${report.averageScore}`,
    "",
    `Excellent : ${report.byStatus.excellent}`,
    "",
    `Good : ${report.byStatus.good}`,
    "",
    `Review : ${report.byStatus.review}`,
    "",
    `Poor : ${report.byStatus.poor}`,
    "",
    "## Détail par lemme",
    "",
    "| Lemme | Score | Statut | Problèmes |",
    "|-------|-------|--------|-----------|",
  ];

  for (const entry of report.entries) {
    const issueSummary =
      entry.report.issues.length === 0
        ? "—"
        : entry.report.issues
            .slice(0, 3)
            .map((issue) => formatQualityIssueBullet(issue))
            .join(" · ");

    lines.push(
      `| ${entry.form} | ${entry.score} | ${entry.status} | ${issueSummary} |`,
    );
  }

  lines.push("", "## Issues détaillées", "");

  for (const entry of report.entries) {
    if (entry.report.issues.length === 0) {
      continue;
    }

    lines.push(`### ${entry.form} (${entry.score} — ${entry.status})`, "");

    for (const issue of entry.report.issues) {
      const prefix = issue.severity === "error" ? "✗" : "⚠";
      const field = issue.field ? ` (\`${issue.field}\`)` : "";

      lines.push(`- ${prefix} **${issue.code}**${field} — ${issue.message}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}

export function writeQualityReport(
  report: TKnowledgeQualityAggregateReport,
  rootDir = process.cwd(),
): string {
  const reportPath = path.join(rootDir, "docs/knowledge/quality-report.md");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, renderQualityReportMarkdown(report), "utf8");

  return reportPath;
}
