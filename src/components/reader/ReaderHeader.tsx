import Link from "next/link";

import { BackLink } from "@/components/ui/BackLink";
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
    <header className="sticky top-14 z-40 border-b border-border bg-surface py-3">
      <div className="px-4 md:px-10">
        <div className="mx-auto w-full max-w-[680px]">
          <BackLink href="/library" label="Bibliothèque" />

          <nav
            className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-3"
            aria-label="Fil d'Ariane"
          >
            <Link href="/" className="hover:text-ink-2">
              Accueil
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/library" className="hover:text-ink-2">
              Bibliothèque
            </Link>
            <span aria-hidden="true">·</span>
            <span>{collectionLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-russian text-ink">{title}</span>
          </nav>

          <h1 className="mt-2 font-russian text-[22px] font-bold leading-tight text-ink">
            {title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[13px] text-ink-2">
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-[5px] border border-border px-2 py-0.5 text-[11px] font-bold text-ink">
                {level}
              </span>
              <span>
                {readingTimeMinutes} min · {exploredLabel}
              </span>
            </span>
            <span className="shrink-0 font-medium text-ink">{percentRead}% lu</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
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
      className="rounded-full border border-border bg-bg px-3 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:border-accent-border hover:text-ink"
    >
      {label}
    </Link>
  );
}
