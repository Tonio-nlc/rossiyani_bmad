import type {
  TReviewSessionItem,
  TReviewSessionProgress,
} from "@/lib/review/types";

export function getCurrentItem(
  items: TReviewSessionItem[],
  index: number,
): TReviewSessionItem | null {
  if (index < 0 || index >= items.length) {
    return null;
  }

  return items[index] ?? null;
}

export function getSessionProgress(
  index: number,
  total: number,
): TReviewSessionProgress {
  if (total === 0) {
    return { current: 0, total: 0, percentage: 0 };
  }

  const current = index + 1;

  return {
    current,
    total,
    percentage: Math.round((current / total) * 100),
  };
}

export function canGoPrevious(index: number): boolean {
  return index > 0;
}

export function canGoNext(index: number, total: number): boolean {
  return index < total - 1;
}

export function advanceSession(
  index: number,
  total: number,
): { nextIndex: number; isComplete: boolean } {
  if (index >= total - 1) {
    return { nextIndex: index, isComplete: true };
  }

  return { nextIndex: index + 1, isComplete: false };
}

export function retreatSession(
  index: number,
): { nextIndex: number; isComplete: boolean } {
  return {
    nextIndex: Math.max(0, index - 1),
    isComplete: false,
  };
}
