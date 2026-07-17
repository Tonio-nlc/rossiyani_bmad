import type { TConceptSecondaryCard } from "@/types/concept-lesson";

import { VOCAB_CARD_CLASS, VOCAB_BODY_SMALL_CLASS } from "@/lib/design/vocabulary-composition";
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
    <NarrativeSection question="Voir aussi">
      <div className="space-y-3">
        {concepts.map((concept) => (
          <div key={concept.conceptId} className={`${VOCAB_CARD_CLASS} px-4 py-4`}>
            <p className="text-[13px] font-bold tracking-[0.06em] text-accent uppercase">
              {concept.title}
            </p>
            <p className={`mt-2 ${VOCAB_BODY_SMALL_CLASS}`}>{concept.summary}</p>
            <p className="mt-2 text-[15px] leading-snug text-ink-2">
              {concept.coreIdea}
            </p>
          </div>
        ))}
      </div>
    </NarrativeSection>
  );
}
