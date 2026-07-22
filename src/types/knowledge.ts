export type TKnowledgeDifficulty = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TKnowledgeGeneratedBy = "manual" | "llm" | "import" | "migration";

export type TKnowledgePartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "pronoun"
  | "particle";

export type TKnowledgeGender = "m" | "f" | "n";

export type TKnowledgeAspect = "imperfective" | "perfective";

export type TKnowledgeAnimacy = "animate" | "inanimate";

export interface TKnowledgeFormEntry {
  label: string;
  form: string;
}

export interface TKnowledgeAspectPair {
  imperfective: string | null;
  perfective: string | null;
}

export interface TKnowledgePluralInfo {
  form: string | null;
  irregular?: boolean;
  notes?: string | null;
}

export interface TKnowledgePreverb {
  prefix: string;
  verb: string;
  meaning?: string | null;
}

export interface TKnowledgeGovernedCase {
  grammaticalCase: string;
  meaning?: string | null;
  examples?: string[];
}

export interface TKnowledgeMorphology {
  gender?: TKnowledgeGender | string | null;
  animacy?: TKnowledgeAnimacy | string | null;
  declensionClass?: string | null;
  plural?: TKnowledgePluralInfo | null;
  irregularities?: string[];
  caseParadigm?: TKnowledgeFormEntry[];
  aspect?: TKnowledgeAspect | string | null;
  aspectPair?: TKnowledgeAspectPair | null;
  conjugationClass?: string | null;
  conjugationParadigm?: TKnowledgeFormEntry[];
  tense?: string | null;
  person?: string | null;
  voice?: string | null;
  movementType?: string | null;
  preverbs?: TKnowledgePreverb[];
  agreement?: string | null;
  comparative?: string | null;
  superlative?: string | null;
  shortForm?: string | null;
  declension?: string | null;
  pronounType?: string | null;
  pronounParadigm?: TKnowledgeFormEntry[];
  specialForms?: TKnowledgeFormEntry[];
  governedCases?: TKnowledgeGovernedCase[];
  variants?: string[];
  nuances?: string[];
  /**
   * Verbe défectif : paradigme incomplet pour ce sens
   * (ex. болеть « avoir mal » → 3e personne seulement).
   */
  defective?: boolean | null;
  defectiveNote?: string | null;
}

export interface TKnowledgeSyntax {
  government?: string[];
  requiredCase?: string | null;
  compatibleCases?: string[];
  constructionPatterns?: string[];
  requiresInfinitive?: boolean;
  takesObject?: boolean;
  movementPattern?: string | null;
  reflexive?: boolean;
  impersonal?: boolean;
  transitivity?: string | null;
}

export interface TKnowledgeErrorPair {
  wrong: string;
  correct: string;
}

