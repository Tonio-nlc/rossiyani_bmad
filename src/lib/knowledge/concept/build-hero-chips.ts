import { stripTrailingPunctuationForDisplay } from "@/lib/utils/russian";
import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import type { TVocabularyContextEncounter, TVocabularyLinguisticProfile } from "@/types/vocabulary";

const FORM_CHIP_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bprésent\b/i, label: "Présent" },
  { pattern: /\bpassé\b/i, label: "Passé" },
  { pattern: /\bfutur\b/i, label: "Futur" },
  { pattern: /\bimparfait\b/i, label: "Imparfait" },
  { pattern: /\bperfectif\b/i, label: "Perfectif" },
  { pattern: /\bimperfectif\b/i, label: "Imperfectif" },
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

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
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
  const fromMorphology = uniqueNonEmpty([
    profile.morphology.tense ?? "",
    profile.morphology.person ?? "",
    profile.morphology.aspect ?? profile.aspect ?? "",
    profile.morphology.gender ?? profile.gender ?? "",
  ]).map((value) => value.charAt(0).toUpperCase() + value.slice(1));

  return uniqueNonEmpty([...fromEncounter, ...fromMorphology, ...analysis.morphSignals])
    .slice(0, 6);
}

export function normalizeEncounterSurface(
  encounter: TVocabularyContextEncounter | null,
): string | null {
  if (!encounter?.surface) {
    return null;
  }

  return stripTrailingPunctuationForDisplay(encounter.surface);
}
