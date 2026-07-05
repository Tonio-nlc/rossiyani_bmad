"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  advanceSession,
  getCurrentItem,
  getSessionProgress,
} from "@/lib/review/session";
import {
  REVIEW_RATINGS,
  REVIEW_RATING_LABELS,
  type TReviewRating,
} from "@/lib/review/rating";
import { submitReviewRating } from "@/lib/review/submit-review-rating";
import type { TReviewSessionItem } from "@/lib/review/types";
import {
  formatAspectLabel,
  formatGenderLabel,
  formatPosLabel,
} from "@/lib/vocabulary/format-linguistic-labels";
import { cn } from "@/lib/utils";

interface ReviewSessionProps {
  items: TReviewSessionItem[];
  errorMessage?: string | null;
}

export function ReviewSession({ items, errorMessage }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [ratedCount, setRatedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-brand-text-primary">
          Aucun mot à réviser
        </h1>
        <p className="mt-2 text-sm text-brand-text-secondary">
          Revenez plus tard lorsque des mots seront dus.
        </p>
        <Link
          href="/review"
          className="mt-6 inline-block text-sm font-medium text-brand-primary hover:underline"
        >
          Retour à Review
        </Link>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-brand-text-primary">
          Révision terminée.
        </h1>
        <p className="mt-3 text-lg text-brand-text-secondary">
          {ratedCount} réponse{ratedCount > 1 ? "s" : ""} enregistrée
          {ratedCount > 1 ? "s" : ""}.
        </p>
        <Link
          href="/review"
          className="mt-8 inline-block text-sm font-medium text-brand-primary hover:underline"
        >
          Retour à Review
        </Link>
      </div>
    );
  }

  const currentItem = getCurrentItem(items, currentIndex);

  if (!currentItem) {
    return null;
  }

  const progress = getSessionProgress(currentIndex, items.length);

  async function handleRating(rating: TReviewRating) {
    if (isSubmitting || !currentItem) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitReviewRating(currentItem.userVocabularyId, rating);

      const nextRatedCount = ratedCount + 1;
      setRatedCount(nextRatedCount);

      const { nextIndex, isComplete: finished } = advanceSession(
        currentIndex,
        items.length,
      );

      if (finished) {
        setIsComplete(true);
        return;
      }

      setCurrentIndex(nextIndex);
      setRevealed(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la réponse";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-brand-surface">
      <header className="border-b border-brand-border bg-brand-card px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/review"
            className="text-sm text-brand-text-secondary transition-colors hover:text-brand-text-primary"
          >
            ← Review
          </Link>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-brand-text-secondary">
              <span>
                {progress.current} / {progress.total}
              </span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-border">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <ReviewSessionCard item={currentItem} revealed={revealed} />

        {!revealed ? (
          <Button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-8 w-full bg-brand-primary text-white hover:bg-brand-primary/90 sm:w-auto"
          >
            Révéler
          </Button>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {REVIEW_RATINGS.map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleRating(rating)}
                  className={cn(
                    "h-11 text-sm font-medium",
                    ratingButtonClassName(rating),
                  )}
                >
                  {REVIEW_RATING_LABELS[rating]}
                </Button>
              ))}
            </div>

            {isSubmitting && (
              <p className="mt-3 text-sm text-brand-text-muted">
                Enregistrement…
              </p>
            )}

            {submitError && (
              <p className="mt-3 text-sm text-destructive">{submitError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ratingButtonClassName(rating: TReviewRating): string {
  switch (rating) {
    case "again":
      return "bg-red-600 text-white hover:bg-red-600/90 disabled:opacity-50";
    case "hard":
      return "bg-orange-500 text-white hover:bg-orange-500/90 disabled:opacity-50";
    case "good":
      return "bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50";
    case "easy":
      return "bg-emerald-600 text-white hover:bg-emerald-600/90 disabled:opacity-50";
  }
}

interface ReviewSessionCardProps {
  item: TReviewSessionItem;
  revealed: boolean;
}

function ReviewSessionCard({ item, revealed }: ReviewSessionCardProps) {
  const knowledgeRows = revealed
    ? [
        formatPosLabel(item.knowledge?.partOfSpeech)
          ? {
              label: "Catégorie grammaticale",
              value: formatPosLabel(item.knowledge?.partOfSpeech)!,
            }
          : null,
        formatAspectLabel(item.knowledge?.aspect)
          ? {
              label: "Aspect",
              value: formatAspectLabel(item.knowledge?.aspect)!,
            }
          : null,
        formatGenderLabel(item.knowledge?.gender)
          ? { label: "Genre", value: formatGenderLabel(item.knowledge?.gender)! }
          : null,
      ].filter((row): row is { label: string; value: string } => row !== null)
    : [];

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-8 text-center">
      <p className="font-serif text-4xl text-brand-text-primary md:text-5xl">
        {item.lemma}
      </p>

      {revealed && (
        <div className="mt-8 space-y-6">
          {item.translation && (
            <p className="text-xl text-brand-text-secondary md:text-2xl">
              {item.translation}
            </p>
          )}

          {knowledgeRows.length > 0 && (
            <div className="mx-auto max-w-md border-t border-brand-border pt-6 text-left">
              <p className="text-xs font-medium tracking-[0.15em] text-brand-text-muted uppercase">
                Informations principales
              </p>
              <dl className="mt-3 space-y-2">
                {knowledgeRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <dt className="text-brand-text-muted">{row.label}</dt>
                    <dd className="text-brand-text-primary">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
