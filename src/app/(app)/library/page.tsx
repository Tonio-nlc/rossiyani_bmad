"use client";

import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CollectionCard } from "@/components/library/CollectionCard";
import { TextCard } from "@/components/library/TextCard";
import { FilterPills } from "@/components/ui/FilterPills";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTexts } from "@/hooks/useTexts";
import {
  COLLECTION_LABELS,
  COLLECTIONS,
  type TCollection,
} from "@/lib/library/collections";
import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
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
      <div className="px-10 py-12 text-center text-ink-2">
        Impossible de charger la bibliothèque. Veuillez réessayer.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="VOS LECTURES"
        title="Bibliothèque"
        subtitle="Collections curatées et textes importés — lisez, progressez, retrouvez vos lectures."
        badge={
          <span className="inline-flex w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold tracking-[0.12em] text-ink-3 uppercase">
            {texts.length} textes
          </span>
        }
      />

      <div className="mx-auto max-w-[1080px] space-y-11 px-6 py-10 md:px-10">
        {continueText && (
          <section>
            <SectionHeader title="Continuer" />
            <div className="relative mt-4 overflow-hidden rounded-lg bg-accent-deep p-7">
              <span
                className="pointer-events-none absolute -bottom-[18px] -right-1.5 font-serif text-[130px] italic leading-none text-white/[0.06]"
                aria-hidden="true"
              >
                Р
              </span>
              <p className="text-[10px] font-bold tracking-[0.12em] text-white/45 uppercase">
                EN COURS
              </p>
              <h3 className="mt-3 font-serif text-[26px] leading-tight text-white">
                {continueText.title}
              </h3>
              <p className="mt-2 text-xs text-white/40">
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
              <button
                type="button"
                onClick={() => navigateToReader(continueText.id)}
                className="mt-5 inline-flex items-center justify-center rounded-[10px] bg-white px-4 py-[11px] text-sm font-bold text-accent-deep"
              >
                Reprendre →
              </button>
            </div>
          </section>
        )}

        <section className="border-t border-border pt-11">
          <SectionHeader
            title="Collections"
            subtitle="Parcours thématiques — le cœur de votre bibliothèque."
          />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collectionsWithCounts.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => handleCollectionClick(collection.id)}
              />
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-11">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionHeader title="Vos textes" />
              {collectionFilter && (
                <p className="-mt-4 text-sm text-ink-2">
                  Filtre collection :{" "}
                  {COLLECTION_LABELS[collectionFilter] ?? collectionFilter}
                  <button
                    type="button"
                    onClick={() => setCollectionFilter(null)}
                    className="ml-2 font-semibold text-accent hover:underline"
                  >
                    Effacer
                  </button>
                </p>
              )}
            </div>
            <p className="text-sm text-ink-3">
              {filteredTexts.length} résultat
              {filteredTexts.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="mt-4">
            <FilterPills
              options={LEVEL_FILTERS}
              value={levelFilter}
              onChange={setLevelFilter}
            />
          </div>

          <div className="mt-4">
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un titre..."
              className="max-w-md border-border bg-surface"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-56 rounded-[14px]" />
                ))
              : filteredTexts.map((text) => (
                  <TextCard
                    key={text.id}
                    text={text}
                    onClick={() => navigateToReader(text.id)}
                  />
                ))}

            <div
              className={`flex min-h-56 flex-col justify-center border-dashed ${CARD_BASE_CLASS}`}
            >
              <div className="mb-4 flex size-[38px] items-center justify-center rounded-lg bg-accent-light text-accent">
                <MessageSquarePlus className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-ink">Suggérer un texte</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-3">
                Vous cherchez un sujet spécifique ? Faites-le nous savoir.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
