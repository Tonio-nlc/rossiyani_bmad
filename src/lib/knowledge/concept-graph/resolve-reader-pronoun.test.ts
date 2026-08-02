import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deriveGenitiveTriggerRoleOverride,
  derivePronounRoleOverride,
} from "./resolve-reader-concept";

/**
 * Pronoms curés + dérivation génitif par déclencheur.
 */
describe("derivePronounRoleOverride", () => {
  it("меня́ après у (У меня́ боли́т го́рло) → possession (violet), pas lieu", () => {
    const override = derivePronounRoleOverride({
      surface: "меня́",
      sentence: "У меня́ боли́т го́рло.",
      functionalRole: "location",
    });

    assert.deepEqual(override, {
      functionalRole: "possession",
      functionColor: "violet",
    });
  });

  it("меня́ objet direct (Она ви́дит меня́) → object_direct (corail)", () => {
    const override = derivePronounRoleOverride({
      surface: "меня́",
      sentence: "Она́ ви́дит меня́.",
    });

    assert.deepEqual(override, {
      functionalRole: "object_direct",
      functionColor: "coral",
    });
  });

  it("тебя́ après без (без тебя́) → aucun badge", () => {
    const override = derivePronounRoleOverride({
      surface: "тебя́",
      sentence: "Я живу́ без тебя́.",
    });

    assert.deepEqual(override, { functionalRole: "", functionColor: "" });
  });

  it("его́ objet direct sans préposition (Я ви́жу его́) → object_direct", () => {
    const override = derivePronounRoleOverride({
      surface: "его́",
      sentence: "Я ви́жу его́.",
    });

    assert.deepEqual(override, {
      functionalRole: "object_direct",
      functionColor: "coral",
    });
  });

  it("него́ après у (У него́ есть кни́га) → possession", () => {
    const override = derivePronounRoleOverride({
      surface: "него́",
      sentence: "У него́ есть кни́га.",
    });

    assert.deepEqual(override, {
      functionalRole: "possession",
      functionColor: "violet",
    });
  });

  it("него́ après без → aucun badge", () => {
    const override = derivePronounRoleOverride({
      surface: "него́",
      sentence: "Мы придём без него́.",
    });

    assert.deepEqual(override, { functionalRole: "", functionColor: "" });
  });

  it("ей datif sans préposition (Я дал ей кни́гу) → object_indirect (ambre)", () => {
    const override = derivePronounRoleOverride({
      surface: "ей",
      sentence: "Я дал ей кни́гу.",
    });

    assert.deepEqual(override, {
      functionalRole: "object_indirect",
      functionColor: "amber",
    });
  });

  it("ней после к (dative univoque) → object_indirect", () => {
    const override = derivePronounRoleOverride({
      surface: "ней",
      sentence: "Я иду́ к ней.",
    });

    assert.deepEqual(override, {
      functionalRole: "object_indirect",
      functionColor: "amber",
    });
  });

  it("ней после с (sense-dependent) → instrument (teal)", () => {
    const override = derivePronounRoleOverride({
      surface: "ней",
      sentence: "Я иду́ с ней.",
    });

    assert.deepEqual(override, {
      functionalRole: "instrument",
      functionColor: "teal",
    });
  });

  it("ней после о (prépositionnel univoque) → location", () => {
    const override = derivePronounRoleOverride({
      surface: "ней",
      sentence: "Мы говори́м о ней.",
    });

    assert.deepEqual(override, {
      functionalRole: "location",
      functionColor: "green",
    });
  });

  it("себя́ после для (génitif hors table) → repli location", () => {
    const override = derivePronounRoleOverride({
      surface: "себя́",
      sentence: "Он де́лает э́то для себя́.",
    });

    assert.deepEqual(override, {
      functionalRole: "location",
      functionColor: "green",
    });
  });

  it("себя́ objet direct (Он ви́дит себя́) → object_direct", () => {
    const override = derivePronounRoleOverride({
      surface: "себя́",
      sentence: "Он ви́дит себя́ в зе́ркале.",
    });

    assert.deepEqual(override, {
      functionalRole: "object_direct",
      functionColor: "coral",
    });
  });

  it("нас après у (У нас есть вре́мя) → possession", () => {
    const override = derivePronounRoleOverride({
      surface: "нас",
      sentence: "У нас есть вре́мя.",
    });

    assert.deepEqual(override, {
      functionalRole: "possession",
      functionColor: "violet",
    });
  });

  it("нас objet direct sans préposition (Он ви́дит нас) → object_direct", () => {
    const override = derivePronounRoleOverride({
      surface: "нас",
      sentence: "Он ви́дит нас.",
    });

    assert.deepEqual(override, {
      functionalRole: "object_direct",
      functionColor: "coral",
    });
  });

  it("них после о (prépositionnel univoque) → location", () => {
    const override = derivePronounRoleOverride({
      surface: "них",
      sentence: "Мы говори́м о них.",
    });

    assert.deepEqual(override, {
      functionalRole: "location",
      functionColor: "green",
    });
  });

  it("них après у (génitif univoque) → possession", () => {
    const override = derivePronounRoleOverride({
      surface: "них",
      sentence: "У них есть маши́на.",
    });

    assert.deepEqual(override, {
      functionalRole: "possession",
      functionColor: "violet",
    });
  });

  it("nominatif я (Я иду́ домо́й) → subject (bleu)", () => {
    const override = derivePronounRoleOverride({
      surface: "я",
      sentence: "Я иду́ домо́й.",
    });

    assert.deepEqual(override, {
      functionalRole: "subject",
      functionColor: "blue",
    });
  });

  it("мной instrumental (Он гово́рит со мной) → instrument (teal)", () => {
    const override = derivePronounRoleOverride({
      surface: "мной",
      sentence: "Он гово́рит со мной.",
    });

    assert.deepEqual(override, {
      functionalRole: "instrument",
      functionColor: "teal",
    });
  });

  it("mot hors paradigme (nom commun) : aucun override pronom", () => {
    const override = derivePronounRoleOverride({
      surface: "кни́га",
      sentence: "Кни́га на столе́.",
    });

    assert.equal(override, null);
  });
});

