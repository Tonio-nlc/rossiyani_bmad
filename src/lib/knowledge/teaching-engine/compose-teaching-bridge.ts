import type { TLinguisticConcept } from "@/types/linguistic-concept";

export interface TComposeTeachingBridgeInput {
  concept: TLinguisticConcept;
  lemma: string;
  encounteredForm: string;
}

function stripStress(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Couche d'application : ancre le concept canonique sur la forme rencontrée.
 * Ne duplique pas le concept par lemme — une phrase d'application dynamique.
 */
export function composeTeachingBridge(
  input: TComposeTeachingBridgeInput,
): string {
  const form = input.encounteredForm.trim();
  const lemma = input.lemma.trim() || form;
  const conceptId = input.concept.id;

  switch (conceptId) {
    case "verb-perfective-aspect":
      return `${form} suit la même logique : l'événement est vu comme terminé — aspect perfectif (lemme ${lemma}).`;

    case "verb-imperfective-aspect":
      return `${form} suit la même logique : on regarde un processus ou une habitude — aspect imperfectif (lemme ${lemma}).`;

    case "aspect-pairs":
      return `${form} appartient à une paire aspectuelle autour de ${lemma} : même action, deux regards (processus vs résultat).`;

    case "verb-present-conjugation":
      return `${form} suit la même logique : la terminaison dit qui agit au présent (lemme ${lemma}).`;

    case "verb-movement-prefixes":
      return `${form} suit la même logique : le préfixe porte une part du sens du déplacement (lemme ${lemma}).`;

    case "verbs-of-motion":
      return `${form} suit la même logique : le russe encode le mode et le type de trajet dans le verbe (lemme ${lemma}).`;

    case "reflexive-possessive":
      return `${form} suit la même logique : le possessif renvoie au bon propriétaire dans la phrase (lemme ${lemma}).`;

    case "noun-declension":
      return `${form} suit la même logique : la terminaison marque le rôle du nom dans la phrase (lemme ${lemma}).`;

    case "noun-gender":
      return `${form} suit la même logique : le genre du nom (${lemma}) impose l'accord autour de lui.`;

    case "adjective-agreement":
      return `${form} suit la même logique : l'adjectif copie le genre, le nombre et le cas du nom (autour de ${lemma}).`;

    case "preposition-government":
      return `${form} suit la même logique : la préposition impose un cas précis (forme rencontrée liée à ${lemma}).`;

    default:
      return `${form} illustre « ${input.concept.title} » : ${input.concept.coreIdea} (lemme ${lemma}).`;
  }
}

/** Le bridge doit citer la forme rencontrée (accents ignorés). */
export function bridgeMentionsForm(bridge: string, form: string): boolean {
  const normalizedForm = stripStress(form);

  if (!normalizedForm) {
    return false;
  }

  return stripStress(bridge).includes(normalizedForm);
}
