import type { TVocabularyEntry } from "@/types/vocabulary";

import { EncounterSummarySection } from "./EncounterSummarySection";
import { ExamplesSection } from "./ExamplesSection";
import { ExploreWordSection } from "./ExploreWordSection";
import { FormInContextSection } from "./FormInContextSection";
import { ImportantVariantsSection } from "./ImportantVariantsSection";
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
  return (
    <div>
      <VocabularyEntryHeader
        entry={entry}
        returnHref={returnHref}
        returnLabel={returnLabel}
      />

      <PageBody width="content">
        <PageSection gap="default">
          <div className="space-y-2">
            {entry.contextEncounter ? (
              <EncounterSummarySection
                encounter={entry.contextEncounter}
                profile={entry.linguisticProfile}
                displayLemma={entry.displayLemma}
              />
            ) : null}

            {entry.contextEncounter ? (
              <FormInContextSection encounter={entry.contextEncounter} />
            ) : null}

            <ExploreWordSection profile={entry.linguisticProfile} />

            <ImportantVariantsSection profile={entry.linguisticProfile} />

            <ExamplesSection examples={entry.examples} />
          </div>
        </PageSection>
      </PageBody>
    </div>
  );
}
