import {
  HEIGHT_CARD_COLLECTION_CLASS,
  HEIGHT_CARD_HUB_CLASS,
  HEIGHT_CARD_TEXT_CLASS,
  HEIGHT_EMPTY_STATE_CLASS,
} from "@/lib/design/rhythm";

/** Coque commune — rayon, bordure, hover (hub + legacy) */
export const CARD_SHELL_CLASS =
  "flex flex-col rounded-[14px] border border-border bg-surface p-5 text-left transition-all duration-200 ease-in-out hover:border-accent-border hover:shadow-[0_4px_20px_rgba(79,70,229,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

/** Hub : exercices, parcours leçons (liste) */
export const CARD_HUB_CLASS = `${CARD_SHELL_CLASS} ${HEIGHT_CARD_HUB_CLASS}`;

/** Hub : collections bibliothèque */
export const CARD_COLLECTION_CLASS = `${CARD_SHELL_CLASS} ${HEIGHT_CARD_COLLECTION_CLASS}`;

/** Hub : cartes texte */
export const CARD_TEXT_CLASS = `${CARD_SHELL_CLASS} ${HEIGHT_CARD_TEXT_CLASS}`;

/** Legacy — sans min-height (import, leçon parcours, etc.) */
export const CARD_BASE_CLASS = CARD_SHELL_CLASS;

export const TEXT_CARD_CLASS = CARD_TEXT_CLASS;

export const EXERCISE_CARD_CLASS = CARD_HUB_CLASS;

export const EMPTY_STATE_SHELL_CLASS = `${CARD_SHELL_CLASS} ${HEIGHT_EMPTY_STATE_CLASS}`;
