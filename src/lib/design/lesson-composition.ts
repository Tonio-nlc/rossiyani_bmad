/**
 * Composition éditoriale Lesson — Story 5.5
 * @see docs/design/DESIGN_SYSTEM.md § Lesson Composition
 */

/** Colonne lecture — 680px partout */
export const LESSON_COLUMN_CLASS = "mx-auto w-full max-w-reading";

/** Shell page */
export const LESSON_PAGE_SHELL_CLASS = "bg-surface px-4 py-8 md:px-8 md:py-10";

/* ── Hero ─────────────────────────────────────────────────── */

export const LESSON_HERO_CLASS =
  "border-b border-border/60 pb-8 md:pb-10";

export const LESSON_EYEBROW_CLASS =
  "text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase";

export const LESSON_TITLE_CLASS =
  "mt-3 font-serif text-[2rem] leading-[1.2] text-ink md:text-[2.25rem] md:leading-[1.15]";

export const LESSON_INTRO_CLASS =
  "mt-6 max-w-reading text-[15px] leading-[1.75] text-ink-2";

/* ── Échelle verticale ────────────────────────────────────
 * Section → 40px · Sous-contenu → 24px · Paragraphes → 16px
 */

export const LESSON_SECTION_GAP_CLASS = "mt-10";
export const LESSON_SUBCONTENT_GAP_CLASS = "space-y-6";
export const LESSON_PARAGRAPH_GAP_CLASS = "space-y-4";

/* ── Paragraphes ────────────────────────────────────────── */

export const LESSON_PROSE_CLASS =
  "max-w-reading text-[15px] leading-[1.75] text-ink-2";

export const LESSON_QUESTION_CLASS =
  "max-w-reading font-serif text-[1.35rem] leading-[1.45] text-ink md:text-[1.5rem] md:leading-[1.4]";

/* ── Cartes leçon (exemple, callout, comparaison) ───────── */

export const LESSON_CARD_SHELL_CLASS =
  "rounded-[12px] border border-border/80 bg-bg/40";

export const LESSON_EXAMPLE_CARD_CLASS = `${LESSON_CARD_SHELL_CLASS} space-y-3 p-4`;

export const LESSON_EXAMPLE_RUSSIAN_CLASS =
  "font-russian text-[20px] leading-[1.5] text-ink";

export const LESSON_EXAMPLE_TRANSLATION_CLASS =
  "text-[13px] italic leading-relaxed text-ink-3";

export const LESSON_EXAMPLE_NOTE_CLASS =
  "text-[13px] leading-[1.7] text-ink-2";

/* ── Schéma (illustration) ──────────────────────────────── */

export const LESSON_SCHEMA_SHELL_CLASS = `${LESSON_CARD_SHELL_CLASS} bg-bg/30`;

/** Padding officiel autour du SVG — ne touche jamais les bords */
export const LESSON_SCHEMA_PADDING_CLASS = "p-5 md:p-6";

export const LESSON_SCHEMA_CAPTION_CLASS =
  "mt-3 text-center text-[11px] leading-relaxed text-ink-3";

/* ── Section « Comprendre » — nouvelle étape ────────────── */

export const LESSON_STEP_SECTION_CLASS = "border-t border-border pt-10";

export const LESSON_STEP_EYEBROW_CLASS =
  "text-[11px] font-bold tracking-[0.08em] text-accent uppercase";

export const LESSON_STEP_TITLE_CLASS =
  "mt-2 font-serif text-xl leading-snug text-ink md:text-[1.35rem]";

/* ── Takeaways — conclusion ─────────────────────────────── */

export const LESSON_ENDING_CLASS =
  "mt-16 border-t border-border pt-10 md:mt-20 md:pt-12";

export const LESSON_TAKEAWAY_ITEM_CLASS =
  "font-serif text-[1.05rem] leading-[1.55] text-ink md:text-[1.1rem]";

/* ── Appendice Reader ↔ Lesson ──────────────────────────── */

export const LESSON_APPENDIX_CLASS =
  "mt-16 border-t border-border/60 pt-10 md:mt-20 md:pt-12";

export const LESSON_COMPLETE_CLASS =
  "mt-10 border-t border-border/60 pt-8 md:mt-12";
