/**
 * Grille officielle Rossiyani — Story 5.2
 * @see docs/design/DESIGN_SYSTEM.md
 */

/** Lecture : Reader, Import, détail Leçon */
export const WIDTH_READING = "max-w-reading";

/** Pages contenu : Vocabulary, Review, Practice, parcours Leçons */
export const WIDTH_CONTENT = "max-w-content";

/** Dashboards : Home, Library, liste Leçons, PageHeader */
export const WIDTH_DASHBOARD = "max-w-dashboard";

export type LayoutWidth = keyof typeof LAYOUT_WIDTH;

export const LAYOUT_WIDTH = {
  reading: WIDTH_READING,
  content: WIDTH_CONTENT,
  dashboard: WIDTH_DASHBOARD,
} as const;
