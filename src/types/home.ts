export interface THomeReadingText {
  id: string;
  title: string;
  level: string;
  collection: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export interface THomeCurrentReading {
  text: THomeReadingText;
  percentRead: number;
}

export interface THomeRecentText extends THomeReadingText {
  percentRead: number;
}

export interface THomeData {
  currentReading: THomeCurrentReading | null;
  recentTexts: THomeRecentText[];
  wordsCount: number;
  reviewCount: number;
  streak: number;
  wordsExploredTotal: number;
  wordsToday: number;
}
