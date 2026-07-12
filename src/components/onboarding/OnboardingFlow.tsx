"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 5;

type TDemoWord = "anna" | "vidit" | "mashu";

interface IDemoExplanation {
  headline: ReactNode;
  role: string;
  body: ReactNode;
}

const DEMO_EXPLANATIONS: Record<TDemoWord, IDemoExplanation> = {
  anna: {
    headline: "Анна",
    role: "fait l'action",
    body: (
      <>
        Анна est au nominatif — c&apos;est elle qui fait l&apos;action de voir.
        Pas de terminaison spéciale : le nominatif est la forme de base.
      </>
    ),
  },
  vidit: {
    headline: (
      <>
        видит <span className="text-ink-3">→</span> видеть
      </>
    ),
    role: "exprime l'action",
    body: (
      <>
        La terminaison -ит indique la 3e personne du singulier au présent.
        C&apos;est Анна qui voit.
      </>
    ),
  },
  mashu: {
    headline: (
      <>
        Машу <span className="text-ink-3">→</span> Маша
      </>
    ),
    role: "reçoit l'action",
    body: (
      <>
        La terminaison -у indique que Маша est celle qui est vue. C&apos;est
        l&apos;objet direct du verbe видеть (voir).
      </>
    ),
  },
};

const ROLE_LEGEND = [
  { color: "#3B82F6", label: "fait l'action (le sujet)" },
  { color: "#EF7C5A", label: "reçoit l'action (l'objet)" },
  { color: "#22C55E", label: "indique où ou quand" },
  { color: "#A78BFA", label: "indique une possession" },
  { color: "#F59E0B", label: "indique à qui" },
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWord, setSelectedWord] = useState<TDemoWord | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  function handleNext() {
    if (isLastStep) {
      return;
    }
    setCurrentStep((step) => step + 1);
    setSelectedWord(null);
  }

  async function handleComplete() {
    setError(null);
    setIsCompleting(true);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Impossible de terminer l'onboarding");
      }

      router.refresh();
      router.push("/library");
    } catch (completionError) {
      setError(
        completionError instanceof Error
          ? completionError.message
          : "Une erreur est survenue",
      );
      setIsCompleting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg px-6 py-8 md:px-12 md:py-12">
      <div className="mb-8 flex items-center gap-1.5">
        <BookOpen
          className="size-4 text-ink-3"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-ink-3">
          Rossiyani
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[560px] rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-12">
          <div
            key={currentStep}
            className="animate-in fade-in duration-200"
          >
            {currentStep === 0 && <StepOne />}
            {currentStep === 1 && <StepTwo />}
            {currentStep === 2 && (
              <StepThree
                selectedWord={selectedWord}
                onSelectWord={setSelectedWord}
              />
            )}
            {currentStep === 3 && <StepFour />}
            {currentStep === 4 && <StepFive />}
          </div>

          <div className="mt-10 space-y-6">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {isLastStep ? (
              <Button
                type="button"
                disabled={isCompleting}
                onClick={handleComplete}
                className="h-11 w-full bg-accent text-base text-white hover:bg-accent/90 md:w-auto md:min-w-[220px]"
              >
                {isCompleting ? "Chargement..." : "Commencer à lire →"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                className="h-11 w-full bg-accent text-base text-white hover:bg-accent/90 md:w-auto md:min-w-[160px]"
              >
                Suivant →
              </Button>
            )}

            <ProgressDots currentStep={currentStep} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="space-y-3">
      <h1 className="text-2xl font-semibold leading-tight text-ink">
        {title}
      </h1>
      <p className="text-base leading-relaxed text-ink-2">
        {subtitle}
      </p>
    </header>
  );
}

function StepOne() {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Le russe change les mots selon leur rôle"
        subtitle="En français, l'ordre des mots indique qui fait quoi. En russe, c'est la terminaison du mot qui l'indique."
      />

      <div className="rounded-xl border border-border bg-bg p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
          <PhraseColumn
            russian={
              <>
                <RoleSubject>Анна</RoleSubject>{" "}
                <span className="text-ink">видит</span>{" "}
                <RoleObject />
              </>
            }
            french="Anna voit Macha"
          />

          <div
            className="hidden h-full w-px bg-border md:block"
            aria-hidden="true"
          />

          <PhraseColumn
            russian={
              <>
                <RoleObject />{" "}
                <span className="text-ink">видит</span>{" "}
                <RoleSubject>Анна</RoleSubject>
              </>
            }
            french="Anna voit Macha"
          />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-2">
          Dans les deux cas, c&apos;est <RoleSubject>Анна</RoleSubject> qui voit
          et <RoleObject /> qui est vue — la terminaison &quot;-у&quot; sur Машу
          indique toujours &quot;celle qui est vue&quot;.
        </p>
      </div>
    </div>
  );
}

function RoleSubject({ children }: { children: ReactNode }) {
  return <span style={{ color: "#3B82F6" }}>{children}</span>;
}

