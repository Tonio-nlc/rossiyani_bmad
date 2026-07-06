"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-sm font-bold text-white hover:bg-accent-deep"
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

    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        return;
      }

      setCompleted(true);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleMarkComplete}
      disabled={completed || isSaving}
      className="inline-flex items-center justify-center rounded-[10px] px-4 py-3 text-sm font-bold text-white transition-colors disabled:cursor-default disabled:bg-[#10B981]"
      style={{
        backgroundColor: completed ? "#10B981" : "#4F46E5",
      }}
    >
      {completed ? "✓ Marqué comme lu" : isSaving ? "Enregistrement…" : "Marquer comme lu"}
    </button>
  );
}
