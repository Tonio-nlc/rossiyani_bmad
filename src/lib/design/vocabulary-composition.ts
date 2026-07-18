/**
 * Composition éditoriale — fiche vocabulaire (RC-022 / RC-023)
 * Échelle verticale : 8 · 16 · 24 · 40 px uniquement.
 */

/** Colonne de lecture — ~740px (parallèle à LESSON_COLUMN_CLASS) */
export const VOCAB_COLUMN_CLASS = "mx-auto w-full max-w-vocab";

/** Shell page — padding + surface sur la colonne centrée */
export const VOCAB_PAGE_SHELL_CLASS = "bg-surface px-6 pb-12 pt-6 md:px-10";

/** Padding horizontal aligné sur la colonne (BackLink / chrome) */
export const VOCAB_COLUMN_GUTTER_CLASS = "px-6 md:px-10";

/* ── Rythme vertical ─────────────────────────────────────── */

/** Entre étapes narratives (40px) */
export const VOCAB_NARRATIVE_GAP_CLASS = "mt-10 first:mt-0";

/** Titre → contenu (16px) */
export const VOCAB_TITLE_TO_CONTENT_CLASS = "mt-4";

/** Blocs internes (16px) */
export const VOCAB_BLOCK_GAP_CLASS = "space-y-4";

/** Groupe serré (8px) */
export const VOCAB_TIGHT_GAP_CLASS = "space-y-2";

/* ── Typographie narrative ───────────────────────────────── */

/** Question unique — DM Serif */
export const VOCAB_NARRATIVE_QUESTION_CLASS =
  "font-serif text-[1.75rem] leading-[1.25] text-ink md:text-[2rem]";

/** Titre section secondaire (référence) */
export const VOCAB_TITLE_CLASS =
  "mt-2 font-serif text-[1.875rem] leading-[1.2] text-ink md:text-[2.125rem]";

export const VOCAB_EYEBROW_CLASS =
  "text-[11px] font-bold tracking-[0.08em] text-accent uppercase";

/** Sous-partie dans une étape */
export const VOCAB_SUBPART_LABEL_CLASS =
  "text-[15px] font-semibold leading-snug text-ink";

/** Corps — DM Sans 17px, lignes courtes */
export const VOCAB_BODY_CLASS =
  "max-w-[42rem] text-[17px] leading-[1.55] text-ink-2";

export const VOCAB_BODY_SMALL_CLASS =
  "max-w-[42rem] text-[15px] leading-[1.55] text-ink-2";

/** Méta discrète (chips en ligne) */
export const VOCAB_INLINE_META_CLASS =
  "text-[13px] leading-relaxed text-ink-3";

/* ── Russe affiché ───────────────────────────────────────── */

export const VOCAB_RUSSIAN_HERO_CLASS =
  "font-russian text-[2.125rem] leading-none tracking-tight text-ink md:text-[2.375rem]";

export const VOCAB_RUSSIAN_MD_CLASS =
  "font-russian text-xl leading-none text-ink";

export const VOCAB_RUSSIAN_SM_CLASS =
  "font-russian text-lg leading-none text-ink";

/* ── Panneaux éditoriaux ─────────────────────────────────── */

export const VOCAB_HERO_PANEL_CLASS =
  "border-y border-border/70 py-5";

export const VOCAB_SUBPART_PANEL_CLASS =
  "border-t border-border/50 pt-5 first:border-t-0 first:pt-0";

export const VOCAB_CARD_CLASS =
  "rounded-lg border border-border/70 bg-bg/35";

export const VOCAB_FORM_CARD_CLASS = `${VOCAB_CARD_CLASS} px-3 py-3`;

export const VOCAB_EXAMPLE_CARD_CLASS = `${VOCAB_CARD_CLASS} px-4 py-4`;

/* ── Listes & grilles ────────────────────────────────────── */

export const VOCAB_LIST_CLASS = "space-y-3";

export const VOCAB_LIST_ITEM_CLASS = "flex gap-2.5";

export const VOCAB_FORMS_GRID_CLASS =
  "grid grid-cols-1 gap-3 sm:grid-cols-2";

export const VOCAB_TAKEAWAY_MAX = 4;

export const VOCAB_EXAMPLE_MAX = 3;

export const VOCAB_NEXT_FORM_MAX = 5;

export const VOCAB_CHIP_MAX = 4;
