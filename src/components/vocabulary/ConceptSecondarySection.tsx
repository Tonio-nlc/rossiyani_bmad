import { LessonSection } from "@/components/lessons/LessonSection";
import { RussianText } from "@/components/reader/RussianText";
import {
  LESSON_PROSE_CLASS,
  LESSON_SUBCONTENT_GAP_CLASS,
} from "@/lib/design/lesson-composition";
import { containsCyrillic } from "@/lib/lessons/lesson-colors";
import { LESSON_SECTION_RHYTHM } from "@/lib/lessons/lesson-section-rhythm";
import type { TConceptSecondaryCard } from "@/types/concept-lesson";

interface ConceptSecondarySectionProps {
  concepts: TConceptSecondaryCard[];
}

export function ConceptSecondarySection({
  concepts,
}: ConceptSecondarySectionProps) {
  if (concepts.length === 0) {
    return null;
  }

  const rhythm = LESSON_SECTION_RHYTHM.comprendre;

  return (
    <LessonSection
      sectionId="comprendre"
      eyebrow="LIENS"
      title="Concepts liés"
      {...rhythm}
    >
      <ul className={LESSON_SUBCONTENT_GAP_CLASS}>
        {concepts.map((concept) => (
          <li key={concept.conceptId}>
            <p className="text-[15px] font-semibold text-ink">{concept.title}</p>
            <p className={LESSON_PROSE_CLASS}>
              {containsCyrillic(concept.summary) ? (
                <RussianText>{concept.summary}</RussianText>
              ) : (
                concept.summary
              )}
            </p>
          </li>
        ))}
      </ul>
      <p className={LESSON_PROSE_CLASS}>
        Ces mécanismes apparaissent souvent avec le même type de forme.
      </p>
    </LessonSection>
  );
}
