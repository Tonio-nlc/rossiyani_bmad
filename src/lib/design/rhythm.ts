/**
 * Grammaire de composition — Story 5.3 Layout Foundation
 * Échelle verticale unique pour les pages hub.
 * @see docs/design/DESIGN_SYSTEM.md § Composition
 */

import {
  LAYOUT_WIDTH,
  WIDTH_CONTENT,
  WIDTH_DASHBOARD,
  WIDTH_READING,
  type LayoutWidth,
} from "@/lib/design/layout";

export type { LayoutWidth };

export const LAYOUT_WIDTH_CLASS = LAYOUT_WIDTH;

/* ── PageHeader ───────────────────────────────────────────── */

export const PAGE_HEADER_SHELL_CLASS =
  "border-b border-border bg-surface px-6 py-7 md:px-10";

export const PAGE_HEADER_EYEBROW_CLASS =
  "text-[11px] font-bold tracking-[0.1em] text-accent uppercase";

export const PAGE_HEADER_TITLE_CLASS =
  "font-serif text-4xl leading-tight text-ink md:text-[2.75rem]";

export const PAGE_HEADER_SUBTITLE_CLASS =
  "mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2";

export const CONTEXT_BAR_SHELL_CLASS =
  "border-b border-border bg-surface px-6 py-3 md:px-10";

/* ── Échelle verticale officielle ───────────────────────────
 * Header → 64px → Hero/contenu
 * Hero → 56px → Section
 * Section → 40px → Section
 * title → 24px → contenu
 * grille cartes → gap 16px
 */

/** Après PageHeader (64px) */
export const PAGE_AFTER_HEADER_CLASS = "pt-16";

export const PAGE_BODY_SHELL_CLASS = "mx-auto px-6 pb-12 md:px-10";

/** Hero → première section (56px) */
export const HERO_TO_SECTION_CLASS = "mt-14";

/** Entre sections (40px) */
export const SECTION_GAP_CLASS = "mt-10";

/** SectionHeader → contenu (24px) */
export const SECTION_CONTENT_GAP_CLASS = "mt-6";

/** Sous-section / filtres → liste (24px) */
export const SUBSECTION_GAP_CLASS = "mt-6";

/* ── Grilles hub ──────────────────────────────────────────── */

export const CARD_GRID_3COL_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export const CARD_GRID_2COL_CLASS = "grid grid-cols-1 gap-4 md:grid-cols-2";

/* ── Hauteurs officielles (hub) ───────────────────────────── */

/** Carte promo « En cours » (Home / Library) */
export const HEIGHT_CARD_PROMO_CLASS = "min-h-0";

/** Carte hub exercice / parcours */
export const HEIGHT_CARD_HUB_CLASS = "min-h-[168px]";

/** Carte collection */
export const HEIGHT_CARD_COLLECTION_CLASS = "min-h-[144px]";

/** Carte texte bibliothèque */
export const HEIGHT_CARD_TEXT_CLASS = "min-h-[176px]";

/** Empty state hub */
export const HEIGHT_EMPTY_STATE_CLASS = "min-h-[160px]";

export function pageBodyWidthClass(width: LayoutWidth = "dashboard"): string {
  switch (width) {
    case "reading":
      return WIDTH_READING;
    case "content":
      return WIDTH_CONTENT;
    case "dashboard":
    default:
      return WIDTH_DASHBOARD;
  }
}

/** @deprecated Utiliser SECTION_GAP_CLASS */
export const PAGE_SECTION_GAP_CLASS = SECTION_GAP_CLASS;

/** @deprecated Utiliser PAGE_AFTER_HEADER_CLASS */
export const PAGE_BODY_TOP_CLASS = PAGE_AFTER_HEADER_CLASS;
