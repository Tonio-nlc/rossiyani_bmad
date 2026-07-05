import type { TReviewRating } from "@/lib/review/rating";

export async function submitReviewRating(
  userVocabularyId: string,
  rating: TReviewRating,
): Promise<void> {
  const response = await fetch("/api/review/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userVocabularyId, rating }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(
      payload?.error ?? "Impossible d'enregistrer la réponse",
    );
  }
}
