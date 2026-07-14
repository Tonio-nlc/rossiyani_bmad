import Link from "next/link";

import {
  VOCAB_BODY_CLASS,
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_EXAMPLE_CARD_CLASS,
  VOCAB_EXAMPLE_DIVIDER_CLASS,
  VOCAB_LIST_MAX,
} from "@/lib/design/vocabulary-composition";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import type { TLearningCardExample } from "@/types/learning-card";

import { VocabSection } from "./VocabEditorial";

interface ExamplesSectionProps {
  examples: TLearningCardExample[];
}

function RussianExampleText({ text }: { text: string }) {
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

function ExampleCitation({ example }: { example: TLearningCardExample }) {
  const sourceLabel =
    example.textId && example.textTitle
      ? example.textTitle
      : example.source === "cache"
        ? "Lecture précédente"
        : null;

  return (
    <figure className={VOCAB_EXAMPLE_CARD_CLASS}>
      <blockquote className={VOCAB_BODY_CLASS}>
        <RussianExampleText text={example.sentenceRu} />
      </blockquote>

      {example.translationFr ? (
        <>
          <div className={VOCAB_EXAMPLE_DIVIDER_CLASS} aria-hidden="true" />
          <figcaption className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">
              Phrase originale
            </p>
            <p className={VOCAB_BODY_SMALL_CLASS}>{example.translationFr}</p>
          </figcaption>
        </>
      ) : null}

      {sourceLabel ? (
        <p className="mt-2 text-[13px] text-ink-3">
          {example.textId && example.textTitle ? (
            <Link
              href={`/reader/${example.textId}`}
              className="text-accent hover:underline"
            >
              {sourceLabel} →
            </Link>
          ) : (
            sourceLabel
          )}
        </p>
      ) : null}
    </figure>
  );
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  const visibleExamples = examples.slice(0, VOCAB_LIST_MAX);

  if (visibleExamples.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Pour voir" title="Exemples">
      <div className="space-y-3">
        {visibleExamples.map((example) => (
          <ExampleCitation key={example.id} example={example} />
        ))}
      </div>
    </VocabSection>
  );
}
