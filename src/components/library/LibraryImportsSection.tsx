"use client";

import { useRouter } from "next/navigation";

import { ImportEntryCard } from "@/components/library/ImportEntryCard";
import { ImportTextCard } from "@/components/library/ImportTextCard";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { IMPORT_LIMITS } from "@/lib/import/constants";
import type { TTextWithProgress } from "@/types/reader";

interface LibraryImportsSectionProps {
  imports: TTextWithProgress[];
  isLoading: boolean;
  searchQuery: string;
  onTextsChange: () => void;
}

export function LibraryImportsSection({
  imports,
  isLoading,
  searchQuery,
  onTextsChange,
}: LibraryImportsSectionProps) {
  const router = useRouter();

  const filteredImports = imports.filter((text) => {
    if (searchQuery.trim() === "") {
      return true;
    }

    return text.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
  });

  return (
    <section id="mes-imports" className="border-t border-border pt-11">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="Mes imports"
          subtitle="Vos textes personnels — visibles par vous seul."
        />
        <span className="inline-flex w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-ink-3">
          {imports.length} / {IMPORT_LIMITS.maxImportsPerUser}
        </span>
      </div>

      {searchQuery.trim() && (
        <p className="mb-4 text-sm text-ink-3">
          {filteredImports.length} import
          {filteredImports.length > 1 ? "s" : ""} correspondant
          {filteredImports.length > 1 ? "s" : ""} à la recherche
        </p>
      )}

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-[14px]" />
          ))}
        </div>
      ) : imports.length === 0 ? (
        <EmptyState
          className="mt-6 min-h-56"
          title="Aucun texte importé pour l'instant"
          description="Collez un extrait de cours, d'article ou de manuel."
          action={{ label: "Importer mon premier texte →", href: "/import" }}
        />
      ) : filteredImports.length === 0 ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink-3">
            Aucun import ne correspond à votre recherche.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ImportEntryCard />
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredImports.map((text) => (
            <ImportTextCard
              key={text.id}
              text={text}
              onRead={() => router.push(`/reader/${text.id}`)}
              onRenamed={() => onTextsChange()}
              onDeleted={() => onTextsChange()}
            />
          ))}
          <ImportEntryCard />
        </div>
      )}
    </section>
  );
}
