"use client";

import { lessonRoleToFunctionColor } from "@/lib/lessons/lesson-colors";
import { LESSON_EXAMPLE_RUSSIAN_CLASS } from "@/lib/design/lesson-composition";
import {
  getFunctionColorHex,
  normalizeToken,
  shouldAddSpaceAfterToken,
  tokenizeSentence,
} from "@/lib/utils/russian";
import type { TLessonExampleWord } from "@/types/lessons";

interface LessonExampleSentenceProps {
  russian: string;
  words: TLessonExampleWord[];
}

function findWordRole(
  token: string,
  words: TLessonExampleWord[],
): TLessonExampleWord | undefined {
  const normalized = normalizeToken(token).toLowerCase();

  return words.find(
    (word) => normalizeToken(word.text).toLowerCase() === normalized,
  );
}

export function LessonExampleSentence({
  russian,
  words,
}: LessonExampleSentenceProps) {
  const tokens = tokenizeSentence(russian);

  return (
    <p className={LESSON_EXAMPLE_RUSSIAN_CLASS}>
      {tokens.map((token, index) => {
        const normalized = normalizeToken(token);

        if (!normalized) {
          return <span key={`${token}-${index}`}>{token}</span>;
        }

        const match = findWordRole(token, words);
        const functionColor = lessonRoleToFunctionColor(match?.role ?? null);
        const colorHex = getFunctionColorHex(functionColor);

        if (functionColor && colorHex) {
          return (
            <span key={`${token}-${index}`}>
              <span style={{ color: colorHex }}>{token}</span>
              {shouldAddSpaceAfterToken(index, tokens) ? " " : ""}
            </span>
          );
        }

        return (
          <span key={`${token}-${index}`}>
            {token}
            {shouldAddSpaceAfterToken(index, tokens) ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
