import Link from "next/link";

import { LESSON_APPENDIX_CLASS } from "@/lib/design/lesson-composition";
import type { TVocabularyExample } from "@/types/vocabulary";

import { VocabSection } from "./VocabEditorial";

interface ExamplesSectionProps {
  examples: TVocabularyExample[];
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  if (examples.length === 0) {
    return null;
  }

  const displayed = examples.slice(0, 4);

  return (
    <VocabSection
      eyebrow="Pour voir"
      title="Illustrations"
      className={LESSON_APPENDIX_CLASS}
    >
      <ul className="space-y-5">
        {displayed.map((example) => (
          <li key={example.id} className="space-y-2">
            <p className="font-russian text-base leading-relaxed text-ink-2">
              {example.sentenceRu}
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
