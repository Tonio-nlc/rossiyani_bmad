import { LessonExampleSentence } from "@/components/lessons/LessonExampleSentence";
import { LessonSection } from "@/components/lessons/LessonSection";
import { RussianText } from "@/components/reader/RussianText";
import {
  LESSON_CARD_SHELL_CLASS,
  LESSON_EXAMPLE_CARD_CLASS,
  LESSON_EXAMPLE_NOTE_CLASS,
  LESSON_PROSE_CLASS,
  LESSON_QUESTION_CLASS,
  LESSON_SCHEMA_CAPTION_CLASS,
  LESSON_SCHEMA_PADDING_CLASS,
  LESSON_SCHEMA_SHELL_CLASS,
  LESSON_SUBCONTENT_GAP_CLASS,
} from "@/lib/design/lesson-composition";
import {
  buildLessonWordsHighlightingSurface,
  buildLessonWordsWithRole,
  containsCyrillic,
  resolveLessonRoleFromEncounter,
} from "@/lib/lessons/lesson-colors";
import { LESSON_SECTION_LABELS } from "@/lib/lessons/group-lesson-sections";
import { LESSON_SECTION_RHYTHM } from "@/lib/lessons/lesson-section-rhythm";
import { cn } from "@/lib/utils";
import type { TTeachingScenario } from "@/types/teaching-scenario";

import { ConceptSchemeDiagram } from "./ConceptSchemeDiagram";

export interface TVocabEncounterColor {
  surface: string;
  functionalRole: string;
  functionColor: string | null;
}

interface TeachingScenarioViewProps {
  scenario: TTeachingScenario;
  encounter?: TVocabEncounterColor | null;
}

function LessonProse({ text }: { text: string }) {
  return (
    <p className={LESSON_PROSE_CLASS}>
      {containsCyrillic(text) ? <RussianText>{text}</RussianText> : text}
    </p>
  );
}

function buildContrastWords(
  fromForm: string,
  toForm: string,
  encounter?: TVocabEncounterColor | null,
) {
  const role = resolveLessonRoleFromEncounter(encounter ?? null);

  if (role && encounter?.surface) {
    const fromWords = buildLessonWordsHighlightingSurface(
      fromForm,
      encounter.surface,
      role,
    );
    const toWords = buildLessonWordsHighlightingSurface(
      toForm,
      encounter.surface,
      role,
    );

    if (
      fromWords.some((word) => word.role) ||
      toWords.some((word) => word.role)
    ) {
      return [...fromWords, ...toWords];
    }
  }

  return [
    ...buildLessonWordsWithRole(fromForm, "subject"),
    ...buildLessonWordsWithRole(toForm, "object"),
  ];
}

