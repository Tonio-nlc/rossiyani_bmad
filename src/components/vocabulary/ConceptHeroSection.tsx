import type { TConceptHero } from "@/types/concept-lesson";

import {
  VOCAB_EYEBROW_CLASS,
  VOCAB_HERO_PANEL_CLASS,
  VOCAB_INLINE_META_CLASS,
} from "@/lib/design/vocabulary-composition";
import { formatPosLabel } from "@/lib/vocabulary/format-linguistic-labels";

import { VocabMutedLabel, VocabRussianDisplay } from "./VocabEditorial";

interface ConceptHeroSectionProps {
  hero: TConceptHero;
}

function ConceptChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border/80 bg-bg/50 px-2.5 py-1 text-[12px] font-medium text-ink-2">
      {label}
    </span>
  );
}

export function ConceptHeroSection({ hero }: ConceptHeroSectionProps) {
  const posLabel = formatPosLabel(hero.partOfSpeech);

  return (
    <section className={VOCAB_HERO_PANEL_CLASS}>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <VocabRussianDisplay size="hero">{hero.lemma}</VocabRussianDisplay>
          <p className={VOCAB_INLINE_META_CLASS}>
            {[posLabel, hero.translation].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="border-t border-border/60 pt-5">
          <p className={VOCAB_EYEBROW_CLASS}>{hero.phenomenon.title}</p>

          {hero.encounteredForm ? (
            <div className="mt-3 space-y-2">
              <VocabMutedLabel>Tu as rencontré</VocabMutedLabel>
              <VocabRussianDisplay size="hero">{hero.encounteredForm}</VocabRussianDisplay>
            </div>
          ) : null}

          {hero.chips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {hero.chips.map((chip) => (
                <ConceptChip key={chip} label={chip} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
