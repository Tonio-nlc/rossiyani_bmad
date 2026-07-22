"use client";

/**
 * Panneau Explorer — composition éditoriale secondaire (Story 5.4).
 * Position fixed hors flux ; max 520px, scroll interne.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ExplorerConceptDeepLink } from "@/components/reader/ExplorerConceptDeepLink";
import { ExplorerLessonDeepLink } from "@/components/reader/ExplorerLessonDeepLink";
import { Skeleton } from "@/components/ui/skeleton";
import { BTN_PRIMARY_CLASS, BTN_SECONDARY_CLASS } from "@/lib/design/classes";
import {
  EXPLORER_PANEL_MAX_HEIGHT_CLASS,
  EXPLORER_PANEL_WIDTH_CLASS,
  EXPLORER_SPACE,
} from "@/lib/design/reader-composition";
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

const DESKTOP_SHELL_CLASS = cn(
  "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-md:hidden",
  EXPLORER_PANEL_WIDTH_CLASS,
  EXPLORER_PANEL_MAX_HEIGHT_CLASS,
  "max-w-[calc(100vw-40px)]",
);

function ExplorerPanelChrome({
  showClose,
  onClose,
  children,
}: {
  showClose: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="shrink-0 border-b border-border px-5 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">
            Explorer
          </h2>
          {showClose && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-semibold text-ink-3 hover:text-ink-2"
            >
              Fermer
            </button>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
    </>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="reader-panel-fade-in space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-28 rounded-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex justify-end pt-2">
        <Skeleton className="h-9 w-36 rounded-[10px]" />
      </div>
    </div>
  );
}

function ExplorerError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="reader-panel-fade-in flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink">
        Impossible d&apos;obtenir une explication.
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRetry}
          className={cn(BTN_SECONDARY_CLASS, "px-4 py-2 text-sm")}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

function ExplorerSaveButton({
  isSaved,
  disabled,
  onClick,
}: {
  isSaved: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className={cn("flex justify-end", EXPLORER_SPACE.afterBridge)}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          BTN_PRIMARY_CLASS,
          "px-4 py-2.5 text-sm",
          isSaved && "cursor-default bg-green hover:bg-green",
          disabled && !isSaved && "opacity-50",
        )}
      >
        {isSaved ? "✓ Sauvegardé" : "Sauvegarder"}
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
      {showSurfaceForm ? (
        <p className="text-xs text-ink-3">{cleanSurface}</p>
      ) : null}
      <p
        className={cn(
          "font-russian text-[26px] font-bold leading-tight text-ink",
          showSurfaceForm && "mt-1",
        )}
      >
        {displayLemma}
      </p>

      <p className={cn("text-[15px] text-ink-2", EXPLORER_SPACE.afterWord)}>
        {explanation.translation}
      </p>

      <div className={EXPLORER_SPACE.afterTranslation}>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
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
            className="size-1.5 shrink-0 rounded-full"
            style={colorHex ? { backgroundColor: colorHex } : undefined}
            aria-hidden="true"
          />
          {roleLabel}
        </span>
      </div>

      {explanation.conceptSlug && explanation.conceptTitle ? (
        <ExplorerConceptDeepLink
          conceptSlug={explanation.conceptSlug}
          conceptTitle={explanation.conceptTitle}
        />
      ) : null}

      <p
        className={cn(
          "text-sm leading-[1.65] text-ink",
          EXPLORER_SPACE.afterBadge,
        )}
      >
        {explanation.explanation}
      </p>

      {explanation.suffix ? (
        <div className={EXPLORER_SPACE.afterExplanation}>
          <span
            className="inline-flex rounded-md px-2 py-0.5 text-[13px] font-bold"
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
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
            {explanation.suffixExplanation}
          </p>
        </div>
      ) : null}

      {lessonDeepLink ? (
        <ExplorerLessonDeepLink lesson={lessonDeepLink} textId={textId} />
      ) : null}

      <ExplorerSaveButton
        isSaved={isSaved}
        disabled={isSaved || !explanation.lemmaId}
        onClick={onSaveWord}
      />
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
      className={cn(DESKTOP_SHELL_CLASS, className)}
      style={{
        top: "calc(3.5rem + 7rem)",
        right: 20,
      }}
      aria-label="Explorer"
    >
      <ExplorerPanelChrome showClose onClose={onClose}>
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
      </ExplorerPanelChrome>
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

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "reader-sheet-panel pointer-events-auto absolute inset-x-0 bottom-0 mx-auto flex w-full flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-[0_-4px_24px_rgba(0,0,0,0.1)]",
          EXPLORER_PANEL_MAX_HEIGHT_CLASS,
          "max-h-[min(520px,calc(100dvh-4rem))]",
        )}
      >
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border"
          aria-hidden="true"
        />
        <ExplorerPanelChrome showClose onClose={onClose}>
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
        </ExplorerPanelChrome>
      </div>
    </div>,
    document.body,
  );
}