function ContrastExampleCard({
  fromForm,
  toForm,
  explanation,
  encounter,
}: {
  fromForm: string;
  toForm: string;
  explanation?: string;
  encounter?: TVocabEncounterColor | null;
}) {
  const russian = `${fromForm} → ${toForm}`;
  const words = buildContrastWords(fromForm, toForm, encounter);

  return (
    <div className={LESSON_EXAMPLE_CARD_CLASS}>
      <LessonExampleSentence russian={russian} words={words} />
      {explanation ? (
        <p className={LESSON_EXAMPLE_NOTE_CLASS}>
          {containsCyrillic(explanation) ? (
            <RussianText>{explanation}</RussianText>
          ) : (
            explanation
          )}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Scénario d'enseignement — même système éditorial que les pages Leçons.
 */
export function TeachingScenarioView({
  scenario,
  encounter = null,
}: TeachingScenarioViewProps) {
  const visualNodes = scenario.visual?.nodes?.filter((node) => node.trim()) ?? [];
  const hasVisual = visualNodes.length >= 2;
  const reuse = scenario.reuse?.filter((item) => item.trim()) ?? [];
  const factTitle =
    scenario.question && !scenario.intuition
      ? scenario.question
      : LESSON_SECTION_LABELS.comprendre.title;

  const questionRhythm = LESSON_SECTION_RHYTHM.question;
  const intuitionRhythm = LESSON_SECTION_RHYTHM.intuition;
  const exempleRhythm = LESSON_SECTION_RHYTHM.exemple;
  const comprendreRhythm = LESSON_SECTION_RHYTHM.comprendre;
  const schemaRhythm = LESSON_SECTION_RHYTHM.schema;
  const retenirRhythm = LESSON_SECTION_RHYTHM.retenir;

  return (
    <>
      {scenario.hook ? (
        <LessonSection
          sectionId="question"
          eyebrow={LESSON_SECTION_LABELS.question.eyebrow}
          title={LESSON_SECTION_LABELS.question.title}
          {...questionRhythm}
        >
          <p className={LESSON_QUESTION_CLASS}>
            {containsCyrillic(scenario.hook) ? (
              <RussianText>{scenario.hook}</RussianText>
            ) : (
              scenario.hook
            )}
          </p>
        </LessonSection>
      ) : null}

      {scenario.intuition ? (
        <LessonSection
          sectionId="intuition"
          eyebrow={LESSON_SECTION_LABELS.intuition.eyebrow}
          title={scenario.question ?? LESSON_SECTION_LABELS.intuition.title}
          {...intuitionRhythm}
          headerTone="standard"
        >
          <LessonProse text={scenario.intuition} />
        </LessonSection>
      ) : null}

      {hasVisual && scenario.visual ? (
        <LessonSection
          sectionId="schema"
          eyebrow={LESSON_SECTION_LABELS.schema.eyebrow}
          title={LESSON_SECTION_LABELS.schema.title}
          {...schemaRhythm}
          headerTone="standard"
        >
          <figure>
            <div
              className={cn(
                LESSON_SCHEMA_SHELL_CLASS,
                LESSON_SCHEMA_PADDING_CLASS,
                "flex justify-center",
              )}
            >
              <ConceptSchemeDiagram
                scheme={{ nodes: visualNodes }}
                compact={scenario.visual.layout === "comparison"}
              />
            </div>
            {scenario.visual.caption ? (
              <figcaption className={LESSON_SCHEMA_CAPTION_CLASS}>
                {scenario.visual.caption}
              </figcaption>
            ) : null}
          </figure>
        </LessonSection>
      ) : null}

      <LessonSection
        sectionId="comprendre"
        eyebrow={LESSON_SECTION_LABELS.comprendre.eyebrow}
        title={factTitle}
        {...comprendreRhythm}
        marginTop={
          scenario.hook || scenario.intuition || hasVisual
            ? comprendreRhythm.marginTop
            : "mt-0"
        }
      >
        <LessonProse text={scenario.fact} />
      </LessonSection>

      {scenario.contrast.length > 0 ? (
        <LessonSection
          sectionId="exemple"
          eyebrow={LESSON_SECTION_LABELS.exemple.eyebrow}
          title={LESSON_SECTION_LABELS.exemple.title}
          {...exempleRhythm}
        >
          <div className={LESSON_SUBCONTENT_GAP_CLASS}>
            {scenario.contrast.map((item) => (
              <ContrastExampleCard
                key={`${item.fromForm}-${item.toForm}`}
                fromForm={item.fromForm}
                toForm={item.toForm}
                explanation={item.explanation}
                encounter={encounter}
              />
            ))}
          </div>
        </LessonSection>
      ) : null}

      {scenario.commonMistake ? (
        <LessonSection
          sectionId="comprendre"
          eyebrow="ERREUR"
          title="Erreur fréquente"
          {...comprendreRhythm}
        >
          <LessonProse text={scenario.commonMistake} />
        </LessonSection>
      ) : null}

      {reuse.length > 0 ? (
        <LessonSection
          sectionId="comprendre"
          eyebrow="RÉUTILISER"
          title="Tu retrouveras cette idée dans"
          {...comprendreRhythm}
        >
          <ul className={LESSON_SUBCONTENT_GAP_CLASS}>
            {reuse.map((item) => (
              <li key={item}>
                <LessonProse text={item} />
              </li>
            ))}
          </ul>
        </LessonSection>
      ) : null}

      <LessonSection
        sectionId="retenir"
        eyebrow={LESSON_SECTION_LABELS.retenir.eyebrow}
        title={LESSON_SECTION_LABELS.retenir.title}
        {...retenirRhythm}
        isConclusion
      >
        <div
          className={cn(
            LESSON_CARD_SHELL_CLASS,
            "border-accent-border/60 bg-accent-light/70 px-4 py-3",
          )}
        >
          <p className={cn(LESSON_PROSE_CLASS, "text-sm")}>
            {containsCyrillic(scenario.memoryAnchor) ? (
              <RussianText>{scenario.memoryAnchor}</RussianText>
            ) : (
              scenario.memoryAnchor
            )}
          </p>
        </div>
      </LessonSection>

      {scenario.nextConcept ? (
        <LessonSection
          sectionId="comprendre"
          eyebrow="ENSUITE"
          title="Ensuite"
          {...comprendreRhythm}
        >
          <LessonProse text={scenario.nextConcept.title} />
        </LessonSection>
      ) : null}
    </>
  );
}
