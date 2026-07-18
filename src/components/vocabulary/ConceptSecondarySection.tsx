import type { TConceptSecondaryCard } from "@/types/concept-lesson";

import {
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_INLINE_META_CLASS,
} from "@/lib/design/vocabulary-composition";
import { NarrativeSection } from "./VocabEditorial";

interface ConceptSecondarySectionProps {
  concepts: TConceptSecondaryCard[];
}

export function ConceptSecondarySection({
  concepts,
}: ConceptSecondarySectionProps) {
  if (concepts.length === 0) {
    return null;
  }

  return (
    <NarrativeSection question="Concepts liés">
      <ul className="space-y-3">
        {concepts.map((concept) => (
          <li key={concept.conceptId}>
            <p className="text-[15px] font-semibold text-ink">{concept.title}</p>
            <p className={`mt-0.5 ${VOCAB_BODY_SMALL_CLASS}`}>{concept.summary}</p>
          </li>
        ))}
      </ul>
      <p className={`mt-3 ${VOCAB_INLINE_META_CLASS}`}>
        Ces mécanismes apparaissent souvent avec le même type de forme.
      </p>
    </NarrativeSection>
  );
}
