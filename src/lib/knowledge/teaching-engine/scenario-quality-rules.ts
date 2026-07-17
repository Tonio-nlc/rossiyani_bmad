import { countWords } from "@/lib/knowledge/teaching/cognitive-limits";
import type {
  TTeachingScenario,
  TTeachingScenarioContent,
  TTeachingScenarioIssue,
  TTeachingScenarioQualityReport,
} from "@/types/teaching-scenario";

const ENCYCLOPEDIC_PATTERNS: RegExp[] = [
  /^le verbe est\b/i,
  /^ce mot est\b/i,
  /^cette terminaison indique/i,
  /^le russe choisit cette forme/i,
  /^définition\s*:/i,
];

const MAX_PARAGRAPH_WORDS = 80;
const MIN_HOOK_WORDS = 4;

function checkTextField(
  value: string | undefined,
  field: string,
  label: string,
  issues: TTeachingScenarioIssue[],
  required = true,
): void {
  const text = value?.trim();

  if (!text) {
    if (required) {
      issues.push({
        severity: "error",
        code: "SCENARIO_FIELD_MISSING",
        message: `${label} absent`,
        field,
      });
    }

    return;
  }

  for (const pattern of ENCYCLOPEDIC_PATTERNS) {
    if (pattern.test(text)) {
      issues.push({
        severity: "warning",
        code: "SCENARIO_ENCYCLOPEDIC",
        message: `Formulation encyclopédique dans ${field}`,
        field,
      });
    }
  }

  if (field === "hook" && countWords(text) < MIN_HOOK_WORDS) {
    issues.push({
      severity: "warning",
      code: "SCENARIO_HOOK_TOO_SHORT",
      message: "Hook trop court — une vraie situation attendue",
      field,
    });
  }
}

export function validateTeachingScenarioContent(
  content: TTeachingScenarioContent,
  conceptId?: string,
): TTeachingScenarioQualityReport {
  const issues: TTeachingScenarioIssue[] = [];

  checkTextField(content.hook, "hook", "Hook", issues);
  checkTextField(content.question, "question", "Question", issues);
  checkTextField(content.intuition, "intuition", "Intuition", issues);
  checkTextField(content.commonMistake, "commonMistake", "Erreur fréquente", issues);
  checkTextField(content.memoryAnchor, "memoryAnchor", "Ancre mémorielle", issues);

  if (!content.visual?.nodes?.length || content.visual.nodes.length < 2) {
    issues.push({
      severity: "error",
      code: "SCENARIO_VISUAL_MISSING",
      message: "VisualModel absent ou incomplet (minimum 2 nœuds)",
      field: "visual",
    });
  }

  if (!content.comparison?.length) {
    issues.push({
      severity: "error",
      code: "SCENARIO_COMPARISON_MISSING",
      message: "Comparaison absente — le cerveau apprend par contraste",
      field: "comparison",
    });
  }

  if (!content.explanation?.length) {
    issues.push({
      severity: "error",
      code: "SCENARIO_EXPLANATION_MISSING",
      message: "Explication absente",
      field: "explanation",
    });
  } else if (content.explanation.length > 2) {
    issues.push({
      severity: "warning",
      code: "SCENARIO_EXPLANATION_TOO_MANY",
      message: `${content.explanation.length} paragraphes — maximum 2`,
      field: "explanation",
    });
  }

  for (const [index, paragraph] of content.explanation.entries()) {
    if (countWords(paragraph) > MAX_PARAGRAPH_WORDS) {
      issues.push({
        severity: "warning",
        code: "SCENARIO_EXPLANATION_TOO_LONG",
        message: `Paragraphe ${index + 1} : ${countWords(paragraph)} mots — max ${MAX_PARAGRAPH_WORDS}`,
        field: `explanation[${index}]`,
      });
    }
  }

  if (!content.reuse?.length) {
    issues.push({
      severity: "warning",
      code: "SCENARIO_REUSE_MISSING",
      message: "Réutilisation absente — préparer la prochaine lecture",
      field: "reuse",
    });
  }

  if (conceptId) {
    const hasErrors = issues.some((issue) => issue.severity === "error");

    return {
      valid: !hasErrors,
      issues,
    };
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}

export function validateTeachingScenario(
  scenario: TTeachingScenario,
): TTeachingScenarioQualityReport {
  const content: TTeachingScenarioContent = {
    hook: scenario.hook,
    question: scenario.question,
    intuition: scenario.intuition,
    visual: scenario.visual,
    explanation: scenario.explanation,
    comparison: scenario.comparison,
    commonMistake: scenario.commonMistake,
    reuse: scenario.reuse,
    memoryAnchor: scenario.memoryAnchor,
  };

  return validateTeachingScenarioContent(content, scenario.conceptId);
}
