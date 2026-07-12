import { PEDAGOGY_LIMITS } from "@/lib/knowledge/pedagogy/importance-ranking";
import { normalizeRussianWord } from "@/lib/vocabulary/normalize-russian-word";
import { segmentGraphemes, toNfc } from "@/lib/utils/russian";
import type { TKnowledgeLlmPayload } from "@/types/knowledge";
import type { TKnowledgeIssue } from "@/lib/knowledge/quality/quality-types";

const COMBINING_ACUTE = "\u0301";
const RUSSIAN_VOWEL_RE = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/u;

const REFERENCE_BANNED_PHRASES = [
  "classe de conjugaison",
  "transitivité",
  "paradigme",
  "concept linguistique interne",
] as const;

const FRENCH_STYLE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ce verbe est utilisé afin de/i, label: "Ce verbe est utilisé afin de…" },
  { pattern: /ce mot indique/i, label: "Ce mot indique…" },
  { pattern: /ce verbe sert à exprimer/i, label: "Ce verbe sert à exprimer…" },
  { pattern: /ce nom indique/i, label: "Ce nom indique…" },
  { pattern: /ce mot est utilisé afin de/i, label: "Ce mot est utilisé afin de…" },
];

const REDUNDANT_TAKEAWAY_PATTERNS = [
  /^utilisé pour\b/i,
  /^employé pour\b/i,
  /^sert à\b/i,
];

const TAKEAWAY_MAX_LENGTH = 180;
const EXPLANATION_MAX_LENGTH = 350;

export function collectQualityStats(payload: TKnowledgeLlmPayload) {
  const takeaways = payload.pedagogy.takeaways ?? [];
  const examples = collectExamples(payload);
  const nextForms = payload.pedagogy.nextForms ?? [];
  const paradigms = [
    ...(payload.paradigms.forms ?? []),
    ...(payload.paradigms.cases ?? []),
    ...(payload.paradigms.conjugation ?? []),
    ...(payload.morphology.caseParadigm ?? []),
    ...(payload.morphology.conjugationParadigm ?? []),
  ];
  const collocations = payload.semantics.collocations ?? [];

  return {
    takeaways: takeaways.length,
    examples: examples.length,
    nextForms: nextForms.length,
    paradigms: paradigms.length,
    collocations: collocations.length,
  };
}

export function collectExamples(payload: TKnowledgeLlmPayload): string[] {
  const fromPatterns = payload.pedagogy.commonPatterns ?? [];
  const fromGoverned =
    payload.morphology.governedCases?.flatMap((item) => item.examples ?? []) ??
    [];

  return [...fromPatterns, ...fromGoverned].filter(Boolean);
}

export function runCompletenessRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];
  const takeaways = payload.pedagogy.takeaways ?? [];
  const examples = collectExamples(payload);
  const nextForms = payload.pedagogy.nextForms ?? [];

  if (takeaways.length < 3) {
    issues.push({
      severity: "error",
      code: "TAKEAWAYS_TOO_FEW",
      message: `Seulement ${takeaways.length} takeaway(s) — minimum 3 attendu`,
      field: "pedagogy.takeaways",
    });
  }

  if (takeaways.length > 5) {
    issues.push({
      severity: "warning",
      code: "TAKEAWAYS_TOO_MANY",
      message: `${takeaways.length} takeaways — maximum recommandé : 5`,
      field: "pedagogy.takeaways",
    });
  }

  if (examples.length < 2) {
    issues.push({
      severity: "error",
      code: "NOT_ENOUGH_EXAMPLES",
      message:
        examples.length === 0
          ? "Aucun exemple (commonPatterns)"
          : "Un seul exemple — minimum 2 attendu",
      field: "pedagogy.commonPatterns",
    });
  }

  if (examples.length > PEDAGOGY_LIMITS.examples) {
    issues.push({
      severity: "warning",
      code: "EXAMPLES_TOO_MANY",
      message: `${examples.length} exemples — maximum recommandé : ${PEDAGOGY_LIMITS.examples}`,
      field: "pedagogy.commonPatterns",
    });
  }

  if (nextForms.length < 2) {
    issues.push({
      severity: "error",
      code: "NEXT_FORMS_TOO_FEW",
      message:
        nextForms.length === 0
          ? "Aucune nextForm"
          : "Une seule nextForm — minimum 2 attendu",
      field: "pedagogy.nextForms",
    });
  }

  if (nextForms.length > PEDAGOGY_LIMITS.nextForms) {
    issues.push({
      severity: "warning",
      code: "NEXT_FORMS_TOO_MANY",
      message: `${nextForms.length} nextForms — maximum recommandé : ${PEDAGOGY_LIMITS.nextForms}`,
      field: "pedagogy.nextForms",
    });
  }

  return issues;
}

