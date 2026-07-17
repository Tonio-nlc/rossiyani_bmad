import type {
  TLearningCardExample,
  TLearningCardHeader,
  TLearningCardReference,
} from "@/types/learning-card";
import type { TVisualModel } from "@/types/linguistic-concept";
import type { TTeachingScenario } from "@/types/teaching-scenario";

export interface TLinguisticPhenomenon {
  id: string;
  title: string;
  priority: number;
}

export interface TConceptHero {
  lemma: string;
  partOfSpeech: string | null;
  translation: string | null;
  encounteredForm: string | null;
  chips: string[];
  phenomenon: TLinguisticPhenomenon;
}

export interface TConceptScheme {
  nodes: string[];
}

export interface TConceptContrast {
  fromForm: string;
  toForm: string;
  question: string;
  explanation: string;
}

export interface TConceptMiniTableRow {
  label: string;
  form: string;
}

export interface TConceptMiniTable {
  title: string;
  rows: TConceptMiniTableRow[];
}

export interface TConceptUnderstand {
  headline: string;
  paragraphs: string[];
}

export interface TConceptSecondaryCard {
  conceptId: string;
  slug: string;
  title: string;
  summary: string;
  coreIdea: string;
}

export interface TConceptConnectedConcept {
  id: string;
  slug: string;
  title: string;
  summary: string;
}

export interface TConceptExplorerView {
  conceptId: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  mentalModel: string;
  visualModel: TVisualModel;
  examples: string[];
  commonMistakes: string[];
  connectedConcepts: TConceptConnectedConcept[];
  relatedLemmas: string[];
  teachingPath: string[];
  reference: TLearningCardReference;
}

export interface TConceptLesson {
  header: TLearningCardHeader;
  hero: TConceptHero;
  teachingScenario: TTeachingScenario;
  understand: TConceptUnderstand;
  scheme: TConceptScheme;
  contrasts: TConceptContrast[];
  miniTable: TConceptMiniTable | null;
  remember: string[];
  family: TConceptScheme;
  secondaryConcepts: TConceptSecondaryCard[];
  conceptExplorer: TConceptExplorerView;
  examples: TLearningCardExample[];
  explorer: TLearningCardReference;
}
