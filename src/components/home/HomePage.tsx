"use client";

import { ArrowLeftRight, BookOpen, PenLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { CollectionCard } from "@/components/library/CollectionCard";
import { TextCard } from "@/components/library/TextCard";
import { EXERCISE_CARD_CLASS, CARD_CTA_STYLE, CARD_ICON_BOX_STYLE } from "@/components/ui/card-styles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeData } from "@/hooks/useHomeData";
import { useTexts } from "@/hooks/useTexts";
import { COLLECTION_LABELS, COLLECTIONS } from "@/lib/library/collections";
import type { THomeCurrentReading } from "@/types/home";
import type { THomeRecentText } from "@/types/home";
import type { TTextWithProgress } from "@/types/reader";

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
      <div className="mx-auto max-w-[1080px] px-10 py-12 text-center">
        <p className="text-ink-2">Impossible de charger l&apos;accueil.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-12 md:px-10">
      <HeroSection data={data} isLoading={isLoading} />

      <HomeSection>
        <TodaySection reviewCount={data?.reviewCount ?? 0} isLoading={isLoading} />
      </HomeSection>

      <HomeSection>
        <SectionHeader
          title="Collections"
          subtitle="Parcours thématiques pour structurer vos lectures."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => router.push(`/library?collection=${collection.id}`)}
            />
          ))}
        </div>
      </HomeSection>

      <HomeSection>
        <SectionHeader
          title="Activité récente"
          subtitle="Lectures suggérées selon votre niveau et votre historique."
        />
        <RecentActivitySection
          recentTexts={data?.recentTexts ?? []}
          isLoading={isLoading}
          onTextClick={(textId) => router.push(`/reader/${textId}`)}
        />
      </HomeSection>

      <HomeSection>
        <VocabularySection
          wordsCount={data?.wordsCount ?? 0}
          isLoading={isLoading}
        />
      </HomeSection>
    </div>
  );
}

function HomeSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-11 border-t border-border pt-11">{children}</section>
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
    <section className="grid gap-8 pt-14 md:grid-cols-2 md:gap-10">
      <div>
        <p className="mb-4 text-[11px] font-bold tracking-[0.1em] text-accent uppercase">
          ESPACE D&apos;APPRENTISSAGE
        </p>
        <h1 className="font-serif text-[52px] leading-none tracking-[-1px] text-ink">
          Rossiyani
        </h1>
        <p className="mt-4 max-w-[380px] text-[15px] leading-[1.65] text-ink-2">
          Reprenez votre lecture, pratiquez un peu, explorez vos collections —
          sans tableau de bord, juste votre progression.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-36 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
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
        <Skeleton className="min-h-[280px] rounded-lg" />
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
          ? "inline-flex rounded-full border border-accent-border bg-accent-light px-3 py-1.5 text-xs font-medium text-accent"
          : "inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-2"
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
    <div className="relative overflow-hidden rounded-lg bg-accent-deep p-7">
      <span
        className="pointer-events-none absolute -bottom-[18px] -right-1.5 font-serif text-[130px] italic leading-none text-white/[0.06]"
        aria-hidden="true"
      >
        Р
      </span>

      {current ? (
        <>
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/45 uppercase">
            EN COURS
          </p>
          <h2 className="mt-3 font-serif text-[26px] leading-tight text-white">
            {current.text.title}
          </h2>
          <p className="mt-2 text-xs text-white/40">
            {COLLECTION_LABELS[current.text.collection] ??
              current.text.collection}{" "}
            · {current.text.level} · {current.percentRead}% lu ·{" "}
            {current.text.readingTimeMinutes} min
          </p>
          <div className="mt-5 h-[3px] overflow-hidden rounded-[2px] bg-white/12">
            <div
              className="h-full rounded-[2px] bg-white/65 transition-all"
              style={{ width: `${current.percentRead}%` }}
            />
          </div>
          <Link
            href={`/reader/${current.text.id}`}
            className="mt-5 inline-flex w-full items-center justify-center rounded-[10px] bg-white px-3 py-[11px] text-sm font-bold text-accent-deep"
          >
            Reprendre →
          </Link>
        </>
      ) : (
        <>
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/45 uppercase">
            COMMENCER
          </p>
          <h2 className="mt-3 font-serif text-[26px] leading-tight text-white">
            Commencer votre première lecture
          </h2>
          <p className="mt-2 text-xs text-white/40">
            Choisissez un texte dans la bibliothèque pour démarrer.
          </p>
          <Link
            href="/library"
            className="mt-5 inline-flex w-full items-center justify-center rounded-[10px] bg-white px-3 py-[11px] text-sm font-bold text-accent-deep"
          >
            Explorer la bibliothèque →
          </Link>
        </>
      )}
    </div>
  );
}

