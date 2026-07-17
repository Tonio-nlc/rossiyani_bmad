import type { TVocabularyContextEncounter, TVocabularyLinguisticProfile } from "@/types/vocabulary";

export interface TLinguisticAnalysis {
  surfaceForm: string | null;
  baseLemma: string;
  partOfSpeech: string | null;
  suffix: string | null;
  roleLabel: string | null;
  sentence: string | null;
  morphSignals: string[];
  alternativeForms: string[];
  encounterExplanation: string | null;
  suffixExplanation: string | null;
}

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function analyzeLinguisticContext(
  profile: TVocabularyLinguisticProfile,
  displayLemma: string,
  encounter: TVocabularyContextEncounter | null,
): TLinguisticAnalysis {
  const morphSignals = uniqueNonEmpty([
    profile.morphology.tense ?? "",
    profile.morphology.person ?? "",
    profile.morphology.aspect ?? profile.aspect ?? "",
    profile.morphology.voice ?? "",
    profile.morphology.gender ?? profile.gender ?? "",
  ]);

  const alternativeForms = uniqueNonEmpty([
    ...(profile.pedagogy.nextForms ?? []),
    ...(profile.paradigms.forms ?? []).map((entry) => entry.form),
    ...(profile.paradigms.conjugation ?? []).map((entry) => entry.form),
    ...(profile.morphology.variants ?? []),
  ]).filter((form) => form !== displayLemma);

  return {
    surfaceForm: encounter?.surface ?? null,
    baseLemma: displayLemma,
    partOfSpeech: profile.partOfSpeech,
    suffix: encounter?.suffix ?? null,
    roleLabel: encounter?.roleLabel ?? null,
    sentence: encounter?.sentence ?? null,
    morphSignals,
    alternativeForms,
    encounterExplanation: encounter?.explanation ?? null,
    suffixExplanation: encounter?.suffixExplanation ?? null,
  };
}
