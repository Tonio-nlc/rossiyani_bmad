import {
  getFunctionColorHex,
  stripTrailingPunctuationForDisplay,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

interface FormInContextSectionProps {
  encounter: TVocabularyContextEncounter;
}

export function FormInContextSection({ encounter }: FormInContextSectionProps) {
  const colorHex = getFunctionColorHex(
    encounter.functionColor as TReaderFunctionColor | undefined,
  );
  const cleanSurface = stripTrailingPunctuationForDisplay(encounter.surface);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-5 md:p-6">
      <h2 className="text-lg font-semibold text-ink">
        Comprendre cette forme
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <p className="font-russian text-2xl text-ink">{cleanSurface}</p>
        {encounter.suffix ? (
          <span
            className="rounded-md px-1.5 py-0.5 font-russian text-lg"
            style={
              colorHex
                ? { color: colorHex, backgroundColor: `${colorHex}1F` }
                : undefined
            }
          >
            {encounter.suffix}
          </span>
        ) : null}
      </div>

      <p
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
        style={
          colorHex
            ? { color: colorHex, backgroundColor: `${colorHex}26` }
            : { color: "var(--ink-2)" }
        }
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={colorHex ? { backgroundColor: colorHex } : undefined}
          aria-hidden="true"
        />
        {encounter.roleLabel}
      </p>

      <p className="text-[15px] leading-[1.7] text-ink">{encounter.explanation}</p>

      {encounter.suffixExplanation ? (
        <p className="text-sm leading-relaxed text-ink-2">
          {encounter.suffixExplanation}
        </p>
      ) : null}

      <blockquote className="border-l-2 border-border pl-4">
        <p className="font-russian text-base leading-relaxed text-ink-2">
          {encounter.sentence}
        </p>
      </blockquote>
    </section>
  );
}
