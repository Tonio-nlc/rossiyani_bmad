import type { TLearningCardTakeaways } from "@/types/learning-card";

import { VocabSection, VocabShortBlock } from "./VocabEditorial";

interface TakeawaySectionProps {
  takeaways: TLearningCardTakeaways;
}

export function TakeawaySection({ takeaways }: TakeawaySectionProps) {
  if (takeaways.items.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Essentiel" title="À retenir">
      <ul className="space-y-3">
        {takeaways.items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-0.5 text-accent" aria-hidden="true">
              ✓
            </span>
            <VocabShortBlock>{item}</VocabShortBlock>
          </li>
        ))}
      </ul>
    </VocabSection>
  );
}
