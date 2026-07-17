import type { TLearningStory } from "@/types/learning-story";

import { VOCAB_HERO_PANEL_CLASS } from "@/lib/design/vocabulary-composition";

import { ExamplesSection } from "./ExamplesSection";
import { FormProgressionSection } from "./FormProgressionSection";
import {
  EditorialProse,
  NarrativeSection,
  VocabRussianDisplay,
} from "./VocabEditorial";
import { ReferenceAccordion } from "./ReferenceAccordion";
import { WhatIfSection } from "./WhatIfSection";

interface LearningStoryViewProps {
  story: TLearningStory;
}

export function LearningStoryView({ story }: LearningStoryViewProps) {
  const takeawayHint = story.steps.remember.points[0] ?? null;

  return (
    <>
      {story.surface ? (
        <div className={VOCAB_HERO_PANEL_CLASS}>
          <VocabRussianDisplay size="hero">{story.surface}</VocabRussianDisplay>
        </div>
      ) : null}

      <NarrativeSection question={story.steps.whyThisForm.question}>
        <EditorialProse>{story.steps.whyThisForm.answer}</EditorialProse>
      </NarrativeSection>

      <NarrativeSection question={story.steps.russianExpresses.question}>
        <EditorialProse>{story.steps.russianExpresses.answer}</EditorialProse>
      </NarrativeSection>

      <NarrativeSection question={story.steps.visibleSignal.question}>
        <EditorialProse>{story.steps.visibleSignal.answer}</EditorialProse>
      </NarrativeSection>

      <FormProgressionSection progression={story.formProgression} />

      <WhatIfSection comparisons={story.steps.whatIf} />

      <NarrativeSection question={story.steps.remember.question}>
        <ul className="space-y-3">
          {story.steps.remember.points.map((point) => (
            <li key={point} className="flex gap-2.5">
              <span
                className="mt-0.5 shrink-0 text-[13px] text-accent"
                aria-hidden="true"
              >
                ✓
              </span>
              <p className="text-[17px] leading-snug text-ink-2">{point}</p>
            </li>
          ))}
        </ul>
      </NarrativeSection>

      <ExamplesSection
        examples={story.examples}
        takeawayHint={takeawayHint}
      />

      <ReferenceAccordion reference={story.reference} />
    </>
  );
}
