import type { TVocabularyEntry } from "@/types/vocabulary";

import {
  VOCAB_COLUMN_CLASS,
  VOCAB_PAGE_SHELL_CLASS,
} from "@/lib/design/vocabulary-composition";
import { cn } from "@/lib/utils";

import { ConceptLessonView } from "./ConceptLessonView";
import { VocabularyEntryHeader } from "./VocabularyEntryHeader";

interface VocabularyEntryProps {
  entry: TVocabularyEntry;
  returnHref: string;
  returnLabel: string;
}

/**
 * Colonne éditoriale centrée (RC-022) — même pattern que la page leçon :
 * VOCAB_COLUMN_CLASS + shell sur l'article, pas un bandeau full-bleed.
 */
export function VocabularyEntry({
  entry,
  returnHref,
  returnLabel,
}: VocabularyEntryProps) {
  return (
    <div>
      <VocabularyEntryHeader
        returnHref={returnHref}
        returnLabel={returnLabel}
      />

      <article className={cn(VOCAB_COLUMN_CLASS, VOCAB_PAGE_SHELL_CLASS)}>
        <ConceptLessonView lesson={entry.conceptLesson} />
      </article>
    </div>
  );
}
