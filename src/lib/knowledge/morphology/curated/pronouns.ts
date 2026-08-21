/**
 * Pronoms personnels + réfléchi — paradigme FERMÉ, curé à la main.
 * validé manuellement — ne pas générer par LLM
 *
 * Bug corrigé : мен-я́ segmenté par le LLM avec un badge de terminaison "я"
 * (мена́ étant une forme SUPPLÉTIVE de я, pas radical+désinence régulière),
 * et un rôle fonctionnel "possession" incorrect (меня́ reste le pronom
 * personnel "je" au génitif, jamais un déterminant possessif comme мой).
 * Même famille de bug que нашёл (segmentation inventée) et никто́
 * (désinence inventée) : ensemble fermé et connu → on le cure, on ne laisse
 * plus le LLM deviner ni la forme, ni la segmentation, ni le rôle.
 *
 * Sources vérifiées (croisées) : voir docs/knowledge/curated-pronouns-sources.md.
 */

import { normalizeToken } from "@/lib/utils/russian";

import type { TGovernedCase } from "./preposition-government";
import { stripStressMarks } from "./present-verbs";

/**
 * Clé d'appariement surface → paradigme : même composition que le rail
 * figé/génitif (`formKey`). Sans normalizeToken, « меня́. » / « нас, »
 * ratent le paradigme et contournent toute la curation.
 */
function pronounSurfaceKey(surface: string): string {
  return stripStressMarks(normalizeToken(surface));
}

export type TPronounCase = TGovernedCase | "nominative";

const ALL_PRONOUN_CASES: readonly TPronounCase[] = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "instrumental",
  "prepositional",
];

interface TPronounCaseForm {
  /** Forme sans variante н- (ou seule forme existante pour я/ты/мы/вы/себя́). */
  plain?: string;
  /**
   * Variante obligatoire après préposition, réservée à он/она́/оно́/они́
   * (у него́, с ней, о них…). Absente pour я/ты/мы/вы/себя́, qui ne
   * prennent jamais de н- (с тобо́й, pas *с нтобой).
   */
  withN?: string;
  /** Variantes orthographiques secondaires (littéraires/rares). */
  alt?: string[];
}

export interface TPronounParadigm {
  /** Forme de citation (lemme), avec accent. */
  lemma: string;
  /** себя́ n'a pas de nominatif : jamais sujet. */
  reflexive?: boolean;
  forms: Partial<Record<TPronounCase, TPronounCaseForm>>;
}

/**
 * я — mне/меня́ : dat = prép (même forme), gén = acc (même forme).
 */
const YA: TPronounParadigm = {
  lemma: "я",
  forms: {
    nominative: { plain: "я" },
    genitive: { plain: "меня́" },
    dative: { plain: "мне" },
    accusative: { plain: "меня́" },
    instrumental: { plain: "мной", alt: ["мно́ю"] },
    prepositional: { plain: "мне" },
  },
};

const TY: TPronounParadigm = {
  lemma: "ты",
  forms: {
    nominative: { plain: "ты" },
    genitive: { plain: "тебя́" },
    dative: { plain: "тебе́" },
    accusative: { plain: "тебя́" },
    instrumental: { plain: "тобо́й", alt: ["тобо́ю"] },
    prepositional: { plain: "тебе́" },
  },
};

/**
 * он / оно́ — 3e personne : н- obligatoire après préposition.
 * Le prépositionnel n'a pas de forme "sans н" (le cas prépositionnel
 * n'existe jamais sans préposition régissante).
 */
const ON: TPronounParadigm = {
  lemma: "он",
  forms: {
    nominative: { plain: "он" },
    genitive: { plain: "его́", withN: "него́" },
    dative: { plain: "ему́", withN: "нему́" },
    accusative: { plain: "его́", withN: "него́" },
    instrumental: { plain: "им", withN: "ним" },
    prepositional: { withN: "нём" },
  },
};

const ONO: TPronounParadigm = {
  lemma: "оно́",
  forms: {
    nominative: { plain: "оно́" },
    genitive: { plain: "его́", withN: "него́" },
    dative: { plain: "ему́", withN: "нему́" },
    accusative: { plain: "его́", withN: "него́" },
    instrumental: { plain: "им", withN: "ним" },
    prepositional: { withN: "нём" },
  },
};

const ONA: TPronounParadigm = {
  lemma: "она́",
  forms: {
    nominative: { plain: "она́" },
    genitive: { plain: "её", withN: "неё" },
    dative: { plain: "ей", withN: "ней" },
    accusative: { plain: "её", withN: "неё" },
    instrumental: { plain: "ей", withN: "ней", alt: ["е́ю"] },
    prepositional: { withN: "ней" },
  },
};

const MY: TPronounParadigm = {
  lemma: "мы",
  forms: {
    nominative: { plain: "мы" },
    genitive: { plain: "нас" },
    dative: { plain: "нам" },
    accusative: { plain: "нас" },
    instrumental: { plain: "на́ми" },
    prepositional: { plain: "нас" },
  },
};

const VY: TPronounParadigm = {
  lemma: "вы",
  forms: {
    nominative: { plain: "вы" },
    genitive: { plain: "вас" },
    dative: { plain: "вам" },
    accusative: { plain: "вас" },
    instrumental: { plain: "ва́ми" },
    prepositional: { plain: "вас" },
  },
};

