import { COLLECTION_LABELS } from "@/lib/library/collections";
import { CARD_CTA_STYLE, TEXT_CARD_CLASS } from "@/components/ui/card-styles";
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
    <button type="button" onClick={onClick} className={TEXT_CARD_CLASS}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-[5px] bg-accent px-2 py-0.5 text-[10px] font-extrabold text-white">
          {text.level}
        </span>
        <span className="text-xs text-ink-3">{text.readingTimeMinutes} min</span>
      </div>

      <h3 className="font-serif text-[17px] leading-snug text-ink">
        {text.title}
      </h3>

      <p className="mt-1 text-xs text-ink-3">{collectionLabel}</p>

      <p className="mt-3 text-xs text-ink-2">
        {text.wordCount} mots · {text.readingTimeMinutes} min
      </p>

      <div className="mt-4">
        {hasProgress ? (
          <div className="space-y-2">
            <div className="h-[3px] overflow-hidden rounded-[2px] bg-accent-light">
              <div
                className="h-full rounded-[2px] bg-accent transition-all"
                style={{ width: `${text.userProgress?.percentRead ?? 0}%` }}
              />
            </div>
            <p style={CARD_CTA_STYLE}>
              {text.userProgress?.percentRead}% · Continuer →
            </p>
          </div>
        ) : (
          <p style={CARD_CTA_STYLE}>Lire →</p>
        )}
      </div>
    </button>
  );
}
