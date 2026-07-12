import { buildExploreBlocks } from "@/lib/vocabulary/vocabulary-pedagogy";
import type { TVocabularyLinguisticProfile } from "@/types/vocabulary";

import { VocabExploreBlock, VocabSection } from "./VocabEditorial";

interface ExploreWordSectionProps {
  profile: TVocabularyLinguisticProfile;
}

export function ExploreWordSection({ profile }: ExploreWordSectionProps) {
  const blocks = buildExploreBlocks(profile);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <VocabSection eyebrow="Approfondir" title="Explorer ce mot">
      <div className="space-y-6">
        {blocks.map((block) => (
          <VocabExploreBlock
            key={block.title}
            title={block.title}
            items={block.items}
          />
        ))}
      </div>
    </VocabSection>
  );
}
