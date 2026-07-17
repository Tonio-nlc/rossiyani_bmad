import type { TConceptContrast } from "@/types/concept-lesson";

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

interface ConceptContrastsSectionProps {
  contrasts: TConceptContrast[];
}

export function ConceptContrastsSection({
  contrasts,
}: ConceptContrastsSectionProps) {
  if (contrasts.length === 0) {
    return null;
  }

  return (
    <NarrativeSection question="Ce qui change si on utilise une autre forme">
      <div className="space-y-3">
        {contrasts.map((contrast) => (
          <div
            key={`${contrast.fromForm}-${contrast.toForm}`}
            className={VOCAB_FORM_CARD_CLASS}
          >
            <div className="flex flex-wrap items-center gap-2">
              <RussianForm text={contrast.fromForm} />
              <span className="text-ink-3" aria-hidden="true">
                ↓
              </span>
              <RussianForm text={contrast.toForm} />
            </div>
            <p className="mt-2 text-[13px] font-semibold text-ink">
              {contrast.question}
            </p>
            <p className={`mt-1 ${VOCAB_BODY_CLASS}`}>{contrast.explanation}</p>
          </div>
        ))}
      </div>
    </NarrativeSection>
  );
}
