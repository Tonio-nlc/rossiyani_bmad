import type { TVocabularyEntry } from "@/types/vocabulary";

import { VocabularyEntryHeader } from "./VocabularyEntryHeader";
import { ExamplesSection } from "./ExamplesSection";
import { InformationSection } from "./InformationSection";
import { ReviewSection } from "./ReviewSection";
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
  return (
    <div>
      <VocabularyEntryHeader
        entry={entry}
        returnHref={returnHref}
        returnLabel={returnLabel}
      />

      <PageBody width="content">
        <PageSection spaced={false}>
          <InformationSection data={entry.linguisticData} />
        </PageSection>
        <PageSection>
          <ExamplesSection examples={entry.examples} />
        </PageSection>
        <PageSection>
          <ReviewSection review={entry.review} />
        </PageSection>
      </PageBody>
    </div>
  );
}
