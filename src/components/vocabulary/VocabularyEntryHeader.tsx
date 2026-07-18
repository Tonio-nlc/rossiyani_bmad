import { BackLink } from "@/components/ui/BackLink";
import { VOCAB_COLUMN_CLASS } from "@/lib/design/vocabulary-composition";
import {
  PAGE_BODY_SHELL_CLASS,
  PAGE_HEADER_SHELL_CLASS,
} from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

interface VocabularyEntryHeaderProps {
  returnHref: string;
  returnLabel: string;
}

/** Chrome de navigation uniquement — le hero concept est dans ConceptHeroSection. */
export function VocabularyEntryHeader({
  returnHref,
  returnLabel,
}: VocabularyEntryHeaderProps) {
  return (
    <header className={cn(PAGE_HEADER_SHELL_CLASS, "py-4 md:py-4")}>
      <div className={cn(PAGE_BODY_SHELL_CLASS, "pb-0", VOCAB_COLUMN_CLASS)}>
        <BackLink href={returnHref} label={returnLabel} />
      </div>
    </header>
  );
}
