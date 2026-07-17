import { textMatchesPatterns } from "@/lib/knowledge/pedagogy/strategy/label-patterns";
import type { TPedagogicalStrategy } from "@/lib/knowledge/pedagogy/strategy/strategy-types";
import type { TLearningCard } from "@/types/learning-card";

const SENTENCE_SPLIT_RE = /(?<=[.!?…])\s+/u;

function filterChips(chips: string[], strategy: TPedagogicalStrategy): string[] {
  return chips.filter(
    (chip) => !textMatchesPatterns(chip, strategy.forbiddenLabelPatterns),
  );
}

function isReferenceSectionAllowed(
  title: string,
  strategy: TPedagogicalStrategy,
): boolean {
  if (strategy.forbiddenReferenceSections.includes(title)) {
    return false;
  }

  if (strategy.allowedReferenceSections.length === 0) {
    return true;
  }

  return strategy.allowedReferenceSections.includes(title);
}

function filterReferenceItems(
  items: string[],
  strategy: TPedagogicalStrategy,
): string[] {
  return items.filter(
    (item) => !textMatchesPatterns(item, strategy.forbiddenLabelPatterns),
  );
}

function sanitizeText(
  text: string | null,
  strategy: TPedagogicalStrategy,
): string | null {
  if (!text?.trim()) {
    return null;
  }

  if (!textMatchesPatterns(text, strategy.forbiddenLabelPatterns)) {
    return text.trim();
  }

  const sentences = text.split(SENTENCE_SPLIT_RE).filter(Boolean);
  const clean = sentences.filter(
    (sentence) =>
      !textMatchesPatterns(sentence, strategy.forbiddenLabelPatterns),
  );

  return clean.length > 0 ? clean.join(" ") : null;
}

function sanitizeTextList(
  items: string[],
  strategy: TPedagogicalStrategy,
): string[] {
  return items
    .map((item) => sanitizeText(item, strategy))
    .filter((item): item is string => Boolean(item));
}

function sanitizeNextForms(
  forms: string[],
  strategy: TPedagogicalStrategy,
): string[] {
  return forms.filter((form) => {
    const hasForbiddenLabel = textMatchesPatterns(
      form,
      strategy.forbiddenNextFormPatterns,
    );
    const hasForbiddenMorphology = textMatchesPatterns(
      form,
      strategy.forbiddenLabelPatterns,
    );

    return !hasForbiddenLabel && !hasForbiddenMorphology;
  });
}

export function applyPedagogicalStrategy(
  card: TLearningCard,
  strategy: TPedagogicalStrategy,
): TLearningCard {
  const encounter = card.encounter
    ? {
        ...card.encounter,
        formChips: filterChips(card.encounter.formChips, strategy),
        traitChips: filterChips(card.encounter.traitChips, strategy),
      }
    : null;

  const understanding = card.understanding
    ? {
        ...card.understanding,
        intro: sanitizeText(card.understanding.intro, strategy),
        whyPoints: sanitizeTextList(
          card.understanding.whyPoints,
          strategy,
        ),
        roleLabel: sanitizeText(card.understanding.roleLabel, strategy),
        explanationBlocks: sanitizeTextList(
          card.understanding.explanationBlocks,
          strategy,
        ),
      }
    : null;

  const takeaways = {
    items: sanitizeTextList(card.takeaways.items, strategy),
  };

  const nextForms = {
    forms: sanitizeNextForms(card.nextForms.forms, strategy),
  };

  const reference = {
    blocks: card.reference.blocks
      .filter((block) => isReferenceSectionAllowed(block.title, strategy))
      .map((block) => ({
        ...block,
        items: filterReferenceItems(block.items, strategy),
      }))
      .filter((block) => block.items.length > 0),
  };

  return {
    ...card,
    encounter,
    understanding,
    takeaways,
    nextForms,
    reference,
  };
}
