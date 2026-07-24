"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { TeachingScenarioView } from "@/components/vocabulary/TeachingScenarioView";
import { Skeleton } from "@/components/ui/skeleton";
import { VOCAB_EYEBROW_CLASS } from "@/lib/design/vocabulary-composition";
import { EXPLORER_SPACE } from "@/lib/design/reader-composition";
import type { TTeachingScenario } from "@/types/teaching-scenario";
import { cn } from "@/lib/utils";

interface ExplorerConceptDeepLinkProps {
  conceptSlug: string;
  conceptTitle: string;
  /** Régence détectée — illustration alignée (ex. до + génitif). */
  conceptPreposition?: string | null;
  conceptGovernedCase?: string | null;
}

interface ConceptApiPayload {
  concept: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    coreIdea: string;
  };
  scenario: TTeachingScenario;
}

/**
 * Entrée secondaire Explorer → fiche concept (phénomène).
 * Ouvre un overlay avec le scénario canonique (pas de bridge lemme).
 * Route page `/concepts/[slug]` : à créer ultérieurement.
 */
export function ExplorerConceptDeepLink({
  conceptSlug,
  conceptTitle,
  conceptPreposition,
  conceptGovernedCase,
}: ExplorerConceptDeepLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <div className={EXPLORER_SPACE.afterBadge}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group text-left transition-colors"
        >
          <span className={cn(VOCAB_EYEBROW_CLASS, "block")}>
            Concept · {conceptTitle}
            <span
              className="ml-1.5 text-accent opacity-70 group-hover:opacity-100"
              aria-hidden="true"
            >
              →
            </span>
          </span>
        </button>
      </div>

      {isOpen ? (
        <ConceptCanonicalOverlay
          conceptSlug={conceptSlug}
          conceptTitle={conceptTitle}
          conceptPreposition={conceptPreposition}
          conceptGovernedCase={conceptGovernedCase}
          titleId={titleId}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}

function ConceptCanonicalOverlay({
  conceptSlug,
  conceptTitle,
  conceptPreposition,
  conceptGovernedCase,
  titleId,
  onClose,
}: {
  conceptSlug: string;
  conceptTitle: string;
  conceptPreposition?: string | null;
  conceptGovernedCase?: string | null;
  titleId: string;
  onClose: () => void;
}) {
  const [scenario, setScenario] = useState<TTeachingScenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (conceptPreposition) {
        params.set("prep", conceptPreposition);
      }

      if (conceptGovernedCase) {
        params.set("case", conceptGovernedCase);
      }

      const query = params.toString();
      const response = await fetch(
        `/api/concepts/${encodeURIComponent(conceptSlug)}${query ? `?${query}` : ""}`,
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Impossible de charger le concept");
      }

      const payload = (await response.json()) as ConceptApiPayload;
      setScenario(payload.scenario);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger le concept",
      );
      setScenario(null);
    } finally {
      setIsLoading(false);
    }
  }, [conceptSlug, conceptPreposition, conceptGovernedCase]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <button
        type="button"
        aria-label="Fermer le concept"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[61] flex max-h-[min(860px,92dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-[0_8px_40px_rgba(0,0,0,0.18)] md:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
          <div>
            <p className={VOCAB_EYEBROW_CLASS}>Concept</p>
            <h2
              id={titleId}
              className="mt-1 font-serif text-xl font-semibold text-ink md:text-2xl"
            >
              {conceptTitle}
            </h2>
            <p className="mt-1 text-xs text-ink-3">
              Phénomène linguistique — pas un mot particulier
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-[13px] font-semibold text-ink-3 hover:text-ink"
          >
            Fermer
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : null}

          {error ? (
            <div className="space-y-3">
              <p className="text-sm text-ink">{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Réessayer
              </button>
            </div>
          ) : null}

          {!isLoading && !error && scenario ? (
            <TeachingScenarioView scenario={scenario} encounter={null} />
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
