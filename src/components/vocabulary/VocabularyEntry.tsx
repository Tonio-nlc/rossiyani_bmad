import type { TVocabularyEntry } from "@/types/vocabulary";

import { VocabularyEntryHeader } from "./VocabularyEntryHeader";
import { ExamplesSection } from "./ExamplesSection";
import { FormInContextSection } from "./FormInContextSection";
import { LinguisticProfileSection } from "./LinguisticProfileSection";
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
        <PageSection gap="default">
          <div className="space-y-8">
            {entry.contextEncounter ? (
              <FormInContextSection encounter={entry.contextEncounter} />
            ) : null}
            <LinguisticProfileSection profile={entry.linguisticProfile} />
            <ExamplesSection examples={entry.examples} />
            <ReviewSection review={entry.review} />
          </div>
        </PageSection>
      </PageBody>
    </div>
  );
}
