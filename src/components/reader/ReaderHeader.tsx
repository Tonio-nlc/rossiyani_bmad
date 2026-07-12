"use client";

import Link from "next/link";

import {
  READER_BREADCRUMB_CLASS,
  READER_COLUMN_CLASS,
  READER_HEADER_SHELL_CLASS,
  READER_TITLE_CLASS,
} from "@/lib/design/reader-composition";
import { buildReturnQuery } from "@/lib/navigation/return-context";
import { useReaderStore } from "@/stores/readerStore";
import { cn } from "@/lib/utils";

interface ReaderHeaderProps {
  textId: string;
  collectionLabel: string;
  title: string;
  level: string;
  readingTimeMinutes: number;
  exploredCount: number;
  percentRead: number;
}

export function ReaderHeader({
  textId,
  collectionLabel,
  title,
  level,
  readingTimeMinutes,
  exploredCount,
  percentRead,
}: ReaderHeaderProps) {
  const showTranslations = useReaderStore((state) => state.showTranslations);
  const setShowTranslations = useReaderStore((state) => state.setShowTranslations);
  const exploredLabel = `${exploredCount} mot${exploredCount > 1 ? "s" : ""} exploré${exploredCount > 1 ? "s" : ""}`;
  const readerReturn = buildReturnQuery("reader", textId);

  return (
    <header className={READER_HEADER_SHELL_CLASS}>
      <div className="px-4 md:px-8">
        <div className={READER_COLUMN_CLASS}>
          <nav className={READER_BREADCRUMB_CLASS} aria-label="Fil d'Ariane">
            <Link href="/library" className="hover:text-ink-2">
              Bibliothèque
            </Link>
            <span aria-hidden="true" className="text-ink-3/60">
              /
            </span>
            <span>{collectionLabel}</span>
          </nav>

          <h1 className={READER_TITLE_CLASS}>{title}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-ink-3">
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-[5px] border border-border px-1.5 py-0.5 text-[10px] font-semibold text-ink-2">
                {level}
              </span>
              <span>
                {readingTimeMinutes} min · {exploredLabel}
              </span>
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <TranslationToggle
                checked={showTranslations}
                onChange={setShowTranslations}
              />
              <span className="shrink-0 text-ink-2">{percentRead}% lu</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
            <ReaderContextLink
              href={`/vocabulary${readerReturn}`}
              label="Vocabulaire"
            />
            <ReaderContextLink
              href={`/review${readerReturn}`}
              label="Révision"
            />
            <ReaderContextLink
              href={`/lessons${readerReturn}`}
              label="Leçons"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function TranslationToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const labelId = "reader-translation-toggle-label";

  return (
    <div className="flex items-center gap-2 text-[11px] text-ink-3">
      <span id={labelId} className="whitespace-nowrap select-none">
        Afficher les traductions
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150",
          checked ? "bg-accent" : "bg-border",
        )}
      >
        <span
          className={cn(
            "inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-150",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ReaderContextLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border/80 bg-bg/80 px-2.5 py-0.5 text-[11px] font-medium text-ink-3 transition-colors hover:border-accent-border hover:text-ink-2"
    >
      {label}
    </Link>
  );
}
