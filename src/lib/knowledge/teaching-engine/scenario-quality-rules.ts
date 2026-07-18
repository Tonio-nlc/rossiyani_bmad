import { countWords } from "@/lib/knowledge/teaching/cognitive-limits";
import type {
  TTeachingComparison,
  TTeachingScenario,
  TTeachingScenarioContent,
  TTeachingScenarioIssue,
  TTeachingScenarioQualityReport,
  TTeachingVisual,
} from "@/types/teaching-scenario";

import { normalizeTeachingScenarioContent } from "./normalize-teaching-scenario";

const ENCYCLOPEDIC_PATTERNS: RegExp[] = [
  /^le verbe est\b/i,
  /^ce mot est\b/i,
  /^cette terminaison indique/i,
  /^le russe choisit cette forme/i,
  /^définition\s*:/i,
];

const MAX_FACT_WORDS = 80;

/** Termes / motifs qui nomment concrètement le fait grammatical. */
const CONCRETE_FACT_PATTERNS: RegExp[] = [
  /[а-яёА-ЯЁіІїЇєЄґҐ][а-яёА-ЯЁіІїЇєЄґҐ́]*\s*=/,
  /-[а-яёА-ЯЁa-zA-Z]{1,8}\s*=/,
  /\b(présent|passé|futur|perfectif|imperfectif|nominatif|accusatif|génitif|datif|instrumental|prépositionnel)\b/i,
  /\b(1re|2e|3e|1ère|première|deuxième|troisième)\s+personne\b/i,
  /\b(singulier|pluriel)\b/i,
  /\b(masculin|féminin|neutre)\b/i,
  /\b(cas|aspect|terminaison|préfixe|conjugaison|temps|personne|genre)\b/i,
];

const NEGATION_ONLY_OPENERS =
  /^(ce n['']est pas\b|il ne s['']agit pas\b|ce n['']est point\b|ne pas confondre\b)/i;

const METAPHOR_PATTERNS: RegExp[] = [
  /\bpense à\b/i,
  /\bcomme (un|une|des|le|la|les)\b/i,
  /\b(film|photo|miroir|flèche|flèches|grille|pièce|contrat|familles? de mots)\b/i,
  /\bmétaphore\b/i,
  /\bimage mentale\b/i,
];

const AXIS_PATTERNS: { id: string; patterns: RegExp[] }[] = [
  {
    id: "person",
    patterns: [
      /\bpersonne\b/i,
      /\b(1re|2e|3e|1ère)\b/i,
      /\b(singulier|pluriel)\b/i,
    ],
  },
  {
    id: "tense",
    patterns: [/\b(présent|passé|futur|temps)\b/i],
  },
  {
    id: "aspect",
    patterns: [/\b(perfectif|imperfectif|aspect)\b/i],
  },
  {
    id: "case",
    patterns: [
      /\b(nominatif|accusatif|génitif|datif|instrumental|prépositionnel|cas)\b/i,
    ],
  },
  {
    id: "gender",
    patterns: [/\b(masculin|féminin|neutre|genre)\b/i],
  },
  {
    id: "motion",
    patterns: [
      /\b(direction|aller-retour|déplacement|préfixe|trajet)\b/i,
    ],
  },
];

const ARROW_ONLY = /^[\s→←⇄↓↑↔•‧·─\-|/\\=]+$/u;

function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(
    normalizeForCompare(text)
      .split(" ")
      .filter((token) => token.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }

  return intersection / (a.size + b.size - intersection);
}

function isRedundantPair(a: string, b: string): boolean {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);

  if (!na || !nb) {
    return false;
  }

  if (na === nb) {
    return true;
  }

  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;

  if (longer.includes(shorter) && shorter.length / longer.length >= 0.65) {
    return true;
  }

  return jaccard(tokenSet(a), tokenSet(b)) >= 0.65;
}

function isNegationOnlyDefinition(text: string): boolean {
  const trimmed = text.trim();

  if (!NEGATION_ONLY_OPENERS.test(trimmed) && !/\bce n['']est pas\b/i.test(trimmed)) {
    return false;
  }

  const withoutLeadingNeg = trimmed
    .replace(NEGATION_ONLY_OPENERS, "")
    .replace(/\bce n['']est pas[^.!?;]*/gi, "")
    .replace(/\bil ne s['']agit pas[^.!?;]*/gi, "")
    .trim();

  const hasPositive =
    /\b(c['']est\b|il s['']agit\b|indique\b|marque\b|signifie\b|correspond\b|égale?\b)/i.test(
      withoutLeadingNeg,
    ) ||
    CONCRETE_FACT_PATTERNS.some((pattern) => pattern.test(withoutLeadingNeg));

  return !hasPositive;
}

