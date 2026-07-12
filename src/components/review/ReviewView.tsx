import Link from "next/link";

import { BackLink } from "@/components/ui/BackLink";
import { RussianText } from "@/components/reader/RussianText";
import { EmptyState } from "@/components/ui/empty-state";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSection } from "@/components/ui/PageSection";
import { BTN_PRIMARY_CLASS } from "@/lib/design/classes";
import type { ReturnContext } from "@/lib/navigation/return-context";
import {
  buildReturnQuery,
  resolveReaderBackNavigation,
} from "@/lib/navigation/return-context";
import { cn } from "@/lib/utils";
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
      <PageBody width="content">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </PageBody>
    );
  }

  const subtitle =
    queue.length === 0
      ? "Revenez lorsque des mots seront dus."
      : `${queue.length} mot${queue.length > 1 ? "s" : ""} à réviser aujourd'hui.`;

  return (
    <div>
      <PageHeader
        eyebrow="MÉMOIRE"
        title="Révision"
        subtitle={subtitle}
        width="content"
        leading={
          <BackLink
            href={backNavigation.href}
            label={backNavigation.label}
          />
        }
      />

      <PageBody width="content">
        {queue.length > 0 ? (
          <Link
            href={`/review/session${sessionQuery}`}
            className={cn(BTN_PRIMARY_CLASS, "h-10 px-4 text-sm")}
          >
            Commencer la session
          </Link>
        ) : null}

        <PageSection gap={queue.length > 0 ? "default" : "none"}>
          {queue.length === 0 ? (
            <EmptyState
              title="Rien à réviser pour l'instant"
              description="Revenez plus tard — vos mots apparaîtront ici quand leur révision sera due."
              dashed={false}
            />
          ) : (
            <ul className="space-y-3">
              {queue.map((item) => (
                <li
                  key={item.userVocabularyId}
                  className="rounded-[14px] border border-border bg-surface px-5 py-4"
                >
                  <p className="text-xl text-ink">
                    <RussianText>{item.lemma}</RussianText>
                  </p>
                  {item.translation ? (
                    <p className="mt-1 text-sm text-ink-2">{item.translation}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </PageSection>
      </PageBody>
    </div>
  );
}
