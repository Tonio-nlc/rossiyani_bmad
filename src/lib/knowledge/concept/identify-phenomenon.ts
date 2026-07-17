import type { TLinguisticPhenomenon } from "@/types/concept-lesson";
import type { TResolvedConceptGraph } from "@/types/linguistic-concept";

export function phenomenonFromGraph(
  graph: TResolvedConceptGraph,
): TLinguisticPhenomenon {
  return {
    id: graph.primary.id,
    title: graph.primary.title,
    priority: 100,
  };
}