export function runLengthRules(payload: TKnowledgeLlmPayload): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];

  for (const [index, takeaway] of (payload.pedagogy.takeaways ?? []).entries()) {
    if (takeaway.length > TAKEAWAY_MAX_LENGTH) {
      issues.push({
        severity: "error",
        code: "TAKEAWAY_TOO_LONG",
        message: `Takeaway ${index + 1} : ${takeaway.length} caractères (max ${TAKEAWAY_MAX_LENGTH})`,
        field: `pedagogy.takeaways[${index}]`,
      });
    }
  }

  const explanationSources = [
    ...(payload.pedagogy.understandingPoints ?? []),
    ...(payload.pedagogy.takeaway ? [payload.pedagogy.takeaway] : []),
    ...(payload.pedagogy.summary ? [payload.pedagogy.summary] : []),
    ...(payload.semantics.coreMeaning ? [payload.semantics.coreMeaning] : []),
  ];

  for (const [index, text] of explanationSources.entries()) {
    if (text.length > EXPLANATION_MAX_LENGTH) {
      issues.push({
        severity: "warning",
        code: "EXPLANATION_TOO_LONG",
        message: `Explication ${index + 1} : ${text.length} caractères (seuil ${EXPLANATION_MAX_LENGTH})`,
        field: "pedagogy.understandingPoints",
      });
    }
  }

  return issues;
}

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text: string): Set<string> {
  const normalized = normalizeForComparison(text);

  if (!normalized) {
    return new Set();
  }

  return new Set(normalized.split(" ").filter((token) => token.length > 2));
}

function jaccardSimilarity(left: string, right: string): number {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = leftTokens.size + rightTokens.size - intersection;

  return union === 0 ? 0 : intersection / union;
}

const DUPLICATION_SIMILARITY_THRESHOLD = 0.65;

export function runRedundancyRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];

  const blocks: Array<{ label: string; text: string }> = [];

  for (const [index, takeaway] of (payload.pedagogy.takeaways ?? []).entries()) {
    blocks.push({ label: `takeaway[${index}]`, text: takeaway });
  }

  for (const [index, point] of (
    payload.pedagogy.understandingPoints ?? []
  ).entries()) {
    blocks.push({ label: `understanding[${index}]`, text: point });
  }

  if (payload.pedagogy.summary) {
    blocks.push({ label: "summary", text: payload.pedagogy.summary });
  }

  if (payload.pedagogy.takeaway) {
    blocks.push({ label: "takeaway", text: payload.pedagogy.takeaway });
  }

  for (let left = 0; left < blocks.length; left += 1) {
    for (let right = left + 1; right < blocks.length; right += 1) {
      const similarity = jaccardSimilarity(
        blocks[left].text,
        blocks[right].text,
      );

      if (similarity >= DUPLICATION_SIMILARITY_THRESHOLD) {
        issues.push({
          severity: "warning",
          code: "DUPLICATED_INFORMATION",
          message: `Contenu similaire entre ${blocks[left].label} et ${blocks[right].label}`,
          field: "pedagogy",
        });
      }
    }
  }

  const takeaways = payload.pedagogy.takeaways ?? [];
  const redundantPatterns = new Set<string>();

  for (const takeaway of takeaways) {
    for (const pattern of REDUNDANT_TAKEAWAY_PATTERNS) {
      if (pattern.test(takeaway.trim())) {
        redundantPatterns.add(pattern.source);
      }
    }
  }

  if (redundantPatterns.size >= 2) {
    issues.push({
      severity: "error",
      code: "REDUNDANT_TAKEAWAYS",
      message:
        "Plusieurs takeaways expriment la même idée (Utilisé pour / Employé pour / Sert à)",
      field: "pedagogy.takeaways",
    });
  }

  return issues;
}

