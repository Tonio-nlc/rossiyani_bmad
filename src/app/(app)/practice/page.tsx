import { ArrowLeftRight, PenLine } from "lucide-react";
import Link from "next/link";

import { EXERCISE_CARD_CLASS } from "@/components/ui/card-styles";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { CARD_ICON_BOX_CLASS, CTA_LINK_CLASS } from "@/lib/design/classes";
import { CARD_GRID_2COL_CLASS } from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

const PRACTICE_MODES = [
  {
    href: "/practice/sentence-builder",
    icon: <PenLine size={18} className="text-accent" aria-hidden="true" />,
    title: "Constructeur de phrases",
    description:
      "Composez une phrase en russe. Rossiyani analyse votre grammaire en contexte.",
  },
  {
    href: "/practice/context-translation",
    icon: <ArrowLeftRight size={18} className="text-accent" aria-hidden="true" />,
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
        width="content"
      />

      <PageBody width="content">
        <div className={CARD_GRID_2COL_CLASS}>
          {PRACTICE_MODES.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className={EXERCISE_CARD_CLASS}
            >
              <div className={cn("mb-4", CARD_ICON_BOX_CLASS)}>{mode.icon}</div>
              <h2 className="text-sm font-bold text-ink">{mode.title}</h2>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-3">
                {mode.description}
              </p>
              <span className={cn("mt-6", CTA_LINK_CLASS)}>Ouvrir →</span>
            </Link>
          ))}
        </div>
      </PageBody>
    </div>
  );
}
