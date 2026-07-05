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

export function Sentence({
  text,
  translationFr,
  words,
  annotatedWords,
  activeWordAnnotation,
  selectedWord,
  onWordClick,
  onVisible,
}: SentenceProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const tokens = tokenizeSentence(text);

  useEffect(() => {
    if (!paragraphRef.current || !onVisible) {
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

    observer.observe(paragraphRef.current);

    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <p ref={paragraphRef} className="mb-6 leading-[44px]">
      {tokens.map((token, index) => {
        const normalized = normalizeToken(token);
        const isWord = normalized.length > 0;

        if (!isWord) {
          return (
            <span key={`${token}-${index}`} className="font-serif text-2xl">
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

      {translationFr && (
        <span className="mt-3 block leading-normal">
          {!showTranslation ? (
            <button
              type="button"
              onClick={() => setShowTranslation(true)}
              className="text-sm text-brand-text-secondary hover:text-brand-text-primary"
            >
              Voir la traduction →
            </button>
          ) : (
            <span className="block text-sm italic text-brand-text-muted">
              {translationFr}
            </span>
          )}
        </span>
      )}
    </p>
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
