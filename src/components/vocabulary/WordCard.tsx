import Link from "next/link";

import { formatReviewLabel } from "@/lib/vocabulary/format-review-label";
import type { TVocabularyListItem } from "@/types/vocabulary";
import { cn } from "@/lib/utils";

interface WordCardProps {
  word: TVocabularyListItem;
}

export function WordCard({ word }: WordCardProps) {
  return (
    <Link
      href={`/vocabulary/${word.id}`}
      className={cn(
        "block rounded-xl border border-brand-border bg-brand-card p-5 transition-shadow",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
      )}
    >
      <p className="font-serif text-xl text-brand-text-primary">{word.lemma}</p>
      <p className="mt-1 text-base text-brand-text-secondary">
        {word.translation || "Traduction indisponible"}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-brand-text-muted">
        <span>Ajouté le {formatAddedDate(word.createdAt)}</span>
        <span>{formatReviewLabel(word.reviewStatus, word.nextReviewAt)}</span>
      </div>
    </Link>
  );
}

function formatAddedDate(dateValue: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
}