describe("deriveGenitiveTriggerRoleOverride (noms)", () => {
  it("после университета → time / green", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "университета",
        sentence: "После университета А́нна и Луи́ идут в булочную.",
      }),
      { functionalRole: "time", functionColor: "green" },
    );
  });

  it("из булочной → location / green", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "булочной",
        sentence: "Они́ выхо́дят из булочной и идут домо́й.",
      }),
      { functionalRole: "location", functionColor: "green" },
    );
  });

  it("без хлеба → aucun badge", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "хлеба",
        sentence: "Нет, без хлеба.",
      }),
      { functionalRole: "", functionColor: "" },
    );
  });

  it("де́сять часо́в → quantity, couleur vide", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "часо́в",
        sentence: "В де́сять часо́в он ложи́тся спать.",
      }),
      { functionalRole: "quantity", functionColor: "" },
    );
  });

  it("до свида́ния → fixed_expression, couleur vide", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "свида́ния",
        sentence: "— Спаси́бо, до свида́ния!",
      }),
      { functionalRole: "fixed_expression", functionColor: "" },
    );
  });

  it("у + nom animacy inconnue → location (ne devine pas ; У врача́ reste faux)", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "врача́",
        sentence: "У врача́ нет кни́ги.",
        animacy: null,
      }),
      { functionalRole: "location", functionColor: "green" },
    );
  });

  it("у + nom animé connu → possession", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "врача́",
        sentence: "У врача́ нет кни́ги.",
        animacy: "animate",
      }),
      { functionalRole: "possession", functionColor: "violet" },
    );
  });

  it("у + nom inanimé → location", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "окна́",
        sentence: "Кот сиди́т у окна́.",
        animacy: "inanimate",
      }),
      { functionalRole: "location", functionColor: "green" },
    );
  });

  it("adnominal / aucun déclencheur → null (LLM inchangé)", () => {
    assert.equal(
      deriveGenitiveTriggerRoleOverride({
        surface: "А́нны",
        sentence: "Э́то кни́га А́нны.",
      }),
      null,
    );
  });
});
