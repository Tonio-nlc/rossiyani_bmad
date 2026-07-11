import {
  LessonBridgeCard,
  LessonBridgeLink,
} from "@/components/lessons/LessonBridgeCard";
import {
  LESSON_APPENDIX_CLASS,
  LESSON_COLUMN_CLASS,
} from "@/lib/design/lesson-composition";
import type { TTextLink } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface LessonEncounteredTextsProps {
  texts: TTextLink[];
}

export function LessonEncounteredTexts({ texts }: LessonEncounteredTextsProps) {
  if (texts.length === 0) {
    return null;
  }

  return (
    <LessonBridgeCard
      title="Tu as déjà rencontré ce phénomène dans"
      className={cn(LESSON_APPENDIX_CLASS, LESSON_COLUMN_CLASS, "bg-bg/30")}
    >
      {texts.map((text) => (
        <LessonBridgeLink
          key={text.textId}
          href={`/reader/${text.textId}`}
          label={text.textTitle}
          cta="Relire le texte →"
        />
      ))}
    </LessonBridgeCard>
  );
}
