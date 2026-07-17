import {
  COGNITIVE_MAX_RETENTION,
  COGNITIVE_MAX_WHAT_IF,
  constrainCognitiveList,
} from "@/lib/knowledge/teaching/cognitive-limits";
import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { toTeachingParagraph } from "@/lib/knowledge/teaching/teaching-voice";
import type { TKnowledgePedagogy, TKnowledgeTeaching } from "@/types/knowledge";
import type { TWhatIfComparison } from "@/types/learning-story";
import type { TVocabularyContextEncounter, TVocabularyLinguisticProfile } from "@/types/vocabulary";

export interface TPedagogicalIntent {
  whyThisForm: string;
  russianExpresses: string;
  visibleSignal: string;
  whatIf: TWhatIfComparison[];
  retentionPoints: string[];
  formProgression: string[];
}

function getTeachingBlock(
  pedagogy: TKnowledgePedagogy,
): TKnowledgeTeaching | undefined {
  return pedagogy.teaching;
}

function buildWhyFallback(
  analysis: TLinguisticAnalysis,
  encounter: TVocabularyContextEncounter | null,
): string {
  if (analysis.surfaceForm && analysis.surfaceForm !== analysis.baseLemma) {
    return `Le russe n'utilise pas « ${analysis.baseLemma} » ici : il choisit « ${analysis.surfaceForm} » parce que la phrase demande cette forme précise, pas le lemme de dictionnaire.`;
  }

  if (encounter?.explanation) {
    return `Le russe choisit cette forme parce que ${encounter.explanation.charAt(0).toLowerCase()}${encounter.explanation.slice(1)}`;
  }

  return `Le russe choisit cette forme pour que la phrase sonne naturelle dans ce contexte de lecture.`;
}

function buildExpressFallback(profile: TVocabularyLinguisticProfile): string {
  const teaching = getTeachingBlock(profile.pedagogy);
  const point =
    teaching?.russianExpresses ??
    profile.pedagogy.understandingPoints?.[0] ??
    profile.semantics.coreMeaning ??
    profile.pedagogy.takeaways?.[0];

  if (point) {
    return `Ici, le locuteur insiste sur une idée précise : ${point.charAt(0).toLowerCase()}${point.slice(1)}`;
  }

  if (profile.morphology.tense) {
    return `Ici, le locuteur insiste sur une action vue au ${profile.morphology.tense}.`;
  }

  return `Ici, le locuteur insiste sur le sens central du mot dans cette phrase.`;
}

function buildSignalFallback(
  analysis: TLinguisticAnalysis,
  encounter: TVocabularyContextEncounter | null,
): string {
  if (analysis.suffix && analysis.suffixExplanation) {
    return `Le russe ajoute « ${analysis.suffix} » pour montrer que ${analysis.suffixExplanation.charAt(0).toLowerCase()}${analysis.suffixExplanation.slice(1)}`;
  }

  if (analysis.roleLabel) {
    return `Le signal visible, c'est ${analysis.roleLabel.toLowerCase()} : c'est ce que le russe met en avant dans la forme.`;
  }

  if (encounter?.suffixExplanation) {
    return `Le russe modifie la forme pour montrer ${encounter.suffixExplanation.charAt(0).toLowerCase()}${encounter.suffixExplanation.slice(1)}`;
  }

  if (analysis.morphSignals.length > 0) {
    return `Le russe ajuste la forme pour signaler : ${analysis.morphSignals.join(", ")}.`;
  }

  return `Le signal visible est la forme elle-même : le russe la choisit pour que le sens soit immédiatement lisible.`;
}

function buildWhatIfFallback(
  analysis: TLinguisticAnalysis,
  profile: TVocabularyLinguisticProfile,
): TWhatIfComparison[] {
  const teaching = getTeachingBlock(profile.pedagogy);

  if (teaching?.whatIfComparisons?.length) {
    return teaching.whatIfComparisons.slice(0, COGNITIVE_MAX_WHAT_IF).map((item) => ({
      fromForm: item.fromForm,
      toForm: item.toForm,
      explanation: item.explanation,
    }));
  }

  const surface = analysis.surfaceForm ?? analysis.baseLemma;
  const alternatives = analysis.alternativeForms.slice(0, COGNITIVE_MAX_WHAT_IF);

  return alternatives.map((alt) => ({
    fromForm: surface,
    toForm: alt,
    explanation: `Si on remplaçait « ${surface} » par « ${alt} », le sens ne serait plus le même : le russe ne pointerait plus vers la même idée dans la phrase.`,
  }));
}

function buildRetentionFallback(profile: TVocabularyLinguisticProfile): string[] {
  const teaching = getTeachingBlock(profile.pedagogy);

  if (teaching?.retentionPoints?.length) {
    return teaching.retentionPoints;
  }

  return [
    ...(profile.pedagogy.takeaways ?? []),
    ...(profile.pedagogy.takeaway ? [profile.pedagogy.takeaway] : []),
    ...(profile.pedagogy.tips ?? []),
  ];
}

export function buildPedagogicalIntent(
  analysis: TLinguisticAnalysis,
  profile: TVocabularyLinguisticProfile,
  encounter: TVocabularyContextEncounter | null,
): TPedagogicalIntent {
  const teaching = getTeachingBlock(profile.pedagogy);

  const whyThisForm = toTeachingParagraph(
    teaching?.whyNotBaseForm ?? buildWhyFallback(analysis, encounter),
  );

  const russianExpresses = toTeachingParagraph(
    teaching?.russianExpresses ?? buildExpressFallback(profile),
  );

  const visibleSignal = toTeachingParagraph(
    teaching?.visibleSignal ?? buildSignalFallback(analysis, encounter),
  );

  const whatIf = buildWhatIfFallback(analysis, profile).map((item) => ({
    ...item,
    explanation: toTeachingParagraph(item.explanation),
  }));

  const retentionPoints = constrainCognitiveList(
    buildRetentionFallback(profile).map(toTeachingParagraph),
    COGNITIVE_MAX_RETENTION,
    45,
  );

  const formProgression = uniqueProgression([
    analysis.surfaceForm ?? analysis.baseLemma,
    ...analysis.alternativeForms,
  ]).slice(0, 4);

  return {
    whyThisForm,
    russianExpresses,
    visibleSignal,
    whatIf,
    retentionPoints,
    formProgression,
  };
}

function uniqueProgression(forms: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const form of forms) {
    const key = form.trim();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(key);
  }

  return result;
}
