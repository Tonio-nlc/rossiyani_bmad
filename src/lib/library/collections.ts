export interface TCollection {
  id: string;
  name: string;
  description: string;
  level: string;
  textCount: number;
}

export const COLLECTIONS: TCollection[] = [
  {
    id: "everyday_russian",
    name: "Everyday Russian",
    description:
      "Textes courts pour la vie quotidienne — métro, courses, conversations.",
    level: "A1",
    textCount: 5,
  },
  {
    id: "stories",
    name: "Russian Stories",
    description:
      "Contes, nouvelles et récits pour progresser en contexte narratif.",
    level: "A1-A2",
    textCount: 0,
  },
  {
    id: "dialogues",
    name: "Dialogues",
    description:
      "Conversations et échanges pour entraîner l'oral et le registre parlé.",
    level: "A1-B1",
    textCount: 0,
  },
  {
    id: "slow_news",
    name: "Slow News",
    description: "Actualités simplifiées pour lire l'information en russe.",
    level: "B1-B2",
    textCount: 0,
  },
  {
    id: "travel",
    name: "Travel Russian",
    description: "Voyage, transports et situations pratiques sur le terrain.",
    level: "A2-B1",
    textCount: 0,
  },
  {
    id: "culture",
    name: "Russian Culture",
    description:
      "Culture, traditions et références pour comprendre le contexte russe.",
    level: "Tous niveaux",
    textCount: 0,
  },
];

export const COLLECTION_LABELS: Record<string, string> = {
  everyday_russian: "Vie quotidienne",
  stories: "Contes et histoires",
  dialogues: "Dialogues",
  slow_news: "Actualités",
  travel: "Voyage",
  culture: "Culture",
  imported: "Mes imports",
};

export const COLLECTION_BORDER_COLORS: Record<string, string> = {
  everyday_russian: "#4F46E5",
  stories: "#10B981",
  dialogues: "#F59E0B",
  slow_news: "#EF4444",
  travel: "#06B6D4",
  culture: "#8B5CF6",
};

export const COLLECTION_COLORS: Record<string, string> = {
  everyday_russian: "#1E3A5F",
  stories: "#7C3AED",
  dialogues: "#059669",
  slow_news: "#B45309",
  travel: "#0EA5E9",
  culture: "#DB2777",
};

export const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
