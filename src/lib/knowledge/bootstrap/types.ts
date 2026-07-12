/**
 * Les 11 textes Rossiyani — 5 seed (008) + 6 gold (010–015).
 * @see docs/reader/content/BIBLIOTHEQUE_V1_GOLD_10.md
 */
export const ROSSIYANI_TEXT_TITLES = [
  "В метро",
  "По дороге",
  "Первый кофе",
  "В магазине",
  "Дома вечером",
  "Первый день в университете",
  "В булочной",
  "Знакомство",
  "У врача",
  "Как найти дорогу?",
  "Обычный день студента",
] as const;

export type TBootstrapPriority = "P0" | "P1" | "P2";

export interface TBootstrapLemma {
  lemmaId: string;
  form: string;
  priority: TBootstrapPriority;
  source: string;
}

export interface TBootstrapOptions {
  force: boolean;
  dryRun: boolean;
  limit?: number;
  only?: TBootstrapPriority;
}

import type { TKnowledgeQualityReport } from "@/lib/knowledge/quality/quality-types";

export interface TBootstrapItemResult {
  lemmaId: string;
  form: string;
  priority: TBootstrapPriority;
  status:
    | "generated"
    | "skipped"
    | "dry-run"
    | "validation"
    | "timeout"
    | "error"
    | "unresolved";
  durationMs: number;
  error?: string;
  normalizationCount?: number;
  qualityReport?: TKnowledgeQualityReport;
}

export interface TBootstrapNormalizationSummary {
  payloadsNormalized: number;
  totalEvents: number;
  byCategory: Record<string, number>;
}

export interface TBootstrapReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  options: TBootstrapOptions;
  totals: {
    candidates: number;
    generated: number;
    skipped: number;
    dryRun: number;
    validation: number;
    timeout: number;
    error: number;
    unresolved: number;
  };
  normalization: TBootstrapNormalizationSummary;
  coverage: {
    p0: { total: number; enriched: number };
    p1: { total: number; enriched: number };
    p2: { total: number; enriched: number };
  };
  results: TBootstrapItemResult[];
  errors: Array<{ form: string; lemmaId: string; status: string; error: string }>;
}
