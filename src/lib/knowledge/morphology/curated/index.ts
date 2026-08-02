/**
 * Morphologie curée (écrit à la main).
 * validé manuellement — ne pas générer par LLM
 */

export {
  CURATED_ADJECTIVES,
  CURATED_AGREEMENT_NOUNS,
  CURATED_ANNA,
  CURATED_AUDITORIYA,
  CURATED_CHITAT,
  CURATED_DELAT,
  CURATED_EXAMPLE_PHRASES,
  CURATED_GOVORIT,
  CURATED_KARTA,
  CURATED_KNIGA,
  CURATED_MOSKVA,
  CURATED_MOTION,
  CURATED_NAJTI_PAST,
  CURATED_NOUNS_GENDER,
  CURATED_OKNO_CASES,
  CURATED_PISAT,
  CURATED_POSSESSIVE,
  CURATED_PREP_GOVERNMENT_EXAMPLES,
  CURATED_PRESENT_SG2,
  CURATED_PROCHITAT,
  CURATED_SLUCHITSYA_PAST,
  CURATED_STOL,
  CURATED_UNIVERSITET,
  CURATED_VRACH,
} from "./forms";

export {
  CURATED_BOLET_HURT,
  CURATED_CHITAT_PRESENT,
  CURATED_GOVORIT_PRESENT,
  CURATED_NAJTI_PRESENT,
  CURATED_POJTI_PRESENT,
  CURATED_PRESENT_VERBS,
  CURATED_SLUCHITSYA,
  buildPresentVisualNodes,
  getAllowedPresentEntries,
  getCuratedPastTenseSuffix,
  getCuratedPresentVerb,
  inferPresentPersonFromSurface,
  isDefectivePresentVerb,
  isDeterministicVerbForRoleClear,
  personKeyToChipLabel,
  personKeyToFrench,
  resolveCuratedLemmaFromSurface,
  stripStressMarks,
  type TCuratedVerbDefectivity,
  type TCuratedVerbPresent,
  type TPresentPersonInfo,
  type TPresentPersonKey,
} from "./present-verbs";

export {
  CURATED_INVARIABLE_WORDS,
  isCuratedInvariableSurface,
} from "./invariable-words";

export { composePresentConjugationDemo } from "./compose-present-conjugation-demo";

export {
  CURATED_PREPOSITION_GOVERNMENT,
  getPrepositionGovernmentEntry,
  type TGovernedCase,
  type TPrepositionGovernmentEntry,
} from "./preposition-government";

export {
  detectPrepositionGovernment,
  getPrecedingNormalizedToken,
  getPrecedingPrepositionEntry,
  inferMorphologicalCaseFromParadigms,
  normalizeGovernedCaseLabel,
  type TDetectedPrepositionGovernment,
} from "./detect-preposition-government";

export {
  CURATED_PRONOUNS,
  findPronounLemmaForCase,
  getPronounCaseCandidates,
  isCuratedPronounSurface,
  NEVER_POSSESSIVE_PRONOUN_HINT,
  type TPronounCase,
  type TPronounParadigm,
} from "./pronouns";

export {
  CURATED_FIXED_EXPRESSIONS,
  findCuratedFixedExpression,
  type TCuratedFixedExpression,
} from "./fixed-expressions";

export {
  CURATED_GENITIVE_GOVERNING_NUMERALS,
  isCuratedGenitiveGoverningNumeral,
} from "./genitive-numerals";
