import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

import { LessonExampleSentence } from "@/components/lessons/LessonExampleSentence";
import { LessonSection } from "@/components/lessons/LessonSection";
import { SchemaDiagram } from "@/components/lessons/SchemaDiagram";
import {
  LESSON_CARD_SHELL_CLASS,
  LESSON_EXAMPLE_CARD_CLASS,
  LESSON_EXAMPLE_NOTE_CLASS,
  LESSON_EXAMPLE_TRANSLATION_CLASS,
  LESSON_PROSE_CLASS,
  LESSON_QUESTION_CLASS,
  LESSON_TAKEAWAY_ITEM_CLASS,
} from "@/lib/design/lesson-composition";
import { containsCyrillic } from "@/lib/lessons/lesson-colors";
import {
  groupLessonBlocks,
  isKeyPhraseParagraph,
  isListLeadParagraph,
  isQuestionParagraph,
  isTransitionParagraph,
  LESSON_SECTION_LABELS,
  type TLessonSectionId,
} from "@/lib/lessons/group-lesson-sections";
import { LESSON_SECTION_RHYTHM } from "@/lib/lessons/lesson-section-rhythm";
import type { TContentBlock } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface LessonBlockRendererProps {
  blocks: TContentBlock[];
}

interface ParagraphBlockProps {
  text: string;
  sectionId: TLessonSectionId;
  inListGroup?: boolean;
}

function ParagraphBlock({ text, sectionId, inListGroup }: ParagraphBlockProps) {
  const hasCyrillic = containsCyrillic(text);
  const isQuestion =
    sectionId === "question" || isQuestionParagraph(text);
  const isKeyPhrase = inListGroup || isKeyPhraseParagraph(text);
  const isTransition = isTransitionParagraph(text);
  const isListLead = isListLeadParagraph(text);
  const isConversational = sectionId === "intuition";

  return (
    <p
      className={cn(
        isQuestion && LESSON_QUESTION_CLASS,
        !isQuestion &&
          isConversational &&
          !isKeyPhrase &&
          !isTransition &&
          !isListLead &&
          LESSON_PROSE_CLASS,
        !isQuestion &&
          !isConversational &&
          isKeyPhrase &&
          "max-w-reading border-l border-accent-border/70 pl-4 text-[14px] font-medium leading-[1.65] text-ink",
        !isQuestion &&
          !isConversational &&
          !isKeyPhrase &&
          isTransition &&
          cn(LESSON_PROSE_CLASS, "font-medium text-ink"),
        !isQuestion &&
          !isConversational &&
          !isKeyPhrase &&
          !isTransition &&
          isListLead &&
          cn(LESSON_PROSE_CLASS, "font-medium text-ink"),
        !isQuestion &&
          !isConversational &&
          !isKeyPhrase &&
          !isTransition &&
          !isListLead &&
          LESSON_PROSE_CLASS,
        hasCyrillic && "font-russian text-[16px] text-ink",
      )}
    >
      {text}
    </p>
  );
}

function ExampleBlock({
  block,
}: {
  block: Extract<TContentBlock, { type: "example" }>;
}) {
  return (
    <div className={LESSON_EXAMPLE_CARD_CLASS}>
      <LessonExampleSentence russian={block.russian} words={block.words} />
      <p className={LESSON_EXAMPLE_TRANSLATION_CLASS}>{block.translation}</p>
      <p className={LESSON_EXAMPLE_NOTE_CLASS}>{block.note}</p>
    </div>
  );
}

function ComparisonCell({ value }: { value: string }) {
  const hasCyrillic = containsCyrillic(value);

  return (
    <span className={hasCyrillic ? "font-russian text-ink" : undefined}>
      {value}
    </span>
  );
}

