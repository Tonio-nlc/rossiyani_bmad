import type { TVocabularyEntry } from "@/types/vocabulary";

import { EncounterSection } from "./EncounterSection";
import { ExamplesSection } from "./ExamplesSection";
import { NextFormsSection } from "./NextFormsSection";
import { ReferenceAccordion } from "./ReferenceAccordion";
import { TakeawaySection } from "./TakeawaySection";
import { UnderstandingSection } from "./UnderstandingSection";
import { VocabularyEntryHeader } from "./VocabularyEntryHeader";
import { PageBody } from "@/components/ui/PageBody";
import { PageSection } from "@/components/ui/PageSection";

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

  return (
    <div>
      <VocabularyEntryHeader
        header={learningCard.header}
        returnHref={returnHref}
        returnLabel={returnLabel}
      />

      <PageBody width="content">
        <PageSection gap="default">
          <div className="space-y-2">
            {learningCard.encounter ? (
              <EncounterSection encounter={learningCard.encounter} />
            ) : null}

            {learningCard.understanding ? (
              <UnderstandingSection understanding={learningCard.understanding} />
            ) : null}

            <TakeawaySection takeaways={learningCard.takeaways} />

            <NextFormsSection nextForms={learningCard.nextForms} />

            <ExamplesSection examples={learningCard.examples} />

            <ReferenceAccordion reference={learningCard.reference} />
          </div>
        </PageSection>
      </PageBody>
    </div>
  );
}
