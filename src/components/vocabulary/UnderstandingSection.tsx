import {
  VOCAB_BODY_CLASS,
  VOCAB_EXAMPLE_CARD_CLASS,
  VOCAB_EXAMPLE_DIVIDER_CLASS,
  VOCAB_SUBTITLE_CLASS,
  VOCAB_SUFFIX_CARD_CLASS,
} from "@/lib/design/vocabulary-composition";
import {
  getFunctionColorHex,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import type {
  TLearningCardEncounter,
  TLearningCardUnderstanding,
} from "@/types/learning-card";

import {
  VocabChipRow,
  VocabMutedLabel,
  VocabRussianDisplay,
  VocabSection,
  VocabShortBlock,
} from "./VocabEditorial";

interface UnderstandingSectionProps {
  understanding: TLearningCardUnderstanding;
  encounter?: TLearningCardEncounter | null;
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
  encounter = null,
}: UnderstandingSectionProps) {
  const colorHex = getFunctionColorHex(
    understanding.functionColor as TReaderFunctionColor | undefined,
  );

  const formChips =
    encounter?.formChips.map((chip) => chip.toLowerCase()) ?? [];
  const traitChips = encounter?.traitChips ?? [];
  const surface = encounter?.surface;

  return (
    <VocabSection eyebrow="Dans la phrase" title="Comprendre cette forme">
      <div className="space-y-4">
        {surface ? (
          <VocabRussianDisplay size="hero">{surface}</VocabRussianDisplay>
        ) : null}

        {formChips.length > 0 || traitChips.length > 0 ? (
          <div className="space-y-2">
            {formChips.length > 0 ? <VocabChipRow chips={formChips} /> : null}
            {encounter ? (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <VocabMutedLabel>{encounter.originPhrase}</VocabMutedLabel>
                <VocabRussianDisplay size="md">{encounter.lemma}</VocabRussianDisplay>
              </div>
            ) : null}
            {traitChips.length > 0 ? <VocabChipRow chips={traitChips} /> : null}
          </div>
        ) : null}

        {understanding.suffix || understanding.roleLabel ? (
          <div className={VOCAB_SUFFIX_CARD_CLASS}>
            {understanding.suffix ? (
              <p
                className="font-russian text-[1.75rem] leading-none"
                style={colorHex ? { color: colorHex } : undefined}
              >
                <RussianSentence text={understanding.suffix} />
              </p>
            ) : null}
            {understanding.roleLabel ? (
              <p
                className="mt-2 text-[15px] font-medium leading-snug"
                style={colorHex ? { color: colorHex } : undefined}
              >
                {understanding.roleLabel}
              </p>
            ) : null}
          </div>
        ) : null}

        {understanding.intro ? (
          <VocabShortBlock>{understanding.intro}</VocabShortBlock>
        ) : null}

        {understanding.whyPoints.length > 0 ? (
          <div className="space-y-2">
            <h3 className={VOCAB_SUBTITLE_CLASS}>Pourquoi ?</h3>
            <div className="space-y-3">
              {understanding.whyPoints.map((point) => (
                <VocabShortBlock key={point}>{point}</VocabShortBlock>
              ))}
            </div>
          </div>
        ) : null}

        {understanding.explanationBlocks.length > 0 ? (
          <div className="space-y-2">
            <h3 className={VOCAB_SUBTITLE_CLASS}>Dans cette phrase</h3>
            <div className="space-y-3">
              {understanding.explanationBlocks.map((block) => (
                <VocabShortBlock key={block}>{block}</VocabShortBlock>
              ))}
            </div>
          </div>
        ) : null}

        {understanding.sentence ? (
          <div className="space-y-2">
            <h3 className={VOCAB_SUBTITLE_CLASS}>Phrase russe</h3>
            <p className={VOCAB_BODY_CLASS}>
              <RussianSentence text={understanding.sentence} />
            </p>
          </div>
        ) : null}
      </div>
    </VocabSection>
  );
}
