import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getPronounCaseCandidates, isCuratedPronounSurface } from "./pronouns";

describe("isCuratedPronounSurface", () => {
  it("reconnaît toutes les formes du paradigme fermé (avec et sans accent)", () => {
    const forms = [
      "я", "меня́", "меня", "мне", "мной",
      "ты", "тебя́", "тебе́", "тобо́й",
      "он", "его́", "него́", "ему́", "нему́", "им", "ним", "нём",
      "она́", "её", "неё", "ей", "ней",
      "оно́",
      "мы", "нас", "нам", "на́ми",
      "вы", "вас", "вам", "ва́ми",
      "они́", "их", "них", "и́ми", "ни́ми",
      "себя́", "себе́", "собо́й",
    ];

    for (const form of forms) {
      assert.equal(isCuratedPronounSurface(form), true, `${form} devrait être curé`);
    }
  });

  it("ne reconnaît pas un mot hors paradigme", () => {
    assert.equal(isCuratedPronounSurface("кни́га"), false);
    assert.equal(isCuratedPronounSurface("нашёл"), false);
    assert.equal(isCuratedPronounSurface("никто́"), false);
  });

  it("match malgré ponctuation / majuscule (normalizeToken + stripStressMarks)", () => {
    assert.equal(isCuratedPronounSurface("меня́."), true);
    assert.equal(isCuratedPronounSurface("Меня́"), true);
    assert.equal(isCuratedPronounSurface("нас,"), true);
    assert.equal(isCuratedPronounSurface("него́ !"), true);
  });
});

describe("getPronounCaseCandidates", () => {
  it("меня́ : génitif ET accusatif (syncrétisme я)", () => {
    assert.deepEqual(
      new Set(getPronounCaseCandidates("меня́")),
      new Set(["genitive", "accusative"]),
    );
  });

  it("мне : datif ET prépositionnel (même forme)", () => {
    assert.deepEqual(
      new Set(getPronounCaseCandidates("мне")),
      new Set(["dative", "prepositional"]),
    );
  });

  it("него́ (variante н-) : génitif ET accusatif, comme его́", () => {
    assert.deepEqual(
      new Set(getPronounCaseCandidates("него́")),
      new Set(["genitive", "accusative"]),
    );
  });

  it("ней : datif, instrumental ET prépositionnel (triple syncrétisme она́)", () => {
    assert.deepEqual(
      new Set(getPronounCaseCandidates("ней")),
      new Set(["dative", "instrumental", "prepositional"]),
    );
  });

  it("нас : génitif, accusatif ET prépositionnel (triple syncrétisme мы)", () => {
    assert.deepEqual(
      new Set(getPronounCaseCandidates("нас")),
      new Set(["genitive", "accusative", "prepositional"]),
    );
  });

  it("них : génitif, accusatif ET prépositionnel (triple syncrétisme они́)", () => {
    assert.deepEqual(
      new Set(getPronounCaseCandidates("них")),
      new Set(["genitive", "accusative", "prepositional"]),
    );
  });

  it("себя́ : génitif ET accusatif, jamais nominatif (pas de sujet réfléchi)", () => {
    assert.deepEqual(
      new Set(getPronounCaseCandidates("себя́")),
      new Set(["genitive", "accusative"]),
    );
  });

  it("nominatifs : un seul cas candidat", () => {
    for (const nominative of ["я", "ты", "он", "она́", "оно́", "мы", "вы", "они́"]) {
      assert.deepEqual(getPronounCaseCandidates(nominative), ["nominative"]);
    }
  });

  it("mot hors paradigme : liste vide", () => {
    assert.deepEqual(getPronounCaseCandidates("стол"), []);
  });
});
