"use client";

import { Sentence, mapAnnotatedWords } from "@/components/reader/Sentence";
import { splitIntoSentences } from "@/lib/utils/russian";
import type { WordAnnotation } from "@/stores/readerStore";
import type { TText } from "@/types/reader";

export interface TextBodyProps {
  text: TText;
  annotatedWords: Map<string, WordAnnotation>;
  activeWordAnnotation?: WordAnnotation | null;
  selectedWord?: string;
  onWordClick: (surface: string, sentence: string) => void;
  onSentenceVisible?: (sentenceIndex: number) => void;
}

export function TextBody({
  text,
  annotatedWords,
  activeWordAnnotation,
  selectedWord,
  onWordClick,
  onSentenceVisible,
}: TextBodyProps) {
  const annotatedSentences = text.contentAnnotated?.sentences;
  const sentences = annotatedSentences?.length
    ? annotatedSentences.map((sentence) => sentence.text)
    : splitIntoSentences(text.content);

  return (
    <div className="mx-auto w-full max-w-[680px] py-6 font-russian md:py-8">
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
            annotatedWords={annotatedWords}
            activeWordAnnotation={activeWordAnnotation}
            selectedWord={selectedWord}
            onWordClick={onWordClick}
            onVisible={() => onSentenceVisible?.(index)}
          />
        );
      })}
    </div>
  );
}