function ComparisonBlock({
  block,
}: {
  block: Extract<TContentBlock, { type: "comparison" }>;
}) {
  return (
    <div
      className={cn(
        LESSON_CARD_SHELL_CLASS,
        "overflow-x-auto bg-surface/80",
      )}
    >
      {block.title ? (
        <p className="border-b border-border/70 px-4 py-2.5 text-sm font-bold text-ink">
          {block.title}
        </p>
      ) : null}
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-bg/60">
            <th className="px-4 py-2.5 text-xs font-bold text-ink-3"> </th>
            {block.columns.map((column) => (
              <th
                key={column}
                className="px-4 py-2.5 text-xs font-bold text-ink-3"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-2.5 font-medium text-ink">{row.label}</td>
              {row.values.map((value, index) => (
                <td key={`${row.label}-${index}`} className="px-4 py-2.5 text-ink-2">
                  <ComparisonCell value={value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutBlock({ text }: { text: string }) {
  return (
    <div
      className={cn(
        LESSON_CARD_SHELL_CLASS,
        "border-accent-border/60 bg-accent-light/70 px-4 py-3",
      )}
    >
      <p className={cn(LESSON_PROSE_CLASS, "text-sm")}>{text}</p>
    </div>
  );
}

function TakeawaysBlock({
  items,
  variant = "default",
}: {
  items: string[];
  variant?: "default" | "conclusion";
}) {
  if (variant === "conclusion") {
    return (
      <ul className="space-y-4 border-l-2 border-accent/25 pl-5 md:pl-6">
        {items.map((item, index) => (
          <li key={index} className={LESSON_TAKEAWAY_ITEM_CLASS}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn(
        LESSON_CARD_SHELL_CLASS,
        "flex gap-3 border-accent-border bg-accent-light p-4",
      )}
    >
      <Lightbulb
        className="mt-0.5 size-5 shrink-0 text-accent"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">À retenir</p>
        <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-relaxed text-ink-2">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function renderBlock(
  block: TContentBlock,
  index: number,
  sectionId: TLessonSectionId,
  inListGroup: boolean,
) {
  switch (block.type) {
    case "paragraph":
      return (
        <ParagraphBlock
          key={index}
          text={block.text}
          sectionId={sectionId}
          inListGroup={inListGroup}
        />
      );
    case "example":
      return <ExampleBlock key={index} block={block} />;
    case "comparison":
      return <ComparisonBlock key={index} block={block} />;
    case "schema":
      return (
        <SchemaDiagram
          key={index}
          svgContent={block.svgContent}
          caption={block.caption}
          variant={sectionId === "schema" ? "climax" : "default"}
        />
      );
    case "callout":
      return <CalloutBlock key={index} text={block.text} />;
    case "takeaways":
      return (
        <TakeawaysBlock
          key={index}
          items={block.items}
          variant={sectionId === "retenir" ? "conclusion" : "default"}
        />
      );
    default:
      return null;
  }
}

function renderSectionBlocks(
  sectionId: TLessonSectionId,
  blocks: { block: TContentBlock; index: number }[],
) {
  const nodes: ReactNode[] = [];
  let listGroupActive = false;

  blocks.forEach(({ block, index }, blockPosition) => {
    if (block.type === "paragraph") {
      if (isListLeadParagraph(block.text)) {
        listGroupActive = true;
        nodes.push(renderBlock(block, index, sectionId, false));
        return;
      }

      const inListGroup =
        listGroupActive && isKeyPhraseParagraph(block.text);

      nodes.push(renderBlock(block, index, sectionId, inListGroup));

      const nextBlock = blocks[blockPosition + 1]?.block;
      if (
        !inListGroup ||
        nextBlock?.type !== "paragraph" ||
        !isKeyPhraseParagraph(nextBlock.text)
      ) {
        listGroupActive = false;
      }

      return;
    }

    listGroupActive = false;
    nodes.push(renderBlock(block, index, sectionId, false));
  });

  return nodes;
}

export function LessonBlockRenderer({ blocks }: LessonBlockRendererProps) {
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-ink-3">
        Le contenu de cette leçon sera bientôt disponible.
      </p>
    );
  }

  const sections = groupLessonBlocks(blocks);

  return (
    <div>
      {sections.map((section) => {
        const labels = LESSON_SECTION_LABELS[section.id];
        const rhythm = LESSON_SECTION_RHYTHM[section.id];

        return (
          <LessonSection
            key={`${section.id}-${section.blocks[0]?.index ?? 0}`}
            sectionId={section.id}
            eyebrow={labels.eyebrow}
            title={labels.title}
            headerTone={rhythm.headerTone}
            contentSpacing={rhythm.contentSpacing}
            contentMaxWidth={rhythm.contentMaxWidth}
            marginTop={rhythm.marginTop}
            marginBottom={rhythm.marginBottom}
            showSeparator={rhythm.showSeparator}
            isConclusion={section.id === "retenir"}
          >
            {renderSectionBlocks(section.id, section.blocks)}
          </LessonSection>
        );
      })}
    </div>
  );
}
