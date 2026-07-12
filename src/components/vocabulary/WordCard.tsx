import Link from "next/link";

import { CARD_SHELL_CLASS } from "@/components/ui/card-styles";
import { formatReviewLabel } from "@/lib/vocabulary/format-review-label";
import type { TVocabularyListItem } from "@/types/vocabulary";
import { cn } from "@/lib/utils";

interface WordCardProps {
  word: TVocabularyListItem;
  returnQuery?: string;
}

export function WordCard({ word, returnQuery = "" }: WordCardProps) {
  return (
    <Link
      href={`/vocabulary/${word.id}${returnQuery}`}
      className={cn(
        CARD_SHELL_CLASS,
        "block hover:shadow-sm",
      )}
    >
      <p className="font-serif text-xl text-ink">{word.lemma}</p>
      <p className="mt-1 text-base text-ink-2">
        {word.translation || "Traduction indisponible"}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-3">
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
