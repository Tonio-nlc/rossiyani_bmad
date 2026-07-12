import {
  getFunctionColorHex,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import type { TLearningCardUnderstanding } from "@/types/learning-card";

import {
  VocabRussianDisplay,
  VocabSection,
  VocabShortBlock,
  VocabStep,
} from "./VocabEditorial";

interface UnderstandingSectionProps {
  understanding: TLearningCardUnderstanding;
}

function RussianSentence({ text }: { text: string }) {
  const graphemes = displayRussianGraphemes(text);

  return (
    <span className="font-russian">
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

export function UnderstandingSection({
  understanding,
}: UnderstandingSectionProps) {
  const colorHex = getFunctionColorHex(
    understanding.functionColor as TReaderFunctionColor | undefined,
  );

  return (
    <VocabSection eyebrow="Dans la phrase" title="Comprendre cette forme">
      {understanding.intro ? (
        <VocabStep>
          <VocabShortBlock>{understanding.intro}</VocabShortBlock>
        </VocabStep>
      ) : null}

      {understanding.whyPoints.length > 0 ? (
        <VocabStep showArrow={understanding.explanationBlocks.length > 0}>
          <div className="space-y-2">
            {understanding.whyPoints.map((point) => (
              <VocabShortBlock key={point}>{point}</VocabShortBlock>
            ))}
          </div>
        </VocabStep>
      ) : null}

      {understanding.suffix ? (
        <VocabStep>
          <span
            className="inline-block rounded-md px-2 py-1 font-russian text-xl"
            style={
              colorHex
                ? { color: colorHex, backgroundColor: `${colorHex}1F` }
                : undefined
            }
          >
            <RussianSentence text={understanding.suffix} />
          </span>
        </VocabStep>
      ) : null}

      {understanding.roleLabel ? (
        <VocabStep>
          <p
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={
              colorHex
                ? { color: colorHex, backgroundColor: `${colorHex}26` }
                : { color: "var(--ink-2)" }
            }
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={colorHex ? { backgroundColor: colorHex } : undefined}
              aria-hidden="true"
            />
            {understanding.roleLabel}
          </p>
        </VocabStep>
      ) : null}

      {understanding.explanationBlocks.length > 0 ? (
        <VocabStep showArrow={Boolean(understanding.sentence)}>
          <div className="space-y-3">
            {understanding.explanationBlocks.map((block) => (
              <VocabShortBlock key={block}>{block}</VocabShortBlock>
            ))}
          </div>
        </VocabStep>
      ) : null}

      {understanding.sentence ? (
        <VocabStep showArrow={false}>
          <blockquote className="border-l-2 border-border pl-4">
            <p className="text-base leading-relaxed text-ink-2">
              <RussianSentence text={understanding.sentence} />
            </p>
          </blockquote>
        </VocabStep>
      ) : null}
    </VocabSection>
  );
}
