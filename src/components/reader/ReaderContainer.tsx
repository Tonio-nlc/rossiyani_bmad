"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ExplorerPanel,
  ExplorerPanelMobile,
  EXPLORER_PANEL_TEXT_PADDING_OPEN_PX,
} from "@/components/reader/ExplorerPanel";
import { ReaderEncounteredLessons } from "@/components/reader/ReaderEncounteredLessons";
import { ReaderHeader } from "@/components/reader/ReaderHeader";
import { TextBody } from "@/components/reader/TextBody";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useWordExplanation } from "@/hooks/useWordExplanation";
import { resolveExplorerLessonLink } from "@/lib/lessons/lesson-text-links";
import {
  clearReaderSelection,
  loadReaderSelection,
  saveReaderSelection,
} from "@/lib/navigation/reader-session";
import { splitIntoSentences } from "@/lib/utils/russian";
import { useReaderStore } from "@/stores/readerStore";
import type { TText, TUserProgress } from "@/types/reader";
import type { TLessonLink } from "@/types/lessons";

export interface ReaderContainerProps {
  text: TText;
  userProgress: TUserProgress | null;
  collectionLabel: string;
  linkedLessons: TLessonLink[];
}

async function saveProgress(payload: {
  textId: string;
  percentRead: number;
  lastSentenceIndex: number;
}) {
  await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function createInitialReadIndices(userProgress: TUserProgress | null): Set<number> {
  const indices = new Set<number>();

  if (!userProgress?.lastSentenceIndex) {
    return indices;
  }

  for (let index = 0; index <= userProgress.lastSentenceIndex; index += 1) {
    indices.add(index);
  }

  return indices;
}

export function ReaderContainer({
  text,
  userProgress,
  collectionLabel,
  linkedLessons,
}: ReaderContainerProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [readSentenceIndices, setReadSentenceIndices] = useState<Set<number>>(
    () => createInitialReadIndices(userProgress),
  );

  const lastSavedProgress = useRef(userProgress?.percentRead ?? 0);
  const highestSentenceIndex = useRef(userProgress?.lastSentenceIndex ?? 0);
  const hasRestoredSession = useRef(false);
  const hasScrolledToProgress = useRef(false);

  const {
    explain,
    explanation,
    isLoading,
    error,
    reset,
  } = useWordExplanation();
  const { savedLemmaIds, saveWord } = useVocabulary();
  const annotatedWords = useReaderStore((state) => state.annotatedWords);
  const exploredCount = useReaderStore((state) => state.exploredCount);
  const annotateWord = useReaderStore((state) => state.annotateWord);
  const initForText = useReaderStore((state) => state.initForText);

  useEffect(() => {
    initForText(text.id);
  }, [initForText, text.id]);

  useEffect(() => {
    const index = userProgress?.lastSentenceIndex;
    if (
      hasScrolledToProgress.current ||
      index === undefined ||
      index === null ||
      index <= 0
    ) {
      return;
    }

    hasScrolledToProgress.current = true;

    requestAnimationFrame(() => {
      document
        .querySelector(`[data-sentence-index="${index}"]`)
        ?.scrollIntoView({ block: "center" });
    });
  }, [text.id, userProgress?.lastSentenceIndex]);

  const totalSentences = useMemo(() => {
    if (text.contentAnnotated?.sentences?.length) {
      return text.contentAnnotated.sentences.length;
    }

    return splitIntoSentences(text.content).length;
  }, [text]);

  const percentRead = useMemo(() => {
    if (totalSentences === 0) {
      return 0;
    }

    return Math.round((readSentenceIndices.size / totalSentences) * 100);
  }, [readSentenceIndices.size, totalSentences]);

  const requestExplanation = useCallback(
    (surface: string, sentence: string) => {
      reset();
      explain({
        surface,
        sentence,
        textId: text.id,
      });
    },
    [explain, reset, text.id],
  );

  useEffect(() => {
    if (hasRestoredSession.current) {
      return;
    }

    hasRestoredSession.current = true;

    const saved = loadReaderSelection(text.id);
    if (!saved) {
      return;
    }

    setSelectedWord(saved.surface);
    setSelectedSentence(saved.sentence);
    requestExplanation(saved.surface, saved.sentence);
  }, [requestExplanation, text.id]);

  const handleSentenceVisible = useCallback((sentenceIndex: number) => {
    setReadSentenceIndices((current) => {
      if (current.has(sentenceIndex)) {
        return current;
      }

      const next = new Set(current);
      next.add(sentenceIndex);
      return next;
    });

    highestSentenceIndex.current = Math.max(
      highestSentenceIndex.current,
      sentenceIndex,
    );
  }, []);

  const handleWordClick = useCallback(
    (surface: string, sentence: string) => {
      setSelectedWord(surface);
      setSelectedSentence(sentence);
      saveReaderSelection(text.id, { surface, sentence });
      requestExplanation(surface, sentence);
    },
    [requestExplanation, text.id],
  );

  const handleRetry = useCallback(() => {
    if (!selectedWord || !selectedSentence) {
      return;
    }

    requestExplanation(selectedWord, selectedSentence);
  }, [requestExplanation, selectedSentence, selectedWord]);

  const handleSaveWord = useCallback(() => {
    if (!explanation?.lemmaId) {
      return;
    }

    saveWord({
      lemmaId: explanation.lemmaId,
      explanationCacheId: explanation.explanationCacheId,
      textId: text.id,
    });
  }, [explanation, saveWord, text.id]);

  const isSaved = explanation?.lemmaId
    ? savedLemmaIds.includes(explanation.lemmaId)
    : false;

  useEffect(() => {
    if (!explanation?.functionColor || !selectedWord) {
      return;
    }

    annotateWord(selectedWord, {
      functionColor: explanation.functionColor,
      functionalRole: explanation.functionalRole,
      lemma: explanation.lemma,
      translation: explanation.translation,
      suffix: explanation.suffix,
      suffixExplanation: explanation.suffixExplanation,
      lemmaStressed: explanation.lemmaStressed,
    });
  }, [annotateWord, explanation, selectedWord]);

  const panelExplanation = selectedWord ? explanation : null;
  const panelIsLoading = Boolean(selectedWord && isLoading);
  const panelError = selectedWord ? error : null;

  const activeWordAnnotation =
    explanation && selectedWord && !isLoading && !error
      ? {
          functionColor: explanation.functionColor,
          functionalRole: explanation.functionalRole,
          lemma: explanation.lemma,
          translation: explanation.translation,
          suffix: explanation.suffix,
          suffixExplanation: explanation.suffixExplanation,
          lemmaStressed: explanation.lemmaStressed,
        }
      : null;

  useEffect(() => {
    const interval = setInterval(() => {
      if (percentRead === lastSavedProgress.current) {
        return;
      }

      void saveProgress({
        textId: text.id,
        percentRead,
        lastSentenceIndex: highestSentenceIndex.current,
      });

      lastSavedProgress.current = percentRead;
    }, 10000);

    return () => clearInterval(interval);
  }, [percentRead, text.id]);

  useEffect(() => {
    return () => {
      if (percentRead === lastSavedProgress.current) {
        return;
      }

      void saveProgress({
        textId: text.id,
        percentRead,
        lastSentenceIndex: highestSentenceIndex.current,
      });
    };
  }, [percentRead, text.id]);

  const isReadingComplete =
    totalSentences > 0 && readSentenceIndices.size >= totalSentences;

  const lessonDeepLink = useMemo(() => {
    if (!explanation?.functionColor) {
      return null;
    }

    return resolveExplorerLessonLink(linkedLessons, explanation.functionColor);
  }, [explanation?.functionColor, linkedLessons]);

  const handleCloseExplorer = useCallback(() => {
    clearReaderSelection(text.id);
    setSelectedWord(null);
    setSelectedSentence(null);
    reset();
  }, [reset, text.id]);

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col">
      <ReaderHeader
        textId={text.id}
        collectionLabel={collectionLabel}
        title={text.title}
        level={text.level}
        readingTimeMinutes={text.readingTimeMinutes}
        exploredCount={exploredCount}
        percentRead={percentRead}
      />

      {/* ExplorerPanel est porté vers document.body (position: fixed) — ne pas le placer dans la colonne texte. */}
      <div className="flex min-h-0 flex-1 overflow-hidden bg-bg">
        <div
          className="min-w-0 flex-1 overflow-y-auto px-4 py-4 md:px-10 md:py-6 md:[padding-right:var(--explorer-pr)]"
          style={
            {
              "--explorer-pr": `${EXPLORER_PANEL_TEXT_PADDING_OPEN_PX}px`,
            } as Record<string, string>
          }
        >
          <div className="mx-auto w-full max-w-reading">
            <TextBody
              text={text}
              annotatedWords={annotatedWords}
              activeWordAnnotation={activeWordAnnotation}
              selectedWord={selectedWord ?? undefined}
              onWordClick={handleWordClick}
              onSentenceVisible={handleSentenceVisible}
            />
            <ReaderEncounteredLessons
              textId={text.id}
              lessons={linkedLessons}
              isComplete={isReadingComplete}
            />
          </div>
        </div>
      </div>

      <ExplorerPanel
        explanation={panelExplanation}
        isLoading={panelIsLoading}
        error={panelError}
        isOpen={Boolean(selectedWord)}
        onClose={handleCloseExplorer}
        onSaveWord={handleSaveWord}
        onRetry={handleRetry}
        isSaved={isSaved}
        textId={text.id}
        lessonDeepLink={lessonDeepLink}
      />

      <ExplorerPanelMobile
        explanation={panelExplanation}
        isLoading={panelIsLoading}
        error={panelError}
        isOpen={Boolean(selectedWord)}
        onClose={handleCloseExplorer}
        onSaveWord={handleSaveWord}
        onRetry={handleRetry}
        isSaved={isSaved}
        textId={text.id}
        lessonDeepLink={lessonDeepLink}
      />
    </div>
  );
}
