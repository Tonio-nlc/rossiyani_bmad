import {
  COGNITIVE_MAX_RETENTION,
  COGNITIVE_MAX_WHAT_IF,
  constrainCognitiveList,
} from "@/lib/knowledge/teaching/cognitive-limits";
import type { TPedagogicalIntent } from "@/lib/knowledge/teaching/build-pedagogical-intent";
import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { buildHeroChips, normalizeEncounterSurface } from "@/lib/knowledge/concept/build-hero-chips";
import { composeTeachingScenario } from "@/lib/knowledge/teaching-engine";
import {
  toConceptParagraph,
  toConceptParagraphs,
} from "@/lib/knowledge/concept/concept-voice";
import type { TLinguisticPhenomenon } from "@/types/concept-lesson";
import type {
  TConceptContrast,
  TConceptExplorerView,
  TConceptLesson,
  TConceptMiniTable,
  TConceptScheme,
  TConceptSecondaryCard,
  TConceptUnderstand,
} from "@/types/concept-lesson";
import type { TResolvedConceptGraph } from "@/types/linguistic-concept";
import type { TTeachingScenario } from "@/types/teaching-scenario";
import type { TKnowledgeConcept } from "@/types/knowledge";
import type { TLearningCard } from "@/types/learning-card";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import type { TVocabularyContextEncounter, TVocabularyLinguisticProfile } from "@/types/vocabulary";

function getConceptBlock(
  profile: TVocabularyLinguisticProfile,
): TKnowledgeConcept | undefined {
  return profile.pedagogy.concept;
}

function buildUnderstandSection(
  phenomenon: TLinguisticPhenomenon,
  analysis: TLinguisticAnalysis,
  intent: TPedagogicalIntent,
  profile: TVocabularyLinguisticProfile,
  encounter: TVocabularyContextEncounter | null,
  graph: TResolvedConceptGraph,
): TConceptUnderstand {
  const concept = getConceptBlock(profile);
  const surface = analysis.surfaceForm ?? analysis.baseLemma;
  const canonical = graph.primary.canonicalExplanation;

  const headline =
    surface !== analysis.baseLemma
      ? `Pourquoi « ${surface} » ?`
      : graph.primary.title;

  const paragraphs = toConceptParagraphs(
    canonical.understand.length
      ? canonical.understand
      : concept?.understand?.length
        ? concept.understand
        : [
            graph.primary.coreIdea,
            intent.whyThisForm,
            encounter?.explanation
              ? `${phenomenon.title} : ${encounter.explanation}`
              : intent.russianExpresses,
          ],
    2,
  );

  return { headline, paragraphs };
}

function buildScheme(
  profile: TVocabularyLinguisticProfile,
  analysis: TLinguisticAnalysis,
  phenomenon: TLinguisticPhenomenon,
  graph: TResolvedConceptGraph,
): TConceptScheme {
  const concept = getConceptBlock(profile);
  const canonical = graph.primary.canonicalExplanation;

  if (canonical.scheme.length) {
    return { nodes: canonical.scheme.slice(0, 6) };
  }

  if (graph.primary.visualModel.nodes?.length) {
    return { nodes: graph.primary.visualModel.nodes.slice(0, 6) };
  }

  const lemma = analysis.baseLemma;
  const surface = analysis.surfaceForm ?? lemma;

  if (phenomenon.id === "verb_present_conjugation") {
    const forms = [
      lemma,
      ...(profile.paradigms.conjugation ?? []).map((e) => e.form),
      ...(profile.paradigms.forms ?? []).map((e) => e.form),
      ...analysis.alternativeForms,
    ].filter(Boolean);

    const nodes = uniqueNodes([lemma, ...forms.slice(0, 3), surface]);

    return { nodes: nodes.length >= 2 ? nodes : [lemma, surface] };
  }

  if (phenomenon.id === "verb_perfective_aspect" && profile.morphology.aspectPair) {
    return {
      nodes: uniqueNodes([
        profile.morphology.aspectPair.imperfective ?? lemma,
        profile.morphology.aspectPair.perfective ?? surface,
      ]),
    };
  }

  if (phenomenon.id === "verb_movement_prefix") {
    const pair = profile.morphology.aspectPair;
    const preverb = profile.morphology.preverbs?.[0];

    return {
      nodes: uniqueNodes([
        pair?.imperfective ?? lemma,
        preverb ? `${preverb.prefix}${lemma}` : surface,
        pair?.perfective ?? analysis.alternativeForms[0] ?? surface,
      ]),
    };
  }

  if (phenomenon.id === "pronoun_reflexive_possessive") {
    return {
      nodes: uniqueNodes([
        "мой",
        lemma,
        surface,
        ...analysis.alternativeForms.slice(0, 1),
      ]),
    };
  }

  return {
    nodes: uniqueNodes([lemma, surface, ...analysis.alternativeForms.slice(0, 2)]),
  };
}

