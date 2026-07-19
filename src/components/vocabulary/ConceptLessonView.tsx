import type { TConceptLesson } from "@/types/concept-lesson";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import { ConceptExplorerSection } from "./ConceptExplorerSection";
import { ConceptHeroSection } from "./ConceptHeroSection";
import { ConceptSecondarySection } from "./ConceptSecondarySection";
import { TeachingScenarioView } from "./TeachingScenarioView";

interface ConceptLessonViewProps {
  lesson: TConceptLesson;
  encounter?: TVocabularyContextEncounter | null;
}

/**
 * Fiche concept-centrée — composition Leçons :
 * Hero → Teaching Scenario → Concepts liés → Approfondir.
 */
export function ConceptLessonView({
  lesson,
  encounter = null,
}: ConceptLessonViewProps) {
  return (
    <>
      <ConceptHeroSection hero={lesson.hero} />

      <TeachingScenarioView
        scenario={lesson.teachingScenario}
        encounter={encounter}
      />

      <ConceptSecondarySection concepts={lesson.secondaryConcepts} />

      <ConceptExplorerSection
        explorer={lesson.conceptExplorer}
        examples={lesson.examples}
        encounter={encounter}
      />
    </>
  );
}
