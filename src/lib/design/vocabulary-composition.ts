/**
 * Composition éditoriale — fiche vocabulaire (RC-022)
 * Échelle verticale : 8 · 16 · 24 · 40 px uniquement.
 */

/** Colonne principale — ~760px */
export const VOCAB_COLUMN_CLASS = "mx-auto w-full max-w-vocab";

/* ── Rythme vertical ─────────────────────────────────────── */

/** Entre sections majeures (40px) */
export const VOCAB_SECTION_GAP_CLASS = "mt-10 first:mt-0";

/** Titre → contenu (16px) */
export const VOCAB_TITLE_TO_CONTENT_CLASS = "mt-4";

/** Blocs internes (16px) */
export const VOCAB_BLOCK_GAP_CLASS = "space-y-4";

/** Groupe serré (8px) */
export const VOCAB_TIGHT_GAP_CLASS = "space-y-2";

/* ── Typographie ─────────────────────────────────────────── */

export const VOCAB_EYEBROW_CLASS =
  "text-[11px] font-bold tracking-[0.08em] text-accent uppercase";

/** Titre section — DM Serif 30–34px */
export const VOCAB_TITLE_CLASS =
  "mt-2 font-serif text-[1.875rem] leading-[1.2] text-ink md:text-[2.125rem]";

/** Sous-titre — DM Sans Semibold 20–22px */
export const VOCAB_SUBTITLE_CLASS =
  "text-[1.25rem] font-semibold leading-snug text-ink md:text-[1.375rem]";

/** Corps — DM Sans 17–18px */
export const VOCAB_BODY_CLASS = "text-[17px] leading-[1.55] text-ink-2";

export const VOCAB_BODY_SMALL_CLASS = "text-[15px] leading-[1.55] text-ink-2";

/** Chips — 13–14px */
export const VOCAB_CHIP_CLASS =
  "inline-flex items-center rounded-md border border-border/80 bg-bg/50 px-2.5 py-0.5 text-[13px] leading-none text-ink-2";

/* ── Russe affiché ───────────────────────────────────────── */

export const VOCAB_RUSSIAN_HERO_CLASS =
  "font-russian text-[2rem] leading-none text-ink md:text-[2.25rem]";

export const VOCAB_RUSSIAN_MD_CLASS =
  "font-russian text-xl leading-none text-ink";

export const VOCAB_RUSSIAN_SM_CLASS =
  "font-russian text-lg leading-none text-ink";

/* ── Cartes éditoriales ──────────────────────────────────── */

export const VOCAB_CARD_CLASS =
  "rounded-lg border border-border/70 bg-bg/40";

export const VOCAB_SUFFIX_CARD_CLASS = `${VOCAB_CARD_CLASS} px-4 py-3`;

export const VOCAB_EXAMPLE_CARD_CLASS = `${VOCAB_CARD_CLASS} px-4 py-4`;

export const VOCAB_EXAMPLE_DIVIDER_CLASS = "my-3 border-t border-border/60";

/* ── Grille formes ───────────────────────────────────────── */

export const VOCAB_FORMS_GRID_CLASS =
  "grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-2";

/* ── Listes ──────────────────────────────────────────────── */

export const VOCAB_LIST_CLASS = "space-y-2";

export const VOCAB_LIST_ITEM_CLASS = "flex gap-2.5";

export const VOCAB_LIST_MAX = 5;
