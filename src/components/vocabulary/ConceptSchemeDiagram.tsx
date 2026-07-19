import { RussianText } from "@/components/reader/RussianText";
import type { TConceptScheme } from "@/types/concept-lesson";

import { LESSON_EXAMPLE_RUSSIAN_CLASS } from "@/lib/design/lesson-composition";

function RussianNode({ text }: { text: string }) {
  return (
    <span className={LESSON_EXAMPLE_RUSSIAN_CLASS}>
      <RussianText>{text}</RussianText>
    </span>
  );
}

interface ConceptSchemeDiagramProps {
  scheme: TConceptScheme;
  compact?: boolean;
}

export function ConceptSchemeDiagram({
  scheme,
  compact = false,
}: ConceptSchemeDiagramProps) {
  if (scheme.nodes.length < 2) {
    return null;
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-x-3 gap-y-2"
          : "flex flex-col items-start gap-2"
      }
    >
      {scheme.nodes.map((node, index) => (
        <div
          key={`${node}-${index}`}
          className={
            compact
              ? "flex items-center gap-3"
              : "flex flex-col items-start gap-2"
          }
        >
          <RussianNode text={node} />
          {index < scheme.nodes.length - 1 ? (
            <span
              className={compact ? "text-ink-3" : "pl-1 text-ink-3"}
              aria-hidden="true"
            >
              ↓
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
