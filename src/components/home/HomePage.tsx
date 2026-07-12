"use client";

import { ArrowLeftRight, BookOpen, PenLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { CollectionCard } from "@/components/library/CollectionCard";
import { TextCard } from "@/components/library/TextCard";
import { CARD_HUB_CLASS } from "@/components/ui/card-styles";
import { ErrorState } from "@/components/ui/error-state";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import {
  BADGE_SOFT_CLASS,
  BTN_PRIMARY_CLASS,
  CARD_ICON_BOX_CLASS,
  CARD_PROMO_CLASS,
  CTA_LINK_CLASS,
} from "@/lib/design/classes";
import { CARD_GRID_3COL_CLASS } from "@/lib/design/rhythm";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeData } from "@/hooks/useHomeData";
import { useTexts } from "@/hooks/useTexts";
import { COLLECTION_LABELS, COLLECTIONS } from "@/lib/library/collections";
import type { THomeCurrentReading } from "@/types/home";
import type { THomeRecentText } from "@/types/home";
import type { TTextWithProgress } from "@/types/reader";
import { cn } from "@/lib/utils";

export function HomePage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useHomeData();
  const { texts } = useTexts();

  const collections = useMemo(
    () =>
      COLLECTIONS.map((collection) => ({
        ...collection,
        textCount: texts.filter((text) => text.collection === collection.id)
          .length,
      })),
    [texts],
  );

  if (error) {
    return (
      <div>
        <PageHeader
          eyebrow="ESPACE D'APPRENTISSAGE"
          title="Rossiyani"
          subtitle="Reprenez votre lecture, pratiquez un peu, explorez vos collections."
          width="dashboard"
        />
        <PageBody width="dashboard">
          <ErrorState
            description="Impossible de charger l'accueil."
            onRetry={() => refetch()}
          />
        </PageBody>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="ESPACE D'APPRENTISSAGE"
        title="Rossiyani"
        subtitle="Reprenez votre lecture, pratiquez un peu, explorez vos collections."
        width="dashboard"
      />

      <PageBody width="dashboard">
        <HeroSection data={data} isLoading={isLoading} />

        <Section
          title="Aujourd'hui"
          description="Trois exercices courts pour garder le rythme."
          gap="after-hero"
        >
          <TodayCards reviewCount={data?.reviewCount ?? 0} isLoading={isLoading} />
        </Section>

        <Section
          title="Collections"
          description="Parcours thématiques pour structurer vos lectures."
        >
          <div className={CARD_GRID_3COL_CLASS}>
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => router.push(`/library?collection=${collection.id}`)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Activité récente"
          description="Lectures suggérées selon votre niveau et votre historique."
        >
          <RecentActivitySection
            recentTexts={data?.recentTexts ?? []}
            isLoading={isLoading}
            onTextClick={(textId) => router.push(`/reader/${textId}`)}
          />
        </Section>

        <Section title="Mémoire linguistique">
          <VocabularyBlock
            wordsCount={data?.wordsCount ?? 0}
            isLoading={isLoading}
          />
        </Section>
      </PageBody>
    </div>
  );
}

function formatStreakLabel(streak: number): string {
  const unit = streak === 1 ? "JOUR" : "JOURS";
  return `🔥 ${streak} ${unit} DE SUITE`;
}

function HeroSection({
  data,
  isLoading,
}: {
  data: ReturnType<typeof useHomeData>["data"];
  isLoading: boolean;
}) {
  return (
    <section className="grid items-stretch gap-4 md:grid-cols-2 md:gap-6">
      <div className="flex flex-col justify-center gap-3">
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </>
          ) : (
            <>
              <StatPill
                label={formatStreakLabel(data?.streak ?? 1)}
                variant="streak"
              />
              <StatPill
                label={`${data?.wordsExploredTotal ?? 0} MOTS EXPLORÉS`}
              />
              <StatPill label={`${data?.wordsToday ?? 0} MOTS AUJOURD'HUI`} />
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="min-h-[200px] rounded-lg" />
      ) : (
        <CurrentReadingCard current={data?.currentReading ?? null} />
      )}
    </section>
  );
}

function StatPill({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "streak";
}) {
  const isStreak = variant === "streak";

  return (
    <span
      className={
        isStreak
          ? "inline-flex rounded-full border border-accent-border bg-accent-light px-3 py-1 text-xs font-medium text-accent"
          : "inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-2"
      }
    >
      {label}
    </span>
  );
}

