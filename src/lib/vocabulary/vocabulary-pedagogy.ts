import {
  buildProfileExploreBlocks,
  buildProfileTraitChips,
  extractProfileVariants,
} from "@/lib/knowledge/profile-views";
import { formatPosLabel } from "@/lib/vocabulary/format-linguistic-labels";
import { stripTrailingPunctuationForDisplay } from "@/lib/utils/russian";
import type {
  TVocabularyContextEncounter,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";

export interface TExploreBlock {
  title: string;
  items: string[];
}

export interface TEncounterSummary {
  surface: string;
  lemma: string;
  originPhrase: string;
  formChips: string[];
  traitChips: string[];
}

const FORM_CHIP_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bprésent\b/i, label: "Présent" },
  { pattern: /\bpassé\b/i, label: "Passé" },
  { pattern: /\bimparfait\b/i, label: "Imparfait" },
  { pattern: /\bfutur\b/i, label: "Futur" },
  { pattern: /\binfinitif\b/i, label: "Infinitif" },
  { pattern: /\bimpératif\b/i, label: "Impératif" },
  { pattern: /\bparticipe\b/i, label: "Participe" },
  { pattern: /\b1[re]+(?:\s+personne)?\b/i, label: "1re personne" },
  { pattern: /\bpremière\s+personne\b/i, label: "1re personne" },
  { pattern: /\b2[e]?\s+personne\b/i, label: "2e personne" },
  { pattern: /\bdeuxième\s+personne\b/i, label: "2e personne" },
  { pattern: /\b3[e]?\s+personne\b/i, label: "3e personne" },
  { pattern: /\btroisième\s+personne\b/i, label: "3e personne" },
  { pattern: /\bsingulier\b/i, label: "singulier" },
  { pattern: /\bpluriel\b/i, label: "pluriel" },
  { pattern: /\bnominatif\b/i, label: "nominatif" },
  { pattern: /\baccusatif\b/i, label: "accusatif" },
  { pattern: /\bgénitif\b/i, label: "génitif" },
  { pattern: /\bdatif\b/i, label: "datif" },
  { pattern: /\binstrumental\b/i, label: "instrumental" },
  { pattern: /\bprépositionnel\b/i, label: "prépositionnel" },
  { pattern: /\bmasculin\b/i, label: "masculin" },
  { pattern: /\bféminin\b/i, label: "féminin" },
  { pattern: /\bneutre\b/i, label: "neutre" },
];

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function splitPedagogicalBlocks(text: string): string[] {
  if (!text.trim()) {
    return [];
  }

  return uniqueStrings(
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

  return uniqueStrings(chips);
}

function buildOriginPhrase(partOfSpeech: string | null): string {
  if (partOfSpeech === "verb") {
    return "Cette forme vient du verbe";
  }

  return "vient de";
}

export function buildEncounterSummary(
  encounter: TVocabularyContextEncounter,
  profile: TVocabularyLinguisticProfile,
  displayLemma: string,
): TEncounterSummary {
  const surface = stripTrailingPunctuationForDisplay(encounter.surface);
  const morphologyChips = uniqueStrings(
    [
      profile.morphology.tense,
      profile.morphology.person,
      profile.morphology.voice,
    ].filter((value): value is string => Boolean(value)),
  );

  const formChips = uniqueStrings([
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
    formChips,
    traitChips: buildProfileTraitChips(profile.profile),
  };
}

export function buildExploreBlocks(
  profile: TVocabularyLinguisticProfile,
): TExploreBlock[] {
  return buildProfileExploreBlocks(profile.profile);
}

export function extractImportantVariants(
  profile: TVocabularyLinguisticProfile,
): string[] {
  return extractProfileVariants(profile.profile);
}

export function getPosLabel(
  partOfSpeech: string | null | undefined,
): string | null {
  return formatPosLabel(partOfSpeech);
}
