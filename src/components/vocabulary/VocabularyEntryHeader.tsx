import { BackLink } from "@/components/ui/BackLink";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import {
  PAGE_BODY_SHELL_CLASS,
  PAGE_HEADER_EYEBROW_CLASS,
  PAGE_HEADER_SHELL_CLASS,
  PAGE_HEADER_SUBTITLE_CLASS,
  PAGE_HEADER_TITLE_CLASS,
  pageBodyWidthClass,
} from "@/lib/design/rhythm";
import type { TLearningCardHeader } from "@/types/learning-card";
import { cn } from "@/lib/utils";

interface VocabularyEntryHeaderProps {
  header: TLearningCardHeader;
  returnHref: string;
  returnLabel: string;
}

function HeaderLemma({ lemma }: { lemma: string }) {
  const graphemes = displayRussianGraphemes(lemma);

  return (
    <span className="font-russian">
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

export function VocabularyEntryHeader({
  header,
  returnHref,
  returnLabel,
}: VocabularyEntryHeaderProps) {
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
        <h1 className={cn(PAGE_HEADER_TITLE_CLASS, "mt-4")}>
          <HeaderLemma lemma={header.lemma} />
        </h1>
        <p className={PAGE_HEADER_SUBTITLE_CLASS}>
          {header.subtitle ?? header.translation ?? "Traduction indisponible"}
        </p>
      </div>
    </header>
  );
}
