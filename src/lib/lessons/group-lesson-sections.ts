import type { TContentBlock } from "@/types/lessons";

export type TLessonSectionId =
  | "question"
  | "intuition"
  | "exemple"
  | "comprendre"
  | "schema"
  | "retenir";

export interface TLessonSectionGroup {
  id: TLessonSectionId;
  blocks: { block: TContentBlock; index: number }[];
}

export const LESSON_SECTION_LABELS: Record<
  TLessonSectionId,
  { eyebrow: string; title: string }
> = {
  question: { eyebrow: "QUESTION", title: "Question de départ" },
  intuition: { eyebrow: "INTUITION", title: "Intuition" },
  exemple: { eyebrow: "EXEMPLE", title: "Exemple réel" },
  comprendre: { eyebrow: "COMPRENDRE", title: "Comprendre" },
  schema: { eyebrow: "SCHÉMA", title: "Schéma visuel" },
  retenir: { eyebrow: "À RETENIR", title: "À retenir" },
};

export function isQuestionParagraph(text: string): boolean {
  const trimmed = text.trim();

  return (
    trimmed.endsWith("?") ||
    /^(pourquoi|comment|est-ce|ou|quand|où|qui|que|quel)/i.test(trimmed)
  );
}

function getLeadingQuestionCount(blocks: TContentBlock[]): number {
  let count = 0;

  for (const block of blocks) {
    if (block.type !== "paragraph" || !isQuestionParagraph(block.text)) {
      break;
    }

    count += 1;
  }

  return count;
}

function getSectionForBlock(
  block: TContentBlock,
  index: number,
  blocks: TContentBlock[],
  leadingQuestionCount: number,
  firstExampleIndex: number,
): TLessonSectionId {
  if (block.type === "takeaways") {
    return "retenir";
  }

  if (block.type === "schema") {
    return "schema";
  }

  if (block.type === "example") {
    return "exemple";
  }

  if (
    block.type === "paragraph" &&
    index < leadingQuestionCount &&
    isQuestionParagraph(block.text)
  ) {
    return "question";
  }

  if (firstExampleIndex === -1 || index < firstExampleIndex) {
    return "intuition";
  }

  return "comprendre";
}

export function groupLessonBlocks(
  blocks: TContentBlock[],
): TLessonSectionGroup[] {
  if (blocks.length === 0) {
    return [];
  }

  const leadingQuestionCount = getLeadingQuestionCount(blocks);
  const firstExampleIndex = blocks.findIndex((block) => block.type === "example");
  const sections: TLessonSectionGroup[] = [];

  blocks.forEach((block, index) => {
    const sectionId = getSectionForBlock(
      block,
      index,
      blocks,
      leadingQuestionCount,
      firstExampleIndex,
    );
    const lastSection = sections[sections.length - 1];

    if (lastSection?.id === sectionId) {
      lastSection.blocks.push({ block, index });
      return;
    }

    sections.push({
      id: sectionId,
      blocks: [{ block, index }],
    });
  });

  return sections;
}

export function isKeyPhraseParagraph(text: string): boolean {
  const trimmed = text.trim();

  return trimmed.length > 0 && trimmed.length <= 40 && !trimmed.endsWith(":");
}

export function isListLeadParagraph(text: string): boolean {
  return text.trim().endsWith(":");
}

export function isTransitionParagraph(text: string): boolean {
  const trimmed = text.trim();

  return (
    trimmed.length <= 120 &&
    /^(le |la |les |ce |c'est|en |au lieu|maintenant|remarque|les trois|ce qui)/i.test(
      trimmed,
    )
  );
}
