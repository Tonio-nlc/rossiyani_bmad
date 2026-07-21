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

/**
 * Mode RENDU : ne throw jamais.
 * Logue les violations et masque les champs / sections fautifs.
 */
export function assertLearningCardIntegrity(
  card: TLearningCard,
  strategy: TPedagogicalStrategy,
): TLearningCard {
  const report = runIntegrityGate(card, strategy);

  if (report.valid) {
    return card;
  }

  console.warn(
    `[Integrity Gate] Violations (rendu dégradé, page non bloquée):`,
    report.issues.map((issue) => `${issue.code}:${issue.field ?? "?"}`),
  );

  return stripIntegrityViolations(card, report);
}

/**
 * Mode AUTEUR / bootstrap : throw si invalide.
 * À utiliser uniquement hors chemin de rendu fiche.
 */
export function assertLearningCardIntegrityStrict(
  card: TLearningCard,
  strategy: TPedagogicalStrategy,
): TLearningCard {
  const report = runIntegrityGate(card, strategy);

  if (!report.valid) {
    throw new LinguisticIntegrityError(report);
  }

  return card;
}

function stripIntegrityViolations(
  card: TLearningCard,
  report: TIntegrityReport,
): TLearningCard {
  const errorFields = new Set(
    report.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.field)
      .filter((field): field is string => Boolean(field)),
  );

  const nextForms = card.nextForms.forms.filter(
    (_form, index) => !errorFields.has(`nextForms[${index}]`),
  );

  const referenceBlocks = card.reference.blocks.filter((block) => {
    if (errorFields.has(`reference.${block.title}`)) {
      return false;
    }

    return !report.issues.some(
      (issue) =>
        issue.severity === "error" &&
        issue.code === "INVALID_SECTION" &&
        issue.field === `reference.${block.title}`,
    );
  });

  let understanding = card.understanding;

  if (understanding && errorFields.has("understanding.intro")) {
    understanding = { ...understanding, intro: null };
  }

  if (understanding) {
    understanding = {
      ...understanding,
      whyPoints: understanding.whyPoints.filter(
        (_point, index) => !errorFields.has(`understanding.whyPoints[${index}]`),
      ),
      explanationBlocks: understanding.explanationBlocks.filter(
        (_block, index) =>
          !errorFields.has(`understanding.explanationBlocks[${index}]`),
      ),
      roleLabel: errorFields.has("understanding.roleLabel")
        ? null
        : understanding.roleLabel,
    };
  }

  const takeaways = {
    items: card.takeaways.items.filter(
      (_item, index) => !errorFields.has(`takeaways[${index}]`),
    ),
  };

  let encounter = card.encounter;

  if (encounter && errorFields.has("encounter.chips")) {
    encounter = {
      ...encounter,
      formChips: [],
      traitChips: [],
    };
  }

  return {
    ...card,
    encounter,
    understanding,
    takeaways,
    nextForms: { forms: nextForms },
    reference: { ...card.reference, blocks: referenceBlocks },
  };
}
