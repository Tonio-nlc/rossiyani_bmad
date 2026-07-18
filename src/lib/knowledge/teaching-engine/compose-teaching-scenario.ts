import type { TLinguisticConcept } from "@/types/linguistic-concept";
import type {
  TTeachingNextConcept,
  TTeachingScenario,
  TTeachingScenarioContent,
} from "@/types/teaching-scenario";

import { normalizeTeachingScenarioContent } from "./normalize-teaching-scenario";
import { SEED_TEACHING_SCENARIOS } from "./seed-teaching-scenarios";

function hasCyrillic(text: string): boolean {
  return /[а-яёА-ЯЁіІїЇєЄґҐ]/.test(text);
}

/**
 * Fallback concept → scénario minimal (pas de meublage).
 * Slots conditionnels omis s'ils n'apportent rien de solide.
 */
function buildScenarioFromConcept(
  concept: TLinguisticConcept,
): TTeachingScenarioContent {
  const canonical = concept.canonicalExplanation;
  const fact =
    canonical.understand.find((item) => item.trim())?.trim() ??
    concept.coreIdea.trim();

  const contrast = canonical.contrasts.map((item) => ({
    fromForm: item.fromForm,
    toForm: item.toForm,
    explanation: item.explanation,
  }));

  const rawNodes = concept.visualModel.nodes ?? canonical.scheme ?? [];
  const cyrillicNodes = rawNodes.filter((node) => hasCyrillic(node));
  const visual =
    cyrillicNodes.length >= 3
      ? {
          nodes: rawNodes,
          layout:
            concept.visualModel.type === "comparison"
              ? ("comparison" as const)
              : ("vertical" as const),
          caption: concept.visualModel.caption,
        }
      : undefined;

  const commonMistake = concept.commonMistakes[0]?.trim();
  const retention = canonical.retentionPoints
    .map((item) => item.trim())
    .find(Boolean);

  return {
    fact,
    contrast: contrast.length > 0 ? contrast : undefined,
    memoryAnchor: retention && !/\bpense à\b/i.test(retention) ? retention : fact,
    visual,
    commonMistake: commonMistake || undefined,
    reuse: canonical.retentionPoints.slice(0, 2).filter(Boolean),
  };
}

export function getTeachingScenarioContent(
  concept: TLinguisticConcept,
): TTeachingScenarioContent | null {
  const seeded = SEED_TEACHING_SCENARIOS[concept.id];

  if (seeded) {
    return seeded;
  }

  if (concept.teachingScenario) {
    return concept.teachingScenario;
  }

  return buildScenarioFromConcept(concept);
}

function personalizeHook(
  content: TTeachingScenarioContent,
  surface: string | null,
): string | undefined {
  if (surface && content.hookWithSurface?.trim()) {
    return content.hookWithSurface.replace("{surface}", surface);
  }

  const hook = content.hook?.trim();

  return hook || undefined;
}

export interface TComposeTeachingScenarioInput {
  concept: TLinguisticConcept;
  encounteredForm?: string | null;
  nextConcept?: TTeachingNextConcept | null;
}

export function composeTeachingScenario(
  input: TComposeTeachingScenarioInput,
): TTeachingScenario | null {
  const content = getTeachingScenarioContent(input.concept);

  if (!content) {
    return null;
  }

  const normalized = normalizeTeachingScenarioContent(content);

  if (!normalized.fact || normalized.contrast.length === 0) {
    return null;
  }

  return {
    conceptId: input.concept.id,
    conceptSlug: input.concept.slug,
    conceptTitle: input.concept.title,
    encounteredForm: input.encounteredForm?.trim() || null,
    fact: normalized.fact,
    contrast: normalized.contrast,
    memoryAnchor: normalized.memoryAnchor,
    hook: personalizeHook(content, input.encounteredForm ?? null),
    question: normalized.question,
    intuition: normalized.intuition,
    visual: normalized.visual ?? undefined,
    commonMistake: normalized.commonMistake,
    reuse: normalized.reuse,
    nextConcept: input.nextConcept ?? null,
  };
}
