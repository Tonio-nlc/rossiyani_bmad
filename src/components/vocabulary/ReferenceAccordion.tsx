"use client";

import { useState } from "react";

import {
  VOCAB_BLOCK_GAP_CLASS,
  VOCAB_EYEBROW_CLASS,
  VOCAB_SECTION_GAP_CLASS,
  VOCAB_TITLE_CLASS,
  VOCAB_TITLE_TO_CONTENT_CLASS,
} from "@/lib/design/vocabulary-composition";
import type { TLearningCardReference } from "@/types/learning-card";
import { cn } from "@/lib/utils";

import { VocabExploreBlock } from "./VocabEditorial";

interface ReferenceAccordionProps {
  reference: TLearningCardReference;
}

export function ReferenceAccordion({ reference }: ReferenceAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (reference.blocks.length === 0) {
    return null;
  }

  return (
    <section className={VOCAB_SECTION_GAP_CLASS}>
      <header>
        <p className={VOCAB_EYEBROW_CLASS}>Référence</p>
        <h2 className={VOCAB_TITLE_CLASS}>Aller plus loin</h2>
      </header>

      <div className={cn(VOCAB_TITLE_TO_CONTENT_CLASS, VOCAB_BLOCK_GAP_CLASS)}>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-bg/40 px-4 py-3 text-left text-[15px] font-medium text-ink-2 transition-colors hover:border-accent-border hover:text-ink"
          aria-expanded={isOpen}
        >
          <span>{isOpen ? "▲" : "▼"} Référence grammaticale</span>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pt-4">
              {reference.blocks.map((block) => (
                <VocabExploreBlock
                  key={block.title}
                  title={block.title}
                  items={block.items}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
