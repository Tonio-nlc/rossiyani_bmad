"use client";

import {
  LessonBridgeCard,
  LessonBridgeLink,
} from "@/components/lessons/LessonBridgeCard";
import { lessonHref } from "@/lib/lessons/lesson-nav";
import type { TLessonLink } from "@/types/lessons";

interface ReaderEncounteredLessonsProps {
  textId: string;
  lessons: TLessonLink[];
  isComplete: boolean;
}

export function ReaderEncounteredLessons({
  textId,
  lessons,
  isComplete,
}: ReaderEncounteredLessonsProps) {
  if (!isComplete || lessons.length === 0) {
    return null;
  }

  return (
    <LessonBridgeCard
      title="Tu viens de rencontrer"
      className="mt-10 md:mt-14"
    >
      {lessons.map((lesson) => (
        <LessonBridgeLink
          key={lesson.lessonId}
          href={lessonHref(
            lesson.pathSlug,
            lesson.lessonSlug,
            "reader",
            textId,
          )}
          label={lesson.lessonTitle}
          cta="Ouvrir la leçon →"
        />
      ))}
    </LessonBridgeCard>
  );
}
