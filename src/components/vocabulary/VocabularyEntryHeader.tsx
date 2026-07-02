import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { TVocabularyEntry } from "@/types/vocabulary";

interface VocabularyEntryHeaderProps {
  entry: TVocabularyEntry;
}

export function VocabularyEntryHeader({ entry }: VocabularyEntryHeaderProps) {
  const displayLemma = entry.linguisticData.accent ?? entry.lemma;

  return (
    <header className="border-b border-brand-border bg-brand-card px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-2 text-sm text-brand-text-secondary transition-colors hover:text-brand-text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour
        </Link>

        <div className="mt-6">
          <p className="font-serif text-3xl text-brand-text-primary md:text-4xl">
            {displayLemma}
          </p>
          <p className="mt-2 text-lg text-brand-text-secondary md:text-xl">
            {entry.translation || "Traduction indisponible"}
          </p>
        </div>
      </div>
    </header>
  );
}
