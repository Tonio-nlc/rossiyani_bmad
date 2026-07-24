import type {
  TTeachingIllustrationVariant,
  TTeachingScenarioContent,
  TTeachingVisual,
} from "@/types/teaching-scenario";

export interface TIllustrationContextHint {
  preposition?: string | null;
  governedCase?: string | null;
}

const ILLUSTRATION_CAPTION_PREFIX = "Illustration — ";

/** Uniformise les légendes de schéma : toujours préfixées « Illustration — ». */
export function ensureIllustrationCaption(
  caption: string | undefined | null,
): string | undefined {
  const trimmed = caption?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^illustration\s*[—–-]/i.test(trimmed)) {
    const rest = trimmed.replace(/^illustration\s*[—–-]\s*/i, "").trim();
    return rest ? `${ILLUSTRATION_CAPTION_PREFIX}${rest}` : ILLUSTRATION_CAPTION_PREFIX.trim();
  }

  return `${ILLUSTRATION_CAPTION_PREFIX}${trimmed}`;
}

function withCaption(visual: TTeachingVisual | null | undefined): TTeachingVisual | null | undefined {
  if (!visual) {
    return visual;
  }

  return {
    ...visual,
    caption: ensureIllustrationCaption(visual.caption),
  };
}

function stripPrep(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .toLowerCase()
    .trim();
}

function scoreVariant(
  variant: TTeachingIllustrationVariant,
  hint: TIllustrationContextHint,
): number {
  const prep = hint.preposition ? stripPrep(hint.preposition) : "";
  const governedCase = hint.governedCase?.toLowerCase().trim() ?? "";

  let score = 0;

  const prepMatch =
    Boolean(prep) &&
    Boolean(variant.prepositions?.some((item) => stripPrep(item) === prep));
  const caseMatch =
    Boolean(governedCase) &&
    Boolean(variant.cases?.some((item) => item === governedCase));

  if (prepMatch && caseMatch) {
    score = 100;
  } else if (prepMatch) {
    score = 80;
  } else if (caseMatch) {
    score = 60;
  }

  return score;
}

/**
 * Applique la variante d'illustration la plus pertinente, sinon le contenu défaut.
 * Légendes visual toujours préfixées « Illustration — ».
 */
export function applyIllustrationContext(
  content: TTeachingScenarioContent,
  hint?: TIllustrationContextHint | null,
): TTeachingScenarioContent {
  const variants = content.illustrationVariants ?? [];
  let selected: TTeachingIllustrationVariant | null = null;

  if (hint && variants.length > 0) {
    let bestScore = 0;

    for (const variant of variants) {
      const score = scoreVariant(variant, hint);

      if (score > bestScore) {
        bestScore = score;
        selected = variant;
      }
    }
  }

  const base: TTeachingScenarioContent = selected
    ? {
        ...content,
        fact: selected.fact ?? content.fact,
        contrast: selected.contrast ?? content.contrast,
        visual: selected.visual ?? content.visual,
        commonMistake: selected.commonMistake ?? content.commonMistake,
        reuse: selected.reuse ?? content.reuse,
        memoryAnchor: selected.memoryAnchor ?? content.memoryAnchor,
      }
    : content;

  return {
    ...base,
    visual: withCaption(base.visual) ?? undefined,
    illustration: base.illustration
      ? {
          ...base.illustration,
          visual: withCaption(base.illustration.visual) ?? undefined,
        }
      : base.illustration,
  };
}
