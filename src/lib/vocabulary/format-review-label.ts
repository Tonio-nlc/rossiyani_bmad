import {
  addDays,
  format,
  isSameDay,
  isTomorrow,
  startOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";

import type { TVocabularyReviewStatus } from "@/types/vocabulary";

export function formatReviewLabel(
  reviewStatus: TVocabularyReviewStatus,
  nextReviewAt: string | null,
): string {
  if (reviewStatus === "new") {
    return "Nouveau mot";
  }

  if (reviewStatus === "due") {
    if (!nextReviewAt) {
      return "À réviser";
    }

    const reviewDate = new Date(nextReviewAt);
    const today = startOfDay(new Date());

    if (reviewDate <= today) {
      return "À réviser aujourd'hui";
    }

    if (isTomorrow(reviewDate)) {
      return "À réviser demain";
    }

    return `À réviser le ${format(reviewDate, "d MMMM", { locale: fr })}`;
  }

  if (!nextReviewAt) {
    return "Appris";
  }

  const reviewDate = new Date(nextReviewAt);

  if (isSameDay(reviewDate, addDays(new Date(), 1))) {
    return "À réviser demain";
  }

  return `Prochaine révision le ${format(reviewDate, "d MMMM", { locale: fr })}`;
}