function collectVisibleFrenchTexts(
  payload: TKnowledgeLlmPayload,
): Array<{ field: string; text: string }> {
  const entries: Array<{ field: string; text: string }> = [];

  const push = (field: string, value: string | null | undefined) => {
    if (value?.trim()) {
      entries.push({ field, text: value });
    }
  };

  for (const [index, takeaway] of (payload.pedagogy.takeaways ?? []).entries()) {
    push(`pedagogy.takeaways[${index}]`, takeaway);
  }

  for (const [index, point] of (
    payload.pedagogy.understandingPoints ?? []
  ).entries()) {
    push(`pedagogy.understandingPoints[${index}]`, point);
  }

  push("pedagogy.summary", payload.pedagogy.summary);
  push("pedagogy.takeaway", payload.pedagogy.takeaway);

  for (const [index, tip] of (payload.pedagogy.tips ?? []).entries()) {
    push(`pedagogy.tips[${index}]`, tip);
  }

  for (const [index, confusion] of (payload.pedagogy.confusions ?? []).entries()) {
    push(`pedagogy.confusions[${index}]`, confusion);
  }

  push("semantics.coreMeaning", payload.semantics.coreMeaning);
  push("semantics.extendedMeaning", payload.semantics.extendedMeaning);

  return entries;
}

export function runReferenceRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];

  for (const { field, text } of collectVisibleFrenchTexts(payload)) {
    const lower = text.toLowerCase();

    for (const phrase of REFERENCE_BANNED_PHRASES) {
      if (lower.includes(phrase)) {
        issues.push({
          severity: "error",
          code: "REFERENCE_INFORMATION_IN_VISIBLE_CONTENT",
          message: `Référence linguistique interne détectée : « ${phrase} »`,
          field,
        });
      }
    }
  }

  return issues;
}

function collectParadigmLabels(payload: TKnowledgeLlmPayload): string[] {
  const entries = [
    ...(payload.paradigms.forms ?? []),
    ...(payload.paradigms.conjugation ?? []),
    ...(payload.paradigms.cases ?? []),
    ...(payload.morphology.conjugationParadigm ?? []),
    ...(payload.morphology.caseParadigm ?? []),
  ];

  return entries.map((entry) => entry.label.toLowerCase());
}

function hasParadigmHint(
  labels: string[],
  patterns: RegExp[],
): boolean {
  return labels.some((label) => patterns.some((pattern) => pattern.test(label)));
}

export function runParadigmRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];
  const pos = payload.partOfSpeech?.toLowerCase() ?? "";
  const labels = collectParadigmLabels(payload);

  if (pos === "verb") {
    const hasInfinitive = hasParadigmHint(labels, [/infinitif/i, /infinitive/i]);
    const hasPresentOrFuture = hasParadigmHint(labels, [
      /présent/i,
      /present/i,
      /futur/i,
      /future/i,
    ]);
    const hasPast = hasParadigmHint(labels, [
      /passé/i,
      /passe/i,
      /past/i,
      /imparfait/i,
      /prétérit/i,
    ]);

    if (!hasInfinitive || !hasPresentOrFuture || !hasPast) {
      const missing: string[] = [];

      if (!hasInfinitive) {
        missing.push("infinitif");
      }

      if (!hasPresentOrFuture) {
        missing.push("présent/futur");
      }

      if (!hasPast) {
        missing.push("passé");
      }

      issues.push({
        severity: "error",
        code: "INCOMPLETE_VERB_PARADIGM",
        message: `Paradigme verbal incomplet — manque : ${missing.join(", ")}`,
        field: "paradigms",
      });
    }
  }

  if (pos === "noun") {
    const hasSingular = hasParadigmHint(labels, [
      /singulier/i,
      /singular/i,
      /nominatif/i,
    ]);
    const hasPlural = hasParadigmHint(labels, [/pluriel/i, /plural/i]);

    if (!hasSingular || !hasPlural) {
      const missing: string[] = [];

      if (!hasSingular) {
        missing.push("singulier");
      }

      if (!hasPlural) {
        missing.push("pluriel");
      }

      issues.push({
        severity: "error",
        code: "INCOMPLETE_NOUN_PARADIGM",
        message: `Paradigme nominal incomplet — manque : ${missing.join(", ")}`,
        field: "paradigms",
      });
    }
  }

  return issues;
}

