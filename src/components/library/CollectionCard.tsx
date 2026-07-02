import { Badge } from "@/components/ui/badge";
import { COLLECTION_COLORS } from "@/lib/library/collections";
import { cn } from "@/lib/utils";

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
  const accentColor =
    COLLECTION_COLORS[collection.id] ?? COLLECTION_COLORS.everyday_russian;
  const initial = collection.name.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col rounded-xl border border-brand-border bg-brand-card p-5 text-left transition-shadow duration-200",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
      )}
    >
      <div
        className="mb-4 flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: accentColor }}
      >
        {initial}
      </div>

      <h3 className="text-base font-semibold text-brand-text-primary">
        {collection.name}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-text-secondary">
        {collection.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {collection.level !== "Tous niveaux" && (
          <Badge
            variant="outline"
            className="border-brand-border text-brand-text-secondary"
          >
            {collection.level}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="bg-brand-surface text-brand-text-secondary"
        >
          {collection.textCount} texte{collection.textCount > 1 ? "s" : ""}
        </Badge>
      </div>
    </button>
  );
}
