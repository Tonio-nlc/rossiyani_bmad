import { buildEncounterSummary } from "@/lib/vocabulary/vocabulary-pedagogy";
import type {
  TVocabularyContextEncounter,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";

import {
  VocabChipRow,
  VocabMutedLabel,
  VocabRussianDisplay,
  VocabSection,
  VocabStep,
} from "./VocabEditorial";

interface EncounterSummarySectionProps {
  encounter: TVocabularyContextEncounter;
  profile: TVocabularyLinguisticProfile;
  displayLemma: string;
}

export function EncounterSummarySection({
  encounter,
  profile,
  displayLemma,
}: EncounterSummarySectionProps) {
  const summary = buildEncounterSummary(encounter, profile, displayLemma);
  const hasFormChips = summary.formChips.length > 0;
  const hasTraitChips = summary.traitChips.length > 0;

  return (
    <VocabSection eyebrow="Rencontre" title="Tu as rencontré…">
      <VocabStep>
        <VocabRussianDisplay size="xl">{summary.surface}</VocabRussianDisplay>
      </VocabStep>

      <VocabStep showArrow={hasFormChips || hasTraitChips}>
        <VocabMutedLabel>{summary.originPhrase}</VocabMutedLabel>
        <VocabRussianDisplay>{summary.lemma}</VocabRussianDisplay>
      </VocabStep>

      {hasFormChips ? (
        <VocabStep showArrow={hasTraitChips}>
          <VocabChipRow chips={summary.formChips} />
        </VocabStep>
      ) : null}

      {hasTraitChips ? (
        <VocabStep showArrow={false}>
          <VocabChipRow chips={summary.traitChips} />
        </VocabStep>
      ) : null}
    </VocabSection>
  );
}
