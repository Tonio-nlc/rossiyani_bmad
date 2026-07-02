import {
  formatAspectLabel,
  formatGenderLabel,
  formatPosLabel,
} from "@/lib/vocabulary/format-linguistic-labels";
import type { TVocabularyLinguisticData } from "@/types/vocabulary";

interface InformationSectionProps {
  data: TVocabularyLinguisticData;
}

interface InfoRow {
  label: string;
  value: string;
}

function formatAddedDate(dateValue: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function InformationSection({ data }: InformationSectionProps) {
  const rows: InfoRow[] = [
    { label: "Lemme", value: data.lemma },
    data.translation
      ? { label: "Traduction", value: data.translation }
      : null,
    formatPosLabel(data.pos)
      ? { label: "Catégorie grammaticale", value: formatPosLabel(data.pos)! }
      : null,
    formatGenderLabel(data.gender)
      ? { label: "Genre", value: formatGenderLabel(data.gender)! }
      : null,
    formatAspectLabel(data.aspect)
      ? { label: "Aspect", value: formatAspectLabel(data.aspect)! }
      : null,
    data.accent ? { label: "Accent", value: data.accent } : null,
    data.addedAt
      ? { label: "Date d'ajout", value: formatAddedDate(data.addedAt) }
      : null,
  ].filter((row): row is InfoRow => row !== null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-brand-border bg-brand-card p-6">
      <h2 className="text-xl font-semibold text-brand-text-primary">
        Informations
      </h2>
      <dl className="mt-4 divide-y divide-brand-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <dt className="text-sm text-brand-text-muted">{row.label}</dt>
            <dd className="font-serif text-base text-brand-text-primary sm:text-right">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