function hasMetaphor(text: string): boolean {
  return METAPHOR_PATTERNS.some((pattern) => pattern.test(text));
}

function hasConcreteGrammaticalNaming(fact: string): boolean {
  return CONCRETE_FACT_PATTERNS.some((pattern) => pattern.test(fact));
}

function axesInText(text: string): string[] {
  return AXIS_PATTERNS.filter((axis) =>
    axis.patterns.some((pattern) => pattern.test(text)),
  ).map((axis) => axis.id);
}

/**
 * Axes qui CHANGENT dans le contraste.
 * « même présent, personne différente » → un seul axe (personne).
 * Les axes tenus constants (« même X ») sont ignorés.
 */
function changingAxesInText(text: string): string[] {
  const withoutConstants = text
    .replace(
      /\bmême[^\s,;.]*\s+(présent|passé|futur|temps|personne|aspect|cas|genre|singulier|pluriel|conjugaison)[^\s,;.]*/gi,
      " ",
    )
    .replace(
      /\b(présent|passé|futur|temps|personne|aspect|cas|genre)\s+identiques?\b/gi,
      " ",
    );

  return axesInText(withoutConstants);
}

function hasCyrillic(text: string): boolean {
  return /[а-яёА-ЯЁіІїЇєЄґҐ]/.test(text);
}

function isArrowOrDecoration(node: string): boolean {
  const trimmed = node.trim();

  return !trimmed || ARROW_ONLY.test(trimmed) || /^[→←⇄↓↑↔]$/u.test(trimmed);
}

function checkVisualPadding(
  visual: TTeachingVisual | null | undefined,
  issues: TTeachingScenarioIssue[],
): void {
  if (!visual?.nodes?.length) {
    return;
  }

  const substantive = visual.nodes.filter(
    (node) => !isArrowOrDecoration(node) && node.trim().length > 0,
  );
  const cyrillic = substantive.filter((node) => hasCyrillic(node));
  const arrowish = visual.nodes.filter((node) => isArrowOrDecoration(node));

  if (cyrillic.length < 2 && substantive.length < 2) {
    issues.push({
      severity: "error",
      code: "SCENARIO_VISUAL_EMPTY",
      message:
        "Visual sans données concrètes — omettre le slot plutôt que meubler",
      field: "visual",
    });
    return;
  }

  // Flèches entre deux formes ≠ paradigme / tableau
  if (
    arrowish.length > 0 &&
    cyrillic.length <= 2 &&
    substantive.length <= 2
  ) {
    issues.push({
      severity: "error",
      code: "SCENARIO_VISUAL_ARROWS_ONLY",
      message:
        "Des flèches entre deux formes ne sont pas un visuel — omettre le slot",
      field: "visual",
    });
  }
}

function checkContrastAxes(
  contrast: TTeachingComparison[],
  issues: TTeachingScenarioIssue[],
): void {
  for (const [index, item] of contrast.entries()) {
    const axes = changingAxesInText(item.explanation ?? "");

    if (axes.length > 1) {
      issues.push({
        severity: "error",
        code: "SCENARIO_CONTRAST_MULTI_AXIS",
        message: `Contraste[${index}] change plusieurs axes (${axes.join(", ")}) — un seul axe autorisé`,
        field: `contrast[${index}]`,
      });
    }
  }
}

function checkRedundancy(
  slots: Array<{ field: string; text: string | undefined }>,
  issues: TTeachingScenarioIssue[],
): void {
  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      const left = slots[i];
      const right = slots[j];

      if (!left?.text?.trim() || !right?.text?.trim()) {
        continue;
      }

      if (isRedundantPair(left.text, right.text)) {
        issues.push({
          severity: "error",
          code: "SCENARIO_REDUNDANCY",
          message: `Redondance entre ${left.field} et ${right.field} — omettre le doublon`,
          field: right.field,
        });
      }
    }
  }
}

