import type { TConceptGraphEdge } from "@/types/linguistic-concept";

export const TEACHING_GRAPH_EDGES: TConceptGraphEdge[] = [
  { fromId: "verb-imperfective-aspect", toId: "verb-present-conjugation", relation: "prerequisite" },
  { fromId: "verb-perfective-aspect", toId: "verb-imperfective-aspect", relation: "prerequisite" },
  { fromId: "aspect-pairs", toId: "verb-imperfective-aspect", relation: "extends" },
  { fromId: "aspect-pairs", toId: "verb-perfective-aspect", relation: "extends" },
  { fromId: "verb-movement-prefixes", toId: "verb-perfective-aspect", relation: "prerequisite" },
  { fromId: "verbs-of-motion", toId: "verb-movement-prefixes", relation: "prerequisite" },
  { fromId: "verbs-of-motion", toId: "verb-imperfective-aspect", relation: "related" },
  { fromId: "noun-declension", toId: "noun-gender", relation: "prerequisite" },
  { fromId: "noun-animacy", toId: "noun-declension", relation: "extends" },
  { fromId: "adjective-agreement", toId: "noun-gender", relation: "prerequisite" },
  { fromId: "adjective-agreement", toId: "noun-declension", relation: "related" },
  { fromId: "reflexive-possessive", toId: "adjective-agreement", relation: "prerequisite" },
  { fromId: "preposition-government", toId: "noun-declension", relation: "prerequisite" },
];

/** Arêtes actives : seed mémoire, remplacées si la DB fournit des relations. */
let activeEdges: TConceptGraphEdge[] = TEACHING_GRAPH_EDGES;

export function setTeachingGraphEdges(edges: TConceptGraphEdge[]): void {
  activeEdges = edges;
}

export function getTeachingGraphEdges(): TConceptGraphEdge[] {
  return activeEdges;
}

export function getPrerequisiteIds(conceptId: string): string[] {
  return activeEdges
    .filter(
      (edge) => edge.toId === conceptId && edge.relation === "prerequisite",
    )
    .map((edge) => edge.fromId);
}

export function getRelatedConceptIds(conceptId: string): string[] {
  const related = new Set<string>();

  for (const edge of activeEdges) {
    if (edge.fromId === conceptId && edge.relation !== "prerequisite") {
      related.add(edge.toId);
    }

    if (edge.toId === conceptId && edge.relation === "related") {
      related.add(edge.fromId);
    }
  }

  return [...related];
}

export function buildTeachingPath(conceptId: string): string[] {
  const path: string[] = [];
  const visited = new Set<string>();
  const queue = [conceptId];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const prerequisites = getPrerequisiteIds(current);

    for (const prerequisite of prerequisites) {
      if (!visited.has(prerequisite)) {
        queue.push(prerequisite);
      }
    }

    path.push(current);
  }

  return path.reverse();
}
