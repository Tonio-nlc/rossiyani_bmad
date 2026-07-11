import type { TLessonSectionId } from "@/lib/lessons/group-lesson-sections";
import {
  LESSON_PARAGRAPH_GAP_CLASS,
  LESSON_SECTION_GAP_CLASS,
  LESSON_SUBCONTENT_GAP_CLASS,
} from "@/lib/design/lesson-composition";

export type TLessonSectionHeaderTone =
  | "chapter"
  | "impact"
  | "conversation"
  | "standard"
  | "step"
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

/** Échelle unique : section 40px · sous-contenu 24px · paragraphes 16px */
export const LESSON_SECTION_RHYTHM: Record<
  TLessonSectionId,
  TLessonSectionRhythm
> = {
  question: {
    marginTop: "mt-0",
    marginBottom: "mb-0",
    headerTone: "impact",
    contentSpacing: LESSON_PARAGRAPH_GAP_CLASS,
    contentMaxWidth: "max-w-reading",
    showSeparator: false,
  },
  intuition: {
    marginTop: LESSON_SECTION_GAP_CLASS,
    marginBottom: "mb-0",
    headerTone: "conversation",
    contentSpacing: LESSON_PARAGRAPH_GAP_CLASS,
    contentMaxWidth: "max-w-reading",
    showSeparator: false,
  },
  exemple: {
    marginTop: LESSON_SECTION_GAP_CLASS,
    marginBottom: "mb-0",
    headerTone: "standard",
    contentSpacing: LESSON_SUBCONTENT_GAP_CLASS,
    contentMaxWidth: "max-w-reading",
    showSeparator: false,
  },
  comprendre: {
    marginTop: LESSON_SECTION_GAP_CLASS,
    marginBottom: "mb-0",
    headerTone: "step",
    contentSpacing: LESSON_PARAGRAPH_GAP_CLASS,
    contentMaxWidth: "max-w-reading",
    showSeparator: false,
  },
  schema: {
    marginTop: LESSON_SECTION_GAP_CLASS,
    marginBottom: "mb-0",
    headerTone: "hidden",
    contentSpacing: "space-y-0",
    contentMaxWidth: "max-w-reading",
    showSeparator: false,
  },
  retenir: {
    marginTop: "mt-16 md:mt-20",
    marginBottom: "mb-0",
    headerTone: "conclusion",
    contentSpacing: "space-y-0",
    contentMaxWidth: "max-w-reading",
    showSeparator: false,
  },
};
