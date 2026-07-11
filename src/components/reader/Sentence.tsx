"use client";

import { useEffect, useRef, useState } from "react";

import { Word } from "@/components/reader/Word";
import {
  normalizeToken,
  shouldAddSpaceAfterToken,
  tokenizeSentence,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import type { WordAnnotation } from "@/stores/readerStore";
import type { TAnnotatedWord } from "@/types/reader";

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
    <div
      ref={containerRef}
      data-sentence-index={sentenceIndex}
      className={resolvedTranslation ? "" : "mb-4"}
    >
      <p className="mb-1 font-russian text-[24px] leading-[1.65] md:text-[26px]">
        {tokens.map((token, index) => {
          const normalized = normalizeToken(token);
          const isWord = normalized.length > 0;

          if (!isWord) {
            return (
              <span key={`${token}-${index}`} className="text-[24px] md:text-[26px]">
                {token}
              </span>
            );
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
        <div className="leading-normal">
          <button
            type="button"
            onClick={() => setShowTranslation((current) => !current)}
            className="mt-0.5 mb-3 block cursor-pointer select-none text-xs italic text-[#A8A8A8] hover:text-[#5A5A5A]"
          >
            {showTranslation ? "masquer" : "voir la traduction →"}
          </button>
          {showTranslation ? (
            <p className="reader-translation-fade-in mt-1 mb-1 text-[13px] italic text-[#A8A8A8]">
              {resolvedTranslation}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
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
