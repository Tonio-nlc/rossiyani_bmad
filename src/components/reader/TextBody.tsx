"use client";

import { Sentence, mapAnnotatedWords } from "@/components/reader/Sentence";
import { splitIntoSentences } from "@/lib/utils/russian";
import type { TText } from "@/types/reader";

export interface TextBodyProps {
  text: TText;
  selectedWord?: string;
  onWordClick: (surface: string, sentence: string) => void;
  onSentenceVisible?: (sentenceIndex: number) => void;
}

export function TextBody({
  text,
  selectedWord,
  onWordClick,
  onSentenceVisible,
}: TextBodyProps) {
  const annotatedSentences = text.contentAnnotated?.sentences;
  const sentences = annotatedSentences?.length
    ? annotatedSentences.map((sentence) => sentence.text)
    : splitIntoSentences(text.content);

  return (
    <div className="mx-auto w-full max-w-[680px] px-6 py-6 md:px-12 md:py-12">
      {sentences.map((sentenceText, index) => {
        const annotated = annotatedSentences?.[index];

        return (
          <Sentence
            key={`${index}-${sentenceText}`}
            text={sentenceText}
            translationFr={annotated?.translationFr}
            words={
              annotated?.words?.length
                ? mapAnnotatedWords(annotated.words)
                : []
            }
            selectedWord={selectedWord}
            onWordClick={onWordClick}
            onVisible={() => onSentenceVisible?.(index)}
          />
        );
      })}
    </div>
  );
}
