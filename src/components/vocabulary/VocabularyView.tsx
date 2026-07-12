"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { VocabularyGrid } from "@/components/vocabulary/VocabularyGrid";
import { BackLink } from "@/components/ui/BackLink";
import { ContextBar } from "@/components/ui/ContextBar";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { PillGroup } from "@/components/ui/pill";
import { Input } from "@/components/ui/input";
import {
  buildReturnQuery,
  parseReturnContext,
  resolveReaderBackNavigation,
} from "@/lib/navigation/return-context";
import { SUBSECTION_GAP_CLASS } from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";
import type { TVocabularyFilter, TVocabularyListItem } from "@/types/vocabulary";

const FILTERS: { value: TVocabularyFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "due", label: "À réviser" },
  { value: "new", label: "Nouveaux" },
  { value: "learned", label: "Appris" },
];

interface VocabularyViewProps {
  words: TVocabularyListItem[];
  errorMessage?: string | null;
}

export function VocabularyView({ words, errorMessage }: VocabularyViewProps) {
  const searchParams = useSearchParams();
  const returnContext = parseReturnContext(searchParams);
  const backNavigation = resolveReaderBackNavigation(returnContext);
  const returnQuery =
    returnContext.from === "reader" && returnContext.textId
      ? buildReturnQuery("reader", returnContext.textId)
      : "";

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
      <div>
        <PageHeader
          eyebrow="MÉMOIRE LINGUISTIQUE"
          title="Vocabulaire"
          subtitle="Vos mots sauvegardés en contexte."
          width="content"
        />
        <PageBody width="content">
          <ErrorState description={errorMessage} />
        </PageBody>
      </div>
    );
  }

  return (
    <div>
      {returnContext.from === "reader" && returnContext.textId ? (
        <ContextBar width="content">
          <BackLink
            href={backNavigation.href}
            label={backNavigation.label}
          />
        </ContextBar>
      ) : null}

      <PageHeader
        eyebrow="MÉMOIRE LINGUISTIQUE"
        title="Vocabulaire"
        subtitle="Vos mots sauvegardés en contexte."
        width="content"
      />

      <PageBody width="content">
        <div className="space-y-3">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un mot ou une traduction..."
            className="max-w-xl border-border bg-surface"
          />

          <div className="hidden md:block">
            <PillGroup
              options={FILTERS}
              value={activeFilter}
              onChange={setActiveFilter}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
            <PillGroup
              options={FILTERS}
              value={activeFilter}
              onChange={setActiveFilter}
              className="flex-nowrap"
            />
          </div>
        </div>

        <div className={SUBSECTION_GAP_CLASS}>
          {words.length === 0 ? (
            <EmptyState
              title="Aucun mot sauvegardé"
              description="Lisez un texte et sauvegardez des mots depuis l'explorateur pour les retrouver ici."
            />
          ) : filteredWords.length === 0 ? (
            <EmptyState
              title="Aucun résultat"
              description="Aucun mot ne correspond à votre recherche ou à ce filtre."
              dashed={false}
            />
          ) : (
            <VocabularyGrid words={filteredWords} returnQuery={returnQuery} />
          )}
        </div>
      </PageBody>
    </div>
  );
}
