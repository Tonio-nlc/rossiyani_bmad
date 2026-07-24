/**
 * Formes fléchies curées pour les scénarios d'enseignement.
 * validé manuellement — ne pas générer par LLM
 *
 * Accents toniques (U+0301) inclus partout où la norme pédagogique les exige.
 */

export const CURATED_CHITAT = {
  infinitive: "чита́ть",
  present: {
    sg1: "чита́ю",
    sg2: "чита́ешь",
    sg3: "чита́ет",
  },
  past: {
    m: "чита́л",
  },
  /** Terminaisons du présent (1re conjugaison) — pour mise en évidence pédagogique. */
  endings: {
    sg1: "-ю",
    sg2: "-ешь",
    sg3: "-ет",
  },
} as const;

export const CURATED_PROCHITAT = {
  infinitive: "прочита́ть",
} as const;

export const CURATED_DELAT = {
  imperfective: "де́лать",
  perfective: "сде́лать",
} as const;

export const CURATED_PISAT = {
  imperfective: "писа́ть",
  perfective: "написа́ть",
} as const;

export const CURATED_GOVORIT = {
  imperfective: "говори́ть",
  perfective: "сказа́ть",
} as const;

export const CURATED_MOTION = {
  idti: "идти́",
  /** 1re pers. sg. présent de идти́ */
  idu: "иду́",
  hodit: "ходи́ть",
  ehat: "е́хать",
  ezdit: "е́здить",
  poehat: "пое́хать",
  uehat: "уе́хать",
  priehat: "прие́хать",
  pojti: "пойти́",
  prijti: "прийти́",
  uiti: "уйти́",
  vyiti: "выйти́",
} as const;

export const CURATED_POSSESSIVE = {
  moj: "мой",
  svoj: "свой",
} as const;

export const CURATED_KNIGA = {
  nom: "кни́га",
  acc: "кни́гу",
  /** Génitif singulier */
  gen: "кни́ги",
} as const;

export const CURATED_STOL = {
  nom: "стол",
  gen: "стола́",
  dat: "столу́",
} as const;

export const CURATED_ADJECTIVES = {
  novyj: "но́вый",
  novaya: "но́вая",
  novoe: "но́вое",
  novye: "но́вые",
  horoshij: "хоро́ший",
  horoshaya: "хоро́шая",
  horoshee: "хоро́шее",
} as const;

export const CURATED_AGREEMENT_NOUNS = {
  den: "день",
  pogoda: "пого́да",
  nastroenie: "настрое́ние",
  knigi: "кни́ги",
} as const;

export const CURATED_PRESENT_SG2 = {
  delaesh: "де́лаешь",
  govorish: "говори́шь",
  pishesh: "пи́шешь",
} as const;

export const CURATED_NOUNS_GENDER = {
  stol: "стол",
  kniga: "кни́га",
  okno: "окно́",
  dom: "дом",
  kvartira: "кварти́ра",
} as const;

export const CURATED_MOSKVA = {
  direction: "в Москву́",
  location: "в Москве́",
} as const;

/** Phrases d'exemple courtes — accents validés manuellement. */
export const CURATED_EXAMPLE_PHRASES = {
  onLyubitSvoyuRabotu: "Он лю́бит свою́ рабо́ту",
  yaIdu: "Я иду́",
  yaEduVMoskvu: "Я е́ду в Москву́",
  yaVMoskve: "Я в Москве́",
} as const;
