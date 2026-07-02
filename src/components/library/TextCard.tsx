import { Badge } from "@/components/ui/badge";
import { COLLECTION_LABELS } from "@/lib/library/collections";
import { cn } from "@/lib/utils";
import type { TTextWithProgress } from "@/types/reader";

interface TextCardProps {
  text: TTextWithProgress;
  onClick: () => void;
}

export function TextCard({ text, onClick }: TextCardProps) {
  const hasProgress =
    text.userProgress !== null && text.userProgress.percentRead > 0;
  const collectionLabel =
    COLLECTION_LABELS[text.collection] ?? text.collection;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col rounded-xl border border-brand-border bg-brand-card p-5 text-left transition-shadow duration-200",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className="border-brand-border text-brand-text-secondary"
        >
          {text.level}
        </Badge>
        <span className="text-xs text-brand-text-muted">
          {text.readingTimeMinutes} min
        </span>
      </div>

      <h3 className="font-serif text-lg leading-snug text-brand-text-primary">
        {text.title}
      </h3>

      <p className="mt-1 text-[13px] text-brand-text-muted">{collectionLabel}</p>

      <p className="mt-3 text-sm text-brand-text-secondary">
        {text.wordCount} mots · {text.readingTimeMinutes} min
      </p>

      <div className="mt-4">
        {hasProgress ? (
          <div className="space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
              <div
                className="h-full rounded-full bg-brand-primary transition-all"
                style={{ width: `${text.userProgress?.percentRead ?? 0}%` }}
              />
            </div>
            <p className="text-sm font-medium text-brand-primary">
              {text.userProgress?.percentRead}% · Continuer →
            </p>
          </div>
        ) : (
          <p className="text-sm text-brand-text-secondary group-hover:text-brand-text-primary">
            Lire →
          </p>
        )}
      </div>
    </button>
  );
}
