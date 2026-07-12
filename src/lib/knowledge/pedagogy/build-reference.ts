import {
  formatErrorPairs,
  formatFormEntries,
  formatPreverbs,
} from "@/lib/knowledge/build-linguistic-profile";
import { buildProfileExploreBlocks } from "@/lib/knowledge/profile-views";
import {
  limitList,
  PEDAGOGY_LIMITS,
  rankBlockImportance,
  uniqueNonEmpty,
} from "@/lib/knowledge/pedagogy/importance-ranking";
import type {
  TLearningCardReference,
  TLearningCardReferenceBlock,
} from "@/types/learning-card";
import type { TVocabularyLinguisticProfile } from "@/types/vocabulary";
import type { TKnowledgePedagogy } from "@/types/knowledge";

const HIDDEN_REFERENCE_TITLES = new Set(["Conjugaison"]);

function limitReferenceItems(title: string, items: string[]): string[] {
  if (title === "Synonymes") {
    return limitList(items, PEDAGOGY_LIMITS.synonyms);
  }

  if (title === "Antonymes") {
    return limitList(items, PEDAGOGY_LIMITS.antonyms);
  }

  if (title === "Collocations") {
    return limitList(items, PEDAGOGY_LIMITS.collocations);
  }

  if (title === "Confusions") {
    return limitList(items, PEDAGOGY_LIMITS.confusions);
  }

  if (title === "Erreurs fréquentes") {
    return limitList(items, PEDAGOGY_LIMITS.commonErrors);
  }

  return limitList(items, PEDAGOGY_LIMITS.referenceItems);
}

function buildReferenceFromProfile(
  profile: TVocabularyLinguisticProfile,
): TLearningCardReferenceBlock[] {
  const exploreBlocks = buildProfileExploreBlocks(profile.profile);
  const blocks: TLearningCardReferenceBlock[] = [];

  for (const block of exploreBlocks) {
    if (HIDDEN_REFERENCE_TITLES.has(block.title)) {
      continue;
    }

    const items = limitReferenceItems(block.title, block.items);

    if (items.length === 0) {
      continue;
    }

    blocks.push({
      title: block.title,
      items,
      importance: rankBlockImportance(block.title),
    });
  }

  const pedagogy = profile.pedagogy as TKnowledgePedagogy & {
    commonPatterns?: string[];
  };

  if (pedagogy.commonPatterns?.length) {
    blocks.push({
      title: "Formulations fréquentes",
      items: limitList(
        uniqueNonEmpty(pedagogy.commonPatterns),
        PEDAGOGY_LIMITS.commonPatterns,
      ),
      importance: "CRITICAL",
    });
  }

  const falseFriends = formatErrorPairs(profile.semantics.falseFriends ?? []);

  if (falseFriends.length > 0) {
    blocks.push({
      title: "Faux amis",
      items: limitList(falseFriends, PEDAGOGY_LIMITS.commonErrors),
      importance: "IMPORTANT",
    });
  }

  const preverbs = formatPreverbs(profile.morphology.preverbs ?? []);

  if (preverbs.length > 0) {
    blocks.push({
      title: "Préverbes",
      items: limitList(preverbs, PEDAGOGY_LIMITS.referenceItems),
      importance: "REFERENCE",
    });
  }

  const conjugation = formatFormEntries(profile.paradigms.conjugation ?? []);

  if (conjugation.length > 0) {
    blocks.push({
      title: "Conjugaison",
      items: limitList(conjugation, PEDAGOGY_LIMITS.referenceItems),
      importance: "REFERENCE",
    });
  }

  return blocks;
}

export function buildLearningCardReference(
  profile: TVocabularyLinguisticProfile,
): TLearningCardReference {
  return {
    blocks: buildReferenceFromProfile(profile),
  };
}
