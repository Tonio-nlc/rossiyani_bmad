import Link from "next/link";

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

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  if (examples.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Pour voir" title="Exemples">
      <ul className="space-y-5">
        {examples.map((example) => (
          <li key={example.id} className="space-y-2">
            <p className="text-base leading-relaxed text-ink-2">
              <RussianExampleText text={example.sentenceRu} />
            </p>
            {example.translationFr ? (
              <p className="text-sm italic text-ink-3">{example.translationFr}</p>
            ) : null}
            {example.textId && example.textTitle ? (
              <Link
                href={`/reader/${example.textId}`}
                className="inline-block text-sm text-accent hover:underline"
              >
                {example.textTitle} →
              </Link>
            ) : example.source === "cache" ? (
              <p className="text-sm text-ink-3">
                Exemple issu d&apos;une lecture précédente
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </VocabSection>
  );
}
