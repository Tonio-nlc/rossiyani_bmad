"use client";

import { useEffect, useRef } from "react";

import {
  getFunctionColorHex,
  splitWordByApiSuffix,
  splitWordStemAndSuffix,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import { cn } from "@/lib/utils";

export interface WordProps {
  surface: string;
  isClickable?: boolean;
  functionalRole?: string;
  functionColor?: TReaderFunctionColor | string;
  suffix?: string;
  isSelected?: boolean;
  isAnnotated?: boolean;
  onWordClick?: (surface: string) => void;
}

function toFunctionColor(
  color?: TReaderFunctionColor | string,
): TReaderFunctionColor | undefined {
  if (!color) {
    return undefined;
  }

  const valid: TReaderFunctionColor[] = [
    "blue",
    "coral",
    "green",
    "violet",
    "amber",
  ];

  if (valid.includes(color as TReaderFunctionColor)) {
    return color as TReaderFunctionColor;
  }

  return undefined;
}

function resolveWordParts(surface: string, apiSuffix?: string) {
  const normalizedSuffix =
    apiSuffix === undefined ? undefined : apiSuffix.replace(/^-+/, "").trim();

  if (apiSuffix !== undefined && normalizedSuffix === "") {
    const trailingMatch = surface.match(/([^\p{L}\p{N}]+)$/u);
    const trailingPunctuation = trailingMatch?.[1] ?? "";
    const wordPart = trailingPunctuation
      ? surface.slice(0, -trailingPunctuation.length)
      : surface;

    return { stem: wordPart, suffix: "", trailingPunctuation };
  }

  if (normalizedSuffix) {
    const fromApi = splitWordByApiSuffix(surface, apiSuffix!);

    if (fromApi) {
      return fromApi;
    }
  }

  if (apiSuffix === undefined) {
    return splitWordStemAndSuffix(surface);
  }

  const trailingMatch = surface.match(/([^\p{L}\p{N}]+)$/u);
  const trailingPunctuation = trailingMatch?.[1] ?? "";
  const wordPart = trailingPunctuation
    ? surface.slice(0, -trailingPunctuation.length)
    : surface;

  return { stem: wordPart, suffix: "", trailingPunctuation };
}

export function Word({
  surface,
  isClickable = false,
  functionColor,
  suffix: apiSuffix,
  isSelected = false,
  isAnnotated = false,
  onWordClick,
}: WordProps) {
  const resolvedColor = toFunctionColor(functionColor);
  const colorHex = getFunctionColorHex(resolvedColor);
  const { stem, suffix, trailingPunctuation } = resolveWordParts(
    surface,
    apiSuffix,
  );
  const pulseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isSelected || !colorHex || !pulseRef.current) {
      return;
    }

    pulseRef.current.style.setProperty("--reader-pulse-color", colorHex);
    pulseRef.current.classList.remove("reader-word-pulse");
    void pulseRef.current.offsetWidth;
    pulseRef.current.classList.add("reader-word-pulse");
  }, [colorHex, isSelected, surface]);

  const handleClick = () => {
    if (isClickable && onWordClick) {
      onWordClick(surface);
    }
  };

  const showColoredSuffix = Boolean(colorHex && suffix);
  const showSelectedBackground = isSelected && colorHex;

  return (
    <span
      ref={pulseRef}
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
        "word-wrapper inline-flex min-h-[44px] items-center font-serif text-2xl leading-relaxed text-brand-text-primary",
        isClickable &&
          "reader-word-clickable cursor-pointer transition-[background-color] duration-150 ease-in-out",
        isClickable && "rounded px-0.5 -mx-0.5",
        showSelectedBackground && "rounded-[4px]",
        isAnnotated && !isSelected && "bg-transparent",
      )}
      style={
        showSelectedBackground
          ? { backgroundColor: `${colorHex}1F` }
          : undefined
      }
    >
      {showColoredSuffix ? (
        <>
          <span className="word-radical text-brand-text-primary">{stem}</span>
          <span
            className="word-suffix transition-colors duration-300 ease-in-out"
            style={{ color: colorHex }}
          >
            {suffix}
          </span>
          {trailingPunctuation ? (
            <span className="text-brand-text-primary">{trailingPunctuation}</span>
          ) : null}
        </>
      ) : (
        <span className="word-radical text-brand-text-primary">{surface}</span>
      )}
    </span>
  );
}
