import { parseNextFormItem } from "@/lib/design/editorial-voice";
import {
  VOCAB_FORM_CARD_CLASS,
  VOCAB_FORMS_GRID_CLASS,
  VOCAB_NEXT_FORM_MAX,
} from "@/lib/design/vocabulary-composition";
import type { TLearningCardNextForms } from "@/types/learning-card";

import { NarrativeSection, VocabRussianDisplay } from "./VocabEditorial";

interface NextFormsSectionProps {
  nextForms: TLearningCardNextForms;
}

export function NextFormsSection({ nextForms }: NextFormsSectionProps) {
  const forms = nextForms.forms
    .slice(0, VOCAB_NEXT_FORM_MAX)
    .map((form, index) => parseNextFormItem(form, index));

  if (forms.length === 0) {
    return null;
  }

  return (
    <NarrativeSection question="Que vais-je rencontrer ensuite ?">
      <ul className={VOCAB_FORMS_GRID_CLASS}>
        {forms.map((form) => (
          <li key={`${form.surface}-${form.hint}`} className={VOCAB_FORM_CARD_CLASS}>
            <VocabRussianDisplay size="md">{form.surface}</VocabRussianDisplay>
            <p className="mt-1.5 text-[13px] text-ink-3">→ {form.hint}</p>
          </li>
        ))}
      </ul>
    </NarrativeSection>
  );
}
