"use client";

import { useMemo, useState } from "react";

import { VocabularyGrid } from "@/components/vocabulary/VocabularyGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import { Input } from "@/components/ui/input";
import type { TVocabularyFilter, TVocabularyListItem } from "@/types/vocabulary";

const FILTERS: { id: TVocabularyFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "due", label: "À réviser" },
  { id: "new", label: "Nouveaux" },
  { id: "learned", label: "Appris" },
];

interface VocabularyViewProps {
  words: TVocabularyListItem[];
  errorMessage?: string | null;
}

export function VocabularyView({ words, errorMessage }: VocabularyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TVocabularyFilter>("all");

  const filteredWords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return words.filter((word) => {
      const matchesFilter =
        activeFilter === "all" || word.reviewStatus === activeFilter;

      const matchesSearch =
        normalizedQuery.length === 0 ||
        word.lemma.toLowerCase().includes(normalizedQuery) ||
        word.translation.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, words]);

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-3xl px-10 py-12">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="MÉMOIRE LINGUISTIQUE"
        title="Vocabulary"
        subtitle="Vos mots sauvegardés en contexte — retrouvez ce que vous avez rencontré en lecture."
      />

      <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
        <div className="space-y-4">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un mot ou une traduction..."
            className="max-w-xl border-border bg-surface"
          />

          <div className="hidden md:block">
            <VocabularyFilterPills
              activeFilter={activeFilter}
              onChange={setActiveFilter}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
            <VocabularyFilterPills
              activeFilter={activeFilter}
              onChange={setActiveFilter}
              compact
            />
          </div>
        </div>

        <div className="mt-8">
          {words.length === 0 ? (
            <div
              className={`border-dashed text-center ${CARD_BASE_CLASS}`}
            >
              <p className="text-base font-bold text-ink">
                Aucun mot sauvegardé
              </p>
              <p className="mt-2 text-sm text-ink-2">
                Lisez un texte et sauvegardez des mots depuis l&apos;Explorer
                pour les retrouver ici.
              </p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className={`text-center ${CARD_BASE_CLASS}`}>
              <p className="text-sm text-ink-2">
                Aucun mot ne correspond à votre recherche ou à ce filtre.
              </p>
            </div>
          ) : (
            <VocabularyGrid words={filteredWords} />
          )}
        </div>
      </div>
    </div>
  );
}

function VocabularyFilterPills({
  activeFilter,
  onChange,
  compact,
}: {
  activeFilter: TVocabularyFilter;
  onChange: (filter: TVocabularyFilter) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex gap-2" : "flex flex-wrap gap-2"}>
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={
            activeFilter === filter.id
              ? "shrink-0 rounded-full border border-[#4F46E5] bg-[#4F46E5] px-4 py-1.5 text-sm font-medium text-white transition-colors"
              : "shrink-0 rounded-full border border-[#E8E4DC] bg-white px-4 py-1.5 text-sm font-medium text-[#5A5A5A] transition-colors hover:text-[#0E0E0E]"
          }
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
