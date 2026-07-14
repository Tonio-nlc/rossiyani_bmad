import type { TVocabularyEntry } from "@/types/vocabulary";

import { VOCAB_COLUMN_CLASS } from "@/lib/design/vocabulary-composition";

import { EncounterSection } from "./EncounterSection";
import { ExamplesSection } from "./ExamplesSection";
import { NextFormsSection } from "./NextFormsSection";
import { ReferenceAccordion } from "./ReferenceAccordion";
import { TakeawaySection } from "./TakeawaySection";
import { UnderstandingSection } from "./UnderstandingSection";
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
  const { learningCard } = entry;
  const hasUnderstanding = Boolean(learningCard.understanding);
  const hasEncounterOnly =
    Boolean(learningCard.encounter) && !hasUnderstanding;

  return (
    <div>
      <VocabularyEntryHeader
        header={learningCard.header}
        returnHref={returnHref}
        returnLabel={returnLabel}
      />

      <div className="bg-surface px-6 pb-10 pt-10 md:px-10">
        <div className={VOCAB_COLUMN_CLASS}>
          {hasUnderstanding ? (
            <UnderstandingSection
              understanding={learningCard.understanding!}
              encounter={learningCard.encounter}
            />
          ) : null}

          {hasEncounterOnly ? (
            <EncounterSection encounter={learningCard.encounter!} />
          ) : null}

          <TakeawaySection takeaways={learningCard.takeaways} />

          <NextFormsSection nextForms={learningCard.nextForms} />

          <ExamplesSection examples={learningCard.examples} />

          <ReferenceAccordion reference={learningCard.reference} />
        </div>
      </div>
    </div>
  );
}
