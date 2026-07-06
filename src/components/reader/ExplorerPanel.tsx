"use client";

/**
 * ATTENTION: ce panel doit rester en position: fixed, hors du flux du document.
 * Ne jamais le faire participer au layout de la colonne de texte. Toute modification
 * de son positionnement doit être testée en cliquant sur plusieurs mots successifs
 * pour vérifier qu'il ne bouge pas et ne pousse pas le texte.
 */

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getFunctionColorHex,
  getNaturalFunctionalRoleLabel,
  stripTrailingPunctuationForDisplay,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import type { TWordExplanationResponse } from "@/types/orchestrator";
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
  className?: string;
}

export const EXPLORER_PANEL_TEXT_PADDING_OPEN_PX = 360;
export const EXPLORER_PANEL_TEXT_PADDING_CLOSED_PX = 48;

const PANEL_BORDER = "#E8E4DC";

function getDesktopPanelLayout(): CSSProperties {
  return {
    position: "fixed",
    top: 160,
    right: 20,
    width: 320,
    maxWidth: "calc(100vw - 40px)",
    maxHeight: "calc(100vh - 180px)",
    overflowY: "auto",
    zIndex: 50,
    boxSizing: "border-box",
    background: "#FFFFFF",
    border: `1px solid ${PANEL_BORDER}`,
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
    padding: "20px 24px",
  };
}

const LEMMA_STYLE: CSSProperties = {
  fontFamily: "var(--font-russian), 'Noto Serif', Georgia, serif",
  fontSize: 28,
  fontWeight: 700,
  color: "#0E0E0E",
  fontStyle: "normal",
};

function PanelDivider() {
  return (
    <div className="my-5 h-px shrink-0" style={{ backgroundColor: PANEL_BORDER }} />
  );
}

function ExplorerPanelHeader({
  showClose,
  onClose,
}: {
  showClose: boolean;
  onClose?: () => void;
}) {
  return (
    <div
      className="mb-5 shrink-0 pb-4"
      style={{ borderBottom: `1px solid ${PANEL_BORDER}` }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-[#A8A8A8]">Explorer</h2>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[13px] font-bold text-[#A8A8A8] hover:text-[#5A5A5A]"
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
      <p className="text-[14px] leading-[1.65] text-[#0E0E0E]">
        Impossible d&apos;obtenir une explication.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="w-fit rounded-[10px] border px-4 py-2 text-[14px] font-bold text-[#0E0E0E]"
        style={{ borderColor: PANEL_BORDER }}
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
}: Pick<
  ExplorerPanelProps,
  | "explanation"
  | "isLoading"
  | "error"
  | "onSaveWord"
  | "onRetry"
  | "isSaved"
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
          <p className="text-[13px] text-[#A8A8A8]">{cleanSurface}</p>
        ) : null}
        <p
          className={cn("leading-tight", showSurfaceForm && "mt-1")}
          style={LEMMA_STYLE}
        >
          {displayLemma}
        </p>
        <p className="mt-1 text-[15px] font-normal text-[#5A5A5A]">
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
        <h3 className="text-[11px] font-bold tracking-[0.06em] text-[#A8A8A8]">
          Explication
        </h3>
        <p className="mt-2 text-[14px] font-normal leading-[1.65] text-[#0E0E0E]">
          {explanation.explanation}
        </p>
      </section>

      <PanelDivider />

      <section>
        <h3 className="text-[11px] font-bold tracking-[0.06em] text-[#A8A8A8]">
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
            <p className="text-[13px] font-normal text-[#5A5A5A]">
              {explanation.suffixExplanation}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-[#A8A8A8]">—</p>
        )}
      </section>

      <button
        type="button"
        onClick={onSaveWord}
        disabled={isSaved || !explanation.lemmaId}
        className={cn(
          "mt-5 box-border w-full rounded-[10px] p-3 text-[14px] font-bold text-white transition-colors",
          isSaved
            ? "cursor-default bg-[#10B981]"
            : "bg-[#4F46E5] hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50",
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
      style={getDesktopPanelLayout()}
      className={cn("max-md:hidden", className)}
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
}: ExplorerPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fermer l'explorateur"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div
        className="relative mx-auto flex max-h-[min(65vh,calc(100vh-120px))] w-full flex-col overflow-y-auto"
        style={{
          background: "#FFFFFF",
          borderTop: `1px solid ${PANEL_BORDER}`,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          padding: "20px 24px",
          paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full"
          style={{ backgroundColor: PANEL_BORDER }}
        />
        <ExplorerPanelHeader showClose onClose={onClose} />
        <ExplorerContent
          explanation={explanation}
          isLoading={isLoading}
          error={error}
          onSaveWord={onSaveWord}
          onRetry={onRetry}
          isSaved={isSaved}
        />
      </div>
    </div>
  );
}
