export { buildKnowledge } from "@/lib/knowledge/build-knowledge";
export { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
export { composeLearningCard } from "@/lib/knowledge/pedagogy/compose-learning-card";
export { composeConceptLesson } from "@/lib/knowledge/concept/compose-concept-lesson";
export {
  getAllConcepts,
  getConceptById,
  getConceptBySlug,
  resolveConceptGraph,
  resolveReaderConcept,
  resolveReaderConceptFromSignals,
} from "@/lib/knowledge/concept-graph";
export {
  composeTeachingScenario,
  validateTeachingScenario,
  validateTeachingScenarioContent,
  validateConceptCatalog,
} from "@/lib/knowledge/teaching-engine";
export { LinguisticIntegrityError, assertLearningCardIntegrityStrict } from "@/lib/knowledge/pedagogy/integrity/integrity-gate";
export { getPedagogicalStrategy } from "@/lib/knowledge/pedagogy/strategy/strategies";
export {
  buildProfileExploreBlocks,
  buildProfileFromKnowledge,
  buildProfileTraitChips,
  extractProfileVariants,
} from "@/lib/knowledge/profile-views";
export {
  ensureKnowledgeExists,
  getKnowledgeByLemmaId,
  getKnowledgeForConceptResolution,
} from "@/lib/knowledge/get-knowledge";
export {
  createEmptyKnowledge,
  upsertKnowledge,
} from "@/lib/knowledge/upsert-knowledge";
