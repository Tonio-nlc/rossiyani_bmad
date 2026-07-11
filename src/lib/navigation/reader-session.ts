const SELECTION_PREFIX = "rossiyani_reader_selection_";

export interface ReaderSelection {
  surface: string;
  sentence: string;
}

export function saveReaderSelection(
  textId: string,
  selection: ReaderSelection,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      `${SELECTION_PREFIX}${textId}`,
      JSON.stringify(selection),
    );
  } catch {
    // ignore quota errors
  }
}

export function loadReaderSelection(textId: string): ReaderSelection | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(`${SELECTION_PREFIX}${textId}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ReaderSelection;
    if (!parsed.surface || !parsed.sentence) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearReaderSelection(textId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(`${SELECTION_PREFIX}${textId}`);
}
