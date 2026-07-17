import { textMatchesPatterns } from "@/lib/knowledge/pedagogy/strategy/label-patterns";
import {
  getPedagogicalStrategy,
  normalizePartOfSpeech,
} from "@/lib/knowledge/pedagogy/strategy/strategies";
import type { TKnowledgeIssue } from "@/lib/knowledge/quality/quality-types";
import type { TKnowledgeLlmPayload } from "@/types/knowledge";

function collectPayloadTexts(
  payload: TKnowledgeLlmPayload,
): Array<{ field: string; text: string }> {
  const entries: Array<{ field: string; text: string }> = [];

  const add = (field: string, value: string | null | undefined) => {
    if (value?.trim()) {
      entries.push({ field, text: value });
    }
  };

  for (const [index, takeaway] of (payload.pedagogy.takeaways ?? []).entries()) {
    add(`pedagogy.takeaways[${index}]`, takeaway);
  }

  add("pedagogy.takeaway", payload.pedagogy.takeaway);
  add("pedagogy.summary", payload.pedagogy.summary);

  for (const [index, point] of (
    payload.pedagogy.understandingPoints ?? []
  ).entries()) {
    add(`pedagogy.understandingPoints[${index}]`, point);
  }

  for (const [index, form] of (payload.pedagogy.nextForms ?? []).entries()) {
    add(`pedagogy.nextForms[${index}]`, form);
  }

  for (const [index, pattern] of (payload.pedagogy.commonPatterns ?? []).entries()) {
    add(`pedagogy.commonPatterns[${index}]`, pattern);
  }

  for (const entry of [
    ...(payload.paradigms.forms ?? []),
    ...(payload.paradigms.conjugation ?? []),
    ...(payload.paradigms.cases ?? []),
    ...(payload.morphology.conjugationParadigm ?? []),
    ...(payload.morphology.caseParadigm ?? []),
  ]) {
    add(`paradigms.${entry.label}`, `${entry.label} ${entry.form}`);
  }

  return entries;
}

function morphologyHasForbiddenField(
  payload: TKnowledgeLlmPayload,
  field: string,
): boolean {
  const morphology = payload.morphology as Record<string, unknown>;
  const value = morphology[field];

  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value as object).length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return Boolean(value);
}

export function runIntegrityQualityRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];
  const pos = normalizePartOfSpeech(payload.partOfSpeech);
  const strategy = getPedagogicalStrategy(payload.partOfSpeech);

  if (!pos) {
    issues.push({
      severity: "warning",
      code: "POS_MISMATCH",
      message: `Nature grammaticale inconnue : « ${payload.partOfSpeech} »`,
      field: "partOfSpeech",
    });

    return issues;
  }

  for (const field of strategy.forbiddenMorphologyFields) {
    if (morphologyHasForbiddenField(payload, field)) {
      issues.push({
        severity: "error",
        code: "INVALID_MORPHOLOGY",
        message: `Champ morphology.${field} incompatible avec ${pos}`,
        field: `morphology.${field}`,
      });
    }
  }

  if (pos === "verb" && (payload.paradigms.cases?.length ?? 0) > 0) {
    issues.push({
      severity: "error",
      code: "INVALID_SECTION",
      message: "Paradigme des cas interdit pour un verbe",
      field: "paradigms.cases",
    });
  }

  if (pos === "noun" && (payload.paradigms.conjugation?.length ?? 0) > 0) {
    issues.push({
      severity: "error",
      code: "INVALID_SECTION",
      message: "Conjugaison interdite pour un nom",
      field: "paradigms.conjugation",
    });
  }

  for (const { field, text } of collectPayloadTexts(payload)) {
    if (textMatchesPatterns(text, strategy.forbiddenLabelPatterns)) {
      const code = field.startsWith("paradigms.")
        ? "INVALID_REFERENCE"
        : field.startsWith("pedagogy.nextForms")
          ? "INVALID_NEXT_FORM"
          : "INVALID_LABEL";

      issues.push({
        severity: "error",
        code,
        message: `Terme interdit pour ${pos} : « ${text.slice(0, 50)}${text.length > 50 ? "…" : ""} »`,
        field,
      });
    }
  }

  if (pos === "verb" && payload.syntax.requiredCase) {
    issues.push({
      severity: "warning",
      code: "POS_MISMATCH",
      message: "Cas requis en syntax — atypique pour un verbe",
      field: "syntax.requiredCase",
    });
  }

  if (pos === "noun" && payload.syntax.transitivity) {
    issues.push({
      severity: "warning",
      code: "POS_MISMATCH",
      message: "Transitivité en syntax — atypique pour un nom",
      field: "syntax.transitivity",
    });
  }

  return issues;
}
