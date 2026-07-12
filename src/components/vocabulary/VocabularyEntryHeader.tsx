import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
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
  return (
    <PageHeader
      eyebrow="VOCABULAIRE"
      title={entry.displayLemma}
      subtitle={entry.translation || "Traduction indisponible"}
      width="content"
      leading={<BackLink href={returnHref} label={returnLabel} />}
      className="[&_h1]:font-russian"
    />
  );
}
