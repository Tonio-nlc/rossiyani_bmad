import { BackLink } from "@/components/ui/BackLink";
import {
  PAGE_BODY_SHELL_CLASS,
  PAGE_HEADER_EYEBROW_CLASS,
  PAGE_HEADER_SHELL_CLASS,
  PAGE_HEADER_SUBTITLE_CLASS,
  PAGE_HEADER_TITLE_CLASS,
  pageBodyWidthClass,
} from "@/lib/design/rhythm";
import { getPosLabel } from "@/lib/vocabulary/vocabulary-pedagogy";
import type { TVocabularyEntry } from "@/types/vocabulary";
import { cn } from "@/lib/utils";

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
  const posLabel = getPosLabel(entry.linguisticProfile.partOfSpeech);

  return (
    <header className={PAGE_HEADER_SHELL_CLASS}>
      <div
        className={cn(
          PAGE_BODY_SHELL_CLASS,
          "pb-0",
          pageBodyWidthClass("content"),
        )}
      >
        <div className="mb-4">
          <BackLink href={returnHref} label={returnLabel} />
        </div>
        <p className={PAGE_HEADER_EYEBROW_CLASS}>VOCABULAIRE</p>
        <h1 className={cn(PAGE_HEADER_TITLE_CLASS, "mt-4 font-russian")}>
          {entry.displayLemma}
        </h1>
        <p className={PAGE_HEADER_SUBTITLE_CLASS}>
          {entry.translation || "Traduction indisponible"}
        </p>
        {posLabel ? (
          <p className="mt-1 text-sm text-ink-3">{posLabel}</p>
        ) : null}
      </div>
    </header>
  );
}
