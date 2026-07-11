import type { TVocabularyExample } from "@/types/vocabulary";

interface ExamplesSectionProps {
  examples: TVocabularyExample[];
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  if (examples.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold text-ink">
        Exemples
      </h2>
      <ul className="mt-4 space-y-4">
        {examples.map((example) => (
          <li
            key={example.id}
            className="rounded-lg border border-border bg-bg p-4"
          >
            <p className="font-serif text-lg text-ink">
              {example.sentenceRu}
            </p>
            {example.translationFr && (
              <p className="mt-2 text-sm text-ink-2">
                {example.translationFr}
              </p>
            )}
            {example.textTitle && (
              <p className="mt-3 text-xs text-ink-3">
                {example.source === "text"
                  ? `Texte Rossiyani · ${example.textTitle}`
                  : "Contexte de lecture"}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
