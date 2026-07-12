import { create } from "zustand";

import { normalizeToken } from "@/lib/utils/russian";

export interface WordAnnotation {
  functionColor: string;
  functionalRole: string;
  lemma: string;
  translation: string;
  suffix: string;
  suffixExplanation: string;
  lemmaStressed?: string;
}

interface ReaderStore {
  textId: string | null;
  annotatedWords: Map<string, WordAnnotation>;
  exploredCount: number;
  showTranslations: boolean;
  initForText: (textId: string) => void;
  annotateWord: (surface: string, annotation: WordAnnotation) => void;
  getAnnotation: (surface: string) => WordAnnotation | undefined;
  resetAnnotations: () => void;
  setShowTranslations: (show: boolean) => void;
}

const STORAGE_PREFIX = "rossiyani_annotations_";

function annotationKey(surface: string): string {
  return normalizeToken(surface).toLowerCase();
}

function getStorageKey(textId: string): string {
  return `${STORAGE_PREFIX}${textId}`;
}

function loadAnnotationsFromStorage(textId: string): Map<string, WordAnnotation> {
  if (typeof window === "undefined") {
    return new Map();
  }

  try {
    const saved = sessionStorage.getItem(getStorageKey(textId));

    if (!saved) {
      return new Map();
    }

    const parsed = JSON.parse(saved) as Record<string, WordAnnotation>;
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function saveAnnotationsToStorage(
  textId: string,
  annotatedWords: Map<string, WordAnnotation>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      getStorageKey(textId),
      JSON.stringify(Object.fromEntries(annotatedWords)),
    );
  } catch {
    // Quota dépassé ou sessionStorage indisponible — ignorer silencieusement
  }
}

export const useReaderStore = create<ReaderStore>((set, get) => ({
  textId: null,
  annotatedWords: new Map(),
  exploredCount: 0,
  showTranslations: false,

  initForText: (textId) => {
    const annotatedWords = loadAnnotationsFromStorage(textId);

    set({
      textId,
      annotatedWords,
      exploredCount: annotatedWords.size,
    });
  },

  annotateWord: (surface, annotation) => {
    const { textId, annotatedWords: current } = get();
    const key = annotationKey(surface);

    if (current.has(key)) {
      return;
    }

    const next = new Map(current);
    next.set(key, annotation);

    set({
      annotatedWords: next,
      exploredCount: next.size,
    });

    if (textId) {
      saveAnnotationsToStorage(textId, next);
    }
  },

  getAnnotation: (surface) => {
    return get().annotatedWords.get(annotationKey(surface));
  },

  resetAnnotations: () => {
    const { textId } = get();

    if (textId && typeof window !== "undefined") {
      sessionStorage.removeItem(getStorageKey(textId));
    }

    set({ annotatedWords: new Map(), exploredCount: 0 });
  },

  setShowTranslations: (show) => {
    set({ showTranslations: show });
  },
}));
