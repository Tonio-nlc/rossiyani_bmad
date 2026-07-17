import { buildConceptLesson } from "@/lib/knowledge/concept/concept-builder";
import { resolveConceptGraph } from "@/lib/knowledge/concept-graph";
import { phenomenonFromGraph } from "@/lib/knowledge/concept/identify-phenomenon";
import { composeLearningCard } from "@/lib/knowledge/pedagogy/compose-learning-card";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import { composeTeachingScenario } from "@/lib/knowledge/teaching-engine";
import { analyzeLinguisticContext } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { buildPedagogicalIntent } from "@/lib/knowledge/teaching/build-pedagogical-intent";
import { normalizeEncounterSurface } from "@/lib/knowledge/concept/build-hero-chips";
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

  const teachingScenario = composeTeachingScenario({
    concept: graph.primary,
    encounteredForm: normalizeEncounterSurface(input.encounter),
    nextConcept: graph.secondary[0]
      ? {
          id: graph.secondary[0].id,
          slug: graph.secondary[0].slug,
          title: graph.secondary[0].title,
        }
      : null,
  });

  if (!teachingScenario) {
    throw new Error(
      `Teaching Engine: scénario introuvable pour ${graph.primary.id}`,
    );
  }

  const phenomenon = phenomenonFromGraph(graph);

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

  return { lesson, card, graph, teachingScenario };
}
