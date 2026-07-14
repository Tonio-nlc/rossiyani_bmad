import {
  VOCAB_FORMS_GRID_CLASS,
  VOCAB_LIST_MAX,
} from "@/lib/design/vocabulary-composition";
import type { TLearningCardNextForms } from "@/types/learning-card";

import { VocabRussianDisplay, VocabSection } from "./VocabEditorial";

interface NextFormsSectionProps {
  nextForms: TLearningCardNextForms;
}

export function NextFormsSection({ nextForms }: NextFormsSectionProps) {
  const forms = nextForms.forms.slice(0, VOCAB_LIST_MAX);

  if (forms.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Formes" title="Les formes que tu rencontreras bientôt">
      <ul className={VOCAB_FORMS_GRID_CLASS}>
        {forms.map((form) => (
          <li key={form}>
            <VocabRussianDisplay size="md">{form}</VocabRussianDisplay>
          </li>
        ))}
      </ul>
    </VocabSection>
  );
}
