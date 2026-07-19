import { LessonExampleSentence } from "@/components/lessons/LessonExampleSentence";
import { RussianText } from "@/components/reader/RussianText";
import type { TConceptHero } from "@/types/concept-lesson";

import {
  LESSON_EYEBROW_CLASS,
  LESSON_HERO_CLASS,
  LESSON_INTRO_CLASS,
  LESSON_TITLE_CLASS,
} from "@/lib/design/lesson-composition";
import {
  buildLessonWordsWithRole,
  resolveLessonRoleFromEncounter,
} from "@/lib/lessons/lesson-colors";
import { formatPosLabel } from "@/lib/vocabulary/format-linguistic-labels";

import type { TVocabEncounterColor } from "./TeachingScenarioView";

interface ConceptHeroSectionProps {
  hero: TConceptHero;
  encounter?: TVocabEncounterColor | null;
}

function ConceptChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border/80 bg-bg/50 px-2.5 py-1 text-[12px] font-medium text-ink-2">
      {label}
    </span>
  );
}

export function ConceptHeroSection({
  hero,
  encounter = null,
}: ConceptHeroSectionProps) {
  const posLabel = formatPosLabel(hero.partOfSpeech);
  const role = resolveLessonRoleFromEncounter(encounter);
  const encounteredWords =
    hero.encounteredForm && role
      ? buildLessonWordsWithRole(hero.encounteredForm, role)
      : [];

  return (
    <header className={LESSON_HERO_CLASS}>
      <p className={LESSON_EYEBROW_CLASS}>{hero.phenomenon.title}</p>
      <h1 className={LESSON_TITLE_CLASS}>
        <RussianText>{hero.lemma}</RussianText>
      </h1>
      <p className={LESSON_INTRO_CLASS}>
        {[posLabel, hero.translation].filter(Boolean).join(" · ")}
      </p>

      {hero.encounteredForm ? (
        <div className="mt-6 space-y-2">
          <p className={LESSON_EYEBROW_CLASS}>Tu as rencontré</p>
          <LessonExampleSentence
            russian={hero.encounteredForm}
            words={encounteredWords}
          />
        </div>
      ) : null}

      {hero.chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {hero.chips.map((chip) => (
            <ConceptChip key={chip} label={chip} />
          ))}
        </div>
      ) : null}
    </header>
  );
}
