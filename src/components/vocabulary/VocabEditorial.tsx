import type { ReactNode } from "react";

import {
  rewriteEditorialText,
  structureExplanation,
} from "@/lib/design/editorial-voice";
import { splitEditorialText } from "@/lib/design/split-editorial-text";
import {
  VOCAB_BLOCK_GAP_CLASS,
  VOCAB_BODY_CLASS,
  VOCAB_BODY_SMALL_CLASS,
  VOCAB_INLINE_META_CLASS,
  VOCAB_NARRATIVE_GAP_CLASS,
  VOCAB_NARRATIVE_QUESTION_CLASS,
  VOCAB_RUSSIAN_HERO_CLASS,
  VOCAB_RUSSIAN_MD_CLASS,
  VOCAB_RUSSIAN_SM_CLASS,
  VOCAB_SUBPART_LABEL_CLASS,
  VOCAB_TIGHT_GAP_CLASS,
  VOCAB_TITLE_TO_CONTENT_CLASS,
} from "@/lib/design/vocabulary-composition";
import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import { cn } from "@/lib/utils";

export function NarrativeSection({
  question,
  children,
  className,
}: {
  question: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(VOCAB_NARRATIVE_GAP_CLASS, className)}>
      <h2 className={VOCAB_NARRATIVE_QUESTION_CLASS}>{question}</h2>
      <div className={cn(VOCAB_TITLE_TO_CONTENT_CLASS, VOCAB_BLOCK_GAP_CLASS)}>
        {children}
      </div>
    </section>
  );
}

export function EditorialSubpart({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border/50 pt-4 first:border-t-0 first:pt-0">
      <h3 className={VOCAB_SUBPART_LABEL_CLASS}>{label}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function EditorialInlineMeta({ items }: { items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return <p className={VOCAB_INLINE_META_CLASS}>{items.join(" • ")}</p>;
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
  return <p className="text-[14px] text-ink-3">{children}</p>;
}

export function EditorialProse({ children }: { children: ReactNode }) {
  if (typeof children !== "string") {
    return <p className={VOCAB_BODY_CLASS}>{children}</p>;
  }

  const rewritten = rewriteEditorialText(children);
  const blocks = splitEditorialText(rewritten, 55);

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

export function EditorialExplanation({ text }: { text: string }) {
  const steps = structureExplanation(text);

  return (
    <div className={VOCAB_TIGHT_GAP_CLASS}>
      {steps.map((step) => (
        <p key={step} className={VOCAB_BODY_CLASS}>
          {step}
        </p>
      ))}
    </div>
  );
}

const CYRILLIC_RE = /[\u0400-\u04FF]/;

function ExploreItem({ item }: { item: string }) {
  if (CYRILLIC_RE.test(item)) {
    return (
      <RussianGraphemeText text={item} className={VOCAB_BODY_SMALL_CLASS} />
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

/** @deprecated Utiliser NarrativeSection */
export function VocabSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <NarrativeSection question={title}>
      <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-accent uppercase">
        {eyebrow}
      </p>
      {children}
    </NarrativeSection>
  );
}

/** @deprecated Utiliser EditorialInlineMeta */
export function VocabChipRow({ chips }: { chips: string[] }) {
  return <EditorialInlineMeta items={chips} />;
}

/** @deprecated Utiliser EditorialProse */
export function VocabShortBlock({ children }: { children: ReactNode }) {
  return <EditorialProse>{children}</EditorialProse>;
}
