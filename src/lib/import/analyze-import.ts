import { detectRussian } from "./detect-language";
import { estimateLevel } from "./estimate-level";
import { cleanImportText } from "./normalize";
import {
  countSentences,
  countWords,
  estimateReadingTimeMinutes,
} from "./stats";
import type {
  AnalyzeImportResult,
  ImportInput,
  ImportPreview,
  ImportStats,
} from "./types";
import { validateImportLimits, validateRawInput } from "./validate";
import { collectWarnings } from "./warnings";
import { splitIntoSentences } from "../utils/russian";

/**
 * Construit la preview à partir d'un texte déjà normalisé et validé (cyrillique).
 * Réutilisable par l'API après re-normalisation ou par des tests ciblés.
 */
export function buildImportPreview(normalizedText: string): ImportPreview {
  const detection = detectRussian(normalizedText);
  const sentences = splitIntoSentences(normalizedText);
  const effectiveSentences =
    sentences.length > 0 ? sentences : normalizedText.trim() ? [normalizedText.trim()] : [];
  const wordCount = countWords(normalizedText);
  const sentenceCount = effectiveSentences.length;
  const readingTime = estimateReadingTimeMinutes(wordCount);

  return {
    detectedLanguage: detection.detectedLanguage,
    isRussian: detection.isRussian,
    estimatedLevel: estimateLevel(normalizedText, wordCount, sentenceCount),
    sentenceCount,
    wordCount,
    readingTime,
    normalizedText,
    annotatedSentences: effectiveSentences.map((text) => ({ text })),
    warnings: collectWarnings(normalizedText, wordCount, effectiveSentences),
  };
}

function toStats(normalizedText: string): ImportStats {
  const sentences = splitIntoSentences(normalizedText);
  const sentenceCount =
    sentences.length > 0 ? sentences.length : normalizedText.trim() ? 1 : 0;

  return {
    wordCount: countWords(normalizedText),
    sentenceCount,
    charLength: normalizedText.length,
  };
}

/**
 * Moteur d'analyse import — pur, sans HTTP ni Supabase.
 * Point d'entrée unique pour API, CLI, tests et futurs batch importers.
 */
export function analyzeImport(input: ImportInput): AnalyzeImportResult {
  const rawErrors = validateRawInput(input.rawText);

  if (rawErrors.length > 0) {
    return { ok: false, errors: rawErrors };
  }

  const normalizedText = cleanImportText(input.rawText);

  if (!normalizedText) {
    return { ok: false, errors: validateRawInput("") };
  }

  const detection = detectRussian(normalizedText);

  if (!detection.isRussian) {
    return {
      ok: false,
      errors: [
        {
          code: "NOT_RUSSIAN",
          message:
            "Ce texte ne semble pas être en russe. Rossiyani importe uniquement des textes en cyrillique.",
        },
      ],
    };
  }

  const limitErrors = validateImportLimits(toStats(normalizedText));

  if (limitErrors.length > 0) {
    return { ok: false, errors: limitErrors };
  }

  return { ok: true, preview: buildImportPreview(normalizedText) };
}
