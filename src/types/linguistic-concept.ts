import type {
  TConceptContrast,
  TConceptMiniTable,
} from "@/types/concept-lesson";
import type { TTeachingScenarioContent } from "@/types/teaching-scenario";

export type TConceptCategory =
  | "Verbal Aspect"
  | "Verb Conjugation"
  | "Verb Motion"
  | "Case System"
  | "Reflexive Verbs"
  | "Possessive Pronouns"
  | "Participles"
  | "Prefixes"
  | "Suffixes"
  | "Animacy"
  | "Word Order"
  | "Negation"
  | "Comparison"
  | "Numerals"
  | "Time Expressions"
  | "Aspect Pairs"
  | "Agreement"
  | "Prepositions"
  | "Gender"
  | "General";

export type TConceptDifficulty = "A0" | "A1" | "A2" | "B1" | "B2";

export type TConceptLinkWeight = "primary" | "secondary" | "advanced";

export type TVisualModelType =
  | "diagram"
  | "timeline"
  | "comparison"
  | "tree"
  | "color-mapping"
  | "table"
  | "animation"
  | "cards";

export interface TVisualModel {
  type: TVisualModelType;
  nodes?: string[];
  caption?: string;
}

export interface TCanonicalExplanation {
  understand: string[];
  scheme: string[];
  contrasts: TConceptContrast[];
  miniTable: TConceptMiniTable | null;
  retentionPoints: string[];
  family: string[];
}

export interface TConceptProgression {
  beginner: string;
  intermediate?: string;
  advanced?: string;
}

export interface TLinguisticConcept {
  id: string;
  slug: string;
  title: string;
  category: TConceptCategory;
  difficulty: TConceptDifficulty;
  summary: string;
  coreIdea: string;
  whyItExists: string;
  mentalModel: string;
  visualModel: TVisualModel;
  canonicalExplanation: TCanonicalExplanation;
  teachingScenario?: TTeachingScenarioContent;
  commonMistakes: string[];
  relatedConcepts: string[];
  relatedLemmas: string[];
  examples: string[];
  progression: TConceptProgression;
  teacherNotes?: string;
}

export interface TLemmaConceptLink {
  conceptId: string;
  weight: TConceptLinkWeight;
  signal?: string;
}

export interface TConceptGraphEdge {
  fromId: string;
  toId: string;
  relation: "prerequisite" | "related" | "extends";
}

export interface TResolvedConceptGraph {
  primary: TLinguisticConcept;
  secondary: TLinguisticConcept[];
  advanced: TLinguisticConcept[];
  links: TLemmaConceptLink[];
  teachingPath: TLinguisticConcept[];
}

export interface TConceptSignalMatch {
  conceptId: string;
  score: number;
  weight: TConceptLinkWeight;
  signal: string;
}
