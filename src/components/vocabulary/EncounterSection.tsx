import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import type { TLearningCardEncounter } from "@/types/learning-card";

import {
  VocabChipRow,
  VocabMutedLabel,
  VocabRussianDisplay,
  VocabSection,
  VocabStep,
} from "./VocabEditorial";

interface EncounterSectionProps {
  encounter: TLearningCardEncounter;
}

export function EncounterSection({ encounter }: EncounterSectionProps) {
  const hasFormChips = encounter.formChips.length > 0;
  const hasTraitChips = encounter.traitChips.length > 0;

  return (
    <VocabSection eyebrow="Rencontre" title="Tu as rencontré…">
      <VocabStep>
        <VocabRussianDisplay size="xl">{encounter.surface}</VocabRussianDisplay>
      </VocabStep>

      <VocabStep showArrow={hasFormChips || hasTraitChips}>
        {hasFormChips ? (
          <VocabChipRow
            chips={encounter.formChips.map((chip) => `→ ${chip.toLowerCase()}`)}
          />
        ) : null}
      </VocabStep>

      <VocabStep showArrow={hasTraitChips}>
        <VocabMutedLabel>{encounter.originPhrase}</VocabMutedLabel>
        <VocabRussianDisplay>{encounter.lemma}</VocabRussianDisplay>
      </VocabStep>

      {hasTraitChips ? (
        <VocabStep showArrow={false}>
          <VocabChipRow chips={encounter.traitChips} />
        </VocabStep>
      ) : null}
    </VocabSection>
  );
}
