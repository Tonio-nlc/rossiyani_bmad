import type { TLinguisticKnowledge } from "@/types/knowledge";
import { KNOWLEDGE_PROFILE_VERSION } from "@/types/knowledge";

export function isKnowledgeComplete(knowledge: TLinguisticKnowledge): boolean {
  return knowledge.validated === true;
}

export function isKnowledgeEnriched(knowledge: TLinguisticKnowledge): boolean {
  return (
    knowledge.validated === true &&
    knowledge.profileVersion >= KNOWLEDGE_PROFILE_VERSION
  );
}
