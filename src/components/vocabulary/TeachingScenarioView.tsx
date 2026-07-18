import type { TTeachingScenario } from "@/types/teaching-scenario";

import {
  VOCAB_BODY_CLASS,
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_CARD_CLASS,
  VOCAB_FORM_CARD_CLASS,
  VOCAB_RUSSIAN_MD_CLASS,
} from "@/lib/design/vocabulary-composition";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";

import { ConceptSchemeDiagram } from "./ConceptSchemeDiagram";
import {
  EditorialProse,
  NarrativeSection,
  TextWithRussianDisplay,
} from "./VocabEditorial";

function RussianForm({ text }: { text: string }) {
  const graphemes = displayRussianGraphemes(text);

  return (
    <span className={VOCAB_RUSSIAN_MD_CLASS}>
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

interface TeachingScenarioViewProps {
  scenario: TTeachingScenario;
}

export function TeachingScenarioView({ scenario }: TeachingScenarioViewProps) {
  const visualScheme = {
    nodes: scenario.visual.nodes,
  };

  return (
    <>
      <section className="border-y border-border/70 py-5">
        <p className="font-serif text-[1.375rem] leading-snug text-ink md:text-[1.5rem]">
          <TextWithRussianDisplay text={scenario.hook} />
        </p>
      </section>

      <NarrativeSection question={scenario.question}>
        <EditorialProse>{scenario.intuition}</EditorialProse>
      </NarrativeSection>

      {visualScheme.nodes.length >= 2 ? (
        <NarrativeSection question="Visualiser">
          {scenario.visual.caption ? (
            <p className={`mb-3 ${VOCAB_BODY_SMALL_CLASS}`}>
              {scenario.visual.caption}
            </p>
          ) : null}
          <ConceptSchemeDiagram
            scheme={visualScheme}
            compact={scenario.visual.layout === "comparison"}
          />
        </NarrativeSection>
      ) : null}

      <NarrativeSection question="Ce qu'il faut comprendre">
        <div className="space-y-4">
          {scenario.explanation.map((paragraph) => (
            <EditorialProse key={paragraph}>{paragraph}</EditorialProse>
          ))}
        </div>
      </NarrativeSection>

      {scenario.comparison.length > 0 ? (
        <NarrativeSection question="Comparer">
          <div className="space-y-3">
            {scenario.comparison.map((item) => (
              <div
                key={`${item.fromForm}-${item.toForm}`}
                className={VOCAB_FORM_CARD_CLASS}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <RussianForm text={item.fromForm} />
                  <span className="text-ink-3" aria-hidden="true">
                    ↓
                  </span>
                  <RussianForm text={item.toForm} />
                </div>
                {item.explanation ? (
                  <p className={`mt-2 ${VOCAB_BODY_CLASS}`}>
                    <TextWithRussianDisplay text={item.explanation} />
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </NarrativeSection>
      ) : null}

      <NarrativeSection question="Erreur fréquente">
        <p className={VOCAB_BODY_CLASS}>
          <TextWithRussianDisplay text={scenario.commonMistake} />
        </p>
      </NarrativeSection>

      {scenario.reuse.length > 0 ? (
        <NarrativeSection question="Tu retrouveras cette idée dans">
          <ul className="space-y-2">
            {scenario.reuse.map((item) => (
              <li key={item} className={VOCAB_BODY_CLASS}>
                <TextWithRussianDisplay text={item} />
              </li>
            ))}
          </ul>
        </NarrativeSection>
      ) : null}

      <NarrativeSection question="À retenir">
        <div className={`${VOCAB_CARD_CLASS} px-4 py-4`}>
          <p className="text-[17px] leading-snug text-ink-2">
            <TextWithRussianDisplay text={scenario.memoryAnchor} />
          </p>
        </div>
      </NarrativeSection>

      {scenario.nextConcept ? (
        <NarrativeSection question="Ensuite">
          <p className={VOCAB_BODY_CLASS}>
            {scenario.nextConcept.title}
          </p>
        </NarrativeSection>
      ) : null}
    </>
  );
}
