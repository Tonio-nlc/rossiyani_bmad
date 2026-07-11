import {
  LessonBridgeCard,
  LessonBridgeLink,
} from "@/components/lessons/LessonBridgeCard";
import type { TTextLink } from "@/types/lessons";

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
      className="mx-auto mt-16 max-w-reading md:mt-20"
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
