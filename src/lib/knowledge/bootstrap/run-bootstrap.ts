import {
  collectBootstrapLemmas,
  countEnrichedByPriority,
} from "@/lib/knowledge/bootstrap/collect-lemmas";
import {
  assertBootstrapSchema,
  classifyBootstrapError,
  generateAndUpsertKnowledge,
  getBootstrapErrorMessage,
  shouldSkipLemma,
} from "@/lib/knowledge/bootstrap/generate-lemma";
import { writeBootstrapReport } from "@/lib/knowledge/bootstrap/report";
import type {
  TBootstrapItemResult,
  TBootstrapNormalizationSummary,
  TBootstrapOptions,
  TBootstrapReport,
} from "@/lib/knowledge/bootstrap/types";
import { summarizeNormalizationEvents } from "@/lib/knowledge/normalize-knowledge-payload";
import {
  formatQualityIssueBullet,
} from "@/lib/knowledge/quality/quality-analyzer";
import {
  buildQualityAggregateReport,
  writeQualityReport,
} from "@/lib/knowledge/quality/quality-report";
import type { TKnowledgeQualityLemmaEntry } from "@/lib/knowledge/quality/quality-types";

export interface TBootstrapProgress {
  index: number;
  total: number;
  form: string;
  status: string;
  durationMs: number;
  successRate: number;
  etaMs: number;
}

export interface TBootstrapRunCallbacks {
  onProgress?: (progress: TBootstrapProgress) => void;
  onItemLog?: (line: string) => void;
}

function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

function initialNormalization(): TBootstrapNormalizationSummary {
  return {
    payloadsNormalized: 0,
    totalEvents: 0,
    byCategory: {},
  };
}

function initialTotals() {
  return {
    candidates: 0,
    generated: 0,
    skipped: 0,
    dryRun: 0,
    validation: 0,
    timeout: 0,
    error: 0,
    unresolved: 0,
  };
}

function mergeNormalizationSummary(
  summary: TBootstrapNormalizationSummary,
  events: Array<{ path: string; from: string; to: string }>,
) {
  if (events.length === 0) {
    return;
  }

  summary.payloadsNormalized += 1;
  summary.totalEvents += events.length;

  const counts = summarizeNormalizationEvents(events);

  for (const [category, count] of Object.entries(counts)) {
    summary.byCategory[category] = (summary.byCategory[category] ?? 0) + count;
  }
}

function formatQualityLogLines(
  index: number,
  total: number,
  form: string,
  statusLabel: string,
  durationMs: number,
  qualityReport?: TKnowledgeQualityLemmaEntry["report"],
): string {
  const prefix = `[${index + 1}/${total}]`;

  if (!qualityReport) {
    return `${prefix} ${form} — ${statusLabel} — ${formatSeconds(durationMs)}`;
  }

  const bullets = qualityReport.issues
    .slice(0, 5)
    .map((issue) => `  • ${formatQualityIssueBullet(issue)}`)
    .join("\n");

  const lines = [
    `${prefix} ${form}`,
    statusLabel,
    `Quality ${qualityReport.score}`,
    qualityReport.status,
  ];

  if (bullets) {
    lines.push(bullets);
  }

  lines.push(formatSeconds(durationMs));

  return lines.join("\n");
}

export async function runKnowledgeBootstrap(
  options: TBootstrapOptions,
  callbacks: TBootstrapRunCallbacks = {},
): Promise<TBootstrapReport> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  if (!options.dryRun) {
    await assertBootstrapSchema();
  }

  let candidates = await collectBootstrapLemmas(options.only);

  if (options.limit && options.limit > 0) {
    candidates = candidates.slice(0, options.limit);
  }

  const results: TBootstrapItemResult[] = [];
  const qualityEntries: TKnowledgeQualityLemmaEntry[] = [];
  const totals = initialTotals();
  const normalization = initialNormalization();
  totals.candidates = candidates.length;

  const durations: number[] = [];
  let successes = 0;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const itemStart = Date.now();

    let status: TBootstrapItemResult["status"] = "error";
    let error: string | undefined;
    let normalizationCount = 0;
    let qualityReport: TBootstrapItemResult["qualityReport"];

    try {
      if (options.dryRun) {
        status = "dry-run";
      } else {
        const skip = await shouldSkipLemma(candidate.lemmaId, options.force);

        if (skip) {
          status = "skipped";
        } else {
          const result = await generateAndUpsertKnowledge(
            candidate.lemmaId,
            candidate.form,
          );
          normalizationCount = result.normalizationEvents.length;
          qualityReport = result.qualityReport;
          mergeNormalizationSummary(normalization, result.normalizationEvents);
          status = "generated";

          qualityEntries.push({
            form: candidate.form,
            lemmaId: candidate.lemmaId,
            score: result.qualityReport.score,
            status: result.qualityReport.status,
            report: result.qualityReport,
          });
        }
      }
    } catch (caught) {
      status = classifyBootstrapError(caught);
      error = getBootstrapErrorMessage(caught);
    }

    const durationMs = Date.now() - itemStart;
    durations.push(durationMs);

    if (status === "generated") {
      totals.generated += 1;
      successes += 1;
    } else if (status === "skipped") {
      totals.skipped += 1;
    } else if (status === "dry-run") {
      totals.dryRun += 1;
    } else if (status === "validation") {
      totals.validation += 1;
    } else if (status === "timeout") {
      totals.timeout += 1;
    } else {
      totals.error += 1;
    }

    const result: TBootstrapItemResult = {
      lemmaId: candidate.lemmaId,
      form: candidate.form,
      priority: candidate.priority,
      status,
      durationMs,
      error,
      normalizationCount: normalizationCount > 0 ? normalizationCount : undefined,
      qualityReport,
    };

    results.push(result);

    const avgMs =
      durations.reduce((sum, value) => sum + value, 0) / durations.length;
    const remaining = candidates.length - (index + 1);
    const etaMs = Math.round(avgMs * remaining);
    const successRate =
      index === 0 ? 0 : Math.round((successes / (index + 1)) * 100);

    const statusLabel =
      status === "generated"
        ? "✓ generated"
        : status === "skipped"
          ? "○ skipped"
          : status === "dry-run"
            ? "◌ dry-run"
            : status === "validation"
              ? "✗ validation"
              : status === "timeout"
                ? "✗ timeout"
                : "✗ error";

    callbacks.onItemLog?.(
      formatQualityLogLines(
        index,
        candidates.length,
        candidate.form,
        statusLabel,
        durationMs,
        qualityReport,
      ),
    );

    callbacks.onProgress?.({
      index: index + 1,
      total: candidates.length,
      form: candidate.form,
      status: statusLabel,
      durationMs,
      successRate,
      etaMs,
    });
  }

  const coverage = await countEnrichedByPriority();
  const finishedAt = new Date().toISOString();

  const report: TBootstrapReport = {
    startedAt,
    finishedAt,
    durationMs: Date.now() - startMs,
    options,
    totals,
    normalization,
    coverage,
    results,
    errors: results
      .filter(
        (item) =>
          item.status === "validation" ||
          item.status === "timeout" ||
          item.status === "error",
      )
      .map((item) => ({
        form: item.form,
        lemmaId: item.lemmaId,
        status: item.status,
        error: item.error ?? "Erreur inconnue",
      })),
  };

  writeBootstrapReport(report);

  if (qualityEntries.length > 0) {
    writeQualityReport(buildQualityAggregateReport(qualityEntries));
  }

  return report;
}
