import {
  dedupeEditorialItems,
  rewriteEditorialText,
  toSingleLineTakeaway,
} from "@/lib/design/editorial-voice";
import {
  VOCAB_LIST_CLASS,
  VOCAB_LIST_ITEM_CLASS,
  VOCAB_TAKEAWAY_MAX,
} from "@/lib/design/vocabulary-composition";
import type { TLearningCardTakeaways } from "@/types/learning-card";

import { NarrativeSection } from "./VocabEditorial";

interface TakeawaySectionProps {
  takeaways: TLearningCardTakeaways;
}

export function TakeawaySection({ takeaways }: TakeawaySectionProps) {
  const items = dedupeEditorialItems(takeaways.items)
    .slice(0, VOCAB_TAKEAWAY_MAX)
    .map((item) => rewriteEditorialText(toSingleLineTakeaway(item)));

  if (items.length === 0) {
    return null;
  }

  return (
    <NarrativeSection question="Que dois-je retenir ?">
      <ul className={VOCAB_LIST_CLASS}>
        {items.map((item) => (
          <li key={item} className={VOCAB_LIST_ITEM_CLASS}>
            <span
              className="mt-0.5 shrink-0 text-[13px] text-accent"
              aria-hidden="true"
            >
              ✓
            </span>
            <p className="text-[17px] leading-snug text-ink-2">{item}</p>
          </li>
        ))}
      </ul>
    </NarrativeSection>
  );
}
