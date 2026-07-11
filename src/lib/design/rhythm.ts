/**
 * Rythme vertical officiel — Story 5.3
 * Navbar → PageHeader → 48px → Section → 64px → Section …
 * @see docs/design/DESIGN_SYSTEM.md § Layouts
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

/** Shell PageHeader */
export const PAGE_HEADER_SHELL_CLASS =
  "border-b border-border bg-surface px-6 py-10 md:px-10";

export const PAGE_HEADER_EYEBROW_CLASS =
  "text-[11px] font-bold tracking-[0.1em] text-accent uppercase";

export const PAGE_HEADER_TITLE_CLASS =
  "font-serif text-4xl leading-tight text-ink md:text-[2.75rem]";

export const PAGE_HEADER_SUBTITLE_CLASS =
  "mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2";

/** Barre contextuelle (retour reader, fil d'Ariane) */
export const CONTEXT_BAR_SHELL_CLASS =
  "border-b border-border bg-surface px-6 py-3 md:px-10";

/** Corps de page — 48px sous le header */
export const PAGE_BODY_SHELL_CLASS = "mx-auto px-6 pb-16 md:px-10";

export const PAGE_BODY_TOP_CLASS = "pt-12";

/** 64px entre sections */
export const PAGE_SECTION_GAP_CLASS = "mt-16";

export const PAGE_SECTION_STACK_CLASS = "flex flex-col gap-16";

/** SectionHeader → contenu */
export const SECTION_CONTENT_GAP_CLASS = "mt-6";

/** Grilles cartes */
export const CARD_GRID_3COL_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export const CARD_GRID_2COL_CLASS = "grid grid-cols-1 gap-4 md:grid-cols-2";

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
