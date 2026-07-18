import { stripTrailingPunctuationForDisplay } from "@/lib/utils/russian";
import { formatAspectLabel } from "@/lib/vocabulary/format-linguistic-labels";
import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import type { TVocabularyContextEncounter, TVocabularyLinguisticProfile } from "@/types/vocabulary";

const FORM_CHIP_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bprésent\b/i, label: "Présent" },
  { pattern: /\bpassé\b/i, label: "Passé" },
  { pattern: /\bfutur\b/i, label: "Futur" },
  { pattern: /\bimparfait\b/i, label: "Imparfait" },
  { pattern: /\bperfectif|perfective|parfaitif\b/i, label: "Perfectif" },
  { pattern: /\bimperfectif|imperfective|imparfaitif\b/i, label: "Imperfectif" },
  { pattern: /\b1[re]+(?:\s+personne)?\b/i, label: "1re personne" },
  { pattern: /\b2[e]?\s+personne\b/i, label: "2e personne" },
  { pattern: /\b3[e]?\s+personne\b/i, label: "3e personne" },
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
  { pattern: /\bneutre\b/i, label: "Neutre" },
];

function uniqueNonEmptyCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();

    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function normalizeChipLabel(value: string): string {
  const aspectLabel = formatAspectLabel(value);

  if (aspectLabel) {
    return aspectLabel;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseEncounterChips(encounter: TVocabularyContextEncounter | null): string[] {
  if (!encounter) {
    return [];
  }

  const combined = `${encounter.suffixExplanation} ${encounter.explanation}`;
  const chips: string[] = [];

  for (const { pattern, label } of FORM_CHIP_PATTERNS) {
    if (pattern.test(combined)) {
      chips.push(label);
    }
  }

  return chips;
}

export function buildHeroChips(
  profile: TVocabularyLinguisticProfile,
  encounter: TVocabularyContextEncounter | null,
  analysis: TLinguisticAnalysis,
): string[] {
  const fromEncounter = parseEncounterChips(encounter);
  const aspectChip = formatAspectLabel(
    profile.morphology.aspect ?? profile.aspect,
  );
  const fromMorphology = [
    profile.morphology.tense ?? "",
    profile.morphology.person ?? "",
    aspectChip ?? "",
    profile.morphology.gender ?? profile.gender ?? "",
  ]
    .filter(Boolean)
    .map((value) => normalizeChipLabel(value));

  const fromSignals = analysis.morphSignals.map((signal) =>
    normalizeChipLabel(signal),
  );

  return uniqueNonEmptyCaseInsensitive([
    ...fromEncounter,
    ...fromMorphology,
    ...fromSignals,
  ]).slice(0, 6);
}

export function normalizeEncounterSurface(
  encounter: TVocabularyContextEncounter | null,
): string | null {
  if (!encounter?.surface) {
    return null;
  }

  return stripTrailingPunctuationForDisplay(encounter.surface);
}
