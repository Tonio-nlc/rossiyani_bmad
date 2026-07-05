import {
  isReviewDue,
  mapReviewQueueRow,
  sortReviewQueue,
  type TReviewQueueItem,
} from "@/lib/review/types";
import { createClient } from "@/lib/supabase/server";

export async function getReviewQueue(
  userId: string,
): Promise<TReviewQueueItem[]> {
  const supabase = await createClient();
  const now = new Date();

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(
      `
      id,
      lemma_id,
      saved_at,
      lemmas ( form ),
      explanation_cache ( explanation_fr ),
      srs_reviews!inner ( next_review_at )
    `,
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const dueItems = (data ?? [])
    .map((row) => mapReviewQueueRow(row))
    .filter((item): item is TReviewQueueItem => item !== null)
    .filter((item) => isReviewDue(item.nextReviewAt, now));

  return sortReviewQueue(dueItems);
}
