"use client";

import { useEffect, useRef, useState } from "react";

import { Word } from "@/components/reader/Word";
import {
  normalizeToken,
  tokenizeSentence,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
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
    (word) => normalizeToken(word.surface).toLowerCase() === normalized.toLowerCase(),
  );
}

export function Sentence({
  text,
  translationFr,
  words,
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
    <p ref={paragraphRef} className="mb-6">
      {tokens.map((token, index) => {
        const annotated = findAnnotatedWord(token, words);
        const normalized = normalizeToken(token);
        const isWord = normalized.length > 0;

        if (!isWord) {
          return (
            <span key={`${token}-${index}`} className="font-serif text-2xl">
              {token}
              {index < tokens.length - 1 ? " " : ""}
            </span>
          );
        }

        return (
          <span key={`${token}-${index}`}>
            <Word
              surface={token}
              isClickable
              functionalRole={annotated?.functionalRole}
              functionColor={annotated?.functionColor}
              isSelected={selectedWord === token || selectedWord === normalized}
              onWordClick={(surface) => onWordClick(surface, text)}
            />
            {index < tokens.length - 1 ? " " : ""}
          </span>
        );
      })}

      {translationFr && (
        <span className="mt-3 block">
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
