"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CollectionCard } from "@/components/library/CollectionCard";
import { LibraryImportsSection } from "@/components/library/LibraryImportsSection";
import { TextCard } from "@/components/library/TextCard";
import { FilterPills } from "@/components/ui/FilterPills";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTexts } from "@/hooks/useTexts";
import { consumeImportSavedToast } from "@/lib/import/session-storage";
import {
  COLLECTION_LABELS,
  COLLECTIONS,
  type TCollection,
} from "@/lib/library/collections";
import { splitLibraryTexts } from "@/lib/library/text-source";
import { CARD_PROMO_CLASS } from "@/lib/design/classes";
import { CARD_GRID_3COL_CLASS, SUBSECTION_GAP_CLASS } from "@/lib/design/rhythm";
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
  const { texts, isLoading, error, refetch } = useTexts();
  const [levelFilter, setLevelFilter] =
    useState<(typeof LEVEL_FILTERS)[number]>("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const { curatedTexts, importedTexts } = useMemo(
    () => splitLibraryTexts(texts),
    [texts],
  );

  useEffect(() => {
    if (consumeImportSavedToast()) {
      setShowSavedToast(true);
      const timer = window.setTimeout(() => setShowSavedToast(false), 3000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (window.location.hash === "#mes-imports") {
      document.getElementById("mes-imports")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading]);

  const collectionsWithCounts = useMemo<TCollection[]>(
    () =>
      COLLECTIONS.map((collection) => ({
        ...collection,
        textCount: curatedTexts.filter(
          (text) => text.collection === collection.id,
        ).length,
      })),
    [curatedTexts],
  );

  const filteredCuratedTexts = useMemo(() => {
    return curatedTexts.filter((text) => {
      const matchesLevel =
        levelFilter === "Tous" || text.level === levelFilter;
      const matchesCollection =
        collectionFilter === null || text.collection === collectionFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        text.title.toLowerCase().includes(searchQuery.trim().toLowerCase());

      return matchesLevel && matchesCollection && matchesSearch;
    });
  }, [curatedTexts, levelFilter, collectionFilter, searchQuery]);

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
      <PageBody width="dashboard">
        <p className="text-center text-ink-2">
          Impossible de charger la bibliothèque. Veuillez réessayer.
        </p>
      </PageBody>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="VOS LECTURES"
        title="Bibliothèque"
        subtitle="Collections curatées et textes importés — lisez, progressez, retrouvez vos lectures."
        width="dashboard"
        badge={
          <span className="inline-flex w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold tracking-[0.12em] text-ink-3 uppercase">
            {curatedTexts.length} textes Rossiyani
          </span>
        }
      />

      <PageBody width="dashboard">
        {showSavedToast ? (
          <div
            role="status"
            className="mb-4 rounded-[12px] border border-green/30 bg-green/10 px-4 py-3 text-sm text-ink"
          >
            <span className="font-semibold text-green">Texte enregistré</span>
            <span className="text-ink-2"> — Retrouvez-le dans Mes imports.</span>
          </div>
        ) : null}

        <p className="text-sm font-semibold text-accent">
          <Link href="/import" className="hover:underline">
            + Importer un texte
          </Link>
        </p>

        {continueText ? (
          <Section title="Continuer" gap="after-hero">
            <div className={CARD_PROMO_CLASS}>
              <span
                className="pointer-events-none absolute -bottom-3 -right-1 font-serif text-[5rem] italic leading-none text-white/[0.06]"
                aria-hidden="true"
              >
                Р
              </span>
              <p className="text-[10px] font-bold tracking-[0.12em] text-white/45 uppercase">
                EN COURS
              </p>
              <h3 className="mt-2 font-serif text-xl leading-tight text-white">
                {continueText.title}
              </h3>
              <p className="mt-1.5 text-xs text-white/40">
                {continueText.source === "imported"
                  ? "Import personnel"
                  : (COLLECTION_LABELS[continueText.collection] ??
                    continueText.collection)}{" "}
                · {continueText.userProgress?.percentRead}% lu
              </p>
              <button
                type="button"
                onClick={() => navigateToReader(continueText.id)}
                className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-white px-4 py-2.5 text-sm font-bold text-accent-deep"
              >
                Reprendre →
              </button>
            </div>
          </Section>
        ) : null}

        <Section
          title="Collections Rossiyani"
          description="Parcours thématiques — le cœur de votre bibliothèque."
          gap={continueText ? "default" : "after-hero"}
        >
          <div className={CARD_GRID_3COL_CLASS}>
            {collectionsWithCounts.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => handleCollectionClick(collection.id)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Vos textes"
          trailing={
            <p className="text-sm text-ink-3">
              {filteredCuratedTexts.length} résultat
              {filteredCuratedTexts.length > 1 ? "s" : ""}
            </p>
          }
        >
          {collectionFilter ? (
            <p className="text-sm text-ink-2">
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
          ) : null}

          <div className={cn("space-y-3", collectionFilter && SUBSECTION_GAP_CLASS)}>
            <FilterPills
              options={LEVEL_FILTERS}
              value={levelFilter}
              onChange={setLevelFilter}
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un titre..."
              className="max-w-md border-border bg-surface"
            />
          </div>

          <div className={cn(CARD_GRID_3COL_CLASS, SUBSECTION_GAP_CLASS)}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-44 rounded-[14px]" />
                ))
              : filteredCuratedTexts.map((text) => (
                  <TextCard
                    key={text.id}
                    text={text}
                    onClick={() => navigateToReader(text.id)}
                  />
                ))}
          </div>
        </Section>

        <LibraryImportsSection
          imports={importedTexts}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onTextsChange={() => {
            void refetch();
          }}
        />
      </PageBody>
    </div>
  );
}
