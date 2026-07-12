"use client";

import { useState } from "react";

import type { TLearningCardReference } from "@/types/learning-card";
import { cn } from "@/lib/utils";

import { VocabExploreBlock, VocabSection } from "./VocabEditorial";

interface ReferenceAccordionProps {
  reference: TLearningCardReference;
}

export function ReferenceAccordion({ reference }: ReferenceAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (reference.blocks.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Référence" title="Aller plus loin">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-bg px-4 py-3 text-left text-sm font-medium text-ink-2 transition-colors hover:border-accent-border hover:text-ink"
        aria-expanded={isOpen}
      >
        <span>Conjugaison, paradigmes, collocations…</span>
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 pt-5">
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
    </VocabSection>
  );
}
