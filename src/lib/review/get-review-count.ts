import { getReviewQueue } from "@/lib/review/get-review-queue";
import type { TReviewCount } from "@/lib/review/types";

export async function getReviewCount(userId: string): Promise<TReviewCount> {
  const queue = await getReviewQueue(userId);

  return { due: queue.length };
}
