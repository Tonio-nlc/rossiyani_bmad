import type { TLessonSectionId } from "@/lib/lessons/group-lesson-sections";

export type TLessonSectionHeaderTone =
  | "chapter"
  | "impact"
  | "conversation"
  | "standard"
  | "hidden"
  | "climax"
  | "conclusion";

export interface TLessonSectionRhythm {
  marginTop: string;
  marginBottom: string;
  headerTone: TLessonSectionHeaderTone;
  contentSpacing: string;
  contentMaxWidth?: string;
  showSeparator: boolean;
}

export const LESSON_SECTION_RHYTHM: Record<
  TLessonSectionId,
  TLessonSectionRhythm
> = {
  question: {
    marginTop: "mt-2",
    marginBottom: "mb-14 md:mb-16",
    headerTone: "impact",
    contentSpacing: "space-y-7 md:space-y-8",
    contentMaxWidth: "max-w-[34rem]",
    showSeparator: false,
  },
  intuition: {
    marginTop: "mt-10 md:mt-12",
    marginBottom: "mb-16 md:mb-20",
    headerTone: "conversation",
    contentSpacing: "space-y-6 md:space-y-7",
    contentMaxWidth: "max-w-[32rem]",
    showSeparator: false,
  },
  exemple: {
    marginTop: "mt-14 md:mt-16",
    marginBottom: "mb-16 md:mb-20",
    headerTone: "standard",
    contentSpacing: "space-y-8 md:space-y-10",
    showSeparator: false,
  },
  comprendre: {
    marginTop: "mt-14 md:mt-16",
    marginBottom: "mb-16 md:mb-20",
    headerTone: "standard",
    contentSpacing: "space-y-6 md:space-y-7",
    contentMaxWidth: "max-w-[34rem]",
    showSeparator: false,
  },
  schema: {
    marginTop: "mt-20 md:mt-24",
    marginBottom: "mb-20 md:mb-24",
    headerTone: "climax",
    contentSpacing: "space-y-0",
    showSeparator: false,
  },
  retenir: {
    marginTop: "mt-24 md:mt-28",
    marginBottom: "mb-4",
    headerTone: "conclusion",
    contentSpacing: "space-y-0",
    contentMaxWidth: "max-w-[34rem]",
    showSeparator: false,
  },
};
