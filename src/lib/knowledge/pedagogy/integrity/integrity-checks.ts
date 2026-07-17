import type { TIntegrityIssue, TIntegrityReport } from "@/lib/knowledge/pedagogy/strategy/strategy-types";
import { textMatchesPatterns } from "@/lib/knowledge/pedagogy/strategy/label-patterns";
import type { TPedagogicalStrategy } from "@/lib/knowledge/pedagogy/strategy/strategy-types";
import type { TLearningCard } from "@/types/learning-card";

function pushIssue(
  issues: TIntegrityIssue[],
  issue: TIntegrityIssue,
): void {
  issues.push(issue);
}

function collectVisibleTexts(
  card: TLearningCard,
): Array<{ field: string; text: string }> {
  const entries: Array<{ field: string; text: string }> = [];

  const add = (field: string, value: string | null | undefined) => {
    if (value?.trim()) {
      entries.push({ field, text: value });
    }
  };

  if (card.encounter) {
    for (const chip of [
      ...card.encounter.formChips,
      ...card.encounter.traitChips,
    ]) {
      add("encounter.chips", chip);
    }
  }

  if (card.understanding) {
    add("understanding.intro", card.understanding.intro);
    for (const [index, point] of card.understanding.whyPoints.entries()) {
      add(`understanding.whyPoints[${index}]`, point);
    }
    add("understanding.roleLabel", card.understanding.roleLabel);
    for (const [index, block] of card.understanding.explanationBlocks.entries()) {
      add(`understanding.explanationBlocks[${index}]`, block);
    }
  }

  for (const [index, item] of card.takeaways.items.entries()) {
    add(`takeaways[${index}]`, item);
  }

  for (const [index, form] of card.nextForms.forms.entries()) {
    add(`nextForms[${index}]`, form);
  }

  for (const block of card.reference.blocks) {
    add(`reference.${block.title}`, block.title);
    for (const [index, item] of block.items.entries()) {
      add(`reference.${block.title}[${index}]`, item);
    }
  }

  return entries;
}

export function checkLearningCardIntegrity(
  card: TLearningCard,
  strategy: TPedagogicalStrategy,
): TIntegrityReport {
  const issues: TIntegrityIssue[] = [];

  if (strategy.id === "unknown") {
    return { valid: true, issues };
  }

  if (
    card.header.partOfSpeech &&
    strategy.id !== card.header.partOfSpeech
  ) {
    pushIssue(issues, {
      code: "POS_MISMATCH",
      severity: "error",
      message: `POS header (${card.header.partOfSpeech}) ≠ stratégie (${strategy.id})`,
      field: "header.partOfSpeech",
    });
  }

  for (const { field, text } of collectVisibleTexts(card)) {
    if (textMatchesPatterns(text, strategy.forbiddenLabelPatterns)) {
      pushIssue(issues, {
        code: field.startsWith("reference.") ? "INVALID_REFERENCE" : "INVALID_LABEL",
        severity: "error",
        message: `Label ou terme interdit pour ${strategy.id} : « ${text.slice(0, 60)}${text.length > 60 ? "…" : ""} »`,
        field,
      });
    }
  }

  for (const block of card.reference.blocks) {
    if (strategy.forbiddenReferenceSections.includes(block.title)) {
      pushIssue(issues, {
        code: "INVALID_SECTION",
        severity: "error",
        message: `Section interdite pour ${strategy.id} : « ${block.title} »`,
        field: `reference.${block.title}`,
      });
    }
  }

  for (const [index, form] of card.nextForms.forms.entries()) {
    if (
      textMatchesPatterns(form, strategy.forbiddenNextFormPatterns) ||
      textMatchesPatterns(form, strategy.forbiddenLabelPatterns)
    ) {
      pushIssue(issues, {
        code: "INVALID_NEXT_FORM",
        severity: "error",
        message: `NextForm incompatible avec ${strategy.id} : « ${form} »`,
        field: `nextForms[${index}]`,
      });
    }
  }

  return {
    valid: issues.filter((issue) => issue.severity === "error").length === 0,
    issues,
  };
}
