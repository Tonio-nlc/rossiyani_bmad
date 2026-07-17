import type { TConceptLesson } from "@/types/concept-lesson";

import { ConceptExplorerSection } from "./ConceptExplorerSection";
import { ConceptHeroSection } from "./ConceptHeroSection";
import { ConceptSecondarySection } from "./ConceptSecondarySection";
import { ExamplesSection } from "./ExamplesSection";
import { TeachingScenarioView } from "./TeachingScenarioView";

interface ConceptLessonViewProps {
  lesson: TConceptLesson;
}

export function ConceptLessonView({ lesson }: ConceptLessonViewProps) {
  const takeawayHint = lesson.teachingScenario.memoryAnchor;

  return (
    <>
      <ConceptHeroSection hero={lesson.hero} />

      <TeachingScenarioView scenario={lesson.teachingScenario} />

      <ConceptSecondarySection concepts={lesson.secondaryConcepts} />

      <ExamplesSection examples={lesson.examples} takeawayHint={takeawayHint} />

      <ConceptExplorerSection explorer={lesson.conceptExplorer} />
    </>
  );
}
