/**
 * Morphologie curée (écrit à la main).
 * validé manuellement — ne pas générer par LLM
 */

export {
  CURATED_ADJECTIVES,
  CURATED_AGREEMENT_NOUNS,
  CURATED_CHITAT,
  CURATED_DELAT,
  CURATED_EXAMPLE_PHRASES,
  CURATED_GOVORIT,
  CURATED_KNIGA,
  CURATED_MOSKVA,
  CURATED_MOTION,
  CURATED_NOUNS_GENDER,
  CURATED_PISAT,
  CURATED_POSSESSIVE,
  CURATED_PREP_GOVERNMENT_EXAMPLES,
  CURATED_PRESENT_SG2,
  CURATED_PROCHITAT,
  CURATED_STOL,
} from "./forms";

export {
  CURATED_BOLET_HURT,
  CURATED_CHITAT_PRESENT,
  CURATED_GOVORIT_PRESENT,
  CURATED_POJTI_PRESENT,
  CURATED_PRESENT_VERBS,
  CURATED_SLUCHITSYA,
  buildPresentVisualNodes,
  getAllowedPresentEntries,
  getCuratedPresentVerb,
  inferPresentPersonFromSurface,
  isDefectivePresentVerb,
  personKeyToChipLabel,
  personKeyToFrench,
  resolveCuratedLemmaFromSurface,
  stripStressMarks,
  type TCuratedVerbDefectivity,
  type TCuratedVerbPresent,
  type TPresentPersonInfo,
  type TPresentPersonKey,
} from "./present-verbs";

export { composePresentConjugationDemo } from "./compose-present-conjugation-demo";

export {
  CURATED_PREPOSITION_GOVERNMENT,
  getPrepositionGovernmentEntry,
  type TGovernedCase,
  type TPrepositionGovernmentEntry,
} from "./preposition-government";

export {
  detectPrepositionGovernment,
  inferMorphologicalCaseFromParadigms,
  normalizeGovernedCaseLabel,
  type TDetectedPrepositionGovernment,
} from "./detect-preposition-government";
