import type {
  TKnowledgeIssue,
  TKnowledgeQualityCategoryScores,
  TKnowledgeQualityStatus,
} from "@/lib/knowledge/quality/quality-types";

const CATEGORY_WEIGHTS = {
  completeness: 0.3,
  pedagogy: 0.3,
  relevance: 0.2,
  readability: 0.1,
  reference: 0.1,
} as const;

const ISSUE_CATEGORY_MAP: Record<string, keyof TKnowledgeQualityCategoryScores> =
  {
    TAKEAWAYS_TOO_FEW: "completeness",
    TAKEAWAYS_TOO_MANY: "completeness",
    NOT_ENOUGH_EXAMPLES: "completeness",
    EXAMPLES_TOO_MANY: "completeness",
    NEXT_FORMS_TOO_FEW: "completeness",
    NEXT_FORMS_TOO_MANY: "completeness",
    COLLOCATIONS_TOO_MANY: "completeness",
    SYNONYMS_TOO_MANY: "completeness",
    ANTONYMS_TOO_MANY: "completeness",

    INCOMPLETE_VERB_PARADIGM: "pedagogy",
    INCOMPLETE_NOUN_PARADIGM: "pedagogy",
    REDUNDANT_TAKEAWAYS: "pedagogy",
    FRENCH_STYLE: "readability",

    EXAMPLE_NOT_RELATED: "relevance",
    DUPLICATED_INFORMATION: "relevance",

    TAKEAWAY_TOO_LONG: "readability",
    EXPLANATION_TOO_LONG: "readability",

    REFERENCE_INFORMATION_IN_VISIBLE_CONTENT: "reference",
    INVALID_STRESS_MARK: "reference",

    POS_MISMATCH: "pedagogy",
    INVALID_SECTION: "pedagogy",
    INVALID_LABEL: "pedagogy",
    INVALID_NEXT_FORM: "relevance",
    INVALID_REFERENCE: "reference",
    INVALID_MORPHOLOGY: "pedagogy",

    TEACHING_MISSING: "pedagogy",
    ENCYCLOPEDIC_TEACHING: "pedagogy",
    TEACHING_TOO_LONG: "readability",
    TEACHING_TOO_MANY_RETENTION: "pedagogy",
    TEACHING_WHAT_IF_MISSING: "pedagogy",
    TEACHING_TOO_MANY_WHAT_IF: "pedagogy",
  };

const ERROR_PENALTY = 22;
const WARNING_PENALTY = 9;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeCategoryScores(
  issues: TKnowledgeIssue[],
): TKnowledgeQualityCategoryScores {
  const penalties: TKnowledgeQualityCategoryScores = {
    completeness: 0,
    pedagogy: 0,
    relevance: 0,
    readability: 0,
    reference: 0,
  };

  for (const issue of issues) {
    const category = ISSUE_CATEGORY_MAP[issue.code];

    if (!category) {
      continue;
    }

    penalties[category] +=
      issue.severity === "error" ? ERROR_PENALTY : WARNING_PENALTY;
  }

  return {
    completeness: clampScore(100 - penalties.completeness),
    pedagogy: clampScore(100 - penalties.pedagogy),
    relevance: clampScore(100 - penalties.relevance),
    readability: clampScore(100 - penalties.readability),
    reference: clampScore(100 - penalties.reference),
  };
}

export function computeQualityScore(
  categoryScores: TKnowledgeQualityCategoryScores,
): number {
  const weighted =
    categoryScores.completeness * CATEGORY_WEIGHTS.completeness +
    categoryScores.pedagogy * CATEGORY_WEIGHTS.pedagogy +
    categoryScores.relevance * CATEGORY_WEIGHTS.relevance +
    categoryScores.readability * CATEGORY_WEIGHTS.readability +
    categoryScores.reference * CATEGORY_WEIGHTS.reference;

  return clampScore(weighted);
}

export function resolveQualityStatus(score: number): TKnowledgeQualityStatus {
  if (score >= 95) {
    return "excellent";
  }

  if (score >= 80) {
    return "good";
  }

  if (score >= 60) {
    return "review";
  }

  return "poor";
}

export function extractWarningMessages(issues: TKnowledgeIssue[]): string[] {
  return issues
    .filter((issue) => issue.severity === "warning")
    .map((issue) => issue.message);
}