function collectParadigmForms(
  payload: TKnowledgeLlmPayload,
  lemmaForm: string,
): Set<string> {
  const forms = new Set<string>();

  const addForm = (value: string | null | undefined) => {
    const normalized = normalizeRussianWord(value ?? "");

    if (normalized) {
      forms.add(normalized);
    }
  };

  addForm(lemmaForm);

  for (const entry of [
    ...(payload.paradigms.forms ?? []),
    ...(payload.paradigms.conjugation ?? []),
    ...(payload.paradigms.cases ?? []),
    ...(payload.morphology.conjugationParadigm ?? []),
    ...(payload.morphology.caseParadigm ?? []),
    ...(payload.morphology.specialForms ?? []),
  ]) {
    addForm(entry.form);
  }

  for (const variant of payload.morphology.variants ?? []) {
    addForm(variant);
  }

  for (const nextForm of payload.pedagogy.nextForms ?? []) {
    addForm(nextForm);
  }

  if (payload.morphology.plural?.form) {
    addForm(payload.morphology.plural.form);
  }

  return forms;
}

function exampleContainsLemmaOrParadigmForm(
  example: string,
  lemmaForm: string,
  paradigmForms: Set<string>,
): boolean {
  const tokens = example.match(/[\p{L}\p{M}]+/gu) ?? [];

  for (const token of tokens) {
    const normalized = normalizeRussianWord(token);

    if (
      normalized === normalizeRussianWord(lemmaForm) ||
      paradigmForms.has(normalized)
    ) {
      return true;
    }
  }

  return false;
}

export function runExampleRelevanceRules(
  payload: TKnowledgeLlmPayload,
  lemmaForm: string,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];
  const examples = collectExamples(payload);
  const paradigmForms = collectParadigmForms(payload, lemmaForm);

  for (const [index, example] of examples.entries()) {
    if (!exampleContainsLemmaOrParadigmForm(example, lemmaForm, paradigmForms)) {
      issues.push({
        severity: "error",
        code: "EXAMPLE_NOT_RELATED",
        message: `Exemple ${index + 1} sans lemme ni forme du paradigme`,
        field: "pedagogy.commonPatterns",
      });
    }
  }

  return issues;
}

function collectRussianTexts(
  payload: TKnowledgeLlmPayload,
  lemmaForm: string,
): Array<{ field: string; text: string }> {
  const entries: Array<{ field: string; text: string }> = [];

  const push = (field: string, value: string | null | undefined) => {
    if (value?.trim()) {
      entries.push({ field, text: value });
    }
  };

  push("lemma", lemmaForm);

  for (const [index, form] of (payload.pedagogy.nextForms ?? []).entries()) {
    push(`pedagogy.nextForms[${index}]`, form);
  }

  for (const [index, pattern] of (payload.pedagogy.commonPatterns ?? []).entries()) {
    push(`pedagogy.commonPatterns[${index}]`, pattern);
  }

  for (const [index, collocation] of (payload.semantics.collocations ?? []).entries()) {
    push(`semantics.collocations[${index}]`, collocation);
  }

  for (const entry of [
    ...(payload.paradigms.forms ?? []),
    ...(payload.paradigms.conjugation ?? []),
    ...(payload.paradigms.cases ?? []),
  ]) {
    push(`paradigms.${entry.label}`, entry.form);
  }

  push("morphology.plural", payload.morphology.plural?.form);

  for (const variant of payload.morphology.variants ?? []) {
    push("morphology.variants", variant);
  }

  return entries;
}

