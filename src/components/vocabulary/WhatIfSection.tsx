import type { TWhatIfComparison } from "@/types/learning-story";

import {
  VOCAB_BODY_CLASS,
  VOCAB_FORM_CARD_CLASS,
  VOCAB_RUSSIAN_MD_CLASS,
} from "@/lib/design/vocabulary-composition";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import { NarrativeSection } from "./VocabEditorial";

function RussianForm({ text }: { text: string }) {
  const graphemes = displayRussianGraphemes(text);

  return (
    <span className={VOCAB_RUSSIAN_MD_CLASS}>
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

interface WhatIfSectionProps {
  comparisons: TWhatIfComparison[];
}

export function WhatIfSection({ comparisons }: WhatIfSectionProps) {
  if (comparisons.length === 0) {
    return null;
  }

  return (
    <NarrativeSection question="Et si…">
      <div className="space-y-3">
        {comparisons.map((comparison) => (
          <div
            key={`${comparison.fromForm}-${comparison.toForm}`}
            className={VOCAB_FORM_CARD_CLASS}
          >
            <div className="flex flex-wrap items-center gap-2">
              <RussianForm text={comparison.fromForm} />
              <span className="text-ink-3" aria-hidden="true">
                ↓
              </span>
              <RussianForm text={comparison.toForm} />
            </div>
            <p className="mt-2 text-[13px] font-semibold text-ink">
              Pourquoi ce n&apos;est plus pareil ?
            </p>
            <p className={`mt-1 ${VOCAB_BODY_CLASS}`}>{comparison.explanation}</p>
          </div>
        ))}
      </div>
    </NarrativeSection>
  );
}
