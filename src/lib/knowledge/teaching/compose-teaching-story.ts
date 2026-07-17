import { analyzeLinguisticContext } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { buildPedagogicalIntent } from "@/lib/knowledge/teaching/build-pedagogical-intent";
import { composeLearningCard } from "@/lib/knowledge/pedagogy/compose-learning-card";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import type { TLearningCard } from "@/types/learning-card";
import type { TLearningStory, TFormProgressionItem } from "@/types/learning-story";

export type TComposeTeachingStoryInput = TComposeLearningCardInput;

export interface TComposeTeachingStoryResult {
  story: TLearningStory;
  card: TLearningCard;
}

const COGNITIVE_QUESTIONS = {
  whyThisForm: "Pourquoi cette forme ?",
  russianExpresses: "Qu'est-ce que le russe veut exprimer ?",
  visibleSignal: "Quel est le signal visible ?",
  remember: "Que dois-je retenir ?",
} as const;

function buildFormProgression(
  forms: string[],
): TFormProgressionItem[] {
  return forms.map((form) => ({
    form,
    hint: null,
  }));
}

export function composeTeachingStory(
  input: TComposeTeachingStoryInput,
): TComposeTeachingStoryResult {
  const card = composeLearningCard(input);

  const analysis = analyzeLinguisticContext(
    input.profile,
    input.displayLemma,
    input.encounter,
  );

  const intent = buildPedagogicalIntent(
    analysis,
    input.profile,
    input.encounter,
  );

  const whyQuestion =
    analysis.surfaceForm &&
    analysis.surfaceForm !== analysis.baseLemma
      ? `Pourquoi le russe n'a-t-il pas utilisé « ${analysis.baseLemma} » ?`
      : COGNITIVE_QUESTIONS.whyThisForm;

  return {
    story: {
      header: card.header,
      surface: analysis.surfaceForm,
      lemma: analysis.baseLemma,
      sentence: analysis.sentence,
      steps: {
        whyThisForm: {
          question: whyQuestion,
          answer: intent.whyThisForm,
        },
        russianExpresses: {
          question: COGNITIVE_QUESTIONS.russianExpresses,
          answer: intent.russianExpresses,
        },
        visibleSignal: {
          question: COGNITIVE_QUESTIONS.visibleSignal,
          answer: intent.visibleSignal,
        },
        whatIf: intent.whatIf,
        remember: {
          question: COGNITIVE_QUESTIONS.remember,
          points: intent.retentionPoints,
        },
      },
      formProgression: buildFormProgression(intent.formProgression),
      examples: card.examples,
      reference: card.reference,
    },
    card,
  };
}
