import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  resolveCuratedFactPromptHint,
  resolvePronounCuratedFact,
} from "./resolve-reader-concept";

describe("resolveCuratedFactPromptHint", () => {
  it("pronom : délègue au fait pronom (FAIT GRAMMATICAL CERTAIN + cas)", () => {
    const hint = resolveCuratedFactPromptHint({
      surface: "меня́",
      sentence: "У меня́ боли́т го́рло.",
    });

    assert.ok(hint);
    assert.match(hint!, /FAIT GRAMMATICAL CERTAIN/);
    assert.match(hint!, /PRONOM PERSONNEL « я »/);
    assert.match(hint!, /у \+ génitif/);
  });

  it("после + génitif : contrainte absolue postériorité temporelle (pas un lieu)", () => {
    const hint = resolveCuratedFactPromptHint({
      surface: "булочной",
      sentence: "После булочной они идут домой.",
    });

    assert.ok(hint);
    assert.match(hint!, /FAIT GRAMMATICAL CERTAIN/);
    assert.match(hint!, /после/);
    assert.match(hint!, /postériorité temporelle/);
    assert.match(hint!, /jamais de « lieu »/i);
  });

  it("numéral + génitif : quantité comptée", () => {
    const hint = resolveCuratedFactPromptHint({
      surface: "часо́в",
      sentence: "Сейча́с де́сять часо́в.",
    });

    assert.ok(hint);
    assert.match(hint!, /quantité comptée/);
  });

  it("без + génitif : privation", () => {
    const hint = resolveCuratedFactPromptHint({
      surface: "хлеба",
      sentence: "Без хлеба нельзя.",
    });

    assert.ok(hint);
    assert.match(hint!, /privation/);
  });

  it("из + génitif : provenance", () => {
    const hint = resolveCuratedFactPromptHint({
      surface: "магазина",
      sentence: "Из магазина выходит Анна.",
    });

    assert.ok(hint);
    assert.match(hint!, /из/);
    assert.match(hint!, /provenance/);
  });

  it("expression figée до свидания", () => {
    const hint = resolveCuratedFactPromptHint({
      surface: "свида́ния",
      sentence: "До свида́ния!",
    });

    assert.ok(hint);
    assert.match(hint!, /expression figée/);
  });

  it("sans déclencheur : undefined (adnominal / hors table)", () => {
    const hint = resolveCuratedFactPromptHint({
      surface: "кни́ги",
      sentence: "Страни́цы кни́ги интере́сны.",
    });

    assert.equal(hint, undefined);
  });

  it("cohérent avec resolvePronounCuratedFact quand pronom", () => {
    const fact = resolvePronounCuratedFact({
      surface: "меня́",
      sentence: "У меня́ боли́т го́рло.",
    });
    const hint = resolveCuratedFactPromptHint({
      surface: "меня́",
      sentence: "У меня́ боли́т го́рло.",
    });

    assert.ok(fact);
    assert.ok(hint?.includes(fact!.lemma));
  });
});
