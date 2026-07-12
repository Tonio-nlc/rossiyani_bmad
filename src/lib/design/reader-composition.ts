/**
 * Composition éditoriale Reader — Story 5.4
 * @see docs/design/DESIGN_SYSTEM.md § Reader Composition
 */

/** Largeur colonne lecture */
export const READER_COLUMN_CLASS = "mx-auto w-full max-w-reading";

/** Explorer — panneau secondaire */
export const EXPLORER_PANEL_WIDTH_CLASS = "w-[320px]";
export const EXPLORER_PANEL_MAX_HEIGHT_CLASS = "max-h-[520px]";

/** Espacements internes Explorer */
export const EXPLORER_SPACE = {
  afterWord: "mt-4",
  afterTranslation: "mt-5",
  afterBadge: "mt-6",
  afterExplanation: "mt-6",
  afterSuffix: "mt-6",
  afterBridge: "mt-6",
} as const;

/** Rythme phrase — 20px entre blocs (traduction → phrase suivante) */
export const SENTENCE_RHYTHM_CLASS = "mb-5 last:mb-0";
export const SENTENCE_TEXT_CLASS =
  "font-russian text-[24px] leading-[1.55] text-ink md:text-[26px] md:leading-[1.55]";
export const SENTENCE_TRANSLATION_TEXT_CLASS =
  "mt-2 text-[13px] leading-relaxed italic text-ink-3";

/** Fin de lecture — conclusion */
export const READER_CONCLUSION_CLASS =
  "mt-20 border-t border-border pt-12 md:mt-24 md:pt-14";

/** Header Reader */
export const READER_HEADER_SHELL_CLASS =
  "sticky top-14 z-40 border-b border-border bg-surface py-4 md:py-5";
export const READER_BREADCRUMB_CLASS =
  "flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] text-ink-3";
export const READER_TITLE_CLASS =
  "mt-4 font-russian text-[22px] font-bold leading-tight text-ink md:text-[24px]";
