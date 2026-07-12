export { buildKnowledge } from "@/lib/knowledge/build-knowledge";
export { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
export { composeLearningCard } from "@/lib/knowledge/pedagogy/compose-learning-card";
export {
  buildProfileExploreBlocks,
  buildProfileFromKnowledge,
  buildProfileTraitChips,
  extractProfileVariants,
} from "@/lib/knowledge/profile-views";
export {
  ensureKnowledgeExists,
  getKnowledgeByLemmaId,
} from "@/lib/knowledge/get-knowledge";
export {
  createEmptyKnowledge,
  upsertKnowledge,
} from "@/lib/knowledge/upsert-knowledge";
