import { BackLink } from "@/components/ui/BackLink";
import type { TVocabularyEntry } from "@/types/vocabulary";

interface VocabularyEntryHeaderProps {
  entry: TVocabularyEntry;
  returnHref: string;
  returnLabel: string;
}

export function VocabularyEntryHeader({
  entry,
  returnHref,
  returnLabel,
}: VocabularyEntryHeaderProps) {
  const displayLemma = entry.linguisticData.accent ?? entry.lemma;

  return (
    <header className="border-b border-border bg-surface px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-3xl">
        <BackLink href={returnHref} label={returnLabel} />

        <div className="mt-6">
          <p className="font-russian text-3xl text-ink md:text-4xl">
            {displayLemma}
          </p>
          <p className="mt-2 text-lg text-ink-2 md:text-xl">
            {entry.translation || "Traduction indisponible"}
          </p>
        </div>
      </div>
    </header>
  );
}
