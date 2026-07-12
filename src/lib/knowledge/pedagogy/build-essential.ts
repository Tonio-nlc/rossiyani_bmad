import { formatPosLabel } from "@/lib/vocabulary/format-linguistic-labels";
import { stripTrailingPunctuationForDisplay } from "@/lib/utils/russian";
import { buildProfileTraitChips } from "@/lib/knowledge/profile-views";
import {
  limitList,
  PEDAGOGY_LIMITS,
  uniqueNonEmpty,
} from "@/lib/knowledge/pedagogy/importance-ranking";
import type {
  TLearningCardEncounter,
  TLearningCardHeader,
  TLearningCardNextForms,
  TLearningCardTakeaways,
  TLearningCardUnderstanding,
} from "@/types/learning-card";
import type {
  TVocabularyContextEncounter,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";
import type { TKnowledgePedagogy } from "@/types/knowledge";

const FORM_CHIP_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bprésent\b/i, label: "Présent" },
  { pattern: /\bpassé\b/i, label: "Passé" },
  { pattern: /\bimparfait\b/i, label: "Imparfait" },
  { pattern: /\bfutur\b/i, label: "Futur" },
  { pattern: /\binfinitif\b/i, label: "Infinitif" },
  { pattern: /\bimpératif\b/i, label: "Impératif" },
  { pattern: /\bparticipe\b/i, label: "Participe" },
  { pattern: /\bperfectif\b/i, label: "Perfectif" },
  { pattern: /\bimperfectif\b/i, label: "Imperfectif" },
  { pattern: /\bneutre\b/i, label: "Neutre" },
  { pattern: /\b1[re]+(?:\s+personne)?\b/i, label: "1re personne" },
  { pattern: /\bpremière\s+personne\b/i, label: "1re personne" },
  { pattern: /\b2[e]?\s+personne\b/i, label: "2e personne" },
  { pattern: /\bdeuxième\s+personne\b/i, label: "2e personne" },
  { pattern: /\b3[e]?\s+personne\b/i, label: "3e personne" },
  { pattern: /\btroisième\s+personne\b/i, label: "3e personne" },
  { pattern: /\bsingulier\b/i, label: "Singulier" },
  { pattern: /\bpluriel\b/i, label: "Pluriel" },
  { pattern: /\bnominatif\b/i, label: "Nominatif" },
  { pattern: /\baccusatif\b/i, label: "Accusatif" },
  { pattern: /\bgénitif\b/i, label: "Génitif" },
  { pattern: /\bdatif\b/i, label: "Datif" },
  { pattern: /\binstrumental\b/i, label: "Instrumental" },
  { pattern: /\bprépositionnel\b/i, label: "Prépositionnel" },
  { pattern: /\bmasculin\b/i, label: "Masculin" },
  { pattern: /\bféminin\b/i, label: "Féminin" },
];

export function splitPedagogicalBlocks(text: string): string[] {
  if (!text.trim()) {
    return [];
  }

  return uniqueNonEmpty(
    text
      .split(/\n+/)
      .flatMap((paragraph) => paragraph.split(/(?<=[.!?…])\s+/))
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  );
}

function parseEncounterFormChips(
  suffixExplanation: string,
  explanation: string,
): string[] {
  const combined = `${suffixExplanation} ${explanation}`;
  const chips: string[] = [];

  for (const { pattern, label } of FORM_CHIP_PATTERNS) {
    if (pattern.test(combined)) {
      chips.push(label);
    }
  }

  return uniqueNonEmpty(chips);
}

function buildOriginPhrase(partOfSpeech: string | null): string {
  if (partOfSpeech === "verb") {
    return "Cette forme vient du verbe";
  }

  return "Cette forme vient de";
}

export function buildLearningCardHeader(
  displayLemma: string,
  translation: string | null,
  profile: TVocabularyLinguisticProfile,
): TLearningCardHeader {
  const posLabel = formatPosLabel(profile.partOfSpeech);
  const subtitleParts = uniqueNonEmpty([
    translation ?? "",
    posLabel ?? "",
  ]);

  return {
    lemma: displayLemma,
    translation,
    partOfSpeech: profile.partOfSpeech,
    subtitle: subtitleParts.length > 0 ? subtitleParts.join(" • ") : null,
  };
}

