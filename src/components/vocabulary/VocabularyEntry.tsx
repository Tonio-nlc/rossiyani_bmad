import type { TVocabularyEntry } from "@/types/vocabulary";

import { VocabularyEntryHeader } from "./VocabularyEntryHeader";
import { ExamplesSection } from "./ExamplesSection";
import { InformationSection } from "./InformationSection";
import { ReviewSection } from "./ReviewSection";

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

      <div className="mx-auto max-w-content space-y-6 px-4 py-8 md:px-8 md:py-10">
        <InformationSection data={entry.linguisticData} />
        <ExamplesSection examples={entry.examples} />
        <ReviewSection review={entry.review} />
      </div>
    </div>
  );
}
