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
  containsCyrillic,
  resolveLessonRoleFromEncounter,
} from "@/lib/lessons/lesson-colors";
import { LESSON_SECTION_LABELS } from "@/lib/lessons/group-lesson-sections";
import { LESSON_SECTION_RHYTHM } from "@/lib/lessons/lesson-section-rhythm";
import { cn } from "@/lib/utils";
import type { TTeachingScenario } from "@/types/teaching-scenario";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import { ConceptSchemeDiagram } from "./ConceptSchemeDiagram";

interface TeachingScenarioViewProps {
  scenario: TTeachingScenario;
  /** Encounter complet — couleurs uniquement dans la phrase d'origine (rôles syntaxiques). */
  encounter?: TVocabularyContextEncounter | null;
}

function LessonProse({ text }: { text: string }) {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  return (
    <p className={LESSON_PROSE_CLASS}>
      {containsCyrillic(trimmed) ? <RussianText>{trimmed}</RussianText> : trimmed}
    </p>
  );
}

/** Contraste conceptuel — pas de couleurs de rôle (ce ne sont pas des rôles syntaxiques). */
function ContrastExampleCard({
  fromForm,
  toForm,
  explanation,
}: {
  fromForm: string;
  toForm: string;
  explanation?: string;
}) {
  const russian = `${fromForm} → ${toForm}`;

  return (
    <div className={LESSON_EXAMPLE_CARD_CLASS}>
      <LessonExampleSentence russian={russian} words={[]} />
      {explanation?.trim() ? (
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

function EncounterExampleCard({
  encounter,
}: {
  encounter: TVocabularyContextEncounter;
}) {
  const role = resolveLessonRoleFromEncounter(encounter);
  const words = role
    ? buildLessonWordsHighlightingSurface(
        encounter.sentence,
        encounter.surface,
        role,
      )
    : [];

  return (
    <div className={LESSON_EXAMPLE_CARD_CLASS}>
      <LessonExampleSentence russian={encounter.sentence} words={words} />
      {encounter.explanation.trim() ? (
        <p className={LESSON_EXAMPLE_NOTE_CLASS}>
          {containsCyrillic(encounter.explanation) ? (
            <RussianText>{encounter.explanation}</RussianText>
          ) : (
            encounter.explanation
          )}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Scénario d'enseignement — système éditorial Leçons + bridge vers la rencontre.
 */
export function TeachingScenarioView({
  scenario,
  encounter = null,
}: TeachingScenarioViewProps) {
  const visualNodes = scenario.visual?.nodes?.filter((node) => node.trim()) ?? [];
  const hasVisual = visualNodes.length >= 2;
  const reuse =
    scenario.reuse?.map((item) => item.trim()).filter(Boolean) ?? [];
  const factTitle =
    scenario.question && !scenario.intuition
      ? scenario.question
      : LESSON_SECTION_LABELS.comprendre.title;

  const showEncounterCard = Boolean(
    scenario.encounterExample?.sentence || encounter?.sentence,
  );
  const encounterForCard: TVocabularyContextEncounter | null =
    encounter?.sentence
      ? encounter
      : scenario.encounterExample
        ? {
            surface: scenario.encounterExample.surface,
            sentence: scenario.encounterExample.sentence,
            explanation: scenario.encounterExample.note ?? "",
            suffix: "",
            suffixExplanation: "",
            functionalRole: "",
            functionColor: null,
            roleLabel: "",
          }
        : null;

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

      <LessonSection
        sectionId="comprendre"
        eyebrow="DANS TA PHRASE"
        title="Ce que ça change ici"
        {...comprendreRhythm}
      >
        <LessonProse text={scenario.bridge} />
        {showEncounterCard && encounterForCard ? (
          <EncounterExampleCard encounter={encounterForCard} />
        ) : null}
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
              />
            ))}
          </div>
        </LessonSection>
      ) : null}

      {scenario.commonMistake?.trim() ? (
        <LessonSection
          sectionId="comprendre"
          eyebrow="PIÈGE"
          title="Erreur fréquente"
          {...comprendreRhythm}
        >
          <LessonProse text={scenario.commonMistake} />
        </LessonSection>
      ) : null}

      {reuse.length > 0 ? (
        <LessonSection
          sectionId="comprendre"
          eyebrow="PLUS LOIN"
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

      {scenario.showMemoryAnchor ? (
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
      ) : null}

      {scenario.nextConcept ? (
        <LessonSection
          sectionId="comprendre"
          eyebrow="SUITE"
          title="Concept suivant"
          {...comprendreRhythm}
        >
          <LessonProse text={scenario.nextConcept.title} />
        </LessonSection>
      ) : null}
    </>
  );
}
