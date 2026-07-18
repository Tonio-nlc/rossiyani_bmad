import type {
  TTeachingComparison,
  TTeachingScenarioContent,
  TTeachingVisual,
} from "@/types/teaching-scenario";

export interface TNormalizedTeachingContent {
  fact: string;
  contrast: TTeachingComparison[];
  memoryAnchor: string;
  hook?: string;
  hookWithSurface?: string;
  question?: string;
  intuition?: string;
  visual?: TTeachingVisual | null;
  commonMistake?: string;
  reuse?: string[];
}

function trimOrUndefined(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

/**
 * Mappe aliases legacy (explanation / comparison) vers le contrat canonique.
 * N'invente aucun slot conditionnel vide.
 */
export function normalizeTeachingScenarioContent(
  content: TTeachingScenarioContent,
): TNormalizedTeachingContent {
  const fact =
    trimOrUndefined(content.fact) ??
    content.explanation?.map((item) => item.trim()).find(Boolean) ??
    "";

  const contrast =
    content.contrast?.length
      ? content.contrast
      : content.comparison?.length
        ? content.comparison
        : [];

  const visual =
    content.visual && content.visual.nodes.length > 0 ? content.visual : undefined;

  const reuse = content.reuse?.map((item) => item.trim()).filter(Boolean);

  return {
    fact,
    contrast,
    memoryAnchor: content.memoryAnchor.trim(),
    hook: trimOrUndefined(content.hook),
    hookWithSurface: trimOrUndefined(content.hookWithSurface),
    question: trimOrUndefined(content.question),
    intuition: trimOrUndefined(content.intuition),
    visual: visual ?? null,
    commonMistake: trimOrUndefined(content.commonMistake),
    reuse: reuse?.length ? reuse : undefined,
  };
}
