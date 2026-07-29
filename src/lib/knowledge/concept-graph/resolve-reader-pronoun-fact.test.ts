import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildPronounFactPromptHint,
  resolvePronounCuratedFact,
} from "./resolve-reader-concept";

/**
 * Vérification du ticket "Prose LLM des pronoms" : le fait curé (lemme + cas)
 * doit être résolu AVANT l'appel LLM et la consigne de prompt qui en découle
 * ne doit jamais laisser la porte ouverte à un "possessif" pour un pronom
 * personnel qui ne peut structurellement pas l'être (я, ты, мы, вы, себя́).
 */
describe("resolvePronounCuratedFact", () => {
  it("меня́ après у (У меня́ боли́т го́рло) → lemme я, génitif, préposition у", () => {
    const fact = resolvePronounCuratedFact({
      surface: "меня́",
      sentence: "У меня́ боли́т го́рло.",
    });

    assert.deepEqual(fact, {
      lemma: "я",
      morphologicalCase: "genitive",
      governingPreposition: "у",
    });
  });

  it("тебя́ isolé (А тебя́?) → lemme ты, sans préposition", () => {
    const fact = resolvePronounCuratedFact({
      surface: "тебя́",
      sentence: "Меня́ зову́т А́нна. А тебя́?",
    });

    assert.equal(fact?.lemma, "ты");
  });

  it("его́ objet direct (А́нна уже́ ждёт его́) → lemme он, accusatif", () => {
    const fact = resolvePronounCuratedFact({
      surface: "его́",
      sentence: "А́нна уже́ ждёт его́ внутри́.",
    });

    assert.deepEqual(fact, {
      lemma: "он",
      morphologicalCase: "accusative",
      governingPreposition: null,
    });
  });

  it("mot hors paradigme (nom commun) → null", () => {
    const fact = resolvePronounCuratedFact({
      surface: "кни́га",
      sentence: "Кни́га на столе́.",
    });

    assert.equal(fact, null);
  });
});

describe("buildPronounFactPromptHint", () => {
  it("interdit explicitement le mot 'possessif' pour un lemme jamais possessif (меня́ → я)", () => {
    const fact = resolvePronounCuratedFact({
      surface: "меня́",
      sentence: "У меня́ боли́т го́рло.",
    });
    const hint = buildPronounFactPromptHint(fact!);

    assert.match(hint, /PRONOM PERSONNEL « я »/);
    assert.match(hint, /JAMAIS un déterminant possessif/);
    assert.match(hint, /у \+ génitif/);
    assert.match(hint, /au génitif/);
  });

  it("nuance prudente (pas d'interdiction absolue) pour он/она́/оно́/они́, qui doublent comme possessif figé", () => {
    const fact = resolvePronounCuratedFact({
      surface: "его́",
      sentence: "А́нна уже́ ждёт его́ внутри́.",
    });
    const hint = buildPronounFactPromptHint(fact!);

    assert.match(hint, /PRONOM PERSONNEL « он » à l'accusatif/);
    assert.doesNotMatch(hint, /JAMAIS un déterminant possessif/);
  });

  it("accord grammatical français correct (à l'accusatif / à l'instrumental, pas 'au')", () => {
    const accusative = resolvePronounCuratedFact({
      surface: "меня́",
      sentence: "Она́ ви́дит меня́.",
    });
    const instrumental = resolvePronounCuratedFact({
      surface: "мной",
      sentence: "Он гово́рит со мной.",
    });

    assert.match(buildPronounFactPromptHint(accusative!), /à l'accusatif/);
    assert.match(buildPronounFactPromptHint(instrumental!), /à l'instrumental/);
  });
});
