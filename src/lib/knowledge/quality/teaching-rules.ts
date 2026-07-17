import {
  COGNITIVE_MAX_RETENTION,
  COGNITIVE_MAX_WHAT_IF,
  COGNITIVE_MAX_WORDS,
  countWords,
} from "@/lib/knowledge/teaching/cognitive-limits";
import { textMatchesPatterns } from "@/lib/knowledge/pedagogy/strategy/label-patterns";
import type { TKnowledgeIssue } from "@/lib/knowledge/quality/quality-types";
import type { TKnowledgeLlmPayload } from "@/types/knowledge";

const ENCYCLOPEDIC_TEACHING_PATTERNS: RegExp[] = [
  /cette terminaison indique/i,
  /le cas instrumental/i,
  /le cas génitif/i,
  /le cas datif/i,
  /la troisième personne/i,
  /la deuxième personne/i,
  /la première personne/i,
];

function collectTeachingTexts(
  payload: TKnowledgeLlmPayload,
): Array<{ field: string; text: string }> {
  const teaching = payload.pedagogy.teaching;
  const entries: Array<{ field: string; text: string }> = [];

  const add = (field: string, value: string | null | undefined) => {
    if (value?.trim()) {
      entries.push({ field, text: value });
    }
  };

  if (!teaching) {
    return entries;
  }

  add("pedagogy.teaching.whyNotBaseForm", teaching.whyNotBaseForm);
  add("pedagogy.teaching.russianExpresses", teaching.russianExpresses);
  add("pedagogy.teaching.visibleSignal", teaching.visibleSignal);

  for (const [index, point] of (teaching.retentionPoints ?? []).entries()) {
    add(`pedagogy.teaching.retentionPoints[${index}]`, point);
  }

  for (const [index, item] of (teaching.whatIfComparisons ?? []).entries()) {
    add(
      `pedagogy.teaching.whatIfComparisons[${index}].explanation`,
      item.explanation,
    );
  }

  return entries;
}

export function runTeachingQualityRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];
  const teaching = payload.pedagogy.teaching;

  if (!teaching) {
    issues.push({
      severity: "warning",
      code: "TEACHING_MISSING",
      message: "Bloc pedagogy.teaching absent — fallback composer utilisé",
      field: "pedagogy.teaching",
    });

    return issues;
  }

  for (const { field, text } of collectTeachingTexts(payload)) {
    if (textMatchesPatterns(text, ENCYCLOPEDIC_TEACHING_PATTERNS)) {
      issues.push({
        severity: "warning",
        code: "ENCYCLOPEDIC_TEACHING",
        message: `Formulation encyclopédique interdite dans ${field}`,
        field,
      });
    }

    if (countWords(text) > COGNITIVE_MAX_WORDS) {
      issues.push({
        severity: "warning",
        code: "TEACHING_TOO_LONG",
        message: `${countWords(text)} mots — maximum ${COGNITIVE_MAX_WORDS} attendu`,
        field,
      });
    }
  }

  const retentionCount = teaching.retentionPoints?.length ?? 0;

  if (retentionCount > COGNITIVE_MAX_RETENTION) {
    issues.push({
      severity: "warning",
      code: "TEACHING_TOO_MANY_RETENTION",
      message: `${retentionCount} retentionPoints — maximum ${COGNITIVE_MAX_RETENTION}`,
      field: "pedagogy.teaching.retentionPoints",
    });
  }

  const whatIfCount = teaching.whatIfComparisons?.length ?? 0;

  if (whatIfCount === 0) {
    issues.push({
      severity: "warning",
      code: "TEACHING_WHAT_IF_MISSING",
      message: "Aucune comparaison whatIfComparisons — bloc « Et si… » vide",
      field: "pedagogy.teaching.whatIfComparisons",
    });
  } else if (whatIfCount > COGNITIVE_MAX_WHAT_IF) {
    issues.push({
      severity: "warning",
      code: "TEACHING_TOO_MANY_WHAT_IF",
      message: `${whatIfCount} comparaisons — maximum ${COGNITIVE_MAX_WHAT_IF}`,
      field: "pedagogy.teaching.whatIfComparisons",
    });
  }

  return issues;
}
