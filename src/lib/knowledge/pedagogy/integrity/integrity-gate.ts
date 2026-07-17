import { checkLearningCardIntegrity } from "@/lib/knowledge/pedagogy/integrity/integrity-checks";
import type { TIntegrityReport } from "@/lib/knowledge/pedagogy/strategy/strategy-types";
import type { TPedagogicalStrategy } from "@/lib/knowledge/pedagogy/strategy/strategy-types";
import type { TLearningCard } from "@/types/learning-card";

export class LinguisticIntegrityError extends Error {
  readonly report: TIntegrityReport;

  constructor(report: TIntegrityReport) {
    const summary = report.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.code)
      .join(", ");

    super(
      `Intégrité linguistique compromise${summary ? ` (${summary})` : ""}`,
    );
    this.name = "LinguisticIntegrityError";
    this.report = report;
  }
}

export function runIntegrityGate(
  card: TLearningCard,
  strategy: TPedagogicalStrategy,
): TIntegrityReport {
  return checkLearningCardIntegrity(card, strategy);
}

export function assertLearningCardIntegrity(
  card: TLearningCard,
  strategy: TPedagogicalStrategy,
): TLearningCard {
  const report = runIntegrityGate(card, strategy);

  if (!report.valid) {
    throw new LinguisticIntegrityError(report);
  }

  return card;
}
