"use client";

import { useState } from "react";

import type { TConceptExplorerView } from "@/types/concept-lesson";
import type { TLearningCardExample } from "@/types/learning-card";

import {
  VOCAB_BLOCK_GAP_CLASS,
  VOCAB_NARRATIVE_GAP_CLASS,
  VOCAB_TITLE_TO_CONTENT_CLASS,
} from "@/lib/design/vocabulary-composition";
import { cn } from "@/lib/utils";

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
 * Les données restent en base ; on re-sourcera plus tard depuis une ressource déterministe.
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
}

export function ConceptExplorerSection({
  explorer,
  examples = [],
}: ConceptExplorerSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const referenceBlocks = explorer.reference.blocks.filter(
    (block) =>
      !DUPLICATE_REFERENCE_TITLES.has(block.title) &&
      !LLM_INFLECTED_FORM_TITLES.has(block.title),
  );

  const exampleItems = examples
    .map((example) =>
      example.translationFr
        ? `${example.sentenceRu} — ${example.translationFr}`
        : example.sentenceRu,
    )
    .filter(Boolean);

  const hasContent =
    referenceBlocks.length > 0 ||
    explorer.relatedLemmas.length > 0 ||
    exampleItems.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <section className={VOCAB_NARRATIVE_GAP_CLASS}>
      <div className={cn(VOCAB_TITLE_TO_CONTENT_CLASS, VOCAB_BLOCK_GAP_CLASS)}>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-bg/40 px-4 py-3 text-left text-[15px] font-medium text-ink-2 transition-colors hover:border-accent-border hover:text-ink"
          aria-expanded={isOpen}
        >
          <span>{isOpen ? "▲" : "▼"} Approfondir</span>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pt-4">
              {referenceBlocks.map((block) => (
                <VocabExploreBlock
                  key={block.title}
                  title={block.title}
                  items={block.items}
                />
              ))}

              {exampleItems.length > 0 ? (
                <VocabExploreBlock title="Exemples" items={exampleItems} />
              ) : null}

              {explorer.relatedLemmas.length > 0 ? (
                <VocabExploreBlock
                  title="Lemmes liés"
                  items={explorer.relatedLemmas}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
