import type { TVocabularyEntry } from "@/types/vocabulary";

import {
  LESSON_COLUMN_CLASS,
  LESSON_PAGE_SHELL_CLASS,
} from "@/lib/design/lesson-composition";
import { cn } from "@/lib/utils";

import { ConceptLessonView } from "./ConceptLessonView";
import { VocabularyEntryHeader } from "./VocabularyEntryHeader";

interface VocabularyEntryProps {
  entry: TVocabularyEntry;
  returnHref: string;
  returnLabel: string;
}

/**
 * Fiche vocabulaire — même colonne éditoriale que les pages Leçons (max-w-reading).
 */
export function VocabularyEntry({
  entry,
  returnHref,
  returnLabel,
}: VocabularyEntryProps) {
  const encounter = entry.contextEncounter
    ? {
        surface: entry.contextEncounter.surface,
        functionalRole: entry.contextEncounter.functionalRole,
        functionColor: entry.contextEncounter.functionColor,
      }
    : null;

  return (
    <div>
      <VocabularyEntryHeader
        returnHref={returnHref}
        returnLabel={returnLabel}
      />

      <article className={cn(LESSON_COLUMN_CLASS, LESSON_PAGE_SHELL_CLASS)}>
        <ConceptLessonView
          lesson={entry.conceptLesson}
          encounter={encounter}
        />
      </article>
    </div>
  );
}
