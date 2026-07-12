"use client";

import { useEffect, useRef } from "react";

import {
  getFunctionColorHex,
  splitWordByApiSuffix,
  splitWordStemAndSuffix,
  splitTrailingPunctuation,
  toNfc,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";
import { displayRussian } from "@/lib/russian/display-russian";
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
  const nfcSurface = toNfc(surface);
  const normalizedSuffix =
    apiSuffix === undefined ? undefined : apiSuffix.replace(/^-+/, "").trim();

  if (apiSuffix !== undefined && normalizedSuffix === "") {
    const { wordPart, trailingPunctuation } =
      splitTrailingPunctuation(nfcSurface);

    return { stem: wordPart, suffix: "", trailingPunctuation };
  }

  if (normalizedSuffix) {
    const fromApi = splitWordByApiSuffix(nfcSurface, apiSuffix!);

    if (fromApi) {
      return fromApi;
    }
  }

  if (apiSuffix === undefined) {
    return splitWordStemAndSuffix(nfcSurface);
  }

  const { wordPart, trailingPunctuation } = splitTrailingPunctuation(nfcSurface);

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
        "word-wrapper inline text-[24px] leading-[1.65] text-ink md:text-[26px]",
        isClickable &&
          "reader-word-clickable cursor-pointer rounded-[4px] px-0.5 transition-[box-shadow,background-color] duration-150 ease-in-out",
        isSelected && "reader-word-selected",
        isAnnotated && !isSelected && "bg-transparent",
      )}
      style={
        showSelectedBackground
          ? { backgroundColor: `${colorHex}1F` }
          : isSelected
            ? { backgroundColor: "rgba(79, 70, 229, 0.1)" }
            : undefined
      }
    >
      {showColoredSuffix ? (
        <>
          <span className="word-radical text-ink">{displayRussian(stem)}</span>
          <span
            className="word-suffix transition-colors duration-300 ease-in-out"
            style={{ color: colorHex }}
          >
            {displayRussian(suffix)}
          </span>
          {trailingPunctuation ? (
            <span className="text-ink">{trailingPunctuation}</span>
          ) : null}
        </>
      ) : (
        <span className="word-radical text-ink">{displayRussian(surface)}</span>
      )}
    </span>
  );
}
