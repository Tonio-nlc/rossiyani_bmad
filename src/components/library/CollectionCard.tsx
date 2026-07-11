import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import { BADGE_META_CLASS } from "@/lib/design/classes";
import { COLLECTION_BORDER_COLORS } from "@/lib/library/collections";

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string;
    level: string;
    textCount: number;
  };
  onClick: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  const borderColor =
    COLLECTION_BORDER_COLORS[collection.id] ??
    COLLECTION_BORDER_COLORS.everyday_russian;

  return (
    <button
      type="button"
      onClick={onClick}
      className={CARD_BASE_CLASS}
      style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
    >
      <h3 className="text-sm font-bold text-ink">{collection.name}</h3>

      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-3">
        {collection.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {collection.level !== "Tous niveaux" && (
          <span className={BADGE_META_CLASS}>
            {collection.level}
          </span>
        )}
        <span className={BADGE_META_CLASS}>
          {collection.textCount} texte{collection.textCount > 1 ? "s" : ""}
        </span>
      </div>
    </button>
  );
}
