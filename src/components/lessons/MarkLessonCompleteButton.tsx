"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface MarkLessonCompleteButtonProps {
  lessonId: string;
  initialCompleted: boolean;
  isAuthenticated: boolean;
}

export function MarkLessonCompleteButton({
  lessonId,
  initialCompleted,
  isAuthenticated,
}: MarkLessonCompleteButtonProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep"
      >
        Connectez-vous pour marquer comme lu
      </a>
    );
  }

  async function handleMarkComplete() {
    if (completed || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(
          payload?.error ?? "Impossible d'enregistrer la progression.",
        );
        return;
      }

      setCompleted(true);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer la progression.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleMarkComplete}
        disabled={completed || isSaving}
        className={cn(
          "inline-flex items-center justify-center rounded-[10px] px-4 py-3 text-sm font-bold text-white transition-colors",
          completed
            ? "cursor-default bg-green"
            : "bg-accent hover:bg-accent-deep disabled:opacity-70",
        )}
      >
        {completed
          ? "✓ Marqué comme lu"
          : isSaving
            ? "Enregistrement…"
            : "Marquer comme lu"}
      </button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
