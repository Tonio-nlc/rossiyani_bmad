import { WordCard } from "@/components/vocabulary/WordCard";
import type { TVocabularyListItem } from "@/types/vocabulary";

interface VocabularyGridProps {
  words: TVocabularyListItem[];
}

export function VocabularyGrid({ words }: VocabularyGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {words.map((word) => (
        <WordCard key={word.id} word={word} />
      ))}
    </div>
  );
}
