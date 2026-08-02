import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { deriveGenitiveTriggerRoleOverride } from "@/lib/knowledge/concept-graph/resolve-reader-concept";

describe("fixed expressions multi-mots", () => {
  it("до свида́ния → fixed_expression (token précédent + surface)", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "свида́ния!",
        sentence: "— Спаси́бо, до свида́ния!",
      }),
      { functionalRole: "fixed_expression", functionColor: "" },
    );
  });

  it("о́чень прия́тно → fixed_expression (même rail multi-mots)", () => {
    assert.deepEqual(
      deriveGenitiveTriggerRoleOverride({
        surface: "прия́тно!",
        sentence: "— О́чень прия́тно!",
      }),
      { functionalRole: "fixed_expression", functionColor: "" },
    );
  });

  it("прия́тно seul (sans о́чень précédent) → pas figé", () => {
    assert.equal(
      deriveGenitiveTriggerRoleOverride({
        surface: "прия́тно",
        sentence: "Э́то прия́тно.",
      }),
      null,
    );
  });
});
