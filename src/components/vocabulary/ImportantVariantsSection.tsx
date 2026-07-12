import { extractImportantVariants } from "@/lib/vocabulary/vocabulary-pedagogy";
import type { TVocabularyLinguisticProfile } from "@/types/vocabulary";

import { VocabRussianDisplay, VocabSection } from "./VocabEditorial";

interface ImportantVariantsSectionProps {
  profile: TVocabularyLinguisticProfile;
}

export function ImportantVariantsSection({
  profile,
}: ImportantVariantsSectionProps) {
  const variants = extractImportantVariants(profile);

  if (variants.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Formes" title="Variantes importantes">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        {variants.map((variant) => (
          <VocabRussianDisplay key={variant} size="md">
            {variant}
          </VocabRussianDisplay>
        ))}
      </div>
    </VocabSection>
  );
}
