import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { CARD_SHELL_CLASS } from "@/components/ui/card-styles";
import type { TVocabularyReviewInfo } from "@/types/vocabulary";

interface ReviewSectionProps {
  review: TVocabularyReviewInfo | null;
}

function formatNextReview(nextReviewAt: string): string {
  return format(new Date(nextReviewAt), "d MMMM yyyy", { locale: fr });
}

export function ReviewSection({ review }: ReviewSectionProps) {
  if (!review) {
    return null;
  }

  return (
    <section className={CARD_SHELL_CLASS}>
      <h2 className="text-xl font-semibold text-ink">
        Révision
      </h2>
      <dl className="mt-4 divide-y divide-border">
        <div className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <dt className="text-sm text-ink-3">Prochaine révision</dt>
          <dd className="text-base text-ink sm:text-right">
            {formatNextReview(review.nextReviewAt)}
          </dd>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <dt className="text-sm text-ink-3">Nombre de révisions</dt>
          <dd className="text-base text-ink sm:text-right">
            {review.repetitions}
          </dd>
        </div>
        <div className="flex flex-col gap-1 py-3 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <dt className="text-sm text-ink-3">Niveau actuel</dt>
          <dd className="text-base text-ink sm:text-right">
            {review.currentLevel}
          </dd>
        </div>
      </dl>
    </section>
  );
}