function buildContrasts(
  profile: TVocabularyLinguisticProfile,
  analysis: TLinguisticAnalysis,
  intent: TPedagogicalIntent,
  graph: TResolvedConceptGraph,
): TConceptContrast[] {
  const concept = getConceptBlock(profile);
  const canonical = graph.primary.canonicalExplanation;

  if (canonical.contrasts.length) {
    return canonical.contrasts.slice(0, COGNITIVE_MAX_WHAT_IF).map((item, index) => ({
      fromForm: item.fromForm,
      toForm: item.toForm,
      question: item.question ?? (index === 0 ? "Pourquoi ?" : "Qu'est-ce qui change ?"),
      explanation: toConceptParagraph(item.explanation),
    }));
  }

  if (concept?.contrasts?.length) {
    return concept.contrasts.slice(0, COGNITIVE_MAX_WHAT_IF).map((item, index) => ({
      fromForm: item.fromForm,
      toForm: item.toForm,
      question: item.question ?? (index === 0 ? "Pourquoi ?" : "Qu'est-ce qui change ?"),
      explanation: toConceptParagraph(item.explanation),
    }));
  }

  const base = analysis.baseLemma;
  const surface = analysis.surfaceForm ?? base;

  const contrasts: TConceptContrast[] = [];

  if (surface !== base) {
    contrasts.push({
      fromForm: base,
      toForm: surface,
      question: "Pourquoi ?",
      explanation: toConceptParagraph(intent.whyThisForm),
    });
  }

  for (const [index, item] of intent.whatIf.entries()) {
    contrasts.push({
      fromForm: item.fromForm,
      toForm: item.toForm,
      question: index === 0 && contrasts.length === 0 ? "Pourquoi ?" : "Qu'est-ce qui change ?",
      explanation: toConceptParagraph(item.explanation),
    });
  }

  if (contrasts.length === 0 && analysis.alternativeForms[0]) {
    contrasts.push({
      fromForm: base,
      toForm: analysis.alternativeForms[0],
      question: "Qu'est-ce qui change ?",
      explanation: toConceptParagraph(
        `Avec « ${analysis.alternativeForms[0]} », le phénomène change : le lecteur ne lit plus la même relation dans la phrase.`,
      ),
    });
  }

  return contrasts.slice(0, COGNITIVE_MAX_WHAT_IF);
}

function buildMiniTable(
  profile: TVocabularyLinguisticProfile,
  phenomenon: TLinguisticPhenomenon,
  graph: TResolvedConceptGraph,
): TConceptMiniTable | null {
  const concept = getConceptBlock(profile);
  const canonical = graph.primary.canonicalExplanation;

  if (canonical.miniTable?.rows?.length) {
    return {
      title: canonical.miniTable.title,
      rows: canonical.miniTable.rows.slice(0, 5),
    };
  }

  if (concept?.miniTable?.rows?.length) {
    return {
      title: concept.miniTable.title,
      rows: concept.miniTable.rows.slice(0, 5),
    };
  }

  if (phenomenon.id === "verb_present_conjugation") {
    const rows = (profile.paradigms.conjugation ?? profile.paradigms.forms ?? [])
      .slice(0, 4)
      .map((entry) => ({
        label: entry.label,
        form: entry.form,
      }));

    if (rows.length >= 2) {
      return { title: "Présent", rows };
    }
  }

  if (phenomenon.id === "noun_declension") {
    const rows = (profile.paradigms.cases ?? profile.morphology.caseParadigm ?? [])
      .slice(0, 4)
      .map((entry) => ({
        label: entry.label.replace(/paradigme|des cas/gi, "").trim() || entry.label,
        form: entry.form,
      }));

    if (rows.length >= 2) {
      return { title: "Cas", rows };
    }
  }

  const fallback = (profile.pedagogy.nextForms ?? []).slice(0, 3);

  if (fallback.length >= 2) {
    return {
      title: "Formes utiles",
      rows: fallback.map((form, index) => ({
        label: `Forme ${index + 1}`,
        form,
      })),
    };
  }

  return null;
}

