import type { TLessonWordRole } from "@/types/lessons";
import type { TReaderFunctionColor } from "@/lib/utils/russian";

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

export function lessonRoleToFunctionColor(
  role: TLessonWordRole,
): TReaderFunctionColor | undefined {
  if (!role) {
    return undefined;
  }

  return ROLE_COLOR_MAP[role];
}

const CYRILLIC_PATTERN = /[\u0400-\u04FF\u0301]/;

export function containsCyrillic(text: string): boolean {
  return CYRILLIC_PATTERN.test(text);
}
