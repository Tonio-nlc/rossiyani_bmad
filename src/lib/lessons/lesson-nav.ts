import { buildReturnQuery } from "@/lib/navigation/return-context";

export function buildLessonsReturnQuery(
  from?: string,
  textId?: string,
): string {
  if (from && textId) {
    return buildReturnQuery(from, textId);
  }

  return "";
}

export function lessonsIndexHref(from?: string, textId?: string): string {
  return `/lessons${buildLessonsReturnQuery(from, textId)}`;
}

export function lessonPathHref(
  pathSlug: string,
  from?: string,
  textId?: string,
): string {
  return `/lessons/${pathSlug}${buildLessonsReturnQuery(from, textId)}`;
}

export function lessonHref(
  pathSlug: string,
  lessonSlug: string,
  from?: string,
  textId?: string,
): string {
  return `/lessons/${pathSlug}/${lessonSlug}${buildLessonsReturnQuery(from, textId)}`;
}
