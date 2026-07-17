import type { TFormProgressionItem } from "@/types/learning-story";

import { VOCAB_RUSSIAN_MD_CLASS } from "@/lib/design/vocabulary-composition";
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

interface FormProgressionSectionProps {
  progression: TFormProgressionItem[];
}

export function FormProgressionSection({
  progression,
}: FormProgressionSectionProps) {
  if (progression.length < 2) {
    return null;
  }

  return (
    <NarrativeSection question="Si je change cette forme ?">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {progression.map((item, index) => (
          <div key={item.form} className="flex items-center gap-3">
            <RussianForm text={item.form} />
            {index < progression.length - 1 ? (
              <span className="text-ink-3" aria-hidden="true">
                ↓
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[15px] leading-snug text-ink-2">
        Chaque forme déplace le sens. Le russe ne les interchange pas au hasard.
      </p>
    </NarrativeSection>
  );
}
