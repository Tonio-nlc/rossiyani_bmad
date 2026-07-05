"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ExplorerPanel,
  ExplorerPanelMobile,
} from "@/components/reader/ExplorerPanel";
import { TextBody } from "@/components/reader/TextBody";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useWordExplanation } from "@/hooks/useWordExplanation";
import { splitIntoSentences } from "@/lib/utils/russian";
import { useReaderStore } from "@/stores/readerStore";
import type { TText, TUserProgress } from "@/types/reader";

export interface ReaderContainerProps {
  text: TText;
  userProgress: TUserProgress | null;
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

export function ReaderContainer({ text, userProgress }: ReaderContainerProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [readSentenceIndices, setReadSentenceIndices] = useState<Set<number>>(
    () => createInitialReadIndices(userProgress),
  );

  const lastSavedProgress = useRef(userProgress?.percentRead ?? 0);
  const highestSentenceIndex = useRef(userProgress?.lastSentenceIndex ?? 0);

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
      setIsExplorerOpen(true);
      requestExplanation(surface, sentence);
    },
    [requestExplanation],
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

  const activeExplanation =
    isLoading || error || !selectedWord ? null : explanation;

  const activeWordAnnotation =
    activeExplanation && selectedWord
      ? {
          functionColor: activeExplanation.functionColor,
          functionalRole: activeExplanation.functionalRole,
          lemma: activeExplanation.lemma,
          translation: activeExplanation.translation,
          suffix: activeExplanation.suffix,
          suffixExplanation: activeExplanation.suffixExplanation,
          lemmaStressed: activeExplanation.lemmaStressed,
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

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col">
      <div className="border-b border-brand-border bg-brand-card px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-sm text-brand-text-secondary">
          <span>
            {text.level} · {text.readingTimeMinutes} min
            <span className="text-[13px] text-brand-text-muted">
              {" "}
              · {exploredCount} mot{exploredCount > 1 ? "s" : ""} exploré
              {exploredCount > 1 ? "s" : ""}
            </span>
          </span>
          <span>{percentRead}% lu</span>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-6xl overflow-hidden rounded-full bg-brand-border">
          <div
            className="h-full bg-brand-primary transition-all duration-300"
            style={{ width: `${percentRead}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-brand-surface">
          <TextBody
            text={text}
            annotatedWords={annotatedWords}
            activeWordAnnotation={activeWordAnnotation}
            selectedWord={selectedWord ?? undefined}
            onWordClick={handleWordClick}
            onSentenceVisible={handleSentenceVisible}
          />
        </div>

        <ExplorerPanel
          explanation={activeExplanation}
          isLoading={isLoading}
          error={error}
          onClose={() => {
            setIsExplorerOpen(false);
            setSelectedWord(null);
            setSelectedSentence(null);
            reset();
          }}
          onSaveWord={handleSaveWord}
          onRetry={handleRetry}
          isSaved={isSaved}
        />
      </div>

      <ExplorerPanelMobile
        explanation={activeExplanation}
        isLoading={isLoading}
        error={error}
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onSaveWord={handleSaveWord}
        onRetry={handleRetry}
        isSaved={isSaved}
      />
    </div>
  );
}
