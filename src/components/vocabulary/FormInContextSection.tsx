import {
  getFunctionColorHex,
  stripTrailingPunctuationForDisplay,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import { splitPedagogicalBlocks } from "@/lib/vocabulary/vocabulary-pedagogy";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import {
  VocabRussianDisplay,
  VocabSection,
  VocabShortBlock,
  VocabStep,
} from "./VocabEditorial";

interface FormInContextSectionProps {
  encounter: TVocabularyContextEncounter;
}

export function FormInContextSection({ encounter }: FormInContextSectionProps) {
  const colorHex = getFunctionColorHex(
    encounter.functionColor as TReaderFunctionColor | undefined,
  );
  const cleanSurface = stripTrailingPunctuationForDisplay(encounter.surface);
  const explanationBlocks = splitPedagogicalBlocks(encounter.explanation);
  const suffixBlocks = splitPedagogicalBlocks(encounter.suffixExplanation);

  return (
    <VocabSection eyebrow="Dans la phrase" title="Comprendre cette forme">
      <VocabStep>
        <VocabRussianDisplay size="lg">{cleanSurface}</VocabRussianDisplay>
      </VocabStep>

      {encounter.suffix ? (
        <VocabStep>
          <span
            className="inline-block rounded-md px-2 py-1 font-russian text-xl"
            style={
              colorHex
                ? { color: colorHex, backgroundColor: `${colorHex}1F` }
                : undefined
            }
          >
            {encounter.suffix}
          </span>
        </VocabStep>
      ) : null}

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
          {encounter.roleLabel}
        </p>
      </VocabStep>

      {explanationBlocks.length > 0 ? (
        <VocabStep showArrow={suffixBlocks.length > 0}>
          <div className="space-y-3">
            {explanationBlocks.map((block) => (
              <VocabShortBlock key={block}>{block}</VocabShortBlock>
            ))}
          </div>
        </VocabStep>
      ) : null}

      {suffixBlocks.length > 0 ? (
        <VocabStep>
          <div className="space-y-2">
            {suffixBlocks.map((block) => (
              <VocabShortBlock key={block}>{block}</VocabShortBlock>
            ))}
          </div>
        </VocabStep>
      ) : null}

      <VocabStep showArrow={false}>
        <blockquote className="border-l-2 border-border pl-4">
          <p className="font-russian text-base leading-relaxed text-ink-2">
            {encounter.sentence}
          </p>
        </blockquote>
      </VocabStep>
    </VocabSection>
  );
}
