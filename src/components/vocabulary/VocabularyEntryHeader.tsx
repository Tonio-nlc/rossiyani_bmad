import { BackLink } from "@/components/ui/BackLink";
import {
  VOCAB_COLUMN_CLASS,
  VOCAB_COLUMN_GUTTER_CLASS,
} from "@/lib/design/vocabulary-composition";
import { cn } from "@/lib/utils";

interface VocabularyEntryHeaderProps {
  returnHref: string;
  returnLabel: string;
}

/** Chrome de navigation — même colonne que le contenu de la fiche. */
export function VocabularyEntryHeader({
  returnHref,
  returnLabel,
}: VocabularyEntryHeaderProps) {
  return (
    <header className="border-b border-border bg-bg py-4">
      <div className={cn(VOCAB_COLUMN_CLASS, VOCAB_COLUMN_GUTTER_CLASS)}>
        <BackLink href={returnHref} label={returnLabel} />
      </div>
    </header>
  );
}
