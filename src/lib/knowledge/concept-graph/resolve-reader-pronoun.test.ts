import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { derivePronounRoleOverride } from "./resolve-reader-concept";

/**
 * Vérification des cas cités par le ticket "Curer les pronoms personnels" :
 * меня́, тебя́, его́/него́, ей/ней, себя́, нас, них — rôle dérivé du CAS
 * (jamais "possession" pour un pronom, jamais une devinette LLM).
 */
describe("derivePronounRoleOverride", () => {
  it("меня́ après у (У меня́ боли́т го́рло) → location (vert), jamais possession", () => {
    const override = derivePronounRoleOverride({
      surface: "меня́",
      sentence: "У меня́ боли́т го́рло.",
      functionalRole: "possession",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("меня́ objet direct (Она ви́дит меня́) → object_direct (corail)", () => {
    const override = derivePronounRoleOverride({
      surface: "меня́",
      sentence: "Она́ ви́дит меня́.",
    });

    assert.deepEqual(override, { functionalRole: "object_direct", functionColor: "coral" });
  });

  it("тебя́ après без (без тебя́) → location (vert), jamais possession", () => {
    const override = derivePronounRoleOverride({
      surface: "тебя́",
      sentence: "Я живу́ без тебя́.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("его́ objet direct sans préposition (Я ви́жу его́) → object_direct", () => {
    const override = derivePronounRoleOverride({
      surface: "его́",
      sentence: "Я ви́жу его́.",
    });

    assert.deepEqual(override, { functionalRole: "object_direct", functionColor: "coral" });
  });

  it("него́ après у (У него́ есть кни́га) → location, jamais possession", () => {
    const override = derivePronounRoleOverride({
      surface: "него́",
      sentence: "У него́ есть кни́га.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("него́ après без (genitif univoque, non sense-dependent) → location", () => {
    const override = derivePronounRoleOverride({
      surface: "него́",
      sentence: "Мы придём без него́.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("ей datif sans préposition (Я дал ей кни́гу) → object_indirect (ambre)", () => {
    const override = derivePronounRoleOverride({
      surface: "ей",
      sentence: "Я дал ей кни́гу.",
    });

    assert.deepEqual(override, { functionalRole: "object_indirect", functionColor: "amber" });
  });

  it("ней après к (dative univoque) → object_indirect", () => {
    const override = derivePronounRoleOverride({
      surface: "ней",
      sentence: "Я иду́ к ней.",
    });

    assert.deepEqual(override, { functionalRole: "object_indirect", functionColor: "amber" });
  });

  it("ней après с (sense-dependent, intersection instrumental|génitif ∩ candidats) → instrument (teal)", () => {
    const override = derivePronounRoleOverride({
      surface: "ней",
      sentence: "Я иду́ с ней.",
    });

    assert.deepEqual(override, { functionalRole: "instrument", functionColor: "teal" });
  });

  it("ней après о (prépositionnel univoque) → location", () => {
    const override = derivePronounRoleOverride({
      surface: "ней",
      sentence: "Мы говори́м о ней.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("себя́ après для (genitif univoque) → location, jamais possession", () => {
    const override = derivePronounRoleOverride({
      surface: "себя́",
      sentence: "Он де́лает э́то для себя́.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("себя́ objet direct (Он ви́дит себя́) → object_direct", () => {
    const override = derivePronounRoleOverride({
      surface: "себя́",
      sentence: "Он ви́дит себя́ в зе́ркале.",
    });

    assert.deepEqual(override, { functionalRole: "object_direct", functionColor: "coral" });
  });

  it("нас après у (У нас есть вре́мя) → location, jamais possession", () => {
    const override = derivePronounRoleOverride({
      surface: "нас",
      sentence: "У нас есть вре́мя.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("нас objet direct sans préposition (Он ви́дит нас) → object_direct", () => {
    const override = derivePronounRoleOverride({
      surface: "нас",
      sentence: "Он ви́дит нас.",
    });

    assert.deepEqual(override, { functionalRole: "object_direct", functionColor: "coral" });
  });

  it("них après о (prépositionnel univoque) → location", () => {
    const override = derivePronounRoleOverride({
      surface: "них",
      sentence: "Мы говори́м о них.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("них après у (génitif univoque) → location, jamais possession", () => {
    const override = derivePronounRoleOverride({
      surface: "них",
      sentence: "У них есть маши́на.",
    });

    assert.deepEqual(override, { functionalRole: "location", functionColor: "green" });
  });

  it("nominatif я (Я иду́ домо́й) → subject (bleu)", () => {
    const override = derivePronounRoleOverride({
      surface: "я",
      sentence: "Я иду́ домо́й.",
    });

    assert.deepEqual(override, { functionalRole: "subject", functionColor: "blue" });
  });

  it("мной instrumental (Он гово́рит со мной) → instrument (teal)", () => {
    const override = derivePronounRoleOverride({
      surface: "мной",
      sentence: "Он гово́рит со мной.",
    });

    assert.deepEqual(override, { functionalRole: "instrument", functionColor: "teal" });
  });

  it("mot hors paradigme (nom commun) : aucun override", () => {
    const override = derivePronounRoleOverride({
      surface: "кни́га",
      sentence: "Кни́га на столе́.",
    });

    assert.equal(override, null);
  });
});
