import { constrainCognitiveParagraph } from "@/lib/knowledge/teaching/cognitive-limits";

const ENCYCLOPEDIC_PATTERNS: Array<[RegExp, string]> = [
  [/cette terminaison indique/gi, "Le russe choisit cette forme parce que"],
  [/cette forme indique/gi, "Le russe choisit cette forme parce que"],
  [/le cas instrumental/gi, "Ici, le russe utilise cette forme pour"],
  [/le cas génitif/gi, "Ici, le russe utilise cette forme pour"],
  [/le cas datif/gi, "Ici, le russe utilise cette forme pour"],
  [/le cas accusatif/gi, "Ici, le russe utilise cette forme pour"],
  [/la troisième personne/gi, "Ici, le locuteur parle de « il/elle »"],
  [/la deuxième personne/gi, "Ici, le locuteur s'adresse à « tu »"],
  [/la première personne/gi, "Ici, le locuteur parle de « je »"],
  [/troisième personne/gi, "il/elle"],
  [/deuxième personne/gi, "tu"],
  [/première personne/gi, "je"],
  [/\bindique\b/gi, "montre"],
  [/correspond à/gi, "revient à"],
  [/exprime /gi, "traduit "],
  [/marque /gi, "signale"],
];

function capitalize(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return trimmed;
  }

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

export function rewriteTeachingVoice(text: string): string {
  let result = text.trim();

  if (!result) {
    return result;
  }

  for (const [pattern, replacement] of ENCYCLOPEDIC_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  if (/^le russe choisit/i.test(result)) {
    return capitalize(result);
  }

  if (/^ici[,\s]/i.test(result)) {
    return capitalize(result);
  }

  if (/^si on changeait/i.test(result)) {
    return capitalize(result);
  }

  return capitalize(result);
}

export function toTeachingParagraph(text: string): string {
  return constrainCognitiveParagraph(rewriteTeachingVoice(text));
}