function RoleObject() {
  return (
    <span>
      <span className="text-ink">Маш</span>
      <span style={{ color: "#EF7C5A" }}>у</span>
    </span>
  );
}

function PhraseColumn({
  russian,
  french,
}: {
  russian: ReactNode;
  french: string;
}) {
  return (
    <div className="space-y-2 text-center md:text-left">
      <p className="font-serif text-xl text-ink">{russian}</p>
      <p className="text-sm text-ink-2">{french}</p>
    </div>
  );
}

function StepTwo() {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Les couleurs signalent le rôle du mot"
        subtitle="Pas le nom grammatical — le sens concret dans la phrase."
      />

      <ul className="space-y-4">
        {ROLE_LEGEND.map((item) => (
          <li key={item.label} className="flex items-center">
            <span
              className="mr-2 inline-block size-3 shrink-0 rounded-full align-middle"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-base text-ink">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepThree({
  selectedWord,
  onSelectWord,
}: {
  selectedWord: TDemoWord | null;
  onSelectWord: (word: TDemoWord) => void;
}) {
  const explanation = selectedWord ? DEMO_EXPLANATIONS[selectedWord] : null;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Cliquez sur un mot pour comprendre son rôle"
        subtitle="Rossiyani vous explique pourquoi ce mot a cette forme dans cette phrase."
      />

      <div className="rounded-xl border border-border bg-bg p-6">
        <p className="text-center font-serif text-xl">
          <DemoWordButton
            isActive={selectedWord === "anna"}
            onClick={() => onSelectWord("anna")}
            variant="subject"
            ariaLabel="Анна — fait l'action, le sujet"
          >
            Анна
          </DemoWordButton>{" "}
          <DemoWordButton
            isActive={selectedWord === "vidit"}
            onClick={() => onSelectWord("vidit")}
            variant="verb"
            ariaLabel="видит — exprime l'action, le verbe"
          >
            видит
          </DemoWordButton>{" "}
          <DemoWordButton
            isActive={selectedWord === "mashu"}
            onClick={() => onSelectWord("mashu")}
            variant="object"
            ariaLabel="Машу — reçoit l'action, l'objet"
          >
            <span className="text-ink">Маш</span>
            <span style={{ color: "#EF7C5A" }}>у</span>
          </DemoWordButton>
          .
        </p>

        <p className="mt-2 text-center text-sm text-ink-2">Anna voit Macha.</p>

        <p className="mt-3 text-center text-[13px] italic text-ink-3">
          ← Cliquez sur un mot
        </p>

        {explanation && (
          <div
            key={selectedWord}
            className="mt-6 animate-in fade-in rounded-xl border border-border bg-surface p-5 duration-150"
          >
            <p className="font-serif text-lg text-ink">
              {explanation.headline}
            </p>
            <p className="mt-1 text-sm font-medium text-ink-2">
              &quot;{explanation.role}&quot;
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              {explanation.body}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DemoWordButton({
  children,
  onClick,
  isActive,
  variant,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  isActive: boolean;
  variant: "subject" | "verb" | "object";
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "cursor-pointer rounded-md px-1 transition-opacity hover:opacity-70",
        isActive && "opacity-70",
        variant === "verb" &&
          "border-b border-dashed border-ink-3 text-ink",
      )}
      style={variant === "subject" ? { color: "#3B82F6" } : undefined}
    >
      {children}
    </button>
  );
}

function StepFour() {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Sauvegardez les mots qui vous intéressent"
        subtitle="Chaque mot sauvegardé garde son contexte — la phrase où vous l'avez rencontré."
      />

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="font-serif text-xl text-ink">ваго́н</p>
        <p className="mt-1 text-base text-ink-2">wagon</p>
        <p className="mt-4 font-serif text-base leading-relaxed text-ink-2">
          &quot;Анна входит в вагон и садится у окна.&quot;
        </p>
        <p className="mt-1 text-sm italic text-ink-3">
          « Anna entre dans le wagon et s&apos;assoit près de la fenêtre. »
        </p>
        <p className="mt-4 text-sm text-ink-3">
          ✓ Sauvegardé · À réviser demain
        </p>
      </div>
    </div>
  );
}

function StepFive() {
  return (
    <div className="space-y-6">
      <StepHeader
        title="On commence par lire"
        subtitle="Pas par mémoriser. La compréhension vient naturellement — mot après mot, phrase après phrase."
      />

      <blockquote className="rounded-lg bg-accent-light px-6 py-6 text-center font-serif text-xl italic text-ink-2">
        « Comprendre d&apos;abord,
        <br />
        mémoriser ensuite. »
      </blockquote>
    </div>
  );
}

function ProgressDots({ currentStep }: { currentStep: number }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={TOTAL_STEPS - 1}
      aria-valuenow={currentStep}
      aria-label={`Étape ${currentStep + 1} sur ${TOTAL_STEPS}`}
    >
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full transition-colors",
            index === currentStep
              ? "bg-accent"
              : "bg-border",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
