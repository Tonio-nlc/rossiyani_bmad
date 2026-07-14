import type { TLearningCardEncounter } from "@/types/learning-card";

import {
  VocabChipRow,
  VocabMutedLabel,
  VocabRussianDisplay,
  VocabSection,
} from "./VocabEditorial";

interface EncounterSectionProps {
  encounter: TLearningCardEncounter;
}

export function EncounterSection({ encounter }: EncounterSectionProps) {
  const formChips = encounter.formChips.map((chip) => chip.toLowerCase());

  return (
    <VocabSection eyebrow="Rencontre" title="Tu as rencontré…">
      <div className="space-y-3">
        <VocabRussianDisplay size="hero">{encounter.surface}</VocabRussianDisplay>

        {formChips.length > 0 ? <VocabChipRow chips={formChips} /> : null}

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <VocabMutedLabel>{encounter.originPhrase}</VocabMutedLabel>
          <VocabRussianDisplay size="md">{encounter.lemma}</VocabRussianDisplay>
        </div>

        {encounter.traitChips.length > 0 ? (
          <VocabChipRow chips={encounter.traitChips} />
        ) : null}
      </div>
    </VocabSection>
  );
}
