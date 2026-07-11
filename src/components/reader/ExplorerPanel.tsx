"use client";

/**
 * ATTENTION: ce panel doit rester en position: fixed, hors du flux du document.
 * Ne jamais le faire participer au layout de la colonne de texte. Toute modification
 * de son positionnement doit être testée en cliquant sur plusieurs mots successifs
 * pour vérifier qu'il ne bouge pas et ne pousse pas le texte.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ExplorerLessonDeepLink } from "@/components/reader/ExplorerLessonDeepLink";
import { Skeleton } from "@/components/ui/skeleton";
import { BTN_SECONDARY_CLASS } from "@/lib/design/classes";
import {
  getFunctionColorHex,
  getNaturalFunctionalRoleLabel,
  stripTrailingPunctuationForDisplay,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import type { TWordExplanationResponse } from "@/types/orchestrator";
import type { TLessonLink } from "@/types/lessons";
import { cn } from "@/lib/utils";

export interface ExplorerPanelProps {
  explanation: TWordExplanationResponse | null;
  isLoading: boolean;
  error: Error | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveWord: () => void;
  onRetry: () => void;
  isSaved: boolean;
  textId: string;
  lessonDeepLink?: TLessonLink | null;
  className?: string;
}

export const EXPLORER_PANEL_TEXT_PADDING_OPEN_PX = 360;
export const EXPLORER_PANEL_TEXT_PADDING_CLOSED_PX = 48;

const DESKTOP_PANEL_CLASS =
  "fixed z-50 box-border max-h-[calc(100dvh-3.5rem-7.5rem)] w-[320px] max-w-[calc(100vw-40px)] overflow-y-auto rounded-2xl border border-border bg-surface px-6 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-md:hidden";

function PanelDivider() {
  return <div className="my-5 h-px shrink-0 bg-border" />;
}

function ExplorerPanelHeader({
  showClose,
  onClose,
}: {
  showClose: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="mb-5 shrink-0 border-b border-border pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-ink-3">Explorer</h2>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[13px] font-bold text-ink-3 hover:text-ink-2"
          >
            Fermer
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-7 w-28 rounded-full" />
      <PanelDivider />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <PanelDivider />
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-11 w-full rounded-[10px]" />
    </div>
  );
}

function ExplorerError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[14px] leading-[1.65] text-ink">
        Impossible d&apos;obtenir une explication.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(BTN_SECONDARY_CLASS, "w-fit px-4 py-2 text-[14px]")}
      >
        Réessayer
      </button>
    </div>
  );
}

function ExplorerContent({
  explanation,
  isLoading,
  error,
  onSaveWord,
  onRetry,
  isSaved,
  textId,
  lessonDeepLink,
}: Pick<
  ExplorerPanelProps,
  | "explanation"
  | "isLoading"
  | "error"
  | "onSaveWord"
  | "onRetry"
  | "isSaved"
  | "textId"
  | "lessonDeepLink"
>) {
  if (isLoading) {
    return <ExplorerSkeleton />;
  }

  if (error) {
    return <ExplorerError onRetry={onRetry} />;
  }

  if (!explanation) {
    return null;
  }

  const colorHex = getFunctionColorHex(
    explanation.functionColor as TReaderFunctionColor,
  );
  const cleanSurface = stripTrailingPunctuationForDisplay(explanation.surface);
  const roleLabel = getNaturalFunctionalRoleLabel(explanation.functionalRole);
  const displayLemma =
    explanation.lemmaStressed ?? explanation.lemma.toLowerCase();
  const plainLemma = explanation.lemma.toLowerCase();
  const showSurfaceForm =
    cleanSurface !== displayLemma && cleanSurface !== plainLemma;

  return (
    <div className="reader-panel-fade-in flex flex-col">
      <section>
        {showSurfaceForm ? (
          <p className="text-[13px] text-ink-3">{cleanSurface}</p>
        ) : null}
        <p
          className={cn(
            "font-russian text-[28px] font-bold leading-tight text-ink",
            showSurfaceForm && "mt-1",
          )}
        >
          {displayLemma}
        </p>
        <p className="mt-1 text-[15px] font-normal text-ink-2">
          {explanation.translation}
        </p>

        <div className="mt-4">
          <span
            className="inline-flex items-center gap-2 rounded-[20px] px-3 py-1 text-xs font-semibold"
            style={
              colorHex
                ? {
                    color: colorHex,
                    backgroundColor: `${colorHex}26`,
                  }
                : undefined
            }
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={colorHex ? { backgroundColor: colorHex } : undefined}
              aria-hidden="true"
            />
            {roleLabel}
          </span>
        </div>
      </section>

      <PanelDivider />

      <section>
        <h3 className="text-[11px] font-bold tracking-[0.06em] text-ink-3">
          Explication
        </h3>
        <p className="mt-2 text-[14px] font-normal leading-[1.65] text-ink">
          {explanation.explanation}
        </p>
      </section>

      <PanelDivider />

      <section>
        <h3 className="text-[11px] font-bold tracking-[0.06em] text-ink-3">
          La terminaison
        </h3>
        {explanation.suffix ? (
          <div className="mt-2 space-y-2">
            <span
              className="inline-flex rounded-[6px] px-2.5 py-[3px] text-[13px] font-bold"
              style={
                colorHex
                  ? {
                      color: colorHex,
                      backgroundColor: `${colorHex}1F`,
                    }
                  : undefined
              }
            >
              {explanation.suffix}
            </span>
            <p className="text-[13px] font-normal text-ink-2">
              {explanation.suffixExplanation}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-ink-3">—</p>
        )}
      </section>

      {lessonDeepLink ? (
        <ExplorerLessonDeepLink lesson={lessonDeepLink} textId={textId} />
      ) : null}

      <button
        type="button"
        onClick={onSaveWord}
        disabled={isSaved || !explanation.lemmaId}
        className={cn(
          "mt-5 box-border w-full rounded-[10px] p-3 text-[14px] font-bold text-white transition-colors",
          isSaved
            ? "cursor-default bg-green"
            : "bg-accent hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {isSaved ? "✓ Sauvegardé" : "Sauvegarder ce mot"}
      </button>
    </div>
  );
}

export function ExplorerPanel({
  explanation,
  isLoading,
  error,
  isOpen,
  onClose,
  onSaveWord,
  onRetry,
  isSaved,
  textId,
  lessonDeepLink,
  className,
}: ExplorerPanelProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <aside
      className={cn(DESKTOP_PANEL_CLASS, className)}
      style={{
        top: "calc(3.5rem + 6.5rem)",
        right: 20,
      }}
      aria-label="Explorer"
    >
      <ExplorerPanelHeader showClose onClose={onClose} />
      <ExplorerContent
        explanation={explanation}
        isLoading={isLoading}
        error={error}
        onSaveWord={onSaveWord}
        onRetry={onRetry}
        isSaved={isSaved}
        textId={textId}
        lessonDeepLink={lessonDeepLink}
      />
    </aside>,
    document.body,
  );
}

export function ExplorerPanelMobile({
  explanation,
  isLoading,
  error,
  isOpen,
  onClose,
  onSaveWord,
  onRetry,
  isSaved,
  textId,
  lessonDeepLink,
}: ExplorerPanelProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fermer l'explorateur"
        className="reader-sheet-backdrop absolute inset-0 bg-black/25"
        onClick={onClose}
      />
      <div className="reader-sheet-panel absolute inset-x-0 bottom-0 mx-auto flex max-h-[min(70vh,calc(100dvh-4rem))] w-full flex-col overflow-y-auto overscroll-contain rounded-t-2xl border-t border-border bg-surface px-5 py-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div
          className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border"
          aria-hidden="true"
        />
        <ExplorerPanelHeader showClose onClose={onClose} />
        <ExplorerContent
          explanation={explanation}
          isLoading={isLoading}
          error={error}
          onSaveWord={onSaveWord}
          onRetry={onRetry}
          isSaved={isSaved}
          textId={textId}
          lessonDeepLink={lessonDeepLink}
        />
      </div>
    </div>,
    document.body,
  );
}
