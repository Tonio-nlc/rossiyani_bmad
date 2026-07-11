import Link from "next/link";

import {
  READER_BREADCRUMB_CLASS,
  READER_COLUMN_CLASS,
  READER_HEADER_SHELL_CLASS,
  READER_TITLE_CLASS,
} from "@/lib/design/reader-composition";
import { buildReturnQuery } from "@/lib/navigation/return-context";

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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-[5px] border border-border px-1.5 py-0.5 text-[10px] font-semibold text-ink-2">
                {level}
              </span>
              <span>
                {readingTimeMinutes} min · {exploredLabel}
              </span>
            </span>
            <span className="shrink-0 text-ink-2">{percentRead}% lu</span>
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