function CurrentReadingCard({
  current,
}: {
  current: THomeCurrentReading | null;
}) {
  return (
    <div className={CARD_PROMO_CLASS}>
      <span
        className="pointer-events-none absolute -bottom-3 -right-1 font-serif text-[5rem] italic leading-none text-white/[0.06]"
        aria-hidden="true"
      >
        Р
      </span>

      {current ? (
        <>
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/45 uppercase">
            EN COURS
          </p>
          <h2 className="mt-2 font-serif text-xl leading-tight text-white md:text-2xl">
            {current.text.title}
          </h2>
          <p className="mt-1.5 text-xs text-white/40">
            {COLLECTION_LABELS[current.text.collection] ??
              current.text.collection}{" "}
            · {current.text.level} · {current.percentRead}% lu
          </p>
          <div className="mt-4 h-[3px] overflow-hidden rounded-[2px] bg-white/12">
            <div
              className="h-full rounded-[2px] bg-white/65 transition-all"
              style={{ width: `${current.percentRead}%` }}
            />
          </div>
          <Link
            href={`/reader/${current.text.id}`}
            className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-white px-4 py-2.5 text-sm font-bold text-accent-deep"
          >
            Reprendre →
          </Link>
        </>
      ) : (
        <>
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/45 uppercase">
            COMMENCER
          </p>
          <h2 className="mt-2 font-serif text-xl leading-tight text-white md:text-2xl">
            Première lecture
          </h2>
          <p className="mt-1.5 text-xs text-white/40">
            Choisissez un texte dans la bibliothèque.
          </p>
          <Link
            href="/library"
            className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-white px-4 py-2.5 text-sm font-bold text-accent-deep"
          >
            Explorer la bibliothèque →
          </Link>
        </>
      )}
    </div>
  );
}

function TodayCards({
  reviewCount,
  isLoading,
}: {
  reviewCount: number;
  isLoading: boolean;
}) {
  const cards = [
    {
      title: "Sentence Builder",
      description: "Composez une phrase en russe.",
      badge: "3 EXERCICES RESTANTS",
      href: "/practice/sentence-builder",
      cta: "Commencer →",
      icon: <PenLine size={18} className="text-accent" aria-hidden="true" />,
    },
    {
      title: "Traduction contextualisée",
      description: "Traduisez le sens, pas les mots.",
      badge: "4 EXERCICES RESTANTS",
      href: "/practice/context-translation",
      cta: "Traduire →",
      icon: <ArrowLeftRight size={18} className="text-accent" aria-hidden="true" />,
    },
    {
      title: "Révision vocabulaire",
      description: "Revisitez vos mots sauvegardés.",
      badge: isLoading
        ? "..."
        : `${reviewCount} MOT${reviewCount > 1 ? "S" : ""} EN ATTENTE`,
      href: "/review",
      cta: "Réviser →",
      icon: <BookOpen size={18} className="text-accent" aria-hidden="true" />,
    },
  ];

  return (
    <div className={CARD_GRID_3COL_CLASS}>
      {cards.map((card) => (
        <div key={card.title} className={CARD_HUB_CLASS}>
          <div className={cn("mb-3", CARD_ICON_BOX_CLASS)}>{card.icon}</div>
          <h3 className="text-sm font-bold text-ink">{card.title}</h3>
          <p className="mt-1.5 flex-1 text-xs text-ink-3">{card.description}</p>
          <span className={cn("mt-3 inline-flex w-fit", BADGE_SOFT_CLASS)}>
            {card.badge}
          </span>
          <Link href={card.href} className={cn("mt-3 hover:underline", CTA_LINK_CLASS)}>
            {card.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}

function RecentActivitySection({
  recentTexts,
  isLoading,
  onTextClick,
}: {
  recentTexts: THomeRecentText[];
  isLoading: boolean;
  onTextClick: (textId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className={CARD_GRID_3COL_CLASS}>
        <Skeleton className="h-44 rounded-[14px]" />
        <Skeleton className="h-44 rounded-[14px]" />
        <Skeleton className="h-44 rounded-[14px]" />
      </div>
    );
  }

  if (recentTexts.length === 0) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-5 text-sm text-ink-2">
        Aucune lecture récente pour le moment.
      </div>
    );
  }

  return (
    <div className={CARD_GRID_3COL_CLASS}>
      {recentTexts.map((text) => (
        <TextCard
          key={text.id}
          text={mapRecentTextToCard(text)}
          onClick={() => onTextClick(text.id)}
        />
      ))}
    </div>
  );
}

function mapRecentTextToCard(text: THomeRecentText): TTextWithProgress {
  return {
    id: text.id,
    title: text.title,
    content: "",
    contentAnnotated: null,
    level: text.level as TTextWithProgress["level"],
    collection: text.collection,
    wordCount: text.wordCount,
    readingTimeMinutes: text.readingTimeMinutes,
    userProgress: {
      percentRead: text.percentRead,
      lastSentenceIndex: 0,
      completedAt: null,
    },
    source: "curated",
    createdAt: null,
    sentenceCount: 0,
  };
}

function VocabularyBlock({
  wordsCount,
  isLoading,
}: {
  wordsCount: number;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5">
      <p className="mt-1 text-sm text-ink-2">
        {isLoading ? (
          <Skeleton className="inline-block h-4 w-48" />
        ) : (
          <>
            {wordsCount} mot{wordsCount > 1 ? "s" : ""} sauvegardé
            {wordsCount > 1 ? "s" : ""} · 0/400 leçons lues
          </>
        )}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {["MOTS", "EXPRESSIONS", "PHRASES"].map((pill) => (
          <span
            key={pill}
            className="rounded-full border border-border px-3 py-1 text-xs text-ink-3"
          >
            {pill}
          </span>
        ))}
      </div>

      <Link
        href="/vocabulary"
        className={cn(BTN_PRIMARY_CLASS, "mt-4 h-9 px-4 text-sm")}
      >
        Ouvrir Vocabulary →
      </Link>
    </div>
  );
}