function TodaySection({
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
      icon: <PenLine size={18} color="#4F46E5" aria-hidden="true" />,
    },
    {
      title: "Traduction contextualisée",
      description: "Traduisez le sens, pas les mots.",
      badge: "4 EXERCICES RESTANTS",
      href: "/practice/context-translation",
      cta: "Traduire →",
      icon: <ArrowLeftRight size={18} color="#4F46E5" aria-hidden="true" />,
    },
    {
      title: "Révision vocabulaire",
      description: "Revisitez vos mots sauvegardés.",
      badge: isLoading
        ? "..."
        : `${reviewCount} MOT${reviewCount > 1 ? "S" : ""} EN ATTENTE`,
      href: "/review",
      cta: "Réviser →",
      icon: <BookOpen size={18} color="#4F46E5" aria-hidden="true" />,
    },
  ];

  return (
    <>
      <SectionHeader
        title="Aujourd'hui"
        subtitle="Trois exercices courts pour garder le rythme."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className={`flex flex-col ${EXERCISE_CARD_CLASS}`}>
            <div className="mb-4" style={CARD_ICON_BOX_STYLE}>
              {card.icon}
            </div>
            <h3 className="text-sm font-bold text-ink">{card.title}</h3>
            <p className="mt-2 flex-1 text-xs text-ink-3">{card.description}</p>
            <span className="mt-4 inline-flex w-fit rounded-[5px] bg-[#F2F0EC] px-2 py-1 text-[10px] font-bold tracking-[0.06em] text-ink-3 uppercase">
              {card.badge}
            </span>
            <Link href={card.href} className="mt-4 hover:underline" style={CARD_CTA_STYLE}>
              {card.cta}
            </Link>
          </div>
        ))}
      </div>
    </>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-48 rounded-[14px]" />
        <Skeleton className="h-48 rounded-[14px]" />
        <Skeleton className="h-48 rounded-[14px]" />
      </div>
    );
  }

  if (recentTexts.length === 0) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-6 text-sm text-ink-2">
        Aucune lecture récente pour le moment.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
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

function VocabularySection({
  wordsCount,
  isLoading,
}: {
  wordsCount: number;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-6 md:p-8">
      <p className="text-[11px] font-bold tracking-[0.1em] text-accent uppercase">
        MÉMOIRE LINGUISTIQUE
      </p>
      <h2 className="mt-3 text-base font-bold text-ink">
        Vos mots, expressions et phrases
      </h2>
      <p className="mt-2 text-sm text-ink-2">
        {isLoading ? (
          <Skeleton className="inline-block h-4 w-48" />
        ) : (
          <>
            {wordsCount} mot{wordsCount > 1 ? "s" : ""} sauvegardé
            {wordsCount > 1 ? "s" : ""} · 0/400 leçons lues
          </>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
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
        className="mt-6 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm text-white hover:opacity-90"
        style={{ backgroundColor: "#4F46E5", fontWeight: 600 }}
      >
        Ouvrir Vocabulary →
      </Link>
    </div>
  );
}
