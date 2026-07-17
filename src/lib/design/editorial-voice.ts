const SENTENCE_SPLIT_RE = /(?<=[.!?…])\s+/u;

const VOICE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/cette terminaison indique/gi, "Ici, cette terminaison montre"],
  [/cette forme indique/gi, "Ici, cette forme montre"],
  [/ce suffixe indique/gi, "Ici, ce suffixe montre"],
  [/indique que/gi, "montre que"],
  [/\bindique\b/gi, "montre"],
  [/correspond à/gi, "revient à"],
  [/\bcorrespond\b/gi, "revient"],
  [/exprime /gi, "traduit "],
  [/\bmarque\b/gi, "signale"],
  [/ce verbe est utilisé/gi, "on utilise ce verbe"],
  [/ce mot est utilisé/gi, "on utilise ce mot"],
  [/cette forme est utilisée/gi, "on utilise cette forme"],
  [/cette forme permet de/gi, "ici, cette forme permet de"],
];

const CASE_HINTS = [
  "génitif",
  "datif",
  "instrumental",
  "prépositionnel",
  "accusatif",
  "pluriel",
  "autre forme",
] as const;

function capitalizeSentence(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return trimmed;
  }

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

export function rewriteEditorialText(text: string): string {
  let result = text.trim();

  if (!result) {
    return result;
  }

  for (const [pattern, replacement] of VOICE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }

  if (/^cette forme /i.test(result) && !/^ici[,\s]/i.test(result)) {
    result = `Ici, ${result.charAt(0).toLowerCase()}${result.slice(1)}`;
  }

  return capitalizeSentence(result);
}

export function structureExplanation(text: string, maxSteps = 4): string[] {
  const rewritten = rewriteEditorialText(text);
  const sentences = rewritten.split(SENTENCE_SPLIT_RE).filter(Boolean);

  if (sentences.length === 0) {
    return [];
  }

  if (sentences.length <= maxSteps) {
    return sentences.map(rewriteEditorialText);
  }

  const chunkSize = Math.ceil(sentences.length / maxSteps);
  const steps: string[] = [];

  for (let index = 0; index < sentences.length; index += chunkSize) {
    steps.push(
      rewriteEditorialText(sentences.slice(index, index + chunkSize).join(" ")),
    );
  }

  return steps.slice(0, maxSteps);
}

function normalizeTakeawayKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function dedupeEditorialItems(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const key = normalizeTakeawayKey(item);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

export function toSingleLineTakeaway(text: string): string {
  const rewritten = rewriteEditorialText(text);
  const firstSentence = rewritten.split(SENTENCE_SPLIT_RE)[0]?.trim();

  return firstSentence || rewritten;
}

export function selectEditorialChips(
  formChips: string[],
  traitChips: string[],
  max = 4,
): string[] {
  const merged = [...formChips, ...traitChips]
    .map((chip) => chip.trim())
    .filter(Boolean)
    .map((chip) => chip.charAt(0).toUpperCase() + chip.slice(1));

  const seen = new Set<string>();
  const selected: string[] = [];

  for (const chip of merged) {
    const key = chip.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    selected.push(chip);

    if (selected.length >= max) {
      break;
    }
  }

  return selected;
}

export interface TEditorialNextForm {
  surface: string;
  hint: string;
}

export function parseNextFormItem(
  raw: string,
  index: number,
): TEditorialNextForm {
  const trimmed = raw.trim();
  const parenthetical = trimmed.match(/^(.+?)\s*\(([^)]+)\)\s*$/u);
  const dashed = trimmed.match(/^(.+?)\s*[—–-]\s*(.+)$/u);

  if (parenthetical) {
    return {
      surface: parenthetical[1].trim(),
      hint: rewriteEditorialText(parenthetical[2].trim()),
    };
  }

  if (dashed) {
    return {
      surface: dashed[1].trim(),
      hint: rewriteEditorialText(dashed[2].trim()),
    };
  }

  return {
    surface: trimmed,
    hint: CASE_HINTS[index] ?? "forme à reconnaître",
  };
}

export function buildExampleReason(
  translation: string | null,
  takeaway: string | null,
): string {
  if (takeaway) {
    return toSingleLineTakeaway(takeaway);
  }

  if (translation) {
    return rewriteEditorialText(
      `Dans cette phrase, tu remarqueras comment la forme s'intègre naturellement : ${translation.charAt(0).toLowerCase()}${translation.slice(1)}`,
    );
  }

  return "Ici, tu vois comment cette forme apparaît dans une phrase réelle.";
}
