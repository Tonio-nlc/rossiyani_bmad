export interface TSRSInput {
  quality: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface TSRSResult {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: Date;
}

export function calculateNextReview(input: TSRSInput): TSRSResult {
  const { quality, easeFactor, intervalDays, repetitions } = input;

  let newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    newInterval = 1;
    newRepetitions = 0;
  } else {
    newRepetitions = repetitions + 1;
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(intervalDays * newEaseFactor);
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    intervalDays: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  };
}
