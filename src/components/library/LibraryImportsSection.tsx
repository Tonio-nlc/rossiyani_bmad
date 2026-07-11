"use client";

import { useRouter } from "next/navigation";

import { ImportEntryCard } from "@/components/library/ImportEntryCard";
import { ImportTextCard } from "@/components/library/ImportTextCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/skeleton";
import { IMPORT_LIMITS } from "@/lib/import/constants";
import { CARD_GRID_3COL_CLASS, SUBSECTION_GAP_CLASS } from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";
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
    <Section
      id="mes-imports"
      title="Mes imports"
      description="Vos textes personnels — visibles par vous seul."
      trailing={
        <span className="inline-flex w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-ink-3">
          {imports.length} / {IMPORT_LIMITS.maxImportsPerUser}
        </span>
      }
    >
      {searchQuery.trim() ? (
        <p className="text-sm text-ink-3">
          {filteredImports.length} import
          {filteredImports.length > 1 ? "s" : ""} correspondant
          {filteredImports.length > 1 ? "s" : ""} à la recherche
        </p>
      ) : null}

      {isLoading ? (
        <div className={cn(CARD_GRID_3COL_CLASS, SUBSECTION_GAP_CLASS)}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-[14px]" />
          ))}
        </div>
      ) : imports.length === 0 ? (
        <EmptyState
          title="Aucun texte importé pour l'instant"
          description="Collez un extrait de cours, d'article ou de manuel."
          action={{ label: "Importer mon premier texte →", href: "/import" }}
        />
      ) : filteredImports.length === 0 ? (
        <div className={cn("space-y-3", SUBSECTION_GAP_CLASS)}>
          <p className="text-sm text-ink-3">
            Aucun import ne correspond à votre recherche.
          </p>
          <div className={CARD_GRID_3COL_CLASS}>
            <ImportEntryCard />
          </div>
        </div>
      ) : (
        <div className={cn(CARD_GRID_3COL_CLASS, SUBSECTION_GAP_CLASS)}>
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
    </Section>
  );
}
