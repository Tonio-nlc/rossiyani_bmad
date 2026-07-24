import type { TLinguisticConcept } from "@/types/linguistic-concept";

import { SEED_TEACHING_SCENARIOS } from "@/lib/knowledge/teaching-engine/seed-teaching-scenarios";
import { validateTeachingScenarioContent } from "@/lib/knowledge/teaching-engine/scenario-quality-rules";

import { loadConceptGraphFromDb } from "../load-from-db";
import { setTeachingGraphEdges } from "../teaching-graph";
import { SEED_LINGUISTIC_CONCEPTS } from "./seed-concepts";

function enrichConceptWithScenario(concept: TLinguisticConcept): TLinguisticConcept {
  const teachingScenario =
    concept.teachingScenario ?? SEED_TEACHING_SCENARIOS[concept.id];

  if (!teachingScenario) {
    return concept;
  }

  return { ...concept, teachingScenario };
}

const MEMORY_SEED = SEED_LINGUISTIC_CONCEPTS.map(enrichConceptWithScenario);

for (const concept of MEMORY_SEED) {
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

let activeConcepts: TLinguisticConcept[] = MEMORY_SEED;
let byId = new Map<string, TLinguisticConcept>();
let bySlug = new Map<string, TLinguisticConcept>();

function rebuildIndexes(concepts: TLinguisticConcept[]): void {
  activeConcepts = concepts;
  byId = new Map();
  bySlug = new Map();

  for (const concept of concepts) {
    byId.set(concept.id, concept);
    bySlug.set(concept.slug, concept);
  }
}

rebuildIndexes(MEMORY_SEED);

let hydratePromise: Promise<"db" | "memory"> | null = null;

/**
 * Charge le Concept Graph depuis la DB une fois par process.
 * Repli silencieux sur le registry TypeScript si table vide / absente / erreur.
 */
export async function ensureConceptGraphHydrated(): Promise<"db" | "memory"> {
  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    const { concepts, relations, source } = await loadConceptGraphFromDb();

    if (source !== "db" || concepts.length === 0) {
      return "memory";
    }

    rebuildIndexes(concepts.map(enrichConceptWithScenario));

    if (relations.length > 0) {
      setTeachingGraphEdges(relations);
    }

    return "db";
  })();

  return hydratePromise;
}

export function getConceptById(id: string): TLinguisticConcept | null {
  return byId.get(id) ?? null;
}

export function getConceptBySlug(slug: string): TLinguisticConcept | null {
  return bySlug.get(slug) ?? null;
}

export function getAllConcepts(): TLinguisticConcept[] {
  return [...activeConcepts];
}

export function getConceptsByIds(ids: string[]): TLinguisticConcept[] {
  return ids
    .map((id) => byId.get(id))
    .filter((concept): concept is TLinguisticConcept => Boolean(concept));
}

export function isKnownConceptId(id: string): boolean {
  return byId.has(id);
}
