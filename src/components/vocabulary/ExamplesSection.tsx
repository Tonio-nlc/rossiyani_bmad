import type { TVocabularyExample } from "@/types/vocabulary";

interface ExamplesSectionProps {
  examples: TVocabularyExample[];
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  if (examples.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-brand-border bg-brand-card p-6">
      <h2 className="text-xl font-semibold text-brand-text-primary">
        Exemples
      </h2>
      <ul className="mt-4 space-y-4">
        {examples.map((example) => (
          <li
            key={example.id}
            className="rounded-lg border border-brand-border bg-brand-surface p-4"
          >
            <p className="font-serif text-lg text-brand-text-primary">
              {example.sentenceRu}
            </p>
            {example.translationFr && (
              <p className="mt-2 text-sm text-brand-text-secondary">
                {example.translationFr}
              </p>
            )}
            {example.textTitle && (
              <p className="mt-3 text-xs text-brand-text-muted">
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
