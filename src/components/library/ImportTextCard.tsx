"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { CARD_CTA_STYLE, TEXT_CARD_CLASS } from "@/components/ui/card-styles";
import { IMPORT_LIMITS } from "@/lib/import/constants";
import { cn } from "@/lib/utils";
import type { TTextWithProgress } from "@/types/reader";

interface ImportTextCardProps {
  text: TTextWithProgress;
  onRead: () => void;
  onRenamed: (title: string) => void;
  onDeleted: () => void;
}

function formatImportDate(value: string | null): string {
  if (!value) {
    return "Date inconnue";
  }

  return format(new Date(value), "d MMM yyyy", { locale: fr });
}

export function ImportTextCard({
  text,
  onRead,
  onRenamed,
  onDeleted,
}: ImportTextCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(text.title);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const hasProgress =
    text.userProgress !== null && text.userProgress.percentRead > 0;

  async function handleRename() {
    const nextTitle = draftTitle.trim();

    if (
      !nextTitle ||
      nextTitle.length > IMPORT_LIMITS.maxTitleLength ||
      nextTitle === text.title
    ) {
      setIsRenaming(false);
      setDraftTitle(text.title);
      return;
    }

    setIsSavingTitle(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/import/${text.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });

      const payload = (await response.json()) as
        | { title: string }
        | { error: string };

      if (!response.ok) {
        setActionError(
          "error" in payload ? payload.error : "Impossible de renommer le texte.",
        );
        return;
      }

      onRenamed("title" in payload ? payload.title : nextTitle);
      setIsRenaming(false);
    } catch {
      setActionError("Impossible de contacter le serveur.");
    } finally {
      setIsSavingTitle(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer « ${text.title} » ? Cette action est définitive.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/import/${text.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setActionError(payload.error ?? "Impossible de supprimer le texte.");
        return;
      }

      onDeleted();
    } catch {
      setActionError("Impossible de contacter le serveur.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className={cn(
        TEXT_CARD_CLASS,
        "border-l-2 border-ink-3/40",
        (isDeleting || isSavingTitle) && "opacity-70",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[5px] bg-accent px-2 py-0.5 text-[10px] font-extrabold text-white">
            {text.level}
          </span>
          <span className="rounded-[5px] border border-border px-2 py-0.5 text-[10px] font-semibold text-ink-3">
            Import personnel
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-bg hover:text-ink"
            aria-label="Actions sur l'import"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setIsRenaming(true);
                setDraftTitle(text.title);
              }}
            >
              Renommer
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isRenaming ? (
        <div className="space-y-3">
          <Input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={IMPORT_LIMITS.maxTitleLength}
            className="h-10 border-border bg-surface"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRename}
              disabled={isSavingTitle}
              className="rounded-[8px] bg-accent px-3 py-1.5 text-xs font-bold text-white"
            >
              {isSavingTitle ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRenaming(false);
                setDraftTitle(text.title);
              }}
              className="rounded-[8px] border border-border px-3 py-1.5 text-xs font-semibold text-ink-2"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={onRead} className="w-full text-left">
          <h3 className="font-serif text-[17px] leading-snug text-ink">
            {text.title}
          </h3>
        </button>
      )}

      <p className="mt-3 text-xs text-ink-2">
        {text.sentenceCount} phrase{text.sentenceCount > 1 ? "s" : ""} ·{" "}
        {text.readingTimeMinutes} min · importé le {formatImportDate(text.createdAt)}
      </p>

      {!isRenaming && (
        <div className="mt-4">
          {hasProgress ? (
            <div className="space-y-2">
              <div className="h-[3px] overflow-hidden rounded-[2px] bg-accent-light">
                <div
                  className="h-full rounded-[2px] bg-accent transition-all"
                  style={{ width: `${text.userProgress?.percentRead ?? 0}%` }}
                />
              </div>
              <button type="button" onClick={onRead} style={CARD_CTA_STYLE}>
                {text.userProgress?.percentRead}% · Continuer →
              </button>
            </div>
          ) : (
            <button type="button" onClick={onRead} style={CARD_CTA_STYLE}>
              Lire →
            </button>
          )}
        </div>
      )}

      {actionError && (
        <p className="mt-3 text-xs text-destructive">{actionError}</p>
      )}

      {isDeleting && (
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-ink-3">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Suppression…
        </div>
      )}
    </div>
  );
}
