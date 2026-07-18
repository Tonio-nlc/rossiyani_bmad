import type { TConceptLesson } from "@/types/concept-lesson";

import { ConceptExplorerSection } from "./ConceptExplorerSection";
import { ConceptHeroSection } from "./ConceptHeroSection";
import { ConceptSecondarySection } from "./ConceptSecondarySection";
import { TeachingScenarioView } from "./TeachingScenarioView";

interface ConceptLessonViewProps {
  lesson: TConceptLesson;
}

/**
 * Fiche concept-centrée uniquement :
 * Hero → Teaching Scenario → Concepts liés → Approfondir (replié).
 */
export function ConceptLessonView({ lesson }: ConceptLessonViewProps) {
  return (
    <>
      <ConceptHeroSection hero={lesson.hero} />

      <TeachingScenarioView scenario={lesson.teachingScenario} />

      <ConceptSecondarySection concepts={lesson.secondaryConcepts} />

      <ConceptExplorerSection
        explorer={lesson.conceptExplorer}
        examples={lesson.examples}
      />
    </>
  );
}
