import type { TLessonExampleWord, TLessonWordRole } from "@/types/lessons";
import {
  normalizeToken,
  tokenizeSentence,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";

const ROLE_COLOR_MAP: Record<
  Exclude<TLessonWordRole, null>,
  TReaderFunctionColor
> = {
  subject: "blue",
  object: "coral",
  place: "green",
  possession: "violet",
  recipient: "amber",
};

const COLOR_ROLE_MAP: Record<TReaderFunctionColor, Exclude<TLessonWordRole, null>> =
  {
    blue: "subject",
    coral: "object",
    green: "place",
    violet: "possession",
    amber: "recipient",
  };

export function lessonRoleToFunctionColor(
  role: TLessonWordRole,
): TReaderFunctionColor | undefined {
  if (!role) {
    return undefined;
  }

  return ROLE_COLOR_MAP[role];
}

/** Inverse de lessonRoleToFunctionColor — pour colorer via functionColor d'un encounter. */
export function functionColorToLessonRole(
  color: string | null | undefined,
): TLessonWordRole {
  if (!color || !(color in COLOR_ROLE_MAP)) {
    return null;
  }

  return COLOR_ROLE_MAP[color as TReaderFunctionColor];
}

/** Mappe le rôle orchestrateur / Reader vers le rôle Leçon. */
export function functionalRoleToLessonRole(
  role: string | null | undefined,
): TLessonWordRole {
  if (!role) {
    return null;
  }

  switch (role.toLowerCase()) {
    case "subject":
      return "subject";
    case "object_direct":
    case "object":
      return "object";
    case "object_indirect":
    case "recipient":
      return "recipient";
    case "possession":
      return "possession";
    case "location":
    case "place":
      return "place";
    default:
      return null;
  }
}

export function resolveLessonRoleFromEncounter(encounter: {
  functionalRole?: string | null;
  functionColor?: string | null;
} | null): TLessonWordRole {
  if (!encounter) {
    return null;
  }

  return (
    functionalRoleToLessonRole(encounter.functionalRole) ??
    functionColorToLessonRole(encounter.functionColor)
  );
}

/** Annotate chaque token d'une forme / phrase avec un rôle uniforme (couleurs Leçons). */
export function buildLessonWordsWithRole(
  russian: string,
  role: TLessonWordRole,
): TLessonExampleWord[] {
  if (!role) {
    return [];
  }

  return tokenizeSentence(russian)
    .map((token) => normalizeToken(token))
    .filter(Boolean)
    .map((text) => ({ text, role }));
}

/**
 * Colorie les tokens qui matchent la surface rencontrée (accents ignorés).
 */
export function buildLessonWordsHighlightingSurface(
  russian: string,
  surface: string | null | undefined,
  role: TLessonWordRole,
): TLessonExampleWord[] {
  if (!role || !surface?.trim()) {
    return [];
  }

  const target = normalizeToken(surface).toLowerCase().replace(/\u0301/g, "");

  return tokenizeSentence(russian)
    .map((token) => normalizeToken(token))
    .filter(Boolean)
    .map((text) => {
      const normalized = text.toLowerCase().replace(/\u0301/g, "");
      const matches =
        normalized === target ||
        target.includes(normalized) ||
        normalized.includes(target);

      return { text, role: matches ? role : null };
    });
}

const CYRILLIC_PATTERN = /[\u0400-\u04FF\u0301]/;

export function containsCyrillic(text: string): boolean {
  return CYRILLIC_PATTERN.test(text);
}
