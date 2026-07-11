"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ImportErrorBanner } from "@/components/import/ImportErrorBanner";
import { ImportMethodNotice } from "@/components/import/ImportMethodNotice";
import { FilterPills } from "@/components/ui/FilterPills";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import { IMPORT_LIMITS } from "@/lib/import/constants";
import {
  clearImportPreview,
  isImportErrorList,
  markImportSavedToast,
  readImportPreview,
  saveImportDraft,
  type ImportPreviewState,
} from "@/lib/import/session-storage";
import type { ImportError, TTextLevel } from "@/lib/import/types";
import { cn } from "@/lib/utils";

const LEVEL_OPTIONS = ["A1", "A2", "B1", "B2"] as const;

type TImportLevelOption = (typeof LEVEL_OPTIONS)[number];

function clampLevelForPills(level: TTextLevel): TImportLevelOption {
  if (LEVEL_OPTIONS.includes(level as TImportLevelOption)) {
    return level as TImportLevelOption;
  }

  return "B2";
}

function formatCount(value: number): string {
  return value.toLocaleString("fr-FR");
}

interface ImportPreviewViewProps {
  defaultLevel: TTextLevel;
}

export function ImportPreviewView({ defaultLevel }: ImportPreviewViewProps) {
  const router = useRouter();
  const [session, setSession] = useState<ImportPreviewState | null>(null);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<TImportLevelOption>(
    clampLevelForPills(defaultLevel),
  );
  const [apiErrors, setApiErrors] = useState<ImportError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<"read" | "library" | null>(null);

  useEffect(() => {
    const previewState = readImportPreview();

    if (!previewState) {
      router.replace("/import");
      return;
    }

    setSession(previewState);
    setTitle(previewState.suggestedTitle);
    setLevel(clampLevelForPills(previewState.preview.estimatedLevel ?? defaultLevel));
  }, [defaultLevel, router]);

  const previewSentences = useMemo(() => {
    if (!session) {
      return [];
    }

    return session.preview.annotatedSentences.slice(0, 5);
  }, [session]);

  const remainingSentences = session
    ? Math.max(session.preview.sentenceCount - previewSentences.length, 0)
    : 0;

  const canSave = Boolean(
    session &&
      title.trim().length > 0 &&
      title.trim().length <= IMPORT_LIMITS.maxTitleLength &&
      !isSaving,
  );

  async function persistImport(mode: "read" | "library") {
    if (!session || !canSave) {
      return;
    }

    setIsSaving(true);
    setSaveMode(mode);
    setApiErrors([]);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          rawText: session.rawText,
          source: session.source,
          level,
        }),
      });

      const payload = (await response.json()) as
        | { textId: string; redirectTo: string }
        | { errors: unknown }
        | { error: string };

      if (!response.ok) {
        if ("errors" in payload && isImportErrorList(payload.errors)) {
          setApiErrors(payload.errors);
          return;
        }

        setApiErrors([
          {
            code: "EMPTY_TEXT",
            message:
              "error" in payload
                ? payload.error
                : "Impossible d'enregistrer le texte.",
          },
        ]);
        return;
      }

      if (!("textId" in payload) || !payload.textId) {
        setApiErrors([
          {
            code: "EMPTY_TEXT",
            message: "Réponse d'enregistrement invalide.",
          },
        ]);
        return;
      }

      clearImportPreview();

      if (mode === "read") {
        router.push(payload.redirectTo ?? `/reader/${payload.textId}`);
        return;
      }

      markImportSavedToast();
      router.push("/library#mes-imports");
    } catch {
      setApiErrors([
        {
          code: "EMPTY_TEXT",
          message: "Impossible de contacter le serveur. Réessayez.",
        },
      ]);
    } finally {
      setIsSaving(false);
      setSaveMode(null);
    }
  }

  function handleBackToEdit() {
    if (!session) {
      router.push("/import");
      return;
    }

    saveImportDraft({
      rawText: session.rawText,
      source: session.source,
      activeTab: session.source === "txt" ? "file" : "paste",
    });

    router.push("/import");
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-reading px-6 py-10">
        <p className="text-sm text-ink-2">Chargement de la prévisualisation…</p>
      </div>
    );
  }

  const { preview } = session;

  return (
    <div>
      <PageHeader
        eyebrow="PRÉVISUALISATION"
        title="Votre texte est prêt"
        subtitle="Vérifiez le découpage avant de lire."
      />

      <div className="mx-auto max-w-reading space-y-6 px-6 py-10">
        <section className="space-y-5 rounded-[14px] border border-border bg-surface p-5 md:p-6">
          <div className="space-y-2">
            <label htmlFor="import-title" className="text-sm font-semibold text-ink">
              Titre
            </label>
            <Input
              id="import-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={IMPORT_LIMITS.maxTitleLength}
              className="h-10 border-border bg-surface"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">Niveau</span>
              <span className="text-[10px] text-ink-3">Suggestion</span>
            </div>
            <FilterPills
              options={LEVEL_OPTIONS}
              value={level}
              onChange={setLevel}
            />
            <p className="text-xs text-ink-3">
              Tu pourras le modifier plus tard.
            </p>
          </div>

          <p className="text-sm text-ink-2">
            <span className="font-semibold text-ink">
              {formatCount(preview.sentenceCount)}
            </span>{" "}
            phrases ·{" "}
            <span className="font-semibold text-ink">
              {formatCount(preview.wordCount)}
            </span>{" "}
            mots ·{" "}
            <span className="font-semibold text-ink">~{preview.readingTime}</span>{" "}
            min
          </p>
        </section>

        <section className={cn(CARD_BASE_CLASS, "space-y-4 bg-surface px-5 py-6")}>
          {previewSentences.map((sentence, index) => (
            <p
              key={`${sentence.text}-${index}`}
              className="font-russian text-[20px] leading-[1.65] text-ink"
            >
              — {sentence.text}
            </p>
          ))}

          {remainingSentences > 0 && (
            <p className="text-sm italic text-ink-3">
              … et {formatCount(remainingSentences)} autre
              {remainingSentences > 1 ? "s" : ""} phrase
              {remainingSentences > 1 ? "s" : ""}
            </p>
          )}
        </section>

        {preview.warnings.length > 0 && (
          <aside className="rounded-[12px] border border-border/70 bg-bg/40 p-4 text-[13px] text-ink-2">
            {preview.warnings.map((warning) => (
              <p key={warning.code}>{warning.message}</p>
            ))}
          </aside>
        )}

        <ImportMethodNotice />

        <ImportErrorBanner errors={apiErrors} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => persistImport("library")}
            disabled={!canSave}
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-[10px] border border-border bg-surface px-4 py-3 text-sm font-bold text-ink transition-opacity",
              !canSave && "cursor-not-allowed opacity-50",
            )}
          >
            {isSaving && saveMode === "library" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Enregistrement…
              </>
            ) : (
              "Enregistrer dans mes imports"
            )}
          </button>

          <button
            type="button"
            onClick={() => persistImport("read")}
            disabled={!canSave}
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-sm font-bold text-white transition-opacity",
              !canSave && "cursor-not-allowed opacity-50",
            )}
          >
            {isSaving && saveMode === "read" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Enregistrement…
              </>
            ) : (
              "Lire maintenant →"
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleBackToEdit}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-3 transition-colors hover:text-ink"
        >
          ← Modifier le texte
        </button>
      </div>
    </div>
  );
}
