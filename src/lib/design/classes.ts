/**
 * Classes utilitaires canoniques — Story 5.2
 * @see docs/design/DESIGN_SYSTEM.md
 */

/** CTA lien dans cartes bibliothèque */
export const CTA_LINK_CLASS =
  "text-[13px] font-semibold text-accent";

/** Coque input canonique — Story 5.6 */
export const INPUT_SHELL_CLASS =
  "h-10 rounded-[10px] border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20";

/** Icône dans carte exercice / collection */
export const CARD_ICON_BOX_CLASS =
  "flex size-[38px] items-center justify-center rounded-lg bg-accent-light text-accent";

/** CTA primaire pleine largeur */
export const BTN_PRIMARY_CLASS =
  "inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50";

/** CTA secondaire */
export const BTN_SECONDARY_CLASS =
  "inline-flex items-center justify-center rounded-[10px] border border-border bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:border-accent-border disabled:cursor-not-allowed disabled:opacity-50";

/** Badge niveau (A1–C2) */
export const BADGE_LEVEL_CLASS =
  "rounded-[5px] bg-accent px-2 py-0.5 text-[10px] font-extrabold text-white";

/** Badge discret / méta */
export const BADGE_MUTED_CLASS =
  "rounded-[5px] border border-border px-2 py-0.5 text-[10px] font-semibold text-ink-3";

/** Badge méta / compteur (fond discret) */
export const BADGE_SOFT_CLASS =
  "rounded-[5px] bg-bg px-2 py-1 text-[10px] font-bold tracking-[0.06em] text-ink-3 uppercase";

/** Badge méta compact (sans uppercase) */
export const BADGE_META_CLASS =
  "rounded-[5px] bg-bg px-2 py-0.5 text-[10px] font-bold text-ink-3";

/** Skeleton aligné cartes */
export const SKELETON_CARD_CLASS = "rounded-[14px]";

/** Encart promo « En cours » (Home / Library) */
export const CARD_PROMO_CLASS =
  "relative overflow-hidden rounded-lg bg-accent-deep p-5";
