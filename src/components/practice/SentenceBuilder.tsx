"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PracticeBreadcrumb } from "@/components/practice/PracticeBreadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSentenceBuilder } from "@/hooks/useSentenceBuilder";
import type { TSentenceBuilderResult } from "@/types/practice";

export function SentenceBuilder() {
  const [idea, setIdea] = useState("");
  const [sentence, setSentence] = useState("");
  const { evaluate, result, isLoading, error, reset } = useSentenceBuilder();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    evaluate({ idea: idea.trim(), sentence: sentence.trim() });
  }

  function handleNewSentence() {
    setIdea("");
    setSentence("");
    reset();
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PracticeBreadcrumb current="Constructeur de phrases" />
        <h1 className="text-2xl font-semibold text-brand-text-primary">
          Composez en russe
        </h1>
        <p className="text-base text-brand-text-secondary">
          Formulez une phrase à partir de ce que vous avez lu.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="idea"
            className="text-sm font-medium text-brand-text-primary"
          >
            Votre idée
          </label>
          <Input
            id="idea"
            type="text"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="En français ou en russe..."
            disabled={isLoading}
            required
            className="h-11 border-brand-border bg-brand-card px-3"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sentence"
            className="text-sm font-medium text-brand-text-primary"
          >
            Votre phrase en russe
          </label>
          <Textarea
            id="sentence"
            value={sentence}
            onChange={(event) => setSentence(event.target.value)}
            placeholder="Ваше предложение..."
            disabled={isLoading}
            required
            maxLength={500}
            className="min-h-[160px] resize-y border-brand-border bg-brand-card px-3 py-3 font-serif text-base"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error instanceof Error
              ? error.message
              : "Une erreur est survenue"}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            disabled={isLoading || !idea.trim() || !sentence.trim()}
            className="h-11 bg-brand-primary px-6 text-white hover:bg-brand-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Évaluation...
              </>
            ) : (
              "Valider →"
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
        <div className="space-y-6">
          <SentenceBuilderResult result={result} />

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleNewSentence}
              className="border-brand-border"
            >
              Nouvelle phrase
            </Button>
            <Button
              type="button"
              disabled
              variant="outline"
              className="border-brand-border"
              title="Bientôt disponible"
            >
              Sauvegarder cette phrase
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SentenceBuilderResult({ result }: { result: TSentenceBuilderResult }) {
  const isPartiallyCorrect = result.isCorrect || result.positives.length > 0;

  if (isPartiallyCorrect) {
    return (
      <div className="space-y-5 rounded-xl border border-brand-border bg-brand-card p-6">
        {result.positives.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-text-primary">
              ✓ Ce qui est bien
            </h2>
            <ul className="space-y-2">
              {result.positives.map((positive, index) => (
                <li
                  key={index}
                  className="text-sm leading-relaxed text-brand-text-secondary"
                >
                  {positive}
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.corrections.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-brand-text-primary">
              ✎ Ce qui peut être amélioré
            </h2>
            <ul className="space-y-4">
              {result.corrections.map((correction, index) => (
                <li
                  key={index}
                  className="space-y-1 text-sm leading-relaxed text-brand-text-secondary"
                >
                  <p>
                    <span className="font-medium text-brand-text-primary">
                      {correction.original}
                    </span>
                    {" → "}
                    <span className="font-serif text-brand-text-primary">
                      {correction.corrected}
                    </span>
                  </p>
                  <p>{correction.explanation}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.correctedSentence && (
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-text-primary">
              Version corrigée :
            </h2>
            <p className="font-serif text-lg text-brand-text-primary">
              {result.correctedSentence}
            </p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-xl border border-brand-border bg-brand-card p-6">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-brand-text-primary">
          Version suggérée :
        </h2>
        <p className="font-serif text-lg text-brand-text-primary">
          {result.correctedSentence}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-brand-text-primary">
          Explication :
        </h2>
        <p className="text-sm leading-relaxed text-brand-text-secondary">
          {result.explanation}
        </p>
      </section>
    </div>
  );
}
