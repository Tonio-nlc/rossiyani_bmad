import {
  selectEditorialChips,
  rewriteEditorialText,
} from "@/lib/design/editorial-voice";
import { VOCAB_HERO_PANEL_CLASS } from "@/lib/design/vocabulary-composition";
import type { TLearningCardEncounter } from "@/types/learning-card";

import {
  EditorialInlineMeta,
  NarrativeSection,
  VocabMutedLabel,
  VocabRussianDisplay,
} from "./VocabEditorial";

interface EncounterSectionProps {
  encounter: TLearningCardEncounter;
}

export function EncounterSection({ encounter }: EncounterSectionProps) {
  const metaChips = selectEditorialChips(
    encounter.formChips.map((chip) => chip.toLowerCase()),
    encounter.traitChips,
  );

  return (
    <NarrativeSection question="Pourquoi ai-je rencontré cette forme ?">
      <div className={VOCAB_HERO_PANEL_CLASS}>
        <div className="space-y-3">
          <VocabRussianDisplay size="hero">{encounter.surface}</VocabRussianDisplay>
          <EditorialInlineMeta items={metaChips} />

          <div className="space-y-1">
            <VocabMutedLabel>
              {rewriteEditorialText(encounter.originPhrase)}
            </VocabMutedLabel>
            <VocabRussianDisplay size="md">{encounter.lemma}</VocabRussianDisplay>
          </div>
        </div>
      </div>
    </NarrativeSection>
  );
}
