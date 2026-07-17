import type { TConceptMiniTable } from "@/types/concept-lesson";

import {
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_CARD_CLASS,
  VOCAB_RUSSIAN_SM_CLASS,
} from "@/lib/design/vocabulary-composition";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import { NarrativeSection } from "./VocabEditorial";

function RussianForm({ text }: { text: string }) {
  const graphemes = displayRussianGraphemes(text);

  return (
    <span className={VOCAB_RUSSIAN_SM_CLASS}>
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

interface ConceptMiniTableSectionProps {
  miniTable: TConceptMiniTable | null;
}

export function ConceptMiniTableSection({
  miniTable,
}: ConceptMiniTableSectionProps) {
  if (!miniTable || miniTable.rows.length === 0) {
    return null;
  }

  return (
    <NarrativeSection question="Pour situer la forme">
      <div className={`${VOCAB_CARD_CLASS} overflow-hidden`}>
        <p className="border-b border-border/60 px-4 py-2.5 text-[13px] font-semibold text-ink">
          {miniTable.title}
        </p>
        <ul>
          {miniTable.rows.map((row) => (
            <li
              key={`${row.label}-${row.form}`}
              className="flex items-baseline justify-between gap-4 border-b border-border/40 px-4 py-2.5 last:border-b-0"
            >
              <span className={VOCAB_BODY_SMALL_CLASS}>{row.label}</span>
              <RussianForm text={row.form} />
            </li>
          ))}
        </ul>
      </div>
    </NarrativeSection>
  );
}