function warnEncyclopedic(
  value: string | undefined,
  field: string,
  issues: TTeachingScenarioIssue[],
): void {
  const text = value?.trim();

  if (!text) {
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
}

/**
 * Quality Gate anti-meublage.
 * Un slot absent est SAIN. Un slot rempli de vide / doublon / négation est rejeté.
 */
export function validateTeachingScenarioContent(
  content: TTeachingScenarioContent,
  _conceptId?: string,
): TTeachingScenarioQualityReport {
  const issues: TTeachingScenarioIssue[] = [];
  const normalized = normalizeTeachingScenarioContent(content);

  if (!normalized.fact) {
    issues.push({
      severity: "error",
      code: "SCENARIO_FACT_MISSING",
      message: "Fact absent — le fait grammatical doit être nommé tôt",
      field: "fact",
    });
  } else {
    if (!hasConcreteGrammaticalNaming(normalized.fact)) {
      issues.push({
        severity: "error",
        code: "SCENARIO_FACT_VAGUE",
        message:
          "Fact vague — nommer concrètement la forme (terminaison, personne, cas, aspect…)",
        field: "fact",
      });
    }

    if (isNegationOnlyDefinition(normalized.fact)) {
      issues.push({
        severity: "error",
        code: "SCENARIO_NEGATION_ONLY",
        message:
          "Définition par la négation sans énoncé positif — dire ce que c'est",
        field: "fact",
      });
    }

    if (countWords(normalized.fact) > MAX_FACT_WORDS) {
      issues.push({
        severity: "warning",
        code: "SCENARIO_FACT_TOO_LONG",
        message: `Fact trop long (${countWords(normalized.fact)} mots) — max ${MAX_FACT_WORDS}`,
        field: "fact",
      });
    }

    warnEncyclopedic(normalized.fact, "fact", issues);
  }

  if (!normalized.contrast.length) {
    issues.push({
      severity: "error",
      code: "SCENARIO_CONTRAST_MISSING",
      message: "Contrast absent — un contraste minimal sur un seul axe est requis",
      field: "contrast",
    });
  } else {
    checkContrastAxes(normalized.contrast, issues);
  }

  if (!normalized.memoryAnchor.trim()) {
    issues.push({
      severity: "error",
      code: "SCENARIO_MEMORY_MISSING",
      message: "memoryAnchor absent",
      field: "memoryAnchor",
    });
  } else {
    if (
      hasMetaphor(normalized.memoryAnchor) &&
      !hasMetaphor(normalized.fact)
    ) {
      issues.push({
        severity: "error",
        code: "SCENARIO_MEMORY_NEW_METAPHOR",
        message:
          "memoryAnchor introduit une métaphore absente du fact — reformuler le fact uniquement",
        field: "memoryAnchor",
      });
    } else if (
      normalized.fact &&
      !hasMetaphor(normalized.memoryAnchor) &&
      jaccard(tokenSet(normalized.memoryAnchor), tokenSet(normalized.fact)) < 0.12
    ) {
      issues.push({
        severity: "warning",
        code: "SCENARIO_MEMORY_NOT_REFORMULATION",
        message: "memoryAnchor devrait reformuler le fact",
        field: "memoryAnchor",
      });
    }
  }

  if (normalized.intuition && isNegationOnlyDefinition(normalized.intuition)) {
    issues.push({
      severity: "error",
      code: "SCENARIO_NEGATION_ONLY",
      message: "Intuition définie seulement par la négation — omettre ou reformuler",
      field: "intuition",
    });
  }

  if (
    normalized.commonMistake &&
    isNegationOnlyDefinition(normalized.commonMistake) &&
    !/\b(éviter|ne dis pas|erreur)\b/i.test(normalized.commonMistake)
  ) {
    // commonMistake often starts with "Ne confonds pas" — that's OK if it states the positive fix
    if (!hasConcreteGrammaticalNaming(normalized.commonMistake)) {
      issues.push({
        severity: "error",
        code: "SCENARIO_NEGATION_ONLY",
        message: "Erreur fréquente sans correction positive nommée",
        field: "commonMistake",
      });
    }
  }

  checkVisualPadding(normalized.visual, issues);

  checkRedundancy(
    [
      { field: "hook", text: normalized.hook },
      { field: "question", text: normalized.question },
      { field: "intuition", text: normalized.intuition },
      { field: "fact", text: normalized.fact },
    ],
    issues,
  );

  warnEncyclopedic(normalized.hook, "hook", issues);
  warnEncyclopedic(normalized.intuition, "intuition", issues);

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}

export function validateTeachingScenario(
  scenario: TTeachingScenario,
): TTeachingScenarioQualityReport {
  const content: TTeachingScenarioContent = {
    fact: scenario.fact,
    contrast: scenario.contrast,
    memoryAnchor: scenario.memoryAnchor,
    hook: scenario.hook,
    question: scenario.question,
    intuition: scenario.intuition,
    visual: scenario.visual,
    commonMistake: scenario.commonMistake,
    reuse: scenario.reuse,
  };

  const report = validateTeachingScenarioContent(content, scenario.conceptId);

  if (!scenario.encounteredForm?.trim()) {
    report.issues.push({
      severity: "error",
      code: "SCENARIO_ENCOUNTERED_FORM_MISSING",
      message: "encounteredForm absent",
      field: "encounteredForm",
    });
    report.valid = false;
  }

  return report;
}
