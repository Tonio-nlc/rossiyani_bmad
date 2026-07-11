import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  analyzeImport,
  buildImportPreview,
  cleanImportText,
  detectRussian,
  IMPORT_LIMITS,
  validateImportLimits,
} from "./index";

const RUSSIAN_SAMPLE = [
  "Луи приходит к университету рано.",
  "Анна уже там и ждёт его у входа.",
  "Они идут в аудиторию вместе с другими студентами.",
  "Преподаватель говорит по-русски очень спокойно.",
  "Студенты слушают, пишут в тетрадях и задают вопросы.",
  "Урок кажется трудным, но очень интересным для всех.",
].join(" ");

const FRENCH_SAMPLE =
  "Bonjour, je m'appelle Marie. Je vis à Paris et j'apprends le russe depuis deux ans.";

function makeLongRussianText(wordTarget: number): string {
  const chunk =
    "Студент читает интересную книгу в библиотеке университета каждый день. ";
  let text = "";

  while (text.split(/\s+/).filter(Boolean).length < wordTarget) {
    text += chunk;
  }

  return text.trim();
}

describe("analyzeImport", () => {
  it("rejette un texte vide", () => {
    const result = analyzeImport({ rawText: "   ", source: "paste" });

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.errors[0]?.code, "EMPTY_TEXT");
    }
  });

  it("rejette un texte français", () => {
    const result = analyzeImport({ rawText: FRENCH_SAMPLE, source: "paste" });

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.errors[0]?.code, "NOT_RUSSIAN");
    }
  });

  it("analyse un texte russe valide", () => {
    const result = analyzeImport({ rawText: RUSSIAN_SAMPLE, source: "paste" });

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(result.preview.isRussian, true);
      assert.equal(result.preview.detectedLanguage, "ru");
      assert.ok(result.preview.wordCount >= IMPORT_LIMITS.minWords);
      assert.ok(result.preview.sentenceCount >= 6);
      assert.ok(result.preview.readingTime >= 1);
      assert.equal(
        result.preview.annotatedSentences.length,
        result.preview.sentenceCount,
      );
      assert.equal(
        result.preview.annotatedSentences[0]?.text,
        "Луи приходит к университету рано.",
      );
      assert.ok(!("translationFr" in (result.preview.annotatedSentences[0] ?? {})));
    }
  });

  it("rejette un texte trop court", () => {
    const result = analyzeImport({
      rawText: "Привет мир.",
      source: "paste",
    });

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.errors[0]?.code, "TOO_FEW_WORDS");
    }
  });

  it("rejette un texte trop long", () => {
    const result = analyzeImport({
      rawText: makeLongRussianText(IMPORT_LIMITS.maxWords + 1),
      source: "txt",
    });

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.errors[0]?.code, "TOO_MANY_WORDS");
    }
  });

  it("rejette un texte dépassant la taille brute", () => {
    const result = analyzeImport({
      rawText: "а".repeat(IMPORT_LIMITS.maxChars + 1),
      source: "paste",
    });

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.errors[0]?.code, "TEXT_TOO_LARGE");
    }
  });

  it("normalise le texte via cleanImportText", () => {
    const raw = `  Луи\u0301   прихо\u0301дит\n\nк университе\u0301ту. ${"Анна уже там и читает книгу в университете. ".repeat(8)}`;
    const result = analyzeImport({ rawText: raw, source: "paste" });

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(result.preview.normalizedText, cleanImportText(raw));
      assert.ok(!result.preview.normalizedText.includes("  "));
      assert.ok(!result.preview.normalizedText.includes("\n"));
    }
  });

  it("nettoie HTML et espaces excessifs", () => {
    const raw = "<p>Луи   приходит</p>\n\n\nк университету.\nАнна уже там. ".repeat(
      12,
    );
    const cleaned = cleanImportText(raw);

    assert.ok(!cleaned.includes("<p>"));
    assert.ok(!cleaned.includes("  "));
    assert.ok(cleaned.includes("Луи приходит"));
  });

  it("émet des warnings non bloquants pour ponctuation inhabituelle", () => {
    const weird = `${"Студент читает книгу в библиотеке каждый день. ".repeat(6)}@#$ странная пунктуация.`;
    const result = analyzeImport({ rawText: weird, source: "paste" });

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.ok(
        result.preview.warnings.some((warning) => warning.code === "UNUSUAL_PUNCTUATION"),
      );
    }
  });
});

describe("detectRussian", () => {
  it("calcule le ratio cyrillique", () => {
    const detection = detectRussian(RUSSIAN_SAMPLE);

    assert.equal(detection.isRussian, true);
    assert.ok(detection.ratio >= IMPORT_LIMITS.russianCyrillicRatio);
  });
});

describe("validateImportLimits", () => {
  it("valide les quotas utilisateur sans accès DB", () => {
    const quotaErrors = validateImportLimits(
      { wordCount: 100, sentenceCount: 5, charLength: 1000 },
      { userImportCount: 20 },
    );

    assert.equal(quotaErrors[0]?.code, "IMPORT_QUOTA_EXCEEDED");

    const dailyErrors = validateImportLimits(
      { wordCount: 100, sentenceCount: 5, charLength: 1000 },
      { userDailyImportCount: 5 },
    );

    assert.equal(dailyErrors[0]?.code, "DAILY_IMPORT_LIMIT_EXCEEDED");
  });
});

describe("buildImportPreview", () => {
  it("reste utilisable indépendamment après normalisation", () => {
    const normalized = cleanImportText(RUSSIAN_SAMPLE);
    const preview = buildImportPreview(normalized);

    assert.equal(preview.isRussian, true);
    assert.ok(preview.annotatedSentences.length > 0);
  });
});
