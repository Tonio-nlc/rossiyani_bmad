import type { ReactNode } from "react";

import { splitEditorialText } from "@/lib/design/split-editorial-text";
import {
  VOCAB_BLOCK_GAP_CLASS,
  VOCAB_BODY_CLASS,
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_CHIP_CLASS,
  VOCAB_EYEBROW_CLASS,
  VOCAB_RUSSIAN_HERO_CLASS,
  VOCAB_RUSSIAN_MD_CLASS,
  VOCAB_RUSSIAN_SM_CLASS,
  VOCAB_SECTION_GAP_CLASS,
  VOCAB_TIGHT_GAP_CLASS,
  VOCAB_TITLE_CLASS,
  VOCAB_TITLE_TO_CONTENT_CLASS,
} from "@/lib/design/vocabulary-composition";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import { cn } from "@/lib/utils";

export function VocabSection({
  eyebrow,
  title,
  children,
  className,
  titleClassName,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <section className={cn(VOCAB_SECTION_GAP_CLASS, className)}>
      <header>
        <p className={VOCAB_EYEBROW_CLASS}>{eyebrow}</p>
        <h2 className={cn(VOCAB_TITLE_CLASS, titleClassName)}>{title}</h2>
      </header>
      <div className={cn(VOCAB_TITLE_TO_CONTENT_CLASS, VOCAB_BLOCK_GAP_CLASS)}>
        {children}
      </div>
    </section>
  );
}

export function VocabChipRow({ chips }: { chips: string[] }) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span key={chip} className={VOCAB_CHIP_CLASS}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function RussianGraphemeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const graphemes = displayRussianGraphemes(text);

  return (
    <span className={cn("font-russian", className)}>
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

export function VocabRussianDisplay({
  children,
  size = "lg",
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "hero";
}) {
  const sizeClass =
    size === "hero"
      ? VOCAB_RUSSIAN_HERO_CLASS
      : size === "lg"
        ? VOCAB_RUSSIAN_MD_CLASS
        : size === "md"
          ? VOCAB_RUSSIAN_SM_CLASS
          : "font-russian text-base leading-none text-ink";

  if (typeof children === "string") {
    return (
      <p className={sizeClass}>
        <RussianGraphemeText text={children} />
      </p>
    );
  }

  return <p className={sizeClass}>{children}</p>;
}

export function VocabMutedLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-ink-3">{children}</p>;
}

export function VocabShortBlock({ children }: { children: ReactNode }) {
  if (typeof children !== "string") {
    return <p className={VOCAB_BODY_CLASS}>{children}</p>;
  }

  const blocks = splitEditorialText(children);

  return (
    <div className={VOCAB_TIGHT_GAP_CLASS}>
      {blocks.map((block) => (
        <p key={block} className={VOCAB_BODY_CLASS}>
          {block}
        </p>
      ))}
    </div>
  );
}

const CYRILLIC_RE = /[\u0400-\u04FF]/;

function ExploreItem({ item }: { item: string }) {
  if (CYRILLIC_RE.test(item)) {
    return (
      <RussianGraphemeText
        text={item}
        className={VOCAB_BODY_SMALL_CLASS}
      />
    );
  }

  return <>{item}</>;
}

export function VocabExploreBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className={VOCAB_TIGHT_GAP_CLASS}>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className={VOCAB_BODY_SMALL_CLASS}>
            <ExploreItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
