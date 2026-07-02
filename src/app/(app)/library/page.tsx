"use client";

import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CollectionCard } from "@/components/library/CollectionCard";
import { TextCard } from "@/components/library/TextCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTexts } from "@/hooks/useTexts";
import {
  COLLECTION_LABELS,
  COLLECTIONS,
  type TCollection,
} from "@/lib/library/collections";
import { cn } from "@/lib/utils";
import type { TTextWithProgress } from "@/types/reader";

const LEVEL_FILTERS = ["Tous", "A1", "A2", "B1", "B2"] as const;

function isInProgress(text: TTextWithProgress): boolean {
  return (
    text.userProgress !== null &&
    text.userProgress.percentRead > 0 &&
    text.userProgress.completedAt === null
  );
}

function getContinueText(texts: TTextWithProgress[]): TTextWithProgress | null {
  const inProgress = texts.filter(isInProgress);

  if (inProgress.length === 0) {
    return null;
  }

  return [...inProgress].sort(
    (a, b) =>
      (b.userProgress?.percentRead ?? 0) - (a.userProgress?.percentRead ?? 0),
  )[0];
}

export default function LibraryPage() {
  const router = useRouter();
  const { texts, isLoading, error } = useTexts();
  const [levelFilter, setLevelFilter] =
    useState<(typeof LEVEL_FILTERS)[number]>("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

  const collectionsWithCounts = useMemo<TCollection[]>(
    () =>
      COLLECTIONS.map((collection) => ({
        ...collection,
        textCount: texts.filter((text) => text.collection === collection.id)
          .length,
      })),
    [texts],
  );

  const filteredTexts = useMemo(() => {
    return texts.filter((text) => {
      const matchesLevel =
        levelFilter === "Tous" || text.level === levelFilter;
      const matchesCollection =
        collectionFilter === null || text.collection === collectionFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        text.title.toLowerCase().includes(searchQuery.trim().toLowerCase());

      return matchesLevel && matchesCollection && matchesSearch;
    });
  }, [texts, levelFilter, collectionFilter, searchQuery]);

  const continueText = getContinueText(texts);

  function handleCollectionClick(collectionId: string) {
    setCollectionFilter((current) =>
      current === collectionId ? null : collectionId,
    );
    setSearchQuery("");
  }

  function navigateToReader(textId: string) {
    router.push(`/reader/${textId}`);
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center text-brand-text-secondary">
        Impossible de charger la bibliothèque. Veuillez réessayer.
      </div>
    );
  }

  return (
    <div className="bg-brand-surface">
      <header className="bg-[#EDE8DF] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium tracking-[0.2em] text-brand-text-muted uppercase">
            Vos lectures
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-brand-text-primary">
                Bibliothèque
              </h1>
              <p className="mt-2 max-w-2xl text-brand-text-secondary">
                Collections curatées et textes importés — lisez, progressez,
                retrouvez vos lectures.
              </p>
            </div>
            <BadgePill>{texts.length} textes</BadgePill>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 md:px-8">
        {continueText && (
          <section>
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Continuer
            </h2>
            <div className="mt-4 rounded-xl border border-brand-border bg-brand-card p-6 md:p-8">
              <p className="text-xs font-medium tracking-[0.15em] text-brand-primary uppercase">
                Collection en cours
              </p>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-brand-text-primary md:text-3xl">
                {continueText.title}
              </h3>
              <p className="mt-2 text-sm text-brand-text-secondary">
                {COLLECTION_LABELS[continueText.collection] ??
                  continueText.collection}{" "}
                ·{" "}
                {
                  texts.filter(
                    (text) => text.collection === continueText.collection,
                  ).length
                }{" "}
                textes · {continueText.userProgress?.percentRead}% lu
              </p>
              <Button
                type="button"
                onClick={() => navigateToReader(continueText.id)}
                className="mt-6 bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Reprendre →
              </Button>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-brand-text-primary">
            Collections
          </h2>
          <p className="mt-1 text-brand-text-secondary">
            Parcours thématiques — le cœur de votre bibliothèque.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collectionsWithCounts.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => handleCollectionClick(collection.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-text-primary">
                Vos textes
              </h2>
              {collectionFilter && (
                <p className="mt-1 text-sm text-brand-text-secondary">
                  Filtre collection :{" "}
                  {COLLECTION_LABELS[collectionFilter] ?? collectionFilter}
                  <button
                    type="button"
                    onClick={() => setCollectionFilter(null)}
                    className="ml-2 text-brand-primary hover:underline"
                  >
                    Effacer
                  </button>
                </p>
              )}
            </div>
            <p className="text-sm text-brand-text-muted">
              {filteredTexts.length} résultat
              {filteredTexts.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {LEVEL_FILTERS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLevelFilter(level)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  levelFilter === level
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-border bg-brand-card text-brand-text-secondary hover:text-brand-text-primary",
                )}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un titre..."
              className="max-w-md border-brand-border bg-brand-card"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-56 rounded-xl" />
                ))
              : filteredTexts.map((text) => (
                  <TextCard
                    key={text.id}
                    text={text}
                    onClick={() => navigateToReader(text.id)}
                  />
                ))}

            <div className="flex min-h-56 flex-col justify-center rounded-xl border border-dashed border-brand-border bg-brand-card p-5">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-brand-surface text-brand-text-secondary">
                <MessageSquarePlus className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-brand-text-primary">
                Suggérer un texte
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
                Vous cherchez un sujet spécifique ? Faites-le nous savoir.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-brand-border bg-brand-card px-3 py-1 text-xs font-medium tracking-[0.12em] text-brand-text-secondary uppercase">
      {children}
    </span>
  );
}
