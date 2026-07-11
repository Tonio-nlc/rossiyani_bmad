export type TLessonWordRole =
  | "subject"
  | "object"
  | "place"
  | "possession"
  | "recipient"
  | null;

export interface TLessonExampleWord {
  text: string;
  role: TLessonWordRole;
}

export type TContentBlock =
  | { type: "paragraph"; text: string }
  | {
      type: "example";
      russian: string;
      translation: string;
      words: TLessonExampleWord[];
      note: string;
    }
  | {
      type: "comparison";
      title: string;
      columns: string[];
      rows: { label: string; values: string[] }[];
    }
  | { type: "schema"; svgContent: string; caption: string }
  | { type: "callout"; text: string }
  | { type: "takeaways"; items: string[] };

export interface TLessonPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  levelRange: string;
  color: string;
  orderIndex: number;
  lessonCount: number;
  completedCount: number;
}

export interface TLessonSummary {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  summary: string;
  completed: boolean;
}

export interface TLessonPathWithLessons extends TLessonPath {
  lessons: TLessonSummary[];
}

export interface TLesson {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  contentBlocks: TContentBlock[];
  path: {
    slug: string;
    title: string;
    color: string;
  };
  completed: boolean;
}
