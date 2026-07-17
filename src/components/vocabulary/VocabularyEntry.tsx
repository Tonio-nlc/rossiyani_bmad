import type { TVocabularyEntry } from "@/types/vocabulary";

import { VOCAB_COLUMN_CLASS } from "@/lib/design/vocabulary-composition";

import { ConceptLessonView } from "./ConceptLessonView";
import { VocabularyEntryHeader } from "./VocabularyEntryHeader";

interface VocabularyEntryProps {
  entry: TVocabularyEntry;
  returnHref: string;
  returnLabel: string;
}

export function VocabularyEntry({
  entry,
  returnHref,
  returnLabel,
}: VocabularyEntryProps) {
  const { conceptLesson } = entry;

  return (
    <article>
      <VocabularyEntryHeader
        header={conceptLesson.header}
        phenomenonTitle={conceptLesson.hero.phenomenon.title}
        returnHref={returnHref}
        returnLabel={returnLabel}
      />

      <div className="bg-surface px-6 pb-12 pt-8 md:px-10">
        <div className={VOCAB_COLUMN_CLASS}>
          <ConceptLessonView lesson={conceptLesson} />
        </div>
      </div>
    </article>
  );
}