function validateRussianStress(text: string): string | null {
  if (text.includes("\uFFFD")) {
    return "caractère Unicode invalide";
  }

  const nfc = toNfc(text);

  if (nfc !== text && text.normalize("NFC") !== nfc) {
    return "normalisation Unicode incorrecte";
  }

  const nfd = text.normalize("NFD");

  if (/^\u0301/.test(nfd)) {
    return "accent isolé";
  }

  if (/\u0301\s+\p{L}/u.test(nfd)) {
    return "accent séparé de la voyelle";
  }

  const graphemes = segmentGraphemes(text);

  for (const grapheme of graphemes) {
    const acuteCount = (grapheme.match(/\u0301/g) ?? []).length;

    if (acuteCount > 1) {
      return "double accent sur une syllabe";
    }

    if (acuteCount === 1) {
      const base = grapheme.replace(/\u0301/g, "");
      const vowels = base.match(RUSSIAN_VOWEL_RE);

      if (!vowels || vowels.length === 0) {
        return "accent sur une consonne ou voyelle non russe";
      }
    }
  }

  return null;
}

export function runAccentRules(
  payload: TKnowledgeLlmPayload,
  lemmaForm: string,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];

  for (const { field, text } of collectRussianTexts(payload, lemmaForm)) {
    if (!/[\u0301\u0400-\u04FF]/u.test(text)) {
      continue;
    }

    const problem = validateRussianStress(text);

    if (problem) {
      issues.push({
        severity: "error",
        code: "INVALID_STRESS_MARK",
        message: `${problem} dans « ${text.slice(0, 40)}${text.length > 40 ? "…" : ""} »`,
        field,
      });
    }
  }

  return issues;
}

export function runFrenchStyleRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];

  for (const { field, text } of collectVisibleFrenchTexts(payload)) {
    for (const { pattern, label } of FRENCH_STYLE_PATTERNS) {
      if (pattern.test(text)) {
        issues.push({
          severity: "warning",
          code: "FRENCH_STYLE",
          message: `Formulation peu naturelle : « ${label} » — préférer On utilise… / Cette forme montre… / Ici…`,
          field,
        });
      }
    }
  }

  return issues;
}

export function runSizeLimitRules(
  payload: TKnowledgeLlmPayload,
): TKnowledgeIssue[] {
  const issues: TKnowledgeIssue[] = [];
  const collocations = payload.semantics.collocations ?? [];
  const synonyms = payload.semantics.synonyms ?? [];
  const antonyms = payload.semantics.antonyms ?? [];

  if (collocations.length > PEDAGOGY_LIMITS.collocations) {
    issues.push({
      severity: "warning",
      code: "COLLOCATIONS_TOO_MANY",
      message: `${collocations.length} collocations — maximum recommandé : ${PEDAGOGY_LIMITS.collocations}`,
      field: "semantics.collocations",
    });
  }

  if (synonyms.length > PEDAGOGY_LIMITS.synonyms) {
    issues.push({
      severity: "warning",
      code: "SYNONYMS_TOO_MANY",
      message: `${synonyms.length} synonymes — maximum recommandé : ${PEDAGOGY_LIMITS.synonyms}`,
      field: "semantics.synonyms",
    });
  }

  if (antonyms.length > PEDAGOGY_LIMITS.antonyms) {
    issues.push({
      severity: "warning",
      code: "ANTONYMS_TOO_MANY",
      message: `${antonyms.length} antonymes — maximum recommandé : ${PEDAGOGY_LIMITS.antonyms}`,
      field: "semantics.antonyms",
    });
  }

  return issues;
}

export function runAllQualityRules(
  payload: TKnowledgeLlmPayload,
  lemmaForm: string,
): TKnowledgeIssue[] {
  return [
    ...runCompletenessRules(payload),
    ...runLengthRules(payload),
    ...runRedundancyRules(payload),
    ...runReferenceRules(payload),
    ...runParadigmRules(payload),
    ...runExampleRelevanceRules(payload, lemmaForm),
    ...runAccentRules(payload, lemmaForm),
    ...runFrenchStyleRules(payload),
    ...runSizeLimitRules(payload),
  ];
}
