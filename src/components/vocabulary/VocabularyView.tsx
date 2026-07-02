"use client";

import { useMemo, useState } from "react";

import { VocabularyGrid } from "@/components/vocabulary/VocabularyGrid";
import { Input } from "@/components/ui/input";
import type { TVocabularyFilter, TVocabularyListItem } from "@/types/vocabulary";
import { cn } from "@/lib/utils";

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
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface">
      <header className="border-b border-brand-border bg-brand-card px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold text-brand-text-primary">
            Vocabulary
          </h1>
          <p className="mt-2 text-brand-text-secondary">
            Vos mots sauvegardés en contexte — retrouvez ce que vous avez
            rencontré en lecture.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="space-y-4">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un mot ou une traduction..."
            className="max-w-xl border-brand-border bg-brand-card"
          />

          <div className="hidden flex-wrap gap-2 md:flex">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  activeFilter === filter.id
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-border bg-brand-card text-brand-text-secondary hover:text-brand-text-primary",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  activeFilter === filter.id
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-border bg-brand-card text-brand-text-secondary",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {words.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-border bg-brand-card p-8 text-center">
              <p className="text-lg font-medium text-brand-text-primary">
                Aucun mot sauvegardé
              </p>
              <p className="mt-2 text-sm text-brand-text-secondary">
                Lisez un texte et sauvegardez des mots depuis l&apos;Explorer
                pour les retrouver ici.
              </p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="rounded-xl border border-brand-border bg-brand-card p-8 text-center">
              <p className="text-sm text-brand-text-secondary">
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
