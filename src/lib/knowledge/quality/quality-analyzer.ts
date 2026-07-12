import {
  collectQualityStats,
  runAllQualityRules,
} from "@/lib/knowledge/quality/quality-rules";
import {
  computeCategoryScores,
  computeQualityScore,
  extractWarningMessages,
  resolveQualityStatus,
} from "@/lib/knowledge/quality/quality-score";
import type {
  TKnowledgeQualityInput,
  TKnowledgeQualityReport,
} from "@/lib/knowledge/quality/quality-types";

export function analyzeKnowledgeQuality(
  input: TKnowledgeQualityInput,
): TKnowledgeQualityReport {
  const issues = runAllQualityRules(input.payload, input.lemmaForm);
  const categoryScores = computeCategoryScores(issues);
  const score = computeQualityScore(categoryScores);
  const status = resolveQualityStatus(score);

  return {
    score,
    status,
    issues,
    warnings: extractWarningMessages(issues),
    stats: collectQualityStats(input.payload),
  };
}

export function formatQualityIssueBullet(issue: {
  code: string;
  message: string;
}): string {
  const shortMessages: Record<string, string> = {
    TAKEAWAYS_TOO_FEW: "too few takeaways",
    TAKEAWAYS_TOO_MANY: "too many takeaways",
    NOT_ENOUGH_EXAMPLES: "only one example",
    EXAMPLES_TOO_MANY: "too many examples",
    NEXT_FORMS_TOO_FEW: "too few next forms",
    NEXT_FORMS_TOO_MANY: "too many next forms",
    TAKEAWAY_TOO_LONG: "takeaway too long",
    EXPLANATION_TOO_LONG: "explanation too long",
    DUPLICATED_INFORMATION: "duplicated information",
    REFERENCE_INFORMATION_IN_VISIBLE_CONTENT: "reference jargon in visible content",
    INCOMPLETE_VERB_PARADIGM: "incomplete verb paradigm",
    INCOMPLETE_NOUN_PARADIGM: "incomplete noun paradigm",
    EXAMPLE_NOT_RELATED: "example not related to lemma",
    INVALID_STRESS_MARK: "invalid stress mark",
    FRENCH_STYLE: "unnatural French phrasing",
    REDUNDANT_TAKEAWAYS: "redundant takeaways",
    COLLOCATIONS_TOO_MANY: "too many collocations",
    SYNONYMS_TOO_MANY: "too many synonyms",
    ANTONYMS_TOO_MANY: "too many antonyms",
  };

  return shortMessages[issue.code] ?? issue.message;
}
