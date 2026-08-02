import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isCuratedInvariableSurface } from "./invariable-words";

describe("isCuratedInvariableSurface", () => {
  it("match formes nues et variantes ponctuées / capitalisées", () => {
    assert.equal(isCuratedInvariableSurface("и"), true);
    assert.equal(isCuratedInvariableSurface("И"), true);
    assert.equal(isCuratedInvariableSurface("о́чень"), true);
    assert.equal(isCuratedInvariableSurface("бы́стро"), true);
    assert.equal(isCuratedInvariableSurface("не"), true);
    assert.equal(isCuratedInvariableSurface("То́лько"), true);
    assert.equal(isCuratedInvariableSurface("по-францу́зски?"), true);
    assert.equal(isCuratedInvariableSurface("хорошо́."), true);
  });

  it("exclut больше, без, verbes, картой, приятно", () => {
    assert.equal(isCuratedInvariableSurface("бо́льше"), false);
    assert.equal(isCuratedInvariableSurface("без"), false);
    assert.equal(isCuratedInvariableSurface("говори́т"), false);
    assert.equal(isCuratedInvariableSurface("ка́ртой"), false);
    assert.equal(isCuratedInvariableSurface("прия́тно"), false);
  });
});