const ONI: TPronounParadigm = {
  lemma: "они́",
  forms: {
    nominative: { plain: "они́" },
    genitive: { plain: "их", withN: "них" },
    dative: { plain: "им", withN: "ним" },
    accusative: { plain: "их", withN: "них" },
    instrumental: { plain: "и́ми", withN: "ни́ми" },
    prepositional: { withN: "них" },
  },
};

/** Réfléchi : pas de nominatif (ne peut jamais être sujet). */
const SEBYA: TPronounParadigm = {
  lemma: "себя́",
  reflexive: true,
  forms: {
    genitive: { plain: "себя́" },
    dative: { plain: "себе́" },
    accusative: { plain: "себя́" },
    instrumental: { plain: "собо́й", alt: ["собо́ю"] },
    prepositional: { plain: "себе́" },
  },
};

export const CURATED_PRONOUNS: readonly TPronounParadigm[] = [
  YA,
  TY,
  ON,
  ONA,
  ONO,
  MY,
  VY,
  ONI,
  SEBYA,
];

/** Paradigmes + index actifs — seed TS ; remplacés après hydrate DB (M2). */
let activePronounParadigms: readonly TPronounParadigm[] = CURATED_PRONOUNS;
let surfaceToCases = new Map<string, Set<TPronounCase>>();

function registerForm(
  map: Map<string, Set<TPronounCase>>,
  form: string | undefined,
  pronounCase: TPronounCase,
): void {
  if (!form) {
    return;
  }

  const key = pronounSurfaceKey(form);
  const existing = map.get(key) ?? new Set<TPronounCase>();
  existing.add(pronounCase);
  map.set(key, existing);
}

function rebuildPronounMaps(paradigms: readonly TPronounParadigm[]): void {
  const next = new Map<string, Set<TPronounCase>>();

  for (const paradigm of paradigms) {
    for (const pronounCase of ALL_PRONOUN_CASES) {
      const entry = paradigm.forms[pronounCase];

      if (!entry) {
        continue;
      }

      registerForm(next, entry.plain, pronounCase);
      registerForm(next, entry.withN, pronounCase);

      for (const alt of entry.alt ?? []) {
        registerForm(next, alt, pronounCase);
      }
    }
  }

  activePronounParadigms = paradigms;
  surfaceToCases = next;
}

rebuildPronounMaps(CURATED_PRONOUNS);

/**
 * Remplace paradigmes + index après hydratation DB.
 * Appelé uniquement depuis ensureMorphologyCuratedHydrated (avant resolve).
 */
export function replaceCuratedPronounParadigms(
  paradigms: readonly TPronounParadigm[],
): void {
  rebuildPronounMaps(paradigms);
}

/**
 * Cas candidats pour une forme de surface curée (pronoms uniquement).
 * Plusieurs cas possibles = syncrétisme réel du paradigme (ex. меня́ =
 * génitif ou accusatif) : la désambiguïsation se fait via disambiguateCase
 * (case-concept-routing.ts), jamais en devinant depuis la prose LLM.
 * Tableau vide = la forme n'appartient pas au paradigme fermé des pronoms.
 */
export function getPronounCaseCandidates(surface: string): TPronounCase[] {
  const key = pronounSurfaceKey(surface);
  const candidates = surfaceToCases.get(key);

  return candidates ? Array.from(candidates) : [];
}

/**
 * true si la forme appartient au paradigme fermé curé des pronoms
 * personnels/réfléchi. Sert de porte pour : (1) ne jamais afficher de badge
 * de terminaison LLM sur ces formes, (2) dériver le rôle fonctionnel du cas
 * plutôt que de la prose LLM.
 */
export function isCuratedPronounSurface(surface: string): boolean {
  return getPronounCaseCandidates(surface).length > 0;
}

/**
 * Lemme d'autorité pour une forme de surface curée UNE FOIS le cas déjà
 * résolu (désambiguïsation faite en amont, cf. case-concept-routing.ts).
 * Sert à injecter un fait déterministe (lemme + cas) dans le prompt LLM au
 * lieu de laisser le LLM deviner le statut grammatical du mot. Retourne
 * `null` si aucun paradigme curé n'a cette forme à ce cas précis.
 */
export function findPronounLemmaForCase(
  surface: string,
  pronounCase: TPronounCase,
): string | null {
  const key = pronounSurfaceKey(surface);

  for (const paradigm of activePronounParadigms) {
    const entry = paradigm.forms[pronounCase];

    if (!entry) {
      continue;
    }

    const candidateForms = [entry.plain, entry.withN, ...(entry.alt ?? [])];

    if (candidateForms.some((form) => form && pronounSurfaceKey(form) === key)) {
      return paradigm.lemma;
    }
  }

  return null;
}

/** Les pronoms qui ne peuvent JAMAIS servir de déterminant possessif figé
 * (contrairement à он/она́/оно́/они́, dont его́/её/их doublent aussi comme
 * « son/sa/leur » invariable) — utilisé pour la consigne de prompt LLM. */
export const NEVER_POSSESSIVE_PRONOUN_HINT: Readonly<Record<string, string>> = {
  я: "мой",
  ты: "твой",
  мы: "наш",
  вы: "ваш",
  "себя́": "свой",
};
