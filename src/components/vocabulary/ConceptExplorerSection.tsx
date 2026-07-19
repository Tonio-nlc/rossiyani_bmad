"use client";

import { useState } from "react";

import { LessonExampleSentence } from "@/components/lessons/LessonExampleSentence";
import { LessonSection } from "@/components/lessons/LessonSection";
import {
  LESSON_APPENDIX_CLASS,
  LESSON_EXAMPLE_CARD_CLASS,
  LESSON_EXAMPLE_TRANSLATION_CLASS,
  LESSON_SUBCONTENT_GAP_CLASS,
} from "@/lib/design/lesson-composition";
import {
  buildLessonWordsHighlightingSurface,
  resolveLessonRoleFromEncounter,
} from "@/lib/lessons/lesson-colors";
import { LESSON_SECTION_RHYTHM } from "@/lib/lessons/lesson-section-rhythm";
import { cn } from "@/lib/utils";
import type { TConceptExplorerView } from "@/types/concept-lesson";
import type { TLearningCardExample } from "@/types/learning-card";

import type { TVocabEncounterColor } from "./TeachingScenarioView";
import { VocabExploreBlock } from "./VocabEditorial";

/** Blocs déjà couverts par TeachingScenarioView / ConceptSecondarySection. */
const DUPLICATE_REFERENCE_TITLES = new Set([
  "À retenir",
  "Erreurs fréquentes",
  "Concepts liés",
  "Résumé",
  "Progression",
]);

/**
 * Formes fléchies / conjugaisons issues du LLM (linguistic_knowledge.paradigms).
 * Volontairement non rendues : morphologie russe LLM non fiable.
 */
const LLM_INFLECTED_FORM_TITLES = new Set([
  "Paradigme principal",
  "Formes principales",
  "Conjugaison",
  "Type de conjugaison",
  "Paradigme",
  "Paradigme des cas",
  "Formes particulières",
  "Cas",
]);

interface ConceptExplorerSectionProps {
  explorer: TConceptExplorerView;
  examples?: TLearningCardExample[];
  encounter?: TVocabEncounterColor | null;
}

export function ConceptExplorerSection({
  explorer,
  examples = [],
  encounter = null,
}: ConceptExplorerSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const referenceBlocks = explorer.reference.blocks.filter(
    (block) =>
      !DUPLICATE_REFERENCE_TITLES.has(block.title) &&
      !LLM_INFLECTED_FORM_TITLES.has(block.title),
  );

  const role = resolveLessonRoleFromEncounter(encounter);

  const hasContent =
    referenceBlocks.length > 0 ||
    explorer.relatedLemmas.length > 0 ||
    examples.length > 0;

  if (!hasContent) {
    return null;
  }

  const rhythm = LESSON_SECTION_RHYTHM.retenir;

  return (
    <LessonSection
      sectionId="retenir"
      eyebrow="APPROFONDIR"
      title="Approfondir"
      {...rhythm}
      marginTop={LESSON_APPENDIX_CLASS}
      isConclusion={false}
      headerTone="standard"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-[12px] border border-border/80 bg-bg/40 px-4 py-3 text-left text-[15px] font-medium text-ink-2 transition-colors hover:border-accent-border hover:text-ink"
        aria-expanded={isOpen}
      >
        <span>{isOpen ? "▲" : "▼"} Voir les détails</span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn(LESSON_SUBCONTENT_GAP_CLASS, "pt-6")}>
            {examples.length > 0 ? (
              <div className={LESSON_SUBCONTENT_GAP_CLASS}>
                {examples.map((example) => (
                  <div key={example.id} className={LESSON_EXAMPLE_CARD_CLASS}>
                    <LessonExampleSentence
                      russian={example.sentenceRu}
                      words={
                        role
                          ? buildLessonWordsHighlightingSurface(
                              example.sentenceRu,
                              encounter?.surface,
                              role,
                            )
                          : []
                      }
                    />
                    {example.translationFr ? (
                      <p className={LESSON_EXAMPLE_TRANSLATION_CLASS}>
                        {example.translationFr}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {referenceBlocks.map((block) => (
              <VocabExploreBlock
                key={block.title}
                title={block.title}
                items={block.items}
              />
            ))}

            {explorer.relatedLemmas.length > 0 ? (
              <VocabExploreBlock
                title="Lemmes liés"
                items={explorer.relatedLemmas}
              />
            ) : null}
          </div>
        </div>
      </div>
    </LessonSection>
  );
}
