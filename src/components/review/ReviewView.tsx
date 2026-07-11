import Link from "next/link";

import { BackLink } from "@/components/ui/BackLink";
import type { ReturnContext } from "@/lib/navigation/return-context";
import {
  buildReturnQuery,
  resolveReaderBackNavigation,
} from "@/lib/navigation/return-context";
import type { TReviewQueueItem } from "@/lib/review/types";

interface ReviewViewProps {
  queue: TReviewQueueItem[];
  errorMessage?: string | null;
  returnContext?: ReturnContext;
}

export function ReviewView({
  queue,
  errorMessage,
  returnContext = { from: null, textId: null },
}: ReviewViewProps) {
  const backNavigation = resolveReaderBackNavigation(returnContext, {
    href: "/vocabulary",
    label: "Vocabulaire",
  });
  const sessionQuery =
    returnContext.from && returnContext.textId
      ? buildReturnQuery(returnContext.from, returnContext.textId)
      : "";

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-bg">
      <header className="border-b border-border bg-surface px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          <BackLink
            href={backNavigation.href}
            label={backNavigation.label}
          />
          <h1 className="mt-4 text-2xl font-bold text-ink md:text-3xl">
            Révision
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <p className="text-lg text-ink">
          {queue.length === 0
            ? "Aucun mot à réviser"
            : `${queue.length} mot${queue.length > 1 ? "s" : ""} à réviser`}
        </p>

        {queue.length > 0 && (
          <Link
            href={`/review/session${sessionQuery}`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
          >
            Commencer la session
          </Link>
        )}

        <div className="my-6 border-t border-border" />

        {queue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
            <p className="text-sm text-ink-2">
              Revenez plus tard — vos mots apparaîtront ici quand leur révision
              sera due.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {queue.map((item) => (
              <li
                key={item.userVocabularyId}
                className="rounded-xl border border-border bg-surface px-5 py-4"
              >
                <p className="font-russian text-xl text-ink">{item.lemma}</p>
                {item.translation && (
                  <p className="mt-1 text-sm text-ink-2">{item.translation}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
