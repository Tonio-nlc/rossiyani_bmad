import { ArrowLeftRight, PenLine } from "lucide-react";
import Link from "next/link";

import {
  CARD_CTA_STYLE,
  CARD_ICON_BOX_STYLE,
  EXERCISE_CARD_CLASS,
} from "@/components/ui/card-styles";
import { PageHeader } from "@/components/ui/PageHeader";

const PRACTICE_MODES = [
  {
    href: "/practice/sentence-builder",
    icon: <PenLine size={18} color="#4F46E5" aria-hidden="true" />,
    title: "Constructeur de phrases",
    description:
      "Composez une phrase en russe. Rossiyani analyse votre grammaire en contexte.",
  },
  {
    href: "/practice/context-translation",
    icon: <ArrowLeftRight size={18} color="#4F46E5" aria-hidden="true" />,
    title: "Traduction contextualisée",
    description:
      "Traduisez le sens, pas les mots. Pensez comme un locuteur natif.",
  },
] as const;

export default function PracticePage() {
  return (
    <div>
      <PageHeader
        eyebrow="PRODUCTION"
        title="Pratique"
        subtitle="Renforcez ce que vous avez lu."
      />

      <div className="mx-auto grid max-w-[900px] gap-6 px-6 py-10 md:grid-cols-2 md:px-10">
        {PRACTICE_MODES.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className={`block ${EXERCISE_CARD_CLASS}`}
          >
            <div className="mb-4" style={CARD_ICON_BOX_STYLE}>
              {mode.icon}
            </div>
            <h2 className="text-sm font-bold text-ink">{mode.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              {mode.description}
            </p>
            <span className="mt-6 inline-block" style={CARD_CTA_STYLE}>
              Ouvrir →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
