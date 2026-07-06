import { Lightbulb } from "lucide-react";

import { LessonExampleSentence } from "@/components/lessons/LessonExampleSentence";
import { SchemaDiagram } from "@/components/lessons/SchemaDiagram";
import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import { containsCyrillic } from "@/lib/lessons/lesson-colors";
import type { TContentBlock } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface LessonBlockRendererProps {
  blocks: TContentBlock[];
}

function ParagraphBlock({ text }: { text: string }) {
  const hasCyrillic = containsCyrillic(text);

  return (
    <p
      className={cn(
        "text-[15px] leading-[1.7] text-ink-2",
        hasCyrillic && "font-russian text-ink",
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
    <div className={cn(CARD_BASE_CLASS, "my-6")}>
      <LessonExampleSentence russian={block.russian} words={block.words} />
      <p className="mt-3 text-sm text-ink-3">{block.translation}</p>
      <p className="mt-4 text-sm leading-relaxed text-ink-2">{block.note}</p>
    </div>
  );
}

function ComparisonBlock({
  block,
}: {
  block: Extract<TContentBlock, { type: "comparison" }>;
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-[14px] border border-border bg-surface">
      {block.title ? (
        <p className="border-b border-border px-4 py-3 text-sm font-bold text-ink">
          {block.title}
        </p>
      ) : null}
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-bg">
            <th className="px-4 py-3 text-xs font-bold text-ink-3"> </th>
            {block.columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-xs font-bold text-ink-3"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
              {row.values.map((value, index) => (
                <td key={`${row.label}-${index}`} className="px-4 py-3 text-ink-2">
                  {value}
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
    <div className="my-6 flex gap-3 rounded-[14px] border border-accent-border bg-accent-light p-4">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-ink-2">{text}</p>
    </div>
  );
}

export function LessonBlockRenderer({ blocks }: LessonBlockRendererProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <ParagraphBlock key={index} text={block.text} />;
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
              />
            );
          case "callout":
            return <CalloutBlock key={index} text={block.text} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
