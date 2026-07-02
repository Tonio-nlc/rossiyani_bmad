import { ExamplesSection } from "@/components/vocabulary/ExamplesSection";
import { InformationSection } from "@/components/vocabulary/InformationSection";
import { ReviewSection } from "@/components/vocabulary/ReviewSection";
import { VocabularyEntryHeader } from "@/components/vocabulary/VocabularyEntryHeader";
import type { TVocabularyEntry } from "@/types/vocabulary";

interface VocabularyEntryProps {
  entry: TVocabularyEntry;
}

export function VocabularyEntry({ entry }: VocabularyEntryProps) {
  return (
    <div className="bg-brand-surface">
      <VocabularyEntryHeader entry={entry} />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8 md:py-10">
        <InformationSection data={entry.linguisticData} />
        <ExamplesSection examples={entry.examples} />
        <ReviewSection review={entry.review} />
      </div>
    </div>
  );
}
