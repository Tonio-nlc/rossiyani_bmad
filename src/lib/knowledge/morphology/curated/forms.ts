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
  /** Accusatif sg. = nominatif (inanimé) — OpenRussian стол */
  acc: "стол",
  gen: "стола́",
  dat: "столу́",
} as const;

/**
 * врач — masculin animé (texte gold « У врача »).
 * validé manuellement — ne pas générer par LLM
 * Source formes : OpenRussian врач (acc. sg. = gen. sg. врача́)
 */
export const CURATED_VRACH = {
  nom: "врач",
  gen: "врача́",
  dat: "врачу́",
  /** Accusatif sg. = génitif (animé) */
  acc: "врача́",
} as const;

/**
 * университе́т — masculin inanimé (textes gold « Premier jour », « Jour d'étudiant »).
 * validé manuellement — ne pas générer par LLM
 * Source formes : OpenRussian университе́т (acc. sg. = nom. sg.)
 */
export const CURATED_UNIVERSITET = {
  nom: "университе́т",
  /** Accusatif sg. = nominatif (inanimé) — destination : в университе́т */
  acc: "университе́т",
  prep: "университе́те",
} as const;

/**
 * А́нна — personnage des textes gold (ex. « Знакомство », « Premier jour »).
 * validé manuellement — ne pas générer par LLM
 * Déclinaison régulière du féminin dur en -а (même paradigme que кни́га/ма́ма,
 * accent fixe sur la première syllabe à tous les cas).
 */
export const CURATED_ANNA = {
  nom: "А́нна",
  /** Génitif singulier — possession (« кни́га А́нны ») */
  gen: "А́нны",
  /** Datif singulier — destinataire (« говори́т А́нне ») */
  dat: "А́нне",
  acc: "А́нну",
  /**
   * Instrumental singulier — accompagnement (« с А́нной »).
   * Forme régulière déduite (féminin dur en -а, désinence -ой à l'instrumental,
   * même paradigme que А́нны/А́нне déjà validées) — pas encore attestée dans les
   * textes gold actuels. À vérifier par un enseignant (lot 03).
   */
  instr: "А́нной",
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
  /** Génitif — après из / от / до… */
  genitive: "Москвы́",
  /**
   * Prépositionnel nu (sans préposition collée) — même forme que `location`,
   * réutilisée pour illustrer о + prépositionnel (« о Москве́ », parler DE Moscou).
   * Le prépositionnel russe ne change pas selon la préposition qui le régit.
   */
  prepositional: "Москве́",
} as const;

/**
 * ка́рта — objet des textes gold (« В булочной » : « Луи́ платит ка́ртой »).
 * validé manuellement — ne pas générer par LLM
 * Source formes : texte gold (ка́ртой, instrumental attesté) ; nominatif ка́рта
 * régulier (féminin dur en -а, même paradigme que кни́га).
 */
export const CURATED_KARTA = {
  nom: "ка́рта",
  /** Instrumental — moyen de paiement (texte gold « В булочной »). */
  instr: "ка́ртой",
} as const;

/**
 * аудито́рия — lieu des textes gold (« Первый день в университете »).
 * validé manuellement — ne pas générer par LLM
 * Source formes : texte gold (аудито́рии, prépositionnel attesté :
 * « В аудито́рии уже́ есть студе́нты. ») ; nominatif аудито́рия régulier
 * (féminin en -ия, désinence -ии au prépositionnel, comme Росси́я/в Росси́и).
 */
export const CURATED_AUDITORIYA = {
  nom: "аудито́рия",
  /** Prépositionnel — lieu où l'on est (texte gold « Первый день в университете »). */
  prep: "аудито́рии",
} as const;

/**
 * окно́ — neutre régulier, illustration de régence (у окна́, texte non-gold).
 * validé manuellement — ne pas générer par LLM
 * Source formes : nominatif окно́ déjà curé (`CURATED_NOUNS_GENDER.okno`) ;
 * génitif окна́ régulier (neutre dur, désinence -а, accent qui se déplace sur
 * la finale — paradigme standard окно́/окна́/окну́…, cf. OpenRussian окно).
 * Distinct de о́кна (nominatif pluriel, accent radical) — homographe non
 * accentué, tranché par l'accent en amont (case-concept-routing.ts).
 */
export const CURATED_OKNO_CASES = {
  nom: "окно́",
  gen: "окна́",
} as const;

/**
 * найти́ (perfectif) — texte gold « Как найти дорогу? » : « Ты бы́стро нашёл доро́гу! ».
 * validé manuellement — ne pas générer par LLM
 * Source forme masculine : attestée telle quelle dans le texte gold (нашёл).
 * Féminin/neutre/pluriel : déduits par règle régulière (composés en -йти se
 * conjuguent comme идти́ au passé : шёл/шла́/шло́/шли́ → нашёл/нашла́/нашло́/нашли́ ;
 * cf. OpenRussian найти, Wiktionnaire найти). Absents des textes gold actuels —
 * à vérifier par un enseignant (lot 04).
 */
export const CURATED_NAJTI_PAST = {
  infinitive: "найти́",
  m: "нашёл",
  f: "нашла́",
  n: "нашло́",
  pl: "нашли́",
} as const;

/**
 * случи́ться (surtout impersonnel) — texte gold « У врача » : « Что случи́лось? ».
 * validé manuellement — ne pas générer par LLM
 * Source : attestée telle quelle dans le texte gold (случи́лось).
 * Pas grammaticalement défectif au sens strict (une beда peut « случи́ться »,
 * fém.), mais dans son emploi le plus courant — l'évènement sans sujet nommé,
 * comme dans « Что случи́лось? » — la forme reste au neutre singulier (cf.
 * CURATED_SLUCHITSYA, present-verbs.ts — même défectivité au présent :
 * слу́чится/слу́чатся, 3e personne surtout).
 */
export const CURATED_SLUCHITSYA_PAST = {
  infinitive: "случи́ться",
  n: "случи́лось",
} as const;

/**
 * Illustrations de régence — formes curées (pas de LLM).
 * Groupées par cas imposé par la préposition.
 */
export const CURATED_PREP_GOVERNMENT_EXAMPLES = {
  genitive: {
    doSvidaniya: "до свида́ния",
    izMoskvy: `из ${CURATED_MOSKVA.genitive}`,
    otStola: `от ${CURATED_STOL.gen}`,
  },
  /** у + génitif : proximité (« près de »), distinct de до/из/от. */
  genitiveNear: {
    uOkna: `у ${CURATED_OKNO_CASES.gen}`,
    uStola: `у ${CURATED_STOL.gen}`,
  },
  dative: {
    kStolu: `к ${CURATED_STOL.dat}`,
    kDrugu: "к дру́гу",
  },
  directionLocation: {
    vDirection: CURATED_MOSKVA.direction,
    vLocation: CURATED_MOSKVA.location,
    naDirection: "на рабо́ту",
    naLocation: "на рабо́те",
  },
} as const;

/** Phrases d'exemple courtes — accents validés manuellement. */
export const CURATED_EXAMPLE_PHRASES = {
  onLyubitSvoyuRabotu: "Он лю́бит свою́ рабо́ту",
  yaIdu: "Я иду́",
  yaEduVMoskvu: "Я е́ду в Москву́",
  yaVMoskve: "Я в Москве́",
} as const;
