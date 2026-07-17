import Link from "next/link";

import { buildExampleReason } from "@/lib/design/editorial-voice";
import {
  VOCAB_BODY_CLASS,
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_EXAMPLE_CARD_CLASS,
  VOCAB_EXAMPLE_MAX,
  VOCAB_TIGHT_GAP_CLASS,
} from "@/lib/design/vocabulary-composition";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import type { TLearningCardExample } from "@/types/learning-card";

import { EditorialProse, NarrativeSection } from "./VocabEditorial";

interface ExamplesSectionProps {
  examples: TLearningCardExample[];
  takeawayHint?: string | null;
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

function ExampleStory({
  example,
  takeawayHint,
}: {
  example: TLearningCardExample;
  takeawayHint?: string | null;
}) {
  const reason = buildExampleReason(example.translationFr, takeawayHint ?? null);
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
        <div className="mt-3">
          <p className="text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">
            Explication
          </p>
          <p className={`mt-1 ${VOCAB_BODY_SMALL_CLASS}`}>
            {example.translationFr}
          </p>
        </div>
      ) : null}

      <div className="mt-3">
        <p className="text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">
          Raison du choix
        </p>
        <div className="mt-1">
          <EditorialProse>{reason}</EditorialProse>
        </div>
      </div>

      {sourceLabel ? (
        <p className="mt-3 text-[13px] text-ink-3">
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

export function ExamplesSection({
  examples,
  takeawayHint = null,
}: ExamplesSectionProps) {
  const visibleExamples = examples.slice(0, VOCAB_EXAMPLE_MAX);

  if (visibleExamples.length === 0) {
    return null;
  }

  return (
    <NarrativeSection
      question={
        visibleExamples.length === 1 ? "Exemple" : "Exemples"
      }
    >
      <div className={VOCAB_TIGHT_GAP_CLASS}>
        {visibleExamples.map((example) => (
          <ExampleStory
            key={example.id}
            example={example}
            takeawayHint={takeawayHint}
          />
        ))}
      </div>
    </NarrativeSection>
  );
}
