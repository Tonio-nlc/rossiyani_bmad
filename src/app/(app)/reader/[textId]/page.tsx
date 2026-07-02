import Link from "next/link";

import { ReaderContainer } from "@/components/reader/ReaderContainer";
import { COLLECTION_LABELS } from "@/lib/library/collections";
import { getTextByIdOrNotFound } from "@/lib/texts/get-text-by-id";
import { splitIntoSentences } from "@/lib/utils/russian";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ textId: string }>;
}) {
  const { textId } = await params;
  const { text, userProgress } = await getTextByIdOrNotFound(textId);

  const collectionLabel =
    COLLECTION_LABELS[text.collection] ?? text.collection;
  const initialPercent = userProgress?.percentRead ?? 0;

  return (
    <div className="bg-brand-surface">
      <header className="border-b border-brand-border bg-brand-card px-4 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <nav className="text-sm text-brand-text-muted">
            <Link href="/library" className="hover:text-brand-text-primary">
              Bibliothèque
            </Link>
            <span className="mx-2">/</span>
            <span>{collectionLabel}</span>
            <span className="mx-2">/</span>
            <span className="text-brand-text-primary">{text.title}</span>
          </nav>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-brand-text-secondary">
            <span className="rounded-full border border-brand-border px-2 py-0.5 text-xs">
              {text.level}
            </span>
            <span>{text.readingTimeMinutes} min</span>
            <span>{initialPercent}% lu</span>
            <span>
              {splitIntoSentences(text.content).length} phrases
            </span>
          </div>

          <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-brand-border">
            <div
              className="h-full bg-brand-primary"
              style={{ width: `${initialPercent}%` }}
            />
          </div>
        </div>
      </header>

      <ReaderContainer text={text} userProgress={userProgress} />
    </div>
  );
}