function buildRememberPoints(
  profile: TVocabularyLinguisticProfile,
  intent: TPedagogicalIntent,
  graph: TResolvedConceptGraph,
): string[] {
  const concept = getConceptBlock(profile);
  const canonical = graph.primary.canonicalExplanation;
  const source = canonical.retentionPoints.length
    ? canonical.retentionPoints
    : concept?.retentionPoints?.length
      ? concept.retentionPoints
      : intent.retentionPoints;

  return constrainCognitiveList(
    source.map((point) => toConceptParagraph(point, 45)),
    COGNITIVE_MAX_RETENTION,
    45,
  );
}

function buildFamilyScheme(
  profile: TVocabularyLinguisticProfile,
  analysis: TLinguisticAnalysis,
  graph: TResolvedConceptGraph,
): TConceptScheme {
  const concept = getConceptBlock(profile);
  const canonical = graph.primary.canonicalExplanation;

  if (canonical.family.length) {
    return { nodes: canonical.family.slice(0, 6) };
  }

  if (concept?.family?.length) {
    return { nodes: concept.family.slice(0, 6) };
  }

  const nodes = uniqueNodes([
    analysis.baseLemma,
    ...(profile.morphology.preverbs ?? []).map((item) => item.verb),
    profile.morphology.aspectPair?.perfective ?? "",
    profile.morphology.aspectPair?.imperfective ?? "",
    ...(profile.pedagogy.nextForms ?? []),
    ...(profile.morphology.variants ?? []),
    ...(profile.semantics.synonyms ?? []),
  ]).slice(0, 5);

  return { nodes: nodes.length >= 2 ? nodes : [analysis.baseLemma] };
}

function uniqueNodes(nodes: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const node of nodes) {
    const key = node.trim();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(key);
  }

  return result;
}

function buildSecondaryConceptCards(
  graph: TResolvedConceptGraph,
): TConceptSecondaryCard[] {
  return graph.secondary.slice(0, 3).map((concept) => ({
    conceptId: concept.id,
    slug: concept.slug,
    title: concept.title,
    summary: concept.summary,
    coreIdea: concept.coreIdea,
  }));
}

function buildConceptExplorerView(
  graph: TResolvedConceptGraph,
  card: TLearningCard,
): TConceptExplorerView {
  const { primary, teachingPath } = graph;

  return {
    conceptId: primary.id,
    slug: primary.slug,
    title: primary.title,
    category: primary.category,
    summary: primary.summary,
    mentalModel: primary.mentalModel,
    visualModel: primary.visualModel,
    examples: primary.examples,
    commonMistakes: primary.commonMistakes,
    connectedConcepts: graph.secondary.map((concept) => ({
      id: concept.id,
      slug: concept.slug,
      title: concept.title,
      summary: concept.summary,
    })),
    relatedLemmas: primary.relatedLemmas,
    teachingPath: teachingPath.map((concept) => concept.title),
    reference: card.reference,
  };
}

export function buildConceptLesson(
  input: TComposeLearningCardInput,
  card: TLearningCard,
  analysis: TLinguisticAnalysis,
  phenomenon: TLinguisticPhenomenon,
  intent: TPedagogicalIntent,
  graph: TResolvedConceptGraph,
  teachingScenario: TTeachingScenario,
): TConceptLesson {
  const encounteredForm = normalizeEncounterSurface(input.encounter);

  return {
    header: card.header,
    hero: {
      lemma: analysis.baseLemma,
      partOfSpeech: analysis.partOfSpeech,
      translation: input.translation,
      encounteredForm,
      chips: buildHeroChips(input.profile, input.encounter, analysis),
      phenomenon: {
        id: graph.primary.id,
        title: graph.primary.title,
        priority: 100,
      },
    },
    teachingScenario,
    understand: buildUnderstandSection(
      phenomenon,
      analysis,
      intent,
      input.profile,
      input.encounter,
      graph,
    ),
    scheme: buildScheme(input.profile, analysis, phenomenon, graph),
    contrasts: buildContrasts(input.profile, analysis, intent, graph),
    miniTable: buildMiniTable(input.profile, phenomenon, graph),
    remember: buildRememberPoints(input.profile, intent, graph),
    family: buildFamilyScheme(input.profile, analysis, graph),
    secondaryConcepts: buildSecondaryConceptCards(graph),
    conceptExplorer: buildConceptExplorerView(graph, card),
    examples: card.examples,
    explorer: card.reference,
  };
}
