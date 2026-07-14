import {
  VOCAB_LIST_CLASS,
  VOCAB_LIST_ITEM_CLASS,
  VOCAB_LIST_MAX,
} from "@/lib/design/vocabulary-composition";
import type { TLearningCardTakeaways } from "@/types/learning-card";

import { VocabSection, VocabShortBlock } from "./VocabEditorial";

interface TakeawaySectionProps {
  takeaways: TLearningCardTakeaways;
}

export function TakeawaySection({ takeaways }: TakeawaySectionProps) {
  const items = takeaways.items.slice(0, VOCAB_LIST_MAX);

  if (items.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Essentiel" title="À retenir">
      <ul className={VOCAB_LIST_CLASS}>
        {items.map((item) => (
          <li key={item} className={VOCAB_LIST_ITEM_CLASS}>
            <span
              className="mt-1 shrink-0 text-[13px] text-accent"
              aria-hidden="true"
            >
              ✓
            </span>
            <VocabShortBlock>{item}</VocabShortBlock>
          </li>
        ))}
      </ul>
    </VocabSection>
  );
}
