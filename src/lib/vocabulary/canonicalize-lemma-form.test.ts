import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canonicalizeLemmaForm,
  hasStressMark,
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
