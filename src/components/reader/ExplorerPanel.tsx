"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

function ExplorerSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-24" />
      <Separator className="bg-brand-border" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="mt-auto h-10 w-full" />
    </div>
  );
}

function ExplorerError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-brand-border bg-brand-surface p-4">
      <p className="text-sm leading-relaxed text-brand-text-primary">
        Impossible d&apos;obtenir
        <br />
        une explication.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="w-fit border-brand-border"
      >
        Réessayer
      </Button>
    </div>
  );
}

function ExplorerEmpty() {
  const legend = [
    { color: "#3B82F6", label: "Sujet" },
    { color: "#EF7C5A", label: "Objet" },
    { color: "#22C55E", label: "Lieu / temps" },
    { color: "#A78BFA", label: "Possession" },
    { color: "#F59E0B", label: "Destinataire" },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-text-primary">
          Cliquez sur un mot
        </p>
        <p className="text-[13px] leading-relaxed text-brand-text-secondary">
          pour comprendre son rôle dans la phrase.
        </p>
      </div>
      <ul className="space-y-2">
        {legend.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-[13px] text-brand-text-secondary"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {item.label}
          </li>
        ))}
      </ul>
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
    return <ExplorerEmpty />;
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
  const showPlainLemma = Boolean(
    explanation.lemmaStressed && explanation.lemmaStressed !== plainLemma,
  );

  return (
    <div className="reader-panel-fade-in flex h-full flex-col gap-5">
      <div>
        {showSurfaceForm ? (
          <p className="text-sm text-brand-text-secondary">{cleanSurface}</p>
        ) : null}
        <p
          className={cn(
            "font-serif text-[28px] leading-tight text-brand-text-primary",
            showSurfaceForm && "mt-1",
          )}
        >
          {displayLemma}
        </p>
        {showPlainLemma ? (
          <p className="mt-1 text-xs text-brand-text-muted">{plainLemma}</p>
        ) : null}
      </div>

      <p className="text-base text-brand-text-secondary">
        {explanation.translation}
      </p>

      <div
        className="inline-flex w-fit items-center justify-center gap-2 rounded-full px-3 py-1 text-[13px] leading-none"
        style={
          colorHex
            ? {
                color: colorHex,
                backgroundColor: `${colorHex}1A`,
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
      </div>

      <Separator className="bg-brand-border" />

      <div>
        <h3 className="mb-2 text-sm font-medium text-brand-text-primary">
          Explication
        </h3>
        <p className="text-sm leading-relaxed text-brand-text-primary">
          {explanation.explanation}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-brand-text-primary">
          La terminaison
        </h3>
        {explanation.suffix ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              style={colorHex ? { color: colorHex } : undefined}
            >
              {explanation.suffix}
            </Badge>
            <p className="text-sm text-brand-text-secondary">
              {explanation.suffixExplanation}
            </p>
          </div>
        ) : (
          <p className="text-sm text-brand-text-muted">—</p>
        )}
      </div>

      <Button
        type="button"
        onClick={onSaveWord}
        disabled={isSaved || !explanation.lemmaId}
        className={cn(
          "mt-auto h-10 w-full",
          isSaved
            ? "bg-green-600 text-white hover:bg-green-600"
            : "bg-brand-primary text-white hover:bg-brand-primary/90",
        )}
      >
        {isSaved ? "✓ Sauvegardé" : "Sauvegarder ce mot"}
      </Button>
    </div>
  );
}

export function ExplorerPanel({
  explanation,
  isLoading,
  error,
  onClose,
  onSaveWord,
  onRetry,
  isSaved,
  className,
}: Omit<ExplorerPanelProps, "isOpen">) {
  return (
    <aside
      className={cn(
        "hidden h-full w-[340px] shrink-0 border-l border-brand-border bg-brand-card p-6 lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-brand-text-primary">Explorer</h2>
        {(explanation || error) && (
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-brand-text-muted hover:text-brand-text-primary"
          >
            Fermer
          </button>
        )}
      </div>
      <ExplorerContent
        explanation={explanation}
        isLoading={isLoading}
        error={error}
        onSaveWord={onSaveWord}
        onRetry={onRetry}
        isSaved={isSaved}
      />
    </aside>
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
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label="Fermer l'explorateur"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div className="relative mx-auto flex h-[60vh] max-w-lg flex-col overflow-y-auto rounded-t-2xl border border-brand-border bg-brand-card p-5 shadow-lg">
        <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-brand-border" />
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
