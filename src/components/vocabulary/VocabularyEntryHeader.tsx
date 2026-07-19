import { BackLink } from "@/components/ui/BackLink";
import { LESSON_COLUMN_CLASS } from "@/lib/design/lesson-composition";
import { cn } from "@/lib/utils";

interface VocabularyEntryHeaderProps {
  returnHref: string;
  returnLabel: string;
}

/** Chrome de navigation — même colonne que les Leçons (px alignés sur le shell). */
export function VocabularyEntryHeader({
  returnHref,
  returnLabel,
}: VocabularyEntryHeaderProps) {
  return (
    <header className="border-b border-border bg-bg py-4">
      <div className={cn(LESSON_COLUMN_CLASS, "px-4 md:px-8")}>
        <BackLink href={returnHref} label={returnLabel} />
      </div>
    </header>
  );
}
