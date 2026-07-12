import type { TLearningCardNextForms } from "@/types/learning-card";

import { VocabRussianDisplay, VocabSection } from "./VocabEditorial";

interface NextFormsSectionProps {
  nextForms: TLearningCardNextForms;
}

export function NextFormsSection({ nextForms }: NextFormsSectionProps) {
  if (nextForms.forms.length === 0) {
    return null;
  }

  return (
    <VocabSection
      eyebrow="Formes"
      title="Les formes que tu rencontreras bientôt"
    >
      <ul className="space-y-3">
        {nextForms.forms.map((form) => (
          <li key={form}>
            <VocabRussianDisplay size="md">{form}</VocabRussianDisplay>
          </li>
        ))}
      </ul>
    </VocabSection>
  );
}