export function buildLearningCardEncounter(
  encounter: TVocabularyContextEncounter | null,
  profile: TVocabularyLinguisticProfile,
  displayLemma: string,
): TLearningCardEncounter | null {
  if (!encounter) {
    return null;
  }

  const surface = stripTrailingPunctuationForDisplay(encounter.surface);
  const morphologyChips = uniqueNonEmpty(
    [
      profile.morphology.tense,
      profile.morphology.person,
      profile.morphology.voice,
      profile.morphology.aspect,
    ].filter((value): value is string => Boolean(value)),
  );

  const formChips = uniqueNonEmpty([
    ...parseEncounterFormChips(
      encounter.suffixExplanation,
      encounter.explanation,
    ),
    ...morphologyChips,
  ]);

  return {
    surface,
    lemma: displayLemma,
    originPhrase: buildOriginPhrase(profile.partOfSpeech),
    formChips: limitList(formChips, PEDAGOGY_LIMITS.referenceItems),
    traitChips: limitList(
      buildProfileTraitChips(profile.profile),
      PEDAGOGY_LIMITS.referenceItems,
    ),
  };
}

export function buildLearningCardUnderstanding(
  encounter: TVocabularyContextEncounter | null,
  profile: TVocabularyLinguisticProfile,
): TLearningCardUnderstanding | null {
  if (!encounter) {
    return null;
  }

  const pedagogy = profile.pedagogy as TKnowledgePedagogy & {
    understandingPoints?: string[];
  };

  const explanationBlocks = limitList(
    uniqueNonEmpty([
      ...splitPedagogicalBlocks(encounter.explanation),
      ...splitPedagogicalBlocks(encounter.suffixExplanation),
    ]),
    PEDAGOGY_LIMITS.takeaways,
  );

  const whyPoints = limitList(
    uniqueNonEmpty([
      ...(pedagogy.understandingPoints ?? []),
      ...(pedagogy.takeaway ? [pedagogy.takeaway] : []),
      ...(profile.semantics.coreMeaning ? [profile.semantics.coreMeaning] : []),
    ]),
    PEDAGOGY_LIMITS.takeaways,
  );

  return {
    intro: pedagogy.summary ?? null,
    whyPoints,
    suffix: encounter.suffix ?? null,
    roleLabel: encounter.roleLabel ?? null,
    functionColor: encounter.functionColor ?? null,
    explanationBlocks,
    sentence: encounter.sentence ?? null,
  };
}

export function buildLearningCardTakeaways(
  profile: TVocabularyLinguisticProfile,
): TLearningCardTakeaways {
  const pedagogy = profile.pedagogy as TKnowledgePedagogy & {
    takeaways?: string[];
    commonPatterns?: string[];
  };

  const items = limitList(
    uniqueNonEmpty([
      ...(pedagogy.takeaways ?? []),
      ...(pedagogy.takeaway ? [pedagogy.takeaway] : []),
      ...(pedagogy.tips ?? []),
      ...(pedagogy.commonPatterns ?? []),
      ...(profile.semantics.coreMeaning ? [profile.semantics.coreMeaning] : []),
    ]),
    PEDAGOGY_LIMITS.takeaways,
  );

  return { items };
}

export function buildLearningCardNextForms(
  profile: TVocabularyLinguisticProfile,
): TLearningCardNextForms {
  const pedagogy = profile.pedagogy as TKnowledgePedagogy & {
    nextForms?: string[];
  };

  if (pedagogy.nextForms?.length) {
    return {
      forms: limitList(uniqueNonEmpty(pedagogy.nextForms), PEDAGOGY_LIMITS.nextForms),
    };
  }

  const fromParadigms = uniqueNonEmpty([
    ...(profile.paradigms.forms ?? []).map((entry) => entry.form),
    ...(profile.paradigms.conjugation ?? []).map((entry) => entry.form),
    ...(profile.morphology.specialForms ?? []).map((entry) => entry.form),
    ...(profile.morphology.variants ?? []),
    ...(pedagogy.commonPatterns ?? []),
  ]);

  return {
    forms: limitList(fromParadigms, PEDAGOGY_LIMITS.nextForms),
  };
}
