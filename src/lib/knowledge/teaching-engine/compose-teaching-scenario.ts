import type { TLinguisticConcept } from "@/types/linguistic-concept";
import type {
  TTeachingNextConcept,
  TTeachingScenario,
  TTeachingScenarioContent,
} from "@/types/teaching-scenario";

import { SEED_TEACHING_SCENARIOS } from "./seed-teaching-scenarios";

function buildScenarioFromConcept(
  concept: TLinguisticConcept,
): TTeachingScenarioContent {
  const canonical = concept.canonicalExplanation;

  return {
    hook: concept.whyItExists,
    question: `Pourquoi ${concept.title.toLowerCase()} ?`,
    intuition: concept.mentalModel,
    visual: {
      nodes: concept.visualModel.nodes ?? canonical.scheme,
      layout:
        concept.visualModel.type === "comparison"
          ? "comparison"
          : "vertical",
      caption: concept.visualModel.caption,
    },
    explanation: canonical.understand.slice(0, 2),
    comparison: canonical.contrasts.map((item) => ({
      fromForm: item.fromForm,
      toForm: item.toForm,
      explanation: item.explanation,
    })),
    commonMistake: concept.commonMistakes[0] ?? "",
    reuse: canonical.retentionPoints.slice(0, 2),
    memoryAnchor: concept.mentalModel,
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
): string {
  if (surface && content.hookWithSurface) {
    return content.hookWithSurface.replace("{surface}", surface);
  }

  return content.hook;
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

  return {
    conceptId: input.concept.id,
    conceptSlug: input.concept.slug,
    conceptTitle: input.concept.title,
    hook: personalizeHook(content, input.encounteredForm ?? null),
    question: content.question,
    intuition: content.intuition,
    visual: content.visual,
    explanation: content.explanation.slice(0, 2),
    comparison: content.comparison,
    commonMistake: content.commonMistake,
    reuse: content.reuse,
    memoryAnchor: content.memoryAnchor,
    nextConcept: input.nextConcept ?? null,
  };
}