export interface TKnowledgeSemantics {
  semanticCategory?: string | null;
  coreMeaning?: string | null;
  extendedMeaning?: string | null;
  register?: string | null;
  frequency?: string | null;
  collocations?: string[];
  falseFriends?: TKnowledgeErrorPair[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface TKnowledgeWhatIfComparison {
  fromForm: string;
  toForm: string;
  explanation: string;
}

export interface TKnowledgeConceptContrast {
  fromForm: string;
  toForm: string;
  question?: string | null;
  explanation: string;
}

export interface TKnowledgeConceptMiniTable {
  title: string;
  rows: Array<{ label: string; form: string }>;
}

export interface TKnowledgeConcept {
  phenomenonId?: string | null;
  phenomenonTitle: string;
  priority?: number | null;
  understand?: string[];
  scheme?: string[];
  contrasts?: TKnowledgeConceptContrast[];
  miniTable?: TKnowledgeConceptMiniTable | null;
  retentionPoints?: string[];
  family?: string[];
}

export interface TKnowledgeTeaching {
  whyNotBaseForm?: string | null;
  russianExpresses?: string | null;
  visibleSignal?: string | null;
  whatIfComparisons?: TKnowledgeWhatIfComparison[];
  retentionPoints?: string[];
}

export interface TKnowledgePedagogy {
  summary?: string | null;
  takeaway?: string | null;
  takeaways?: string[];
  commonPatterns?: string[];
  nextForms?: string[];
  understandingPoints?: string[];
  commonErrors?: TKnowledgeErrorPair[];
  confusions?: string[];
  tips?: string[];
  progression?: TKnowledgeDifficulty | string | null;
  relatedConcepts?: string[];
  teaching?: TKnowledgeTeaching;
  concept?: TKnowledgeConcept;
}

export interface TKnowledgeParadigms {
  forms?: TKnowledgeFormEntry[];
  cases?: TKnowledgeFormEntry[];
  conjugation?: TKnowledgeFormEntry[];
}

export const EMPTY_KNOWLEDGE_MORPHOLOGY: TKnowledgeMorphology = {};
export const EMPTY_KNOWLEDGE_SYNTAX: TKnowledgeSyntax = {};
export const EMPTY_KNOWLEDGE_SEMANTICS: TKnowledgeSemantics = {};
export const EMPTY_KNOWLEDGE_PEDAGOGY: TKnowledgePedagogy = {};
export const EMPTY_KNOWLEDGE_PARADIGMS: TKnowledgeParadigms = {};

export const KNOWLEDGE_PROFILE_VERSION = 2;

export interface TLinguisticKnowledge {
  id: string;
  lemmaId: string;
  partOfSpeech: TKnowledgePartOfSpeech | string | null;
  gender: TKnowledgeGender | string | null;
  aspect: TKnowledgeAspect | string | null;
  stress: string | null;
  movementType: string | null;
  government: string | null;
  semanticCategory: string | null;
  frequencyRank: number | null;
  register: string | null;
  difficulty: TKnowledgeDifficulty | string | null;
  tags: string[];
  notes: string | null;
  generatedBy: TKnowledgeGeneratedBy | string | null;
  validated: boolean;
  morphology: TKnowledgeMorphology;
  syntax: TKnowledgeSyntax;
  semantics: TKnowledgeSemantics;
  pedagogy: TKnowledgePedagogy;
  paradigms: TKnowledgeParadigms;
  profileVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface TLinguisticProfile {
  lemmaId: string;
  partOfSpeech: string | null;
  gender: string | null;
  aspect: string | null;
  movementType: string | null;
  morphology: TKnowledgeMorphology;
  syntax: TKnowledgeSyntax;
  semantics: TKnowledgeSemantics;
  pedagogy: TKnowledgePedagogy;
  paradigms: TKnowledgeParadigms;
  profileVersion: number;
}

export interface TKnowledgeUpsertInput {
  lemmaId: string;
  partOfSpeech?: string | null;
  gender?: string | null;
  aspect?: string | null;
  stress?: string | null;
  movementType?: string | null;
  government?: string | null;
  semanticCategory?: string | null;
  frequencyRank?: number | null;
  register?: string | null;
  difficulty?: string | null;
  tags?: string[];
  notes?: string | null;
  generatedBy?: string | null;
  validated?: boolean;
  morphology?: TKnowledgeMorphology;
  syntax?: TKnowledgeSyntax;
  semantics?: TKnowledgeSemantics;
  pedagogy?: TKnowledgePedagogy;
  paradigms?: TKnowledgeParadigms;
  profileVersion?: number;
}

export interface TKnowledgeLlmPayload {
  partOfSpeech: string;
  gender: TKnowledgeGender | null;
  aspect: TKnowledgeAspect | null;
  movementType: string | null;
  government: string[];
  semanticCategory: string | null;
  register: string | null;
  difficulty: string;
  notes: string;
  tags: string[];
  morphology: TKnowledgeMorphology;
  syntax: TKnowledgeSyntax;
  semantics: TKnowledgeSemantics;
  pedagogy: TKnowledgePedagogy;
  paradigms: TKnowledgeParadigms;
}
