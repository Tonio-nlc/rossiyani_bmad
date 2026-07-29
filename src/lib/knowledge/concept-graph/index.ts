export {
  ensureConceptGraphHydrated,
  getAllConcepts,
  getConceptById,
  getConceptBySlug,
  getConceptsByIds,
  isKnownConceptId,
} from "./registry";
export { NO_CONCEPT_ID, resolveConceptGraph } from "./resolve-concept-graph";
export {
  detectReliableCase,
  deriveInstrumentRoleOverride,
  derivePronounRoleOverride,
  INSTRUMENT_FUNCTIONAL_ROLE,
  INSTRUMENT_FUNCTION_COLOR,
  resolveReaderConcept,
  resolveReaderConceptFromSignals,
  type TInstrumentRoleOverrideInput,
  type TPronounRoleOverrideInput,
} from "./resolve-reader-concept";
export {
  buildTeachingPath,
  getPrerequisiteIds,
  getRelatedConceptIds,
  getTeachingGraphEdges,
} from "./teaching-graph";
export { matchConceptSignals, buildLemmaConceptLinks, listSignalRuleConceptIds } from "./match-signals";
export {
  applyPedagogicalHierarchy,
  isMotionVerbLemma,
  familyOfConcept,
  FAMILY_PRIORITY,
  FRAGILE_SCORE_PAIRS,
} from "./pedagogical-hierarchy";
export {
  CASE_CONCEPT_BY_CASE,
  disambiguateCase,
  inferMorphologicalCase,
  resolveCaseConceptId,
} from "./case-concept-routing";
export {
  auditOrphanConcepts,
  formatOrphanConceptsMarkdown,
} from "./orphan-concepts";
export { loadConceptGraphFromDb } from "./load-from-db";
