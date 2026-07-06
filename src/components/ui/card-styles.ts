import type { CSSProperties } from "react";

export const CARD_BASE_CLASS =
  "rounded-[14px] border border-border bg-surface p-[22px] text-left transition-all duration-200 ease-in-out hover:border-accent-border hover:shadow-[0_4px_20px_rgba(79,70,229,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export const TEXT_CARD_CLASS = `${CARD_BASE_CLASS} hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,70,229,0.08)]`;

export const EXERCISE_CARD_CLASS = CARD_BASE_CLASS;

export const CARD_ICON_BOX_STYLE: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 8,
  background: "#EEF0FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const CARD_CTA_STYLE: CSSProperties = {
  color: "#4F46E5",
  fontWeight: 600,
  fontSize: 13,
};
