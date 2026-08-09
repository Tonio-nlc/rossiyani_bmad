import { buildConceptLesson } from "@/lib/knowledge/concept/concept-builder";
import { NO_CONCEPT_ID, resolveConceptGraph } from "@/lib/knowledge/concept-graph";
import { phenomenonFromGraph } from "@/lib/knowledge/concept/identify-phenomenon";
import { composeLearningCard } from "@/lib/knowledge/pedagogy/compose-learning-card";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import { composeTeachingScenario } from "@/lib/knowledge/teaching-engine";
import { analyzeLinguisticContext } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { buildPedagogicalIntent } from "@/lib/knowledge/teaching/build-pedagogical-intent";
import { normalizeEncounterSurface } from "@/lib/knowledge/concept/build-hero-chips";
import { getNaturalFunctionalRoleLabel } from "@/lib/utils/russian";
import type { TConceptLesson } from "@/types/concept-lesson";
import type { TResolvedConceptGraph } from "@/types/linguistic-concept";
import type { TLearningCard } from "@/types/learning-card";
import type { TTeachingScenario } from "@/types/teaching-scenario";

export type TComposeConceptLessonInput = TComposeLearningCardInput;

export interface TComposeConceptLessonResult {
  lesson: TConceptLesson;
  card: TLearningCard;
  graph: TResolvedConceptGraph;
  teachingScenario: TTeachingScenario;
}

/**
 * Expression figée : libellé + sens de rencontre, sans scénario de concept
 * (sinon « Régence des prépositions » / décomposition de cas).
 */
function buildFixedExpressionTeachingScenario(
  input: TComposeConceptLessonInput,
): TTeachingScenario {
  const encounteredForm = normalizeEncounterSurface(input.encounter);
  const roleLabel = getNaturalFunctionalRoleLabel("fixed_expression");
  const fact =
    input.encounter?.explanation?.trim() ||
    "Cette expression se dit telle quelle — on ne découpe pas la terminaison.";

  return {
    conceptId: "fixed_expression",
    conceptSlug: "fixed_expression",
    conceptTitle: roleLabel,
    consultedLemma: input.displayLemma || input.profile.lemma,
    encounteredForm,
    encounterExample: input.encounter?.sentence
      ? {
          sentence: input.encounter.sentence,
          note: input.encounter.explanation || undefined,
          surface: input.encounter.surface,
        }
      : null,
    fact,
    contrast: [],
    memoryAnchor: fact,
    showMemoryAnchor: false,
    contrastIsCanonical: false,
    nextConcept: null,
  };
}

/**
 * Compose la leçon concept pour la fiche vocabulaire.
 * Ne throw jamais pour une donnée manquante — dégrade l'affichage.
 */
export function composeConceptLesson(
  input: TComposeConceptLessonInput,
): TComposeConceptLessonResult {
  const card = composeLearningCard(input);

  const analysis = analyzeLinguisticContext(
    input.profile,
    input.displayLemma,
    input.encounter,
  );

  const graph = resolveConceptGraph(
    input.profile,
    analysis,
    input.encounter,
  );

  const isFixedExpression =
    input.encounter?.functionalRole === "fixed_expression";

  const teachingScenario = isFixedExpression
    ? buildFixedExpressionTeachingScenario(input)
    : (input.persistedTeachingScenario ??
      composeTeachingScenario({
        concept: graph.primary,
        lemma: input.displayLemma || input.profile.lemma,
        encounteredForm: normalizeEncounterSurface(input.encounter),
        encounterExample: input.encounter?.sentence
          ? {
              sentence: input.encounter.sentence,
              note: input.encounter.explanation || undefined,
              surface: input.encounter.surface,
            }
          : null,
        nextConcept: graph.secondary[0]
          ? {
              id: graph.secondary[0].id,
              slug: graph.secondary[0].slug,
              title: graph.secondary[0].title,
            }
          : null,
        profile: input.profile,
      }));

  const phenomenon = isFixedExpression
    ? {
        id: "fixed_expression",
        title: getNaturalFunctionalRoleLabel("fixed_expression"),
        priority: 100,
      }
    : phenomenonFromGraph(graph);

  const intent = buildPedagogicalIntent(
    analysis,
    input.profile,
    input.encounter,
  );

  const lesson = buildConceptLesson(
    input,
    card,
    analysis,
    phenomenon,
    intent,
    graph,
    teachingScenario,
  );

  if (isFixedExpression || graph.primary.id === NO_CONCEPT_ID) {
    // Pas de lien concept / approfondissement de cas pour un figé.
    lesson.secondaryConcepts = [];
    lesson.conceptExplorer = {
      ...lesson.conceptExplorer,
      conceptId: "",
      slug: "",
      title: "",
      summary: "",
      mentalModel: "",
      examples: [],
      commonMistakes: [],
      connectedConcepts: [],
      teachingPath: [],
    };
    lesson.hero.phenomenon = phenomenon;
  }

  return { lesson, card, graph, teachingScenario };
}
