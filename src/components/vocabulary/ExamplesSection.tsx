import type { TVocabularyExample } from "@/types/vocabulary";

interface ExamplesSectionProps {
  examples: TVocabularyExample[];
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  if (examples.length === 0) {
    return null;
  }

  const displayed = examples.slice(0, 4);

  return (
    <section className="space-y-3 border-t border-border/60 pt-6">
      <h2 className="text-sm font-semibold tracking-wide text-ink-3 uppercase">
        Illustrations
      </h2>
      <ul className="space-y-3">
        {displayed.map((example) => (
          <li key={example.id} className="space-y-1">
            <p className="font-russian text-base leading-relaxed text-ink-2">
              {example.sentenceRu}
            </p>
            {example.translationFr ? (
              <p className="text-sm italic text-ink-3">{example.translationFr}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
