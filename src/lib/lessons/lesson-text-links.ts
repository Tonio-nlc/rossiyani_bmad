import type { TFunctionColor } from "@/types/orchestrator";
import type {
  TLessonLink,
  TLessonRelatedText,
  TTextLink,
} from "@/types/lessons";

export const LES_SIX_CAS_PATH_SLUG = "les-six-cas";

/** Rôle fonctionnel Reader → leçon du parcours Les six cas */
export const FUNCTION_COLOR_TO_LESSON_SLUG: Partial<
  Record<TFunctionColor, string>
> = {
  blue: "nominatif",
  coral: "accusatif",
  green: "prepositionnel",
  violet: "genitif",
  amber: "datif",
};

export function textTitleInRelatedTexts(
  relatedTexts: TLessonRelatedText[],
  textTitle: string,
): boolean {
  return relatedTexts.some((entry) => entry.textTitle === textTitle);
}

export function sortLessonLinks(links: TLessonLink[]): TLessonLink[] {
  return [...links].sort((a, b) => a.orderIndex - b.orderIndex);
}

export function resolveExplorerLessonLink(
  lessonsForText: TLessonLink[],
  functionColor: string | undefined,
): TLessonLink | null {
  if (!functionColor) {
    return null;
  }

  const lessonSlug =
    FUNCTION_COLOR_TO_LESSON_SLUG[functionColor as TFunctionColor];

  if (!lessonSlug) {
    return null;
  }

  return lessonsForText.find((link) => link.lessonSlug === lessonSlug) ?? null;
}

export function buildExplorerLessonLinksMap(
  lessonsForText: TLessonLink[],
): Partial<Record<TFunctionColor, TLessonLink>> {
  const map: Partial<Record<TFunctionColor, TLessonLink>> = {};

  for (const [color, slug] of Object.entries(FUNCTION_COLOR_TO_LESSON_SLUG)) {
    const link = lessonsForText.find((lesson) => lesson.lessonSlug === slug);
    if (link) {
      map[color as TFunctionColor] = link;
    }
  }

  return map;
}

export function relatedTextsToTextLinks(
  relatedTexts: TLessonRelatedText[],
  textsByTitle: Map<string, { id: string }>,
): TTextLink[] {
  const links: TTextLink[] = [];

  for (const entry of relatedTexts) {
    const text = textsByTitle.get(entry.textTitle);
    if (!text) {
      continue;
    }

    links.push({
      textId: text.id,
      textTitle: entry.textTitle,
      goldNumber: entry.goldNumber,
    });
  }

  return links;
}
