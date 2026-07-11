"use client";

import { Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ImportErrorBanner } from "@/components/import/ImportErrorBanner";
import { ImportLimitsNotice } from "@/components/import/ImportLimitsNotice";
import {
  ImportSourceTabs,
  type ImportSourceTab,
} from "@/components/import/ImportSourceTabs";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTexts } from "@/hooks/useTexts";
import { IMPORT_LIMITS } from "@/lib/import/constants";
import {
  isImportErrorList,
  readImportDraft,
  saveImportDraft,
  saveImportPreview,
} from "@/lib/import/session-storage";
import { suggestImportTitle } from "@/lib/import/suggest-title";
import { countWords } from "@/lib/import/stats";
import type { ImportError, ImportPreview, TImportSource } from "@/lib/import/types";
import { cn } from "@/lib/utils";

function formatCount(value: number): string {
  return value.toLocaleString("fr-FR");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} o`;
  }

  return `${(bytes / 1024).toFixed(1)} Ko`;
}

export function ImportPageView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { texts: importedTexts } = useTexts({ collection: "imported" });

  const [activeTab, setActiveTab] = useState<ImportSourceTab>("paste");
  const [rawText, setRawText] = useState("");
  const [source, setSource] = useState<TImportSource>("paste");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
  const [apiErrors, setApiErrors] = useState<ImportError[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const draft = readImportDraft();

    if (!draft) {
      return;
    }

    setRawText(draft.rawText);
    setSource(draft.source);
    setActiveTab(draft.activeTab);
  }, []);

  const wordCount = useMemo(() => countWords(rawText), [rawText]);
  const charCount = rawText.length;
  const importCount = importedTexts.length;
  const quotaReached = importCount >= IMPORT_LIMITS.maxImportsPerUser;

  const wordRatio = wordCount / IMPORT_LIMITS.maxWords;
  const counterClass =
    wordCount > IMPORT_LIMITS.maxWords
      ? "text-destructive"
      : wordRatio > 0.9
        ? "text-amber"
        : "text-ink-3";

  const canAnalyze =
    !isAnalyzing &&
    !quotaReached &&
    wordCount >= IMPORT_LIMITS.minWords &&
    wordCount <= IMPORT_LIMITS.maxWords &&
    rawText.trim().length > 0;

  function persistDraft(
    nextRawText: string,
    nextSource: TImportSource,
    nextTab: ImportSourceTab,
  ) {
    saveImportDraft({
      rawText: nextRawText,
      source: nextSource,
      activeTab: nextTab,
    });
  }

  function handleTextChange(value: string) {
    setRawText(value);
    setSource("paste");
    setApiErrors([]);
    setFileError(null);
    persistDraft(value, "paste", activeTab);
  }

  function handleTabChange(tab: ImportSourceTab) {
    setActiveTab(tab);
    persistDraft(rawText, source, tab);
  }

  function handleFileSelect(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setFileError(
        "Impossible de lire ce fichier. Utilisez un fichier .txt en UTF-8.",
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setFileError(
          "Impossible de lire ce fichier. Utilisez un fichier .txt en UTF-8.",
        );
        return;
      }

      setRawText(reader.result);
      setSource("txt");
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
      setApiErrors([]);
      setFileError(null);
      persistDraft(reader.result, "txt", "file");
    };

    reader.onerror = () => {
      setFileError(
        "Impossible de lire ce fichier. Utilisez un fichier .txt en UTF-8.",
      );
    };

    reader.readAsText(file, "UTF-8");
  }

  async function handleAnalyze() {
    if (!canAnalyze) {
      return;
    }

    setIsAnalyzing(true);
    setApiErrors([]);

    try {
      const response = await fetch("/api/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          source,
        }),
      });

      const payload = (await response.json()) as
        | { preview: unknown }
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
                : "Une erreur est survenue pendant l'analyse.",
          },
        ]);
        return;
      }

      if (!("preview" in payload) || !payload.preview) {
        setApiErrors([
          {
            code: "EMPTY_TEXT",
            message: "Réponse d'analyse invalide.",
          },
        ]);
        return;
      }

      saveImportPreview({
        rawText,
        source,
        preview: payload.preview as ImportPreview,
        suggestedTitle: suggestImportTitle(rawText),
      });

      router.push("/import/preview");
    } catch {
      setApiErrors([
        {
          code: "EMPTY_TEXT",
          message: "Impossible de contacter le serveur. Réessayez.",
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const quotaErrors: ImportError[] = quotaReached
    ? [
        {
          code: "IMPORT_QUOTA_EXCEEDED",
          message: `Vous avez atteint la limite de ${IMPORT_LIMITS.maxImportsPerUser} textes importés. Supprimez un texte existant pour en ajouter un nouveau.`,
        },
      ]
    : [];

  const inlineValidationErrors: ImportError[] = [];

  if (rawText.trim() && wordCount < IMPORT_LIMITS.minWords) {
    inlineValidationErrors.push({
      code: "TOO_FEW_WORDS",
      message: "Texte trop court — minimum 30 mots pour importer.",
    });
  }

  if (wordCount > IMPORT_LIMITS.maxWords) {
    inlineValidationErrors.push({
      code: "TOO_MANY_WORDS",
      message: `Texte trop long — maximum 15 000 mots. Votre texte en contient ${formatCount(wordCount)}. Scindez-le en plusieurs imports.`,
    });
  }

  const visibleErrors =
    apiErrors.length > 0
      ? apiErrors
      : quotaErrors.length > 0
        ? quotaErrors
        : inlineValidationErrors.length > 0 && !isAnalyzing
          ? inlineValidationErrors
          : [];

  return (
    <div>
      <PageHeader
        eyebrow="IMPORTER"
        title="Importer un texte"
        subtitle="Analyse un texte russe avec la méthode Rossiyani."
      />

      <div className="mx-auto max-w-reading space-y-6 px-6 py-10">
        <ImportSourceTabs value={activeTab} onChange={handleTabChange} />

        {activeTab === "paste" ? (
          <div role="tabpanel">
            <textarea
              value={rawText}
              onChange={(event) => handleTextChange(event.target.value)}
              readOnly={isAnalyzing}
              aria-describedby="import-counter import-errors"
              placeholder={
                "Collez votre texte russe ici…\nExtrait de cours, article, chapitre de manuel."
              }
              className="min-h-[280px] w-full resize-y rounded-[14px] border border-border bg-surface px-4 py-4 font-russian text-[18px] leading-relaxed text-ink outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
            />
          </div>
        ) : (
          <div role="tabpanel">
            <button
              type="button"
              aria-label="Importer un fichier texte"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFileSelect(event.dataTransfer.files[0] ?? null);
              }}
              className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-[14px] border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-accent-border hover:bg-accent-light/30"
            >
              <Upload className="mb-4 size-8 text-accent" aria-hidden="true" />
              <p className="text-sm font-semibold text-ink">
                Glissez un fichier .txt ou choisissez-le
              </p>
              <p className="mt-2 text-xs text-ink-3">Encodage UTF-8 uniquement</p>
              {selectedFileName && (
                <p className="mt-4 text-sm text-ink-2">
                  {selectedFileName}
                  {selectedFileSize !== null && ` · ${formatFileSize(selectedFileSize)}`}
                </p>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={(event) =>
                handleFileSelect(event.target.files?.[0] ?? null)
              }
            />

            {rawText.trim() && (
              <p className="mt-4 text-sm text-ink-2">
                Fichier chargé — {formatCount(wordCount)} mots détectés.
              </p>
            )}
          </div>
        )}

        <div
          id="import-counter"
          className="flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          <p className={counterClass}>
            {formatCount(wordCount)} / {formatCount(IMPORT_LIMITS.maxWords)} mots
            <span className="mx-2 text-ink-3">·</span>
            {formatCount(charCount)} caractères
          </p>
          <p className="text-ink-3">
            {importCount} / {IMPORT_LIMITS.maxImportsPerUser} textes importés
          </p>
        </div>

        {fileError && (
          <ImportErrorBanner
            errors={[
              {
                code: "INVALID_CHARACTERS",
                message: fileError,
              },
            ]}
          />
        )}

        <div id="import-errors">
          <ImportErrorBanner
            errors={visibleErrors}
            onRetry={() => setApiErrors([])}
          />
        </div>

        <ImportLimitsNotice />

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          aria-disabled={!canAnalyze}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent py-3 text-sm font-bold text-white transition-opacity",
            !canAnalyze && "cursor-not-allowed opacity-50",
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Analyse en cours…
            </>
          ) : (
            "Analyser le texte →"
          )}
        </button>

        <BackLink href="/library" label="Retour à la bibliothèque" />
      </div>
    </div>
  );
}
