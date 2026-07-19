import type { TLinguisticConcept } from "@/types/linguistic-concept";
import type {
  TTeachingEncounterExample,
  TTeachingNextConcept,
  TTeachingScenario,
  TTeachingScenarioContent,
} from "@/types/teaching-scenario";

import {
  bridgeMentionsForm,
  composeTeachingBridge,
} from "./compose-teaching-bridge";
import { normalizeTeachingScenarioContent } from "./normalize-teaching-scenario";
import { SEED_TEACHING_SCENARIOS } from "./seed-teaching-scenarios";

function hasCyrillic(text: string): boolean {
  return /[а-яёА-ЯЁіІїЇєЄґҐ]/.test(text);
}

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

/** Évite un « À retenir » qui répète « Comprendre ». */
function dedupeMemoryAnchor(fact: string, memoryAnchor: string): string | undefined {
  const na = normalizeForCompare(fact);
  const nb = normalizeForCompare(memoryAnchor);

  if (!nb) {
    return undefined;
  }

  if (na === nb) {
    return undefined;
  }

  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;

  if (longer.includes(shorter) && shorter.length / longer.length >= 0.75) {
    return undefined;
  }

  if (jaccard(tokenSet(fact), tokenSet(memoryAnchor)) >= 0.7) {
    return undefined;
  }

  return memoryAnchor;
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
  lemma: string;
  encounteredForm?: string | null;
  /** Phrase d'origine + raison (explanation_cache). */
  encounterExample?: TTeachingEncounterExample | null;
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

  const encounteredForm =
    input.encounteredForm?.trim() || input.lemma.trim() || null;
  const lemma = input.lemma.trim() || encounteredForm || "";

  if (!encounteredForm) {
    return null;
  }

  const bridge = composeTeachingBridge({
    concept: input.concept,
    lemma,
    encounteredForm,
  });

  if (!bridgeMentionsForm(bridge, encounteredForm)) {
    return null;
  }

  const memoryDeduped = dedupeMemoryAnchor(
    normalized.fact,
    normalized.memoryAnchor,
  );

  const reuse = normalized.reuse?.map((item) => item.trim()).filter(Boolean);

  const encounterExample =
    input.encounterExample?.sentence.trim()
      ? {
          sentence: input.encounterExample.sentence.trim(),
          note: input.encounterExample.note?.trim() || undefined,
          surface: input.encounterExample.surface.trim() || encounteredForm,
        }
      : null;

  return {
    conceptId: input.concept.id,
    conceptSlug: input.concept.slug,
    conceptTitle: input.concept.title,
    encounteredForm,
    bridge,
    encounterExample,
    fact: normalized.fact,
    contrast: normalized.contrast,
    memoryAnchor: memoryDeduped ?? normalized.memoryAnchor,
    showMemoryAnchor: Boolean(memoryDeduped),
    hook: personalizeHook(content, encounteredForm),
    question: normalized.question,
    intuition: normalized.intuition,
    visual: normalized.visual ?? undefined,
    commonMistake: normalized.commonMistake,
    reuse: reuse?.length ? reuse : undefined,
    nextConcept: input.nextConcept ?? null,
  };
}
