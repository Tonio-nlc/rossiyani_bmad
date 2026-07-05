import Link from "next/link";

import type { TReviewQueueItem } from "@/lib/review/types";

interface ReviewViewProps {
  queue: TReviewQueueItem[];
  errorMessage?: string | null;
}

export function ReviewView({ queue, errorMessage }: ReviewViewProps) {
  if (errorMessage) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface">
      <header className="border-b border-brand-border bg-brand-card px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold text-brand-text-primary">
            Review
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <p className="text-lg text-brand-text-primary">
          {queue.length === 0
            ? "Aucun mot à réviser"
            : `${queue.length} mot${queue.length > 1 ? "s" : ""} à réviser`}
        </p>

        {queue.length > 0 && (
          <Link
            href="/review/session"
            className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90"
          >
            Commencer la session
          </Link>
        )}

        <div className="my-6 border-t border-brand-border" />

        {queue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-border bg-brand-card p-8 text-center">
            <p className="text-sm text-brand-text-secondary">
              Revenez plus tard — vos mots apparaîtront ici quand leur
              révision sera due.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {queue.map((item) => (
              <li
                key={item.userVocabularyId}
                className="rounded-xl border border-brand-border bg-brand-card px-5 py-4"
              >
                <p className="font-serif text-xl text-brand-text-primary">
                  {item.lemma}
                </p>
                {item.translation && (
                  <p className="mt-1 text-sm text-brand-text-secondary">
                    {item.translation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
