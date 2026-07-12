import {
  formatAspectLabel,
  formatGenderLabel,
  formatMovementLabel,
} from "@/lib/vocabulary/format-linguistic-labels";
import {
  buildLinguisticProfile,
  collectParadigmForms,
  formatErrorPairs,
  formatFormEntries,
  formatPreverbs,
} from "@/lib/knowledge/build-linguistic-profile";
import type { TLinguisticKnowledge, TLinguisticProfile } from "@/types/knowledge";

export interface TProfileExploreBlock {
  title: string;
  items: string[];
}

function block(title: string, items: string[]): TProfileExploreBlock | null {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);

  if (cleaned.length === 0) {
    return null;
  }

  return { title, items: cleaned };
}

function formatAspectPair(
  pair: TLinguisticProfile["morphology"]["aspectPair"],
): string[] {
  if (!pair) {
    return [];
  }

  const items: string[] = [];

  if (pair.imperfective) {
    items.push(`Imperfectif : ${pair.imperfective}`);
  }

  if (pair.perfective) {
    items.push(`Perfectif : ${pair.perfective}`);
  }

  return items;
}

function buildPedagogyBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  const { pedagogy, semantics } = profile;

  return [
    pedagogy.summary ? block("Résumé", [pedagogy.summary]) : null,
    pedagogy.takeaway ? block("À retenir", [pedagogy.takeaway]) : null,
    block("Erreurs fréquentes", formatErrorPairs(pedagogy.commonErrors)),
    block("Confusions", pedagogy.confusions ?? []),
    block("Conseils", pedagogy.tips ?? []),
    pedagogy.progression
      ? block("Progression", [`Niveau ${pedagogy.progression}`])
      : null,
    block("Concepts liés", pedagogy.relatedConcepts ?? []),
    semantics.coreMeaning ? block("Sens central", [semantics.coreMeaning]) : null,
    semantics.extendedMeaning
      ? block("Sens élargi", [semantics.extendedMeaning])
      : null,
    block("Collocations", semantics.collocations ?? []),
    block("Faux amis", formatErrorPairs(semantics.falseFriends)),
    block("Synonymes", semantics.synonyms ?? []),
    block("Antonymes", semantics.antonyms ?? []),
  ].filter((item): item is TProfileExploreBlock => item !== null);
}

function buildNounExploreBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  const { morphology, syntax } = profile;
  const gender = formatGenderLabel(morphology.gender ?? profile.gender);

  return [
    gender ? block("Genre", [gender]) : null,
    morphology.animacy
      ? block("Animacité", [
          morphology.animacy === "animate" ? "Animé" : "Inanimé",
        ])
      : null,
    morphology.declensionClass
      ? block("Déclinaison", [morphology.declensionClass])
      : null,
    morphology.plural?.form
      ? block("Pluriel", [
          morphology.plural.form,
          ...(morphology.plural.notes ? [morphology.plural.notes] : []),
        ])
      : null,
    block("Irrégularités", morphology.irregularities ?? []),
    block("Paradigme des cas", formatFormEntries(morphology.caseParadigm)),
    block("Paradigme des cas", formatFormEntries(profile.paradigms.cases)),
    block(
      "Cas gouvernés",
      (morphology.governedCases ?? []).map((item) =>
        item.meaning
          ? `${item.grammaticalCase} — ${item.meaning}`
          : item.grammaticalCase,
      ),
    ),
    block("Constructions", syntax.constructionPatterns ?? []),
    block("Régimes", syntax.government ?? []),
    ...buildPedagogyBlocks(profile),
  ].filter((item): item is TProfileExploreBlock => item !== null);
}

function buildVerbExploreBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  const { morphology, syntax } = profile;
  const aspect = formatAspectLabel(morphology.aspect ?? profile.aspect);
  const movement = formatMovementLabel(morphology.movementType ?? profile.movementType);

  return [
    aspect ? block("Aspect", [aspect]) : null,
    block("Paire aspectuelle", formatAspectPair(morphology.aspectPair)),
    morphology.conjugationClass
      ? block("Type de conjugaison", [morphology.conjugationClass])
      : null,
    block(
      "Paradigme principal",
      formatFormEntries(morphology.conjugationParadigm),
    ),
    block("Conjugaison", formatFormEntries(profile.paradigms.conjugation)),
    block("Formes principales", formatFormEntries(profile.paradigms.forms)),
    morphology.tense ? block("Temps", [morphology.tense]) : null,
    morphology.person ? block("Personne", [morphology.person]) : null,
    morphology.voice ? block("Voix", [morphology.voice]) : null,
    movement
      ? block("Verbe de mouvement", [
          movement.charAt(0).toUpperCase() + movement.slice(1),
        ])
      : null,
    block("Préverbes", formatPreverbs(morphology.preverbs)),
    syntax.movementPattern
      ? block("Schéma de mouvement", [syntax.movementPattern])
      : null,
    syntax.transitivity
      ? block("Transitivité", [syntax.transitivity])
      : null,
    block("Constructions", syntax.constructionPatterns ?? []),
    block("Régimes", syntax.government ?? []),
    block("Cas compatibles", syntax.compatibleCases ?? []),
    ...buildPedagogyBlocks(profile),
  ].filter((item): item is TProfileExploreBlock => item !== null);
}

function buildAdjectiveExploreBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  const { morphology, syntax } = profile;

  return [
    morphology.agreement ? block("Accord", [morphology.agreement]) : null,
    morphology.declension ? block("Déclinaison", [morphology.declension]) : null,
    morphology.comparative
      ? block("Comparatif", [morphology.comparative])
      : null,
    morphology.superlative
      ? block("Superlatif", [morphology.superlative])
      : null,
    morphology.shortForm ? block("Forme courte", [morphology.shortForm]) : null,
    block("Irrégularités", morphology.irregularities ?? []),
    block("Paradigme", formatFormEntries(morphology.caseParadigm)),
    block("Formes principales", formatFormEntries(profile.paradigms.forms)),
    block("Constructions", syntax.constructionPatterns ?? []),
    block("Régimes", syntax.government ?? []),
    ...buildPedagogyBlocks(profile),
  ].filter((item): item is TProfileExploreBlock => item !== null);
}

function buildPronounExploreBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  const { morphology, syntax, semantics } = profile;

  return [
    morphology.pronounType
      ? block("Type", [morphology.pronounType])
      : semantics.semanticCategory
        ? block("Type", [semantics.semanticCategory])
        : null,
    morphology.agreement ? block("Accord", [morphology.agreement]) : null,
    block("Paradigme", formatFormEntries(morphology.pronounParadigm)),
    block("Formes principales", formatFormEntries(profile.paradigms.forms)),
    block("Cas", formatFormEntries(profile.paradigms.cases)),
    block("Formes particulières", formatFormEntries(morphology.specialForms)),
    block("Emplois", syntax.constructionPatterns ?? []),
    block("Régimes", syntax.government ?? []),
    ...buildPedagogyBlocks(profile),
  ].filter((item): item is TProfileExploreBlock => item !== null);
}

function buildPrepositionExploreBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  const { morphology, syntax, semantics } = profile;

  return [
    semantics.coreMeaning
      ? block("Sens", [semantics.coreMeaning])
      : semantics.semanticCategory
        ? block("Sens", [semantics.semanticCategory])
        : null,
    block(
      "Cas gouvernés",
      (morphology.governedCases ?? []).map((item) => {
        const examples = item.examples?.length
          ? ` (${item.examples.join(", ")})`
          : "";

        return item.meaning
          ? `${item.grammaticalCase} — ${item.meaning}${examples}`
          : `${item.grammaticalCase}${examples}`;
      }),
    ),
    block("Variantes", morphology.variants ?? []),
    block("Nuances", morphology.nuances ?? []),
    block("Constructions", syntax.constructionPatterns ?? []),
    block("Régimes", syntax.government ?? []),
    ...buildPedagogyBlocks(profile),
  ].filter((item): item is TProfileExploreBlock => item !== null);
}

function buildGenericExploreBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  return [
    block("Régimes", profile.syntax.government ?? []),
    block("Constructions", profile.syntax.constructionPatterns ?? []),
    profile.semantics.semanticCategory
      ? block("Sens", [profile.semantics.semanticCategory])
      : null,
    ...buildPedagogyBlocks(profile),
  ].filter((item): item is TProfileExploreBlock => item !== null);
}

export function buildProfileExploreBlocks(
  profile: TLinguisticProfile,
): TProfileExploreBlock[] {
  switch (profile.partOfSpeech) {
    case "noun":
      return buildNounExploreBlocks(profile);
    case "verb":
      return buildVerbExploreBlocks(profile);
    case "adjective":
      return buildAdjectiveExploreBlocks(profile);
    case "pronoun":
      return buildPronounExploreBlocks(profile);
    case "preposition":
      return buildPrepositionExploreBlocks(profile);
    default:
      return buildGenericExploreBlocks(profile);
  }
}

export function buildProfileTraitChips(profile: TLinguisticProfile): string[] {
  const chips: string[] = [];
  const gender = formatGenderLabel(profile.gender);
  const aspect = formatAspectLabel(profile.aspect);
  const movement = formatMovementLabel(profile.movementType);

  if (profile.partOfSpeech === "verb") {
    if (movement) {
      chips.push("Verbe de mouvement");
    }

    if (aspect) {
      chips.push(aspect.toLowerCase());
    }

    if (movement) {
      chips.push(movement);
    }
  }

  if (profile.partOfSpeech === "noun" && gender) {
    chips.push(gender.toLowerCase());
  }

  if (profile.partOfSpeech === "pronoun") {
    const type =
      profile.morphology.pronounType ?? profile.semantics.semanticCategory;

    if (type) {
      chips.push(type.toLowerCase());
    }
  }

  if (profile.partOfSpeech === "adjective" && gender) {
    chips.push(gender.toLowerCase());
  }

  if (profile.partOfSpeech === "preposition" && profile.semantics.semanticCategory) {
    chips.push(profile.semantics.semanticCategory.toLowerCase());
  }

  return [...new Set(chips)];
}

export function extractProfileVariants(profile: TLinguisticProfile): string[] {
  const forms = collectParadigmForms(profile.paradigms);

  if (forms.length >= 2) {
    return forms;
  }

  const morphologyForms = [
    ...formatFormEntries(profile.morphology.conjugationParadigm),
    ...formatFormEntries(profile.morphology.caseParadigm),
    ...formatFormEntries(profile.morphology.pronounParadigm),
    ...formatFormEntries(profile.morphology.specialForms),
  ].map((entry) => entry.split(" : ").pop()?.trim() ?? entry);

  const unique = [...new Set(morphologyForms.filter(Boolean))];

  return unique.length >= 2 ? unique : [];
}

export function buildProfileFromKnowledge(
  knowledge: TLinguisticKnowledge,
): TLinguisticProfile {
  return buildLinguisticProfile(knowledge);
}
