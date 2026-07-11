import { IMPORT_LIMITS } from "./constants";
import { hasInvalidControlCharacters } from "./normalize";
import type {
  ImportError,
  ImportErrorCode,
  ImportLimitsOptions,
  ImportStats,
} from "./types";

const ERROR_MESSAGES: Record<ImportErrorCode, string> = {
  EMPTY_TEXT: "Le texte est vide.",
  TEXT_TOO_LARGE: `Le texte dépasse ${IMPORT_LIMITS.maxChars.toLocaleString("fr-FR")} caractères.`,
  INVALID_CHARACTERS: "Le texte contient des caractères non valides.",
  NOT_RUSSIAN:
    "Ce texte ne semble pas être en russe. Rossiyani importe uniquement des textes en cyrillique.",
  TOO_FEW_WORDS: `Le texte doit contenir au moins ${IMPORT_LIMITS.minWords} mots.`,
  TOO_MANY_WORDS: `Le texte ne peut pas dépasser ${IMPORT_LIMITS.maxWords.toLocaleString("fr-FR")} mots.`,
  TOO_MANY_SENTENCES: `Le texte ne peut pas dépasser ${IMPORT_LIMITS.maxSentences} phrases.`,
  IMPORT_QUOTA_EXCEEDED: `Vous avez atteint la limite de ${IMPORT_LIMITS.maxImportsPerUser} textes importés.`,
  DAILY_IMPORT_LIMIT_EXCEEDED: `Vous avez atteint la limite de ${IMPORT_LIMITS.maxImportsPerDay} imports par jour.`,
};

function makeError(code: ImportErrorCode): ImportError {
  return { code, message: ERROR_MESSAGES[code] };
}

export function validateRawInput(rawText: string): ImportError[] {
  const errors: ImportError[] = [];

  if (!rawText.trim()) {
    errors.push(makeError("EMPTY_TEXT"));
    return errors;
  }

  if (hasInvalidControlCharacters(rawText)) {
    errors.push(makeError("INVALID_CHARACTERS"));
  }

  if (rawText.length > IMPORT_LIMITS.maxChars) {
    errors.push(makeError("TEXT_TOO_LARGE"));
  }

  return errors;
}

export function validateImportLimits(
  stats: ImportStats,
  options: ImportLimitsOptions = {},
): ImportError[] {
  const errors: ImportError[] = [];

  if (stats.charLength > IMPORT_LIMITS.maxChars) {
    errors.push(makeError("TEXT_TOO_LARGE"));
  }

  if (stats.wordCount < IMPORT_LIMITS.minWords) {
    errors.push(makeError("TOO_FEW_WORDS"));
  }

  if (stats.wordCount > IMPORT_LIMITS.maxWords) {
    errors.push(makeError("TOO_MANY_WORDS"));
  }

  if (stats.sentenceCount > IMPORT_LIMITS.maxSentences) {
    errors.push(makeError("TOO_MANY_SENTENCES"));
  }

  if (
    options.userImportCount !== undefined &&
    options.userImportCount >= IMPORT_LIMITS.maxImportsPerUser
  ) {
    errors.push(makeError("IMPORT_QUOTA_EXCEEDED"));
  }

  if (
    options.userDailyImportCount !== undefined &&
    options.userDailyImportCount >= IMPORT_LIMITS.maxImportsPerDay
  ) {
    errors.push(makeError("DAILY_IMPORT_LIMIT_EXCEEDED"));
  }

  return errors;
}
