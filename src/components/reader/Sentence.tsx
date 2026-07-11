"use client";

import { useEffect, useRef, useState } from "react";

import { Word } from "@/components/reader/Word";
import {
  SENTENCE_RHYTHM_CLASS,
  SENTENCE_TEXT_CLASS,
  SENTENCE_TRANSLATION_TEXT_CLASS,
  SENTENCE_TRANSLATION_TOGGLE_CLASS,
} from "@/lib/design/reader-composition";
import {
  normalizeToken,
  shouldAddSpaceAfterToken,
  tokenizeSentence,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import type { WordAnnotation } from "@/stores/readerStore";
import type { TAnnotatedWord } from "@/types/reader";
import { cn } from "@/lib/utils";

export interface AnnotatedWord {
  surface: string;
  functionalRole?: string;
  functionColor?: TReaderFunctionColor;
}

export interface SentenceProps {
  text: string;
  sentenceIndex: number;
  translationFr?: string;
  words: AnnotatedWord[];
  annotatedWords: Map<string, WordAnnotation>;
  activeWordAnnotation?: WordAnnotation | null;
  selectedWord?: string;
  onWordClick: (surface: string, sentence: string) => void;
  onVisible?: () => void;
}

function findAnnotatedWord(
  token: string,
  words: AnnotatedWord[],
): AnnotatedWord | undefined {
  const normalized = normalizeToken(token);

  return words.find(
    (word) =>
      normalizeToken(word.surface).toLowerCase() === normalized.toLowerCase(),
  );
}

function getSessionAnnotation(
  token: string,
  annotatedWords: Map<string, WordAnnotation>,
): WordAnnotation | undefined {
  return annotatedWords.get(normalTokenKey(token));
}

function normalTokenKey(token: string): string {
  return normalizeToken(token).toLowerCase();
}

function isWordSelected(token: string, selectedWord?: string): boolean {
  if (!selectedWord) {
    return false;
  }

  const normalized = normalizeToken(token);
  const selectedNormalized = normalizeToken(selectedWord);

  return (
    token === selectedWord ||
    normalized === selectedWord ||
    token === selectedNormalized ||
    normalized === selectedNormalized
  );
}

function resolveTranslation(translationFr: string | undefined): string {
  return translationFr?.trim() ?? "";
}

export function Sentence({
  text,
  sentenceIndex,
  translationFr,
  words,
  annotatedWords,
  activeWordAnnotation,
  selectedWord,
  onWordClick,
  onVisible,
}: SentenceProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tokens = tokenizeSentence(text);
  const resolvedTranslation = resolveTranslation(translationFr);

  useEffect(() => {
    if (!containerRef.current || !onVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onVisible();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <article
      ref={containerRef}
      data-sentence-index={sentenceIndex}
      className={cn("reader-sentence-block", SENTENCE_RHYTHM_CLASS)}
    >
      <p className={SENTENCE_TEXT_CLASS}>
        {tokens.map((token, index) => {
          const normalized = normalizeToken(token);
          const isWord = normalized.length > 0;

          if (!isWord) {
            return <span key={`${token}-${index}`}>{token}</span>;
          }

          const sessionAnnotation = getSessionAnnotation(token, annotatedWords);
          const isSelected = isWordSelected(token, selectedWord);
          const annotation =
            sessionAnnotation ??
            (isSelected ? activeWordAnnotation ?? undefined : undefined);
          const functionColor = annotation?.functionColor as
            | TReaderFunctionColor
            | undefined;

          return (
            <span key={`${token}-${index}`}>
              <Word
                surface={token}
                isClickable
                functionalRole={
                  annotation?.functionalRole ??
                  findAnnotatedWord(token, words)?.functionalRole
                }
                functionColor={functionColor}
                suffix={annotation?.suffix}
                isSelected={isSelected}
                isAnnotated={Boolean(sessionAnnotation) && !isSelected}
                onWordClick={(surface) => onWordClick(surface, text)}
              />
              {shouldAddSpaceAfterToken(index, tokens) ? " " : ""}
            </span>
          );
        })}
      </p>

      {resolvedTranslation ? (
        <div>
          <button
            type="button"
            onClick={() => setShowTranslation((current) => !current)}
            className={SENTENCE_TRANSLATION_TOGGLE_CLASS}
          >
            {showTranslation ? "masquer la traduction" : "voir la traduction →"}
          </button>
          {showTranslation ? (
            <p className={SENTENCE_TRANSLATION_TEXT_CLASS}>
              {resolvedTranslation}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function mapAnnotatedWords(words: TAnnotatedWord[]): AnnotatedWord[] {
  return words.map((word) => ({
    surface: word.surface,
    functionalRole: word.functionalRole ?? undefined,
    functionColor:
      (word.functionColor as TReaderFunctionColor | null) ?? undefined,
  }));
}
