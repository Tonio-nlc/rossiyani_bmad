"use client";

import { useMutation } from "@tanstack/react-query";
import { Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PracticeBreadcrumb } from "@/components/practice/PracticeBreadcrumb";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  TContextTranslationRequest,
  TContextTranslationResult,
  TTranslationRegister,
} from "@/types/practice";

interface TRecentTranslation {
  input: string;
  output: string;
  register: TTranslationRegister;
  timestamp: Date;
}

const MAX_RECENT_TRANSLATIONS = 5;

const REGISTER_OPTIONS: {
  value: TTranslationRegister;
  label: string;
}[] = [
  { value: "courant", label: "Courant" },
  { value: "soutenu", label: "Soutenu" },
  { value: "familier", label: "Familier" },
  { value: "argotique", label: "Argotique" },
];

const REGISTER_DISPLAY: Record<TTranslationRegister, string> = {
  courant: "courant",
  soutenu: "soutenu",
  familier: "familier",
  argotique: "argotique",
};

async function fetchTranslation(
  request: TContextTranslationRequest,
): Promise<TContextTranslationResult> {
  const response = await fetch("/api/practice/context-translation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Impossible de traduire cette expression");
  }

  return response.json() as Promise<TContextTranslationResult>;
}

export function ContextTranslation() {
  const [text, setText] = useState("");
  const [register, setRegister] = useState<TTranslationRegister>("courant");
  const [recentTranslations, setRecentTranslations] = useState<
    TRecentTranslation[]
  >([]);

  const mutation = useMutation({
    mutationFn: fetchTranslation,
    onSuccess: (result, variables) => {
      setRecentTranslations((previous) =>
        [
          {
            input: variables.text,
            output: result.naturalTranslation,
            register: variables.register,
            timestamp: new Date(),
          },
          ...previous,
        ].slice(0, MAX_RECENT_TRANSLATIONS),
      );
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({ text: text.trim(), register });
  }

  const result = mutation.data ?? null;
  const activeRegister = mutation.variables?.register ?? register;
  const isLoading = mutation.isPending;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PracticeBreadcrumb current="Traduction contextualisée" />
        <h1 className="text-2xl font-semibold text-brand-text-primary">
          Traduire le sens
        </h1>
        <p className="text-base text-brand-text-secondary">
          Pensez comme un locuteur natif — pas mot à mot.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="text"
            className="text-sm font-medium text-brand-text-primary"
          >
            Phrase ou expression à traduire
          </label>
          <Textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Une idée en français..."
            disabled={isLoading}
            required
            maxLength={300}
            className="min-h-[120px] resize-y border-brand-border bg-brand-card px-3 py-3"
          />
        </div>

        <RegisterSelector
          value={register}
          onChange={setRegister}
          disabled={isLoading}
        />

        {mutation.error && (
          <p className="text-sm text-destructive" role="alert">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Une erreur est survenue"}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="h-11 bg-brand-primary px-6 text-white hover:bg-brand-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Traduction...
              </>
            ) : (
              "Traduire →"
            )}
          </Button>

          <Link
            href="/practice"
            className="text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary"
          >
            ← Retour à la pratique
          </Link>
        </div>
      </form>

      {result && (
        <div className="space-y-5 rounded-xl border border-brand-border bg-brand-card p-6">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-text-primary">
              Traduction naturelle :
            </h2>
            <p
              className="font-serif text-xl text-brand-text-primary"
              style={{ textTransform: "none" }}
            >
              {result.naturalTranslation}
            </p>
            {result.registerNote && activeRegister !== "courant" && (
              <p className="flex items-start gap-1.5 text-[13px] italic text-brand-text-muted">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Registre {REGISTER_DISPLAY[activeRegister]} :{" "}
                  {result.registerNote}
                </span>
              </p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-text-primary">
              Pourquoi cette construction ?
            </h2>
            <p className="text-sm leading-relaxed text-brand-text-secondary">
              {result.explanation}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-text-primary">
              Traduction littérale (à éviter) :
            </h2>
            <p className="font-serif text-base text-brand-text-secondary">
              {result.literalTranslation}
            </p>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              {result.literalNote}
            </p>
          </section>

          {result.examples.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-brand-text-primary">
                Exemples en contexte
              </h2>
              <ul className="space-y-2">
                {result.examples.map((example, index) => (
                  <li
                    key={index}
                    className="font-serif text-sm leading-relaxed text-brand-text-secondary"
                  >
                    {example}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {recentTranslations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-text-primary">
            Traductions récentes
          </h2>
          <ul className="space-y-3">
            {recentTranslations.map((entry, index) => (
              <li
                key={`${entry.timestamp.toISOString()}-${index}`}
                className="rounded-xl border border-brand-border bg-brand-card p-4"
              >
                <p className="text-sm text-brand-text-secondary">
                  {entry.input}
                </p>
                <p className="mt-1 font-serif text-base text-brand-text-primary">
                  → {entry.output}
                </p>
                {entry.register !== "courant" && (
                  <span className="mt-2 inline-block text-[11px] text-brand-text-muted">
                    [{REGISTER_DISPLAY[entry.register]}]
                  </span>
                )}
                <p className="mt-2 text-xs text-brand-text-muted">
                  {formatTimestamp(entry.timestamp)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RegisterSelector({
  value,
  onChange,
  disabled,
}: {
  value: TTranslationRegister;
  onChange: (register: TTranslationRegister) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-brand-text-muted">Registre</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Registre">
        {REGISTER_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-full border px-3 py-1 text-[13px] transition-all duration-150",
                isSelected
                  ? "border-brand-primary bg-brand-card text-brand-text-primary"
                  : "border-brand-border bg-transparent text-brand-text-muted hover:text-brand-text-secondary",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
