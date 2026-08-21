/**
 * Log divergence curated DB vs TS (serveur uniquement).
 * Base gagne — aucun throw, aucun impact utilisateur.
 */

export function logCuratedMorphologyDivergence(input: {
  kind: "verb" | "pronoun" | "case_form";
  lemmaBare: string;
  slot: string;
  variant?: string;
  tsValue: string;
  dbValue: string;
}): void {
  const variant = input.variant ? `/${input.variant}` : "";
  console.warn(
    `[morphology curated] divergence ${input.kind} ` +
      `${input.lemmaBare} ${input.slot}${variant}: ` +
      `ts=${JSON.stringify(input.tsValue)} db=${JSON.stringify(input.dbValue)} ` +
      `(base gagne)`,
  );
}
