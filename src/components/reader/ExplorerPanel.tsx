"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FUNCTIONAL_ROLE_LABELS,
  getFunctionColorHex,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import type { TWordExplanationResponse } from "@/types/orchestrator";
import { cn } from "@/lib/utils";

export interface ExplorerPanelProps {
  explanation: TWordExplanationResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSaveWord: () => void;
  isSaved: boolean;
  className?: string;
}

function ExplorerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function ExplorerContent({
  explanation,
  isLoading,
  onSaveWord,
  isSaved,
}: Pick<
  ExplorerPanelProps,
  "explanation" | "isLoading" | "onSaveWord" | "isSaved"
>) {
  if (isLoading) {
    return <ExplorerSkeleton />;
  }

  if (!explanation) {
    return (
      <p className="text-sm text-brand-text-secondary">
        Cliquez sur un mot pour comprendre son rôle dans la phrase.
      </p>
    );
  }

  const colorHex = getFunctionColorHex(
    explanation.functionColor as TReaderFunctionColor,
  );
  const roleLabel =
    FUNCTIONAL_ROLE_LABELS[explanation.functionalRole] ??
    explanation.functionalRole;

  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <p className="font-serif text-[28px] leading-tight text-brand-text-primary">
          {explanation.surface}
        </p>
        <p className="mt-1 text-sm text-brand-text-muted">{explanation.lemma}</p>
      </div>

      <Badge
        variant="outline"
        className="w-fit border-brand-border"
        style={colorHex ? { color: colorHex, borderColor: colorHex } : undefined}
      >
        {roleLabel}
      </Badge>

      <p className="text-base text-brand-text-secondary">
        {explanation.translation}
      </p>

      <Separator className="bg-brand-border" />

      <div>
        <h3 className="mb-2 text-sm font-medium text-brand-text-primary">
          Explication
        </h3>
        <p className="text-sm leading-relaxed text-brand-text-primary">
          {explanation.explanation}
        </p>
      </div>

      {explanation.suffix && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-brand-text-primary">
            La terminaison
          </h3>
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
        </div>
      )}

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
        {isSaved ? "Sauvegardé ✓" : "Sauvegarder ce mot"}
      </Button>
    </div>
  );
}

export function ExplorerPanel({
  explanation,
  isLoading,
  onClose,
  onSaveWord,
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
        {explanation && (
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
        onSaveWord={onSaveWord}
        isSaved={isSaved}
      />
    </aside>
  );
}

export function ExplorerPanelMobile({
  explanation,
  isLoading,
  isOpen,
  onClose,
  onSaveWord,
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
      <div className="relative mx-auto flex h-[60vh] max-w-lg flex-col rounded-t-2xl border border-brand-border bg-brand-card p-5 shadow-lg">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-brand-border" />
        <ExplorerContent
          explanation={explanation}
          isLoading={isLoading}
          onSaveWord={onSaveWord}
          isSaved={isSaved}
        />
      </div>
    </div>
  );
}
