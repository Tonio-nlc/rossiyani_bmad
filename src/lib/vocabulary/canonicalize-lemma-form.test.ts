import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertLemmaFormCharset,
  canonicalizeLemmaForm,
  countRussianVowels,
  hasStressMark,
  isAllowedLemmaFormCharset,
  shouldReuseExistingAccentedLemma,
  stripMonosyllableStress,
  stripStressMark,
} from "./canonicalize-lemma-form";

describe("canonicalizeLemmaForm", () => {
  it("normalise en NFC et retire les espaces de bord", () => {
    assert.equal(canonicalizeLemmaForm("  вагон  "), "вагон");
    assert.equal(canonicalizeLemmaForm("ваго́н"), "ваго́н".normalize("NFC"));
  });
});

describe("hasStressMark", () => {
  it("détecte l'absence d'accent", () => {
    assert.equal(hasStressMark("вагон"), false);
  });

  it("détecte la présence d'un accent tonique (U+0301)", () => {
    assert.equal(hasStressMark("ваго́н"), true);
    assert.equal(hasStressMark("му́ка"), true);
    assert.equal(hasStressMark("мука́"), true);
  });
});

describe("stripStressMark", () => {
  it("retire uniquement l'accent, laisse une forme nue inchangée", () => {
    assert.equal(stripStressMark("вагон"), "вагон");
    assert.equal(stripStressMark("ваго́н"), "вагон");
  });

  it("gère un accent placé sur la toute première lettre", () => {
    assert.equal(stripStressMark("и́мя"), "имя");
  });

  it("ne fusionne PAS deux mots réellement différents : une paire minimale " +
    "accent-distinctive (му́ка/мука́) donne la MÊME base une fois l'accent " +
    "retiré, mais les deux formes originales restent distinctes l'une de " +
    "l'autre (c'est à l'appelant de ne jamais les traiter comme équivalentes " +
    "quand les deux portent un accent — voir resolveOrCreateLemma)", () => {
    assert.equal(stripStressMark("му́ка"), stripStressMark("мука́"));
    assert.notEqual("му́ка", "мука́");
  });
});

describe("assertLemmaFormCharset", () => {
  it("accepte cyrillique, trait d'union et U+0301", () => {
    assert.equal(isAllowedLemmaFormCharset("ваго́н"), true);
    assert.equal(isAllowedLemmaFormCharset("по-французски"), true);
    assert.equal(isAllowedLemmaFormCharset("я"), true);
  });

  it("rejette les homoglyphes latins (c, a, á)", () => {
    assert.equal(isAllowedLemmaFormCharset("садитьcя"), false);
    assert.equal(isAllowedLemmaFormCharset("двa"), false);
    assert.equal(isAllowedLemmaFormCharset("знáть"), false);
    assert.throws(
      () => assertLemmaFormCharset("садитьcя"),
      /Lemme rejeté/,
    );
  });
});

describe("countRussianVowels / stripMonosyllableStress", () => {
  it("compte les voyelles, pas les caractères (вста́ть = 1)", () => {
    assert.equal(countRussianVowels("вста́ть"), 1);
    assert.equal(countRussianVowels("встать"), 1);
    assert.equal(countRussianVowels("пить"), 1);
    assert.equal(countRussianVowels("я́"), 1);
    assert.equal(countRussianVowels("Я"), 1);
  });

  it("retire U+0301 sur monosyllabe, y compris après NFC", () => {
    const nfc = canonicalizeLemmaForm("вста́ть");
    assert.equal(stripMonosyllableStress(nfc), "встать");
    assert.equal(stripMonosyllableStress(canonicalizeLemmaForm("пи́ть")), "пить");
    assert.equal(stripMonosyllableStress(canonicalizeLemmaForm("я́")), "я");
    assert.equal(stripMonosyllableStress(canonicalizeLemmaForm("де́нь")), "день");
  });

  it("ne touche pas les polysyllabes ni les paires accent-distinctives", () => {
    assert.equal(countRussianVowels("му́ка"), 2);
    assert.equal(countRussianVowels("мука́"), 2);
    assert.equal(countRussianVowels("бо́леть"), 2);
    assert.equal(countRussianVowels("боле́ть"), 2);
    assert.equal(stripMonosyllableStress("му́ка"), "му́ка");
    assert.equal(stripMonosyllableStress("мука́"), "мука́");
    assert.equal(stripMonosyllableStress("бо́леть"), "бо́леть");
    assert.equal(stripMonosyllableStress("боле́ть"), "боле́ть");
  });
});

describe("shouldReuseExistingAccentedLemma", () => {
  it("réutilise quand une seule forme accentuée existe avec un accent différent", () => {
    assert.equal(
      shouldReuseExistingAccentedLemma("бо́леть", ["боле́ть"]),
      true,
    );
    assert.equal(
      shouldReuseExistingAccentedLemma("и́дти", ["идти́"]),
      true,
    );
  });

  it("ne réutilise pas si la forme est déjà exacte (géré en amont)", () => {
    assert.equal(
      shouldReuseExistingAccentedLemma("боле́ть", ["боле́ть"]),
      false,
    );
  });

  it("ne réutilise pas une forme nue entrante", () => {
    assert.equal(
      shouldReuseExistingAccentedLemma("болеть", ["боле́ть"]),
      false,
    );
  });

  it("ne choisit pas arbitrairement si plusieurs accents coexistent déjà", () => {
    assert.equal(
      shouldReuseExistingAccentedLemma("мука́", ["му́ка", "мука́"]),
      false,
    );
    assert.equal(
      shouldReuseExistingAccentedLemma("му́ка", ["му́ка", "мука́"]),
      false,
    );
  });

  it("ne réutilise pas s'il n'y a aucune forme accentuée existante", () => {
    assert.equal(shouldReuseExistingAccentedLemma("боле́ть", []), false);
  });
});
