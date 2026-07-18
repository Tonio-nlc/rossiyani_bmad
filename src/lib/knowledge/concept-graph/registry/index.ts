import type { TLinguisticConcept } from "@/types/linguistic-concept";

import { SEED_TEACHING_SCENARIOS } from "@/lib/knowledge/teaching-engine/seed-teaching-scenarios";
import { validateTeachingScenarioContent } from "@/lib/knowledge/teaching-engine/scenario-quality-rules";

import { SEED_LINGUISTIC_CONCEPTS } from "./seed-concepts";

function enrichConceptWithScenario(concept: TLinguisticConcept): TLinguisticConcept {
  const teachingScenario =
    concept.teachingScenario ?? SEED_TEACHING_SCENARIOS[concept.id];

  if (!teachingScenario) {
    return concept;
  }

  return { ...concept, teachingScenario };
}

const ENRICHED_CONCEPTS = SEED_LINGUISTIC_CONCEPTS.map(enrichConceptWithScenario);

for (const concept of ENRICHED_CONCEPTS) {
  if (!concept.teachingScenario) {
    continue;
  }

  const report = validateTeachingScenarioContent(
    concept.teachingScenario,
    concept.id,
  );

  if (!report.valid && process.env.NODE_ENV !== "production") {
    console.warn(
      `[Teaching Engine] Scénario rejeté (anti-meublage): ${concept.id}`,
      report.issues,
    );
  }
}

const byId = new Map<string, TLinguisticConcept>();
const bySlug = new Map<string, TLinguisticConcept>();

for (const concept of ENRICHED_CONCEPTS) {
  byId.set(concept.id, concept);
  bySlug.set(concept.slug, concept);
}

export function getConceptById(id: string): TLinguisticConcept | null {
  return byId.get(id) ?? null;
}

export function getConceptBySlug(slug: string): TLinguisticConcept | null {
  return bySlug.get(slug) ?? null;
}

export function getAllConcepts(): TLinguisticConcept[] {
  return [...ENRICHED_CONCEPTS];
}

export function getConceptsByIds(ids: string[]): TLinguisticConcept[] {
  return ids
    .map((id) => byId.get(id))
    .filter((concept): concept is TLinguisticConcept => Boolean(concept));
}

export function isKnownConceptId(id: string): boolean {
  return byId.has(id);
}
