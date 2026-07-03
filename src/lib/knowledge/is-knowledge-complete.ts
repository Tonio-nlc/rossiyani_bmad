import type { TLinguisticKnowledge } from "@/types/knowledge";

export function isKnowledgeComplete(knowledge: TLinguisticKnowledge): boolean {
  return knowledge.validated === true;
}
