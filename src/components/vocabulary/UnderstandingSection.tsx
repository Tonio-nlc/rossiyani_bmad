import {
  selectEditorialChips,
  rewriteEditorialText,
} from "@/lib/design/editorial-voice";
import { VOCAB_HERO_PANEL_CLASS } from "@/lib/design/vocabulary-composition";
import type {
  TLearningCardEncounter,
  TLearningCardUnderstanding,
} from "@/types/learning-card";

import {
  EditorialExplanation,
  EditorialInlineMeta,
  EditorialProse,
  EditorialSubpart,
  NarrativeSection,
  VocabMutedLabel,
  VocabRussianDisplay,
} from "./VocabEditorial";

interface UnderstandingSectionProps {
  understanding: TLearningCardUnderstanding;
  encounter?: TLearningCardEncounter | null;
}

function RussianSentence({ text }: { text: string }) {
  return <VocabRussianDisplay size="md">{text}</VocabRussianDisplay>;
}

export function UnderstandingSection({
  understanding,
  encounter = null,
}: UnderstandingSectionProps) {
  const surface = encounter?.surface;
  const lemma = encounter?.lemma;
  const metaChips = selectEditorialChips(
    encounter?.formChips.map((chip) => chip.toLowerCase()) ?? [],
    encounter?.traitChips ?? [],
  );

  const hasEncounterStep = Boolean(surface);
  const hasMeaningStep = Boolean(
    understanding.intro ||
      understanding.whyPoints.length > 0 ||
      understanding.suffix ||
      understanding.roleLabel,
  );
  const hasContextStep = Boolean(
    understanding.explanationBlocks.length > 0 || understanding.sentence,
  );

  return (
    <>
      {hasEncounterStep ? (
        <NarrativeSection question="Pourquoi ai-je rencontré cette forme ?">
          <div className={VOCAB_HERO_PANEL_CLASS}>
            <div className="space-y-3">
              <VocabRussianDisplay size="hero">{surface}</VocabRussianDisplay>
              <EditorialInlineMeta items={metaChips} />

              {lemma ? (
                <div className="space-y-1">
                  <VocabMutedLabel>
                    {rewriteEditorialText(
                      encounter?.originPhrase ?? "Cette forme vient de",
                    )}
                  </VocabMutedLabel>
                  <VocabRussianDisplay size="md">{lemma}</VocabRussianDisplay>
                </div>
              ) : null}
            </div>
          </div>
        </NarrativeSection>
      ) : null}

      {hasMeaningStep ? (
        <NarrativeSection question="Que signifie exactement cette forme ?">
          <div className="space-y-4">
            {understanding.suffix || understanding.roleLabel ? (
              <div className="space-y-2">
                {understanding.suffix ? (
                  <VocabRussianDisplay size="hero">
                    {understanding.suffix}
                  </VocabRussianDisplay>
                ) : null}
                {understanding.roleLabel ? (
                  <EditorialProse>
                    {rewriteEditorialText(understanding.roleLabel)}
                  </EditorialProse>
                ) : null}
              </div>
            ) : null}

            {understanding.intro ? (
              <EditorialProse>{understanding.intro}</EditorialProse>
            ) : null}

            {understanding.whyPoints.length > 0 ? (
              <EditorialSubpart label="Pourquoi ?">
                <div className="space-y-3">
                  {understanding.whyPoints.map((point) => (
                    <EditorialExplanation key={point} text={point} />
                  ))}
                </div>
              </EditorialSubpart>
            ) : null}
          </div>
        </NarrativeSection>
      ) : null}

      {hasContextStep ? (
        <NarrativeSection question="Pourquoi est-elle utilisée ici ?">
          <div className="space-y-4">
            {understanding.explanationBlocks.length > 0 ? (
              <EditorialSubpart label="Dans cette phrase">
                <div className="space-y-3">
                  {understanding.explanationBlocks.map((block) => (
                    <EditorialExplanation key={block} text={block} />
                  ))}
                </div>
              </EditorialSubpart>
            ) : null}

            {understanding.sentence ? (
              <EditorialSubpart label="Phrase">
                <RussianSentence text={understanding.sentence} />
              </EditorialSubpart>
            ) : null}
          </div>
        </NarrativeSection>
      ) : null}
    </>
  );
}
