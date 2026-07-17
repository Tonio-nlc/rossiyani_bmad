"use client";

import { useState } from "react";

import type { TConceptExplorerView } from "@/types/concept-lesson";

import {
  VOCAB_BLOCK_GAP_CLASS,
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_EYEBROW_CLASS,
  VOCAB_NARRATIVE_GAP_CLASS,
  VOCAB_TITLE_CLASS,
  VOCAB_TITLE_TO_CONTENT_CLASS,
} from "@/lib/design/vocabulary-composition";
import { cn } from "@/lib/utils";

import { ConceptSchemeDiagram } from "./ConceptSchemeDiagram";
import { VocabExploreBlock, VocabMutedLabel } from "./VocabEditorial";

interface ConceptExplorerSectionProps {
  explorer: TConceptExplorerView;
}

export function ConceptExplorerSection({
  explorer,
}: ConceptExplorerSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const schemeNodes = explorer.visualModel.nodes ?? [];

  return (
    <section className={VOCAB_NARRATIVE_GAP_CLASS}>
      <header>
        <p className={VOCAB_EYEBROW_CLASS}>Explorer</p>
        <h2 className={VOCAB_TITLE_CLASS}>{explorer.title}</h2>
        <p className={`mt-2 ${VOCAB_BODY_SMALL_CLASS}`}>{explorer.summary}</p>
      </header>

      <div className={cn(VOCAB_TITLE_TO_CONTENT_CLASS, VOCAB_BLOCK_GAP_CLASS)}>
        <VocabMutedLabel>Modèle mental</VocabMutedLabel>
        <p className="text-[17px] leading-snug text-ink-2">{explorer.mentalModel}</p>

        {schemeNodes.length >= 2 ? (
          <ConceptSchemeDiagram scheme={{ nodes: schemeNodes }} />
        ) : null}

        {explorer.examples.length > 0 ? (
          <VocabExploreBlock title="Exemples" items={explorer.examples} />
        ) : null}

        {explorer.connectedConcepts.length > 0 ? (
          <VocabExploreBlock
            title="Concepts liés"
            items={explorer.connectedConcepts.map(
              (concept) => `${concept.title} — ${concept.summary}`,
            )}
          />
        ) : null}

        {explorer.relatedLemmas.length > 0 ? (
          <VocabExploreBlock title="Lemmes liés" items={explorer.relatedLemmas} />
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-bg/40 px-4 py-3 text-left text-[15px] font-medium text-ink-2 transition-colors hover:border-accent-border hover:text-ink"
          aria-expanded={isOpen}
        >
          <span>{isOpen ? "▲" : "▼"} Paradigmes, collocations, notes</span>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pt-4">
              {explorer.reference.blocks.map((block) => (
                <VocabExploreBlock
                  key={block.title}
                  title={block.title}
                  items={block.items}
                />
              ))}

              {explorer.commonMistakes.length > 0 ? (
                <VocabExploreBlock
                  title="Erreurs fréquentes"
                  items={explorer.commonMistakes}
                />
              ) : null}

              {explorer.teachingPath.length > 0 ? (
                <VocabExploreBlock
                  title="Progression"
                  items={explorer.teachingPath}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
