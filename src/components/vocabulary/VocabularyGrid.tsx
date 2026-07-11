import { WordCard } from "@/components/vocabulary/WordCard";
import type { TVocabularyListItem } from "@/types/vocabulary";

interface VocabularyGridProps {
  words: TVocabularyListItem[];
  returnQuery?: string;
}

export function VocabularyGrid({ words, returnQuery = "" }: VocabularyGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {words.map((word) => (
        <WordCard key={word.id} word={word} returnQuery={returnQuery} />
      ))}
    </div>
  );
}
