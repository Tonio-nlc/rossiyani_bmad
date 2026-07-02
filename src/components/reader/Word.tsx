"use client";

import {
  getFunctionColorHex,
  splitWordStemAndSuffix,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import { cn } from "@/lib/utils";

export interface WordProps {
  surface: string;
  isClickable?: boolean;
  functionalRole?: string;
  functionColor?: TReaderFunctionColor;
  isSelected?: boolean;
  onWordClick?: (surface: string) => void;
}

export function Word({
  surface,
  isClickable = false,
  functionColor,
  isSelected = false,
  onWordClick,
}: WordProps) {
  const colorHex = getFunctionColorHex(functionColor);
  const { stem, suffix } = splitWordStemAndSuffix(surface);

  const handleClick = () => {
    if (isClickable && onWordClick) {
      onWordClick(surface);
    }
  };

  return (
    <span
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (isClickable && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onWordClick?.(surface);
        }
      }}
      className={cn(
        "inline font-serif text-2xl leading-relaxed text-brand-text-primary",
        isClickable && "cursor-pointer",
        isSelected && colorHex && "rounded-sm",
      )}
      style={
        isSelected && colorHex
          ? { backgroundColor: `${colorHex}1A` }
          : undefined
      }
    >
      {colorHex && suffix ? (
        <>
          <span>{stem}</span>
          <span style={{ color: colorHex }}>{suffix}</span>
        </>
      ) : (
        <span style={colorHex ? { color: colorHex } : undefined}>{surface}</span>
      )}
    </span>
  );
}
