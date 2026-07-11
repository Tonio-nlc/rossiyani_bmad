import type { ImportPreview, ImportError, TImportSource } from "./types";

export const IMPORT_DRAFT_KEY = "rossiyani:import-draft";
export const IMPORT_PREVIEW_KEY = "rossiyani:import-preview";
export const IMPORT_SAVED_TOAST_KEY = "rossiyani:import-saved-toast";

export interface ImportDraftState {
  rawText: string;
  source: TImportSource;
  activeTab: "paste" | "file";
}

export interface ImportPreviewState {
  rawText: string;
  source: TImportSource;
  preview: ImportPreview;
  suggestedTitle: string;
}

export function saveImportDraft(draft: ImportDraftState): void {
  sessionStorage.setItem(IMPORT_DRAFT_KEY, JSON.stringify(draft));
}

export function readImportDraft(): ImportDraftState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(IMPORT_DRAFT_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ImportDraftState;
  } catch {
    return null;
  }
}

export function saveImportPreview(state: ImportPreviewState): void {
  sessionStorage.setItem(IMPORT_PREVIEW_KEY, JSON.stringify(state));
}

export function readImportPreview(): ImportPreviewState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(IMPORT_PREVIEW_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ImportPreviewState;
  } catch {
    return null;
  }
}

export function clearImportPreview(): void {
  sessionStorage.removeItem(IMPORT_PREVIEW_KEY);
}

export function markImportSavedToast(): void {
  sessionStorage.setItem(IMPORT_SAVED_TOAST_KEY, "1");
}

export function consumeImportSavedToast(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const value = sessionStorage.getItem(IMPORT_SAVED_TOAST_KEY);

  if (!value) {
    return false;
  }

  sessionStorage.removeItem(IMPORT_SAVED_TOAST_KEY);
  return true;
}

export function isImportErrorList(value: unknown): value is ImportError[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "code" in item &&
        "message" in item,
    )
  );
}
