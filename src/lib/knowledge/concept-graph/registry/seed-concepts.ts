import type { TLinguisticConcept } from "@/types/linguistic-concept";

export const SEED_LINGUISTIC_CONCEPTS: TLinguisticConcept[] = [
  {
    id: "verb-present-conjugation",
    slug: "verb-present-conjugation",
    title: "Conjugaison du présent",
    category: "Verb Conjugation",
    difficulty: "A1",
    summary:
      "Le russe modifie la terminaison du verbe pour indiquer qui agit maintenant.",
    coreIdea:
      "La terminaison du verbe répond à la question : qui fait l'action, maintenant ?",
    whyItExists:
      "Contrairement au français, le russe intègre souvent le pronom dans la forme verbale : la terminaison dit qui agit, maintenant.",
    mentalModel:
      "Pense à une grille : lignes = personnes (я, ты, он…), colonne = présent. Chaque case a sa terminaison.",
    visualModel: {
      type: "diagram",
      nodes: ["infinitif", "я …", "ты …", "он …"],
      caption: "De l'infinitif à la forme conjuguée — la terminaison porte la personne",
    },
    canonicalExplanation: {
      understand: [
        "En russe, la terminaison du verbe dit qui fait l'action, maintenant.",
        "Ce n'est jamais une terminaison au hasard : la phrase exige une personne précise, et la forme du verbe la marque.",
      ],
      scheme: ["infinitif", "я …", "ты …", "он …"],
      contrasts: [
        {
          fromForm: "infinitif",
          toForm: "forme conjuguée",
          question: "Pourquoi ?",
          explanation:
            "L'infinitif nomme l'action. La forme conjuguée ajoute qui agit, au présent.",
        },
      ],
      miniTable: {
        title: "Présent — logique",
        rows: [
          { label: "я", form: "…" },
          { label: "ты", form: "…" },
          { label: "он/она", form: "…" },
        ],
      },
      retentionPoints: [
        "Terminaison du présent = qui agit, maintenant.",
        "La démonstration se lit toujours sur le verbe consulté, pas sur un autre verbe.",
      ],
      family: ["читать", "говорить", "болеть", "делать"],
    },
    commonMistakes: [
      "Oublier que le pronom est souvent omis — la terminaison suffit.",
      "Appliquer le paradigme d'un autre verbe (ex. читать) au verbe consulté.",
      "Confondre présent et futur perfectif.",
    ],
    relatedConcepts: [
      "verb-imperfective-aspect",
      "verb-perfective-aspect",
      "aspect-pairs",
    ],
    relatedLemmas: ["читать", "делать", "говорить", "писать"],
    examples: ["Ты читаешь книгу.", "Он читает газету."],
    progression: {
      beginner: "Une seule idée : la terminaison dit qui agit, maintenant.",
      intermediate: "Comparer les personnes sur le verbe consulté (pas sur un autre verbe).",
      advanced: "Repérer conjugaison 1 vs 2 et les paradigmes défectifs (болеть « avoir mal », случиться).",
    },
    teacherNotes:
      "RC-025 : une explication canonique = le principe. La démonstration (terminaison, paradigme) se compose depuis le lemme + la forme rencontrée.",
  },
  {
    id: "verb-past-tense",
    slug: "verb-past-tense",
    title: "Passé",
    category: "Verb Conjugation",
    difficulty: "A1",
    validationStatus: "brouillon",
    summary:
      "Le passé russe s'accorde au genre et au nombre du sujet — jamais à la personne, contrairement au présent.",
    coreIdea:
      "Au passé, ce n'est pas qui parle (je/tu/il) qui change la forme du verbe, mais le genre et le nombre du sujet.",
    whyItExists:
      "Le russe simplifie le passé en un seul système d'accord (genre/nombre), là où le présent distingue plusieurs personnes.",
    mentalModel:
      "Passé = radical + -л, puis accord au sujet : -л (masculin), -ла (féminin), -ло (neutre), -ли (pluriel).",
    visualModel: {
      type: "comparison",
      nodes: ["нашёл (masculin)", "нашла́ (féminin)", "нашли́ (pluriel)"],
      caption: "Illustration — accord du passé au genre/nombre du sujet",
    },
    canonicalExplanation: {
      understand: [
        "Au présent, la terminaison du verbe dit qui parle : я чита́ю, ты чита́ешь, он чита́ет — une forme par personne. Au passé, ce principe change complètement : нашёл reste identique que le sujet soit я, ты ou он (au masculin) — c'est le genre du sujet qui décide la forme, pas la personne.",
        "Dès que le sujet est féminin, нашёл devient нашла́ ; s'il est pluriel, нашли́. Le français accorde parfois son participe passé (« elle est allée »), mais pas toujours (« il a trouvé » / « elle a trouvé », même forme) — le russe, lui, accorde systématiquement.",
      ],
      scheme: ["нашёл", "нашла́", "нашли́"],
      contrasts: [
        {
          fromForm: "нашёл",
          toForm: "нашла́",
          question: "Qu'est-ce qui change ?",
          explanation:
            "нашёл = sujet masculin (il). нашла́ = sujet féminin (elle) — seul le genre change, jamais la personne.",
        },
      ],
      miniTable: {
        title: "Passé — accord",
        rows: [
          { label: "m.", form: "нашёл" },
          { label: "f.", form: "нашла́" },
          { label: "n.", form: "нашло́" },
          { label: "pl.", form: "нашли́" },
        ],
      },
      retentionPoints: [
        "Le passé s'accorde au genre et au nombre du sujet — jamais à la personne.",
        "я/ты/он нашёл sont identiques au masculin : seul le sujet change la forme, pas le pronom qui l'accompagne.",
        "случи́лось (« il s'est passé ») reste au neutre singulier dans son emploi le plus courant : un évènement sans sujet nommé, pas une personne précise.",
      ],
      family: ["найти́", "случи́ться"],
    },
    commonMistakes: [
      "Chercher une terminaison par personne comme au présent : au passé, c'est le genre du sujet qui compte, pas je/tu/il.",
      "Garder нашёл pour un sujet féminin : il faut нашла́ (« она нашла́ », pas « она нашёл »).",
    ],
    relatedConcepts: ["verb-present-conjugation", "verb-perfective-aspect"],
    relatedLemmas: ["найти", "случиться"],
    examples: ["Ты бы́стро нашёл доро́гу!", "Что случи́лось?"],
    progression: {
      beginner:
        "Une seule idée : au passé, le sujet impose son genre et son nombre — jamais sa personne.",
      intermediate:
        "Comparer avec le présent (personne) sur le même verbe pour bien sentir la différence de système.",
      advanced:
        "Verbes surtout impersonnels au passé : случи́ться reste au neutre singulier dans son emploi le plus courant (évènement sans sujet nommé).",
    },
    teacherNotes:
      "Statut brouillon — lot 04. Aucun rôle fonctionnel Rossiyani associé (les verbes n'ont pas de rôle fonctionnel — cf. lots précédents). случи́ться n'est pas grammaticalement défectif au sens strict (une беда́ peut « случи́ться », féminin), mais son emploi le plus courant est impersonnel au neutre singulier (cf. CURATED_SLUCHITSYA, present-verbs.ts : même défectivité pratique au présent — 3e personne surtout).",
  },
  {
    id: "verb-imperfective-aspect",
    slug: "verb-imperfective-aspect",
    title: "Aspect imperfectif",
    category: "Verbal Aspect",
    difficulty: "A2",
    summary:
      "L'imperfectif décrit un processus, une habitude ou une action en cours.",
    coreIdea: "L'imperfectif montre l'action comme un processus, pas comme un résultat.",
    whyItExists:
      "Le russe distingue « comment l'action se déroule » (processus) de « si elle est terminée » (résultat).",
    mentalModel:
      "Une flèche continue : читать ————————> (lecture en cours)",
    visualModel: {
      type: "timeline",
      nodes: ["читать", "────────────>"],
      caption: "Processus en cours",
    },
    canonicalExplanation: {
      understand: [
        "читать ne dit pas qu'un livre est fini : il décrit la lecture comme activité — en cours, répétée ou habituelle.",
        "C'est l'aspect imperfectif : le russe regarde l'action de l'intérieur, comme un film, pas comme une photo finale.",
      ],
      scheme: ["читать", "я читаю", "он читает"],
      contrasts: [
        {
          fromForm: "читать",
          toForm: "прочитать",
          question: "Qu'est-ce qui change ?",
          explanation:
            "прочитать place un point final : le livre est lu jusqu'au bout. читать ne promet pas ce résultat.",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "читать = lecture en cours ou habituelle.",
        "Pour un livre terminé, le russe choisira souvent прочитать.",
        "L'imperfectif est la forme « par défaut » du dictionnaire.",
      ],
      family: ["читать", "прочитать", "дочитать"],
    },
    commonMistakes: [
      "Traduire imperfectif = « imparfait » français — ce sont deux systèmes différents.",
    ],
    relatedConcepts: ["verb-perfective-aspect", "aspect-pairs"],
    relatedLemmas: ["читать", "делать", "ходить", "говорить"],
    examples: ["Я читаю каждый день.", "Он читает сейчас."],
    progression: {
      beginner: "Imperfectif = processus, pas résultat.",
      intermediate: "Comparer avec le perfectif sur la même action.",
    },
  },
  {
    id: "verb-perfective-aspect",
    slug: "verb-perfective-aspect",
    title: "Aspect perfectif",
    category: "Verbal Aspect",
    difficulty: "A2",
    summary:
      "Le perfectif voit l'action comme terminée ou aboutie à un résultat.",
    coreIdea: "Le perfectif place un point final sur l'action.",
    whyItExists:
      "Le russe utilise le perfectif quand le locuteur veut montrer que l'action a un aboutissement clair.",
    mentalModel: "Un point final : прочитать • (livre terminé)",
    visualModel: {
      type: "comparison",
      nodes: ["читать", "прочитать •"],
      caption: "Processus vs résultat",
    },
    canonicalExplanation: {
      understand: [
        "прочитать ne décrit pas une lecture en cours : il dit que la lecture est menée à son terme.",
        "Le préfixe про- renforce l'idée d'achèvement. Le perfectif transforme le regard : de « en train de » vers « c'est fait ».",
      ],
      scheme: ["читать", "прочитать"],
      contrasts: [
        {
          fromForm: "читать",
          toForm: "прочитать",
          question: "Qu'est-ce qui change ?",
          explanation:
            "читать = processus. прочитать = résultat atteint. Même action, deux regards différents.",
        },
        {
          fromForm: "прочитать",
          toForm: "читать",
          question: "Pourquoi revenir à l'imperfectif ?",
          explanation:
            "Pour décrire une habitude ou une action en cours, le russe repasse à l'imperfectif.",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "прочитать = lire jusqu'au bout.",
        "Le perfectif ne se conjugue pas au présent (sauf emplois très limités).",
        "Un préfixe perfectif change souvent le regard sur l'action.",
      ],
      family: ["читать", "прочитать", "перечитать", "дочитать"],
    },
    commonMistakes: [
      "Utiliser le perfectif pour une action habituelle.",
      "Chercher un temps français équivalent — l'aspect est un système à part.",
    ],
    relatedConcepts: ["verb-imperfective-aspect", "aspect-pairs", "verb-movement-prefixes"],
    relatedLemmas: ["прочитать", "сделать", "понять", "пойти"],
    examples: ["Я прочитал книгу.", "Она уже прочитала."],
    progression: {
      beginner: "Perfectif = action terminée ou résultat.",
      intermediate: "Paire aspectuelle : читать / прочитать.",
    },
  },
  {
    id: "aspect-pairs",
    slug: "aspect-pairs",
    title: "Paires aspectuelles",
    category: "Aspect Pairs",
    difficulty: "A2",
    summary:
      "La plupart des verbes russes existent en deux aspects : imperfectif et perfectif.",
    coreIdea: "Un verbe imperfectif a souvent un partenaire perfectif formé par préfixe ou suffixe.",
    whyItExists:
      "Le russe organise le vocabulaire verbal par paires : même action, deux regards (processus / résultat).",
    mentalModel: "читать ↔ прочитать — deux faces d'une même action.",
    visualModel: {
      type: "comparison",
      nodes: ["читать", "↔", "прочитать"],
    },
    canonicalExplanation: {
      understand: [
        "читать et прочитать ne sont pas deux verbes aléatoires : ils forment une paire aspectuelle.",
        "Apprendre une paire, c'est apprendre deux façons de regarder la même action — en cours ou terminée.",
      ],
      scheme: ["делать", "сделать"],
      contrasts: [
        {
          fromForm: "делать",
          toForm: "сделать",
          question: "Qu'est-ce qui change ?",
          explanation:
            "делать = faire (processus). сделать = faire jusqu'au bout (résultat).",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "Apprendre les paires, pas les verbes isolés.",
        "Le perfectif est souvent formé avec un préfixe (с-, про-, по-).",
      ],
      family: ["читать", "прочитать", "делать", "сделать", "писать", "написать"],
    },
    commonMistakes: ["Apprendre прочитать sans connaître читать."],
    relatedConcepts: ["verb-imperfective-aspect", "verb-perfective-aspect"],
    relatedLemmas: ["читать", "делать", "писать"],
    examples: ["Я делаю / Я сделал."],
    progression: {
      beginner: "Deux formes, une action.",
      intermediate: "Former des paires par préfixe.",
    },
  },
  {
    id: "verb-movement-prefixes",
    slug: "verb-movement-prefixes",
    title: "Préfixes des verbes de mouvement",
    category: "Prefixes",
    difficulty: "B1",
    summary:
      "Les préfixes ajoutent une direction ou un aboutissement au déplacement.",
    coreIdea: "по-, у-, при-, вы- modifient le sens du verbe de base.",
    whyItExists:
      "Le russe encode la direction du mouvement dans le verbe lui-même, pas dans une préposition séparée.",
    mentalModel: "идти → поехать (départ vers un lieu) / уйти (s'éloigner)",
    visualModel: {
      type: "tree",
      nodes: ["идти", "пойти", "уйти", "прийти"],
    },
    canonicalExplanation: {
      understand: [
        "поехать ne remplace pas ехать au hasard : le préfixe по- ajoute l'idée d'un départ vers un but.",
        "Chaque préfixe est un morceau de sens réutilisable : по- (départ), у- (éloignement), при- (arrivée).",
      ],
      scheme: ["ехать", "поехать", "уехать", "приехать"],
      contrasts: [
        {
          fromForm: "ехать",
          toForm: "поехать",
          question: "Qu'est-ce qui change ?",
          explanation:
            "ехать = se déplacer (processus). поехать = partir / se mettre en route vers un lieu.",
        },
        {
          fromForm: "поехать",
          toForm: "уехать",
          question: "Qu'est-ce qui change ?",
          explanation: "у- ajoute l'éloignement : quitter un lieu pour un autre.",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "по- = départ vers un but.",
        "у- = s'éloigner, quitter.",
        "при- = arriver.",
      ],
      family: ["ехать", "поехать", "уехать", "приехать"],
    },
    commonMistakes: ["Confondre поехать (partir en véhicule) et пойти (partir à pied)."],
    relatedConcepts: ["verbs-of-motion", "verb-perfective-aspect"],
    relatedLemmas: ["ехать", "идти", "поехать", "пойти"],
    examples: ["Мы поехали в Москву.", "Он уехал."],
    progression: {
      beginner: "Un préfixe = une direction.",
      intermediate: "Paires multidirectionnel / unidirectionnel.",
    },
  },
  {
    id: "verbs-of-motion",
    slug: "verbs-of-motion",
    title: "Verbes de mouvement",
    category: "Verb Motion",
    difficulty: "B1",
    summary:
      "Le russe distingue déplacement à pied, en véhicule, aller simple et aller-retour.",
    coreIdea: "идти/ходить (à pied) vs ехать/ездить (en véhicule) ; unidirectionnel vs multidirectionnel.",
    whyItExists:
      "Le mode et la direction du déplacement sont grammaticaux en russe, pas seulement lexicaux.",
    mentalModel: "идти → (aller) vs ходить ⇄⇄⇄ (aller-retour, habitude)",
    visualModel: {
      type: "comparison",
      nodes: ["идти →", "ходить ⇄⇄⇄"],
    },
    canonicalExplanation: {
      understand: [
        "идти décrit un déplacement à pied dans une direction précise. ходить décrit des allers-retours ou l'habitude de se déplacer à pied.",
        "De même, ехать = trajet en véhicule vers un but ; ездить = déplacements répétés ou allers-retours en véhicule.",
      ],
      scheme: ["идти", "ходить", "ехать", "ездить"],
      contrasts: [
        {
          fromForm: "идти",
          toForm: "ходить",
          question: "Qu'est-ce qui change ?",
          explanation:
            "идти = une direction, un trajet. ходить = aller-retour ou habitude.",
        },
        {
          fromForm: "ехать",
          toForm: "ездить",
          question: "Qu'est-ce qui change ?",
          explanation:
            "ехать = un trajet en véhicule. ездить = déplacements répétés.",
        },
      ],
      miniTable: {
        title: "Mouvement",
        rows: [
          { label: "À pied (aller)", form: "идти" },
          { label: "À pied (retour)", form: "ходить" },
          { label: "Véhicule (aller)", form: "ехать" },
          { label: "Véhicule (retour)", form: "ездить" },
        ],
      },
      retentionPoints: [
        "идти/ехать = trajet unidirectionnel.",
        "ходить/ездить = aller-retour ou habitude.",
        "Le mode (pied vs véhicule) est obligatoire.",
      ],
      family: ["идти", "пойти", "ходить", "ехать", "поехать", "ездить"],
    },
    commonMistakes: ["Utiliser идти pour un trajet en voiture."],
    relatedConcepts: ["verb-movement-prefixes", "verb-perfective-aspect"],
    relatedLemmas: ["идти", "ехать", "ходить", "ездить"],
    examples: ["Я иду домой.", "Мы ездим на работу каждый день."],
    progression: {
      beginner: "Pied vs véhicule.",
      intermediate: "Unidirectionnel vs multidirectionnel.",
    },
  },
  {
    id: "reflexive-possessive",
    slug: "reflexive-possessive",
    title: "Possessif réfléchi",
    category: "Possessive Pronouns",
    difficulty: "A2",
    summary:
      "свой renvoie au possesseur du groupe nominal, pas au locuteur.",
    coreIdea: "свой = « le sien / la sienne » par rapport au sujet de la phrase.",
    whyItExists:
      "Le russe évite l'ambiguïté : свой indique que la possession renvoie au sujet, pas à un autre participant.",
    mentalModel: "мой (à moi, le locuteur) → свой (à celui dont on parle)",
    visualModel: {
      type: "comparison",
      nodes: ["мой", "свой"],
    },
    canonicalExplanation: {
      understand: [
        "свой ne signifie pas « mon » au sens du locuteur : il renvoie au possesseur déjà présent dans la phrase.",
        "Si le sujet possède quelque chose, le russe préfère свой à мой/твой/его pour éviter toute confusion.",
      ],
      scheme: ["мой", "свой"],
      contrasts: [
        {
          fromForm: "мой",
          toForm: "свой",
          question: "Qu'est-ce qui change ?",
          explanation:
            "мой = à moi (le locuteur). свой = au possesseur dont on parle déjà dans la phrase.",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "свой renvoie au sujet de la proposition.",
        "À éviter : *он любит его книгу quand il s'agit de sa propre livre.",
        "свой s'accorde en genre, nombre et cas.",
      ],
      family: ["мой", "свой", "своя", "своё", "свои"],
    },
    commonMistakes: [
      "Traduire свой par « mon » systématiquement.",
      "Oublier l'accord de свой.",
    ],
    relatedConcepts: ["adjective-agreement"],
    relatedLemmas: ["свой", "своя", "своё"],
    examples: ["Он любит свою работу.", "Она взяла свою сумку."],
    progression: {
      beginner: "свой = possession du sujet.",
      intermediate: "Accord et cas de свой.",
    },
  },
  {
    id: "noun-declension",
    slug: "noun-declension",
    title: "Déclinaison",
    category: "Case System",
    difficulty: "A1",
    summary:
      "Les noms russes changent de terminaison selon leur rôle dans la phrase.",
    coreIdea: "Chaque cas répond à une fonction : sujet, objet, lieu, moyen…",
    whyItExists:
      "Le russe marque le rôle grammatical sur le nom lui-même, pas seulement par l'ordre des mots.",
    mentalModel: "Nom → changement de terminaison selon la fonction",
    visualModel: {
      type: "table",
      nodes: ["Nom.", "Acc.", "Dat.", "Gen."],
    },
    canonicalExplanation: {
      understand: [
        "Quand un nom change de forme, ce n'est pas arbitraire : la terminaison indique son rôle dans la phrase.",
        "Le nominatif est la forme du dictionnaire. Les autres cas montrent comment le nom se relie aux autres mots.",
      ],
      scheme: ["стол", "стола", "столу", "столом"],
      contrasts: [
        {
          fromForm: "стол",
          toForm: "стола",
          question: "Qu'est-ce qui change ?",
          explanation:
            "стол = sujet ou complément de base. стола = génitif — souvent « de la table » ou absence.",
        },
      ],
      miniTable: {
        title: "Cas",
        rows: [
          { label: "Nom.", form: "стол" },
          { label: "Acc.", form: "стол" },
          { label: "Dat.", form: "столу" },
          { label: "Gen.", form: "стола" },
        ],
      },
      retentionPoints: [
        "La forme du dictionnaire = nominatif.",
        "Chaque cas a une fonction précise dans la phrase.",
        "Le genre influence les terminaisons.",
      ],
      family: ["стол", "стола", "столу"],
    },
    commonMistakes: ["Apprendre les cas comme une liste sans fonction."],
    relatedConcepts: [
      "noun-gender",
      "noun-animacy",
      "case-accusative",
      "preposition-government",
    ],
    relatedLemmas: ["стол", "книга", "город"],
    examples: ["На столе книга.", "Я вижу стол."],
    progression: {
      beginner: "Un cas = une fonction.",
      intermediate: "Mini-paradigmes par thème.",
    },
  },
  {
    id: "noun-gender",
    slug: "noun-gender",
    title: "Genre des noms",
    category: "Gender",
    difficulty: "A1",
    summary: "Chaque nom russe est masculin, féminin ou neutre.",
    coreIdea: "Le genre détermine les terminaisons et l'accord.",
    whyItExists: "Le genre est la grille sur laquelle s'accrochent déclinaison et adjectifs.",
    mentalModel: "Nom → genre → terminaisons possibles",
    visualModel: { type: "tree", nodes: ["Nom", "m.", "f.", "n."] },
    canonicalExplanation: {
      understand: [
        "Le genre n'est pas optionnel : il conditionne toutes les formes que tu rencontreras autour de ce nom.",
      ],
      scheme: ["стол (m.)", "книга (f.)", "окно (n.)"],
      contrasts: [],
      miniTable: null,
      retentionPoints: [
        "Terminaison -а/-я souvent féminin.",
        "Neutre en -о/-е.",
      ],
      family: ["стол", "книга", "окно"],
    },
    commonMistakes: ["Deviner le genre sans vérifier l'accord."],
    relatedConcepts: ["noun-declension", "adjective-agreement"],
    relatedLemmas: ["стол", "книга", "окно"],
    examples: ["Новый стол. Новая книга."],
    progression: { beginner: "Trois genres, trois grilles." },
  },
  {
    id: "adjective-agreement",
    slug: "adjective-agreement",
    title: "Accord de l'adjectif",
    category: "Agreement",
    difficulty: "A2",
    summary: "L'adjectif s'accorde en genre, nombre et cas avec le nom.",
    coreIdea: "L'adjectif copie les traits du nom qu'il décrit.",
    whyItExists: "Le russe lie visuellement l'adjectif et le nom par des terminaisons communes.",
    mentalModel: "Nom (féminin singulier) → adjectif (féminin singulier)",
    visualModel: { type: "diagram", nodes: ["книга", "новая книга"] },
    canonicalExplanation: {
      understand: [
        "новая s'accorde avec книга (féminin singulier). Ce n'est pas une variante libre : l'adjectif reflète le nom.",
      ],
      scheme: ["новый", "новая", "новое", "новые"],
      contrasts: [
        {
          fromForm: "новый стол",
          toForm: "новая книга",
          question: "Qu'est-ce qui change ?",
          explanation: "Le genre du nom change, l'adjectif suit.",
        },
      ],
      miniTable: {
        title: "Accord",
        rows: [
          { label: "m.", form: "новый" },
          { label: "f.", form: "новая" },
          { label: "n.", form: "новое" },
        ],
      },
      retentionPoints: ["L'adjectif suit le nom, pas l'inverse."],
      family: ["новый", "новая", "новое"],
    },
    commonMistakes: ["Oublier l'accord au pluriel."],
    relatedConcepts: ["noun-gender", "noun-declension"],
    relatedLemmas: ["новый", "хороший", "русский"],
    examples: ["Новая книга. Новый стол."],
    progression: { beginner: "Adjectif = copie du nom." },
  },
  {
    id: "preposition-government",
    slug: "preposition-government",
    title: "Régence des prépositions",
    category: "Prepositions",
    difficulty: "A2",
    summary: "Chaque préposition impose un cas précis au nom qui suit.",
    coreIdea: "в + accusatif (direction) vs в + prépositionnel (lieu).",
    whyItExists: "Le cas après une préposition n'est pas libre — c'est une convention fixe à mémoriser par préposition.",
    mentalModel: "Préposition → cas obligatoire",
    visualModel: { type: "diagram", nodes: ["в", "→ Acc.", "в", "→ Prép."] },
    canonicalExplanation: {
      understand: [
        "в Москву (accusatif) = direction. в Москве (prépositionnel) = lieu. La préposition в ne change pas, le cas oui.",
      ],
      scheme: ["в + Acc.", "в + Prép.", "на + Acc.", "на + Prép."],
      contrasts: [
        {
          fromForm: "в Москву",
          toForm: "в Москве",
          question: "Qu'est-ce qui change ?",
          explanation: "Direction (accusatif) vs lieu (prépositionnel).",
        },
      ],
      miniTable: null,
      retentionPoints: ["Chaque préposition a son cas.", "в/на + Acc. = direction."],
      family: ["в", "на", "к", "у"],
    },
    commonMistakes: ["Mélanger direction et lieu."],
    relatedConcepts: ["noun-declension", "case-accusative"],
    relatedLemmas: ["в", "на", "к"],
    examples: ["Я еду в Москву.", "Я в Москве."],
    progression: { beginner: "Préposition + cas fixe." },
  },
  {
    id: "case-nominative",
    slug: "case-nominative",
    title: "Nominatif",
    category: "Case System",
    difficulty: "A1",
    validationStatus: "brouillon",
    summary:
      "Le nominatif marque le sujet — celui qui fait l'action — et sert de point de repère pour tous les autres cas.",
    coreIdea:
      "En russe, chaque mot a une forme neutre, celle du dictionnaire ; c'est cette forme que porte le sujet, celui qui fait l'action.",
    whyItExists:
      "Sans cette forme de référence, aucun autre cas ne se comprendrait : chaque cas se définit par ce qu'il change par rapport au nominatif.",
    mentalModel: "Qui fait l'action ? → ce mot garde sa forme de départ (nominatif).",
    visualModel: {
      type: "comparison",
      nodes: ["А́нна (sujet, fait l'action)", "А́нну (objet, subit l'action)"],
      caption: "Illustration — le nominatif ne change pas, les autres cas si",
    },
    canonicalExplanation: {
      understand: [
        "А́нна, comme tous les mots russes, a une forme neutre : celle qu'on trouve dans le dictionnaire. Quand А́нна fait l'action — « А́нна говори́т » (Anna parle) — elle garde exactement cette forme : c'est le nominatif.",
        "Le nominatif est le point de repère : les cinq autres cas se définissent par ce qu'ils changent par rapport à lui (objet, possession, destinataire, moyen, lieu). Sans lui, aucun autre cas ne se comprendrait.",
      ],
      scheme: ["А́нна", "говори́т", "чита́ет"],
      contrasts: [
        {
          fromForm: "А́нна",
          toForm: "А́нну",
          question: "Qu'est-ce qui change ?",
          explanation:
            "А́нна fait l'action : c'est le sujet, la forme de départ. А́нну subit l'action : la forme change pour devenir l'objet.",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "Le nominatif est la forme de départ — celle du dictionnaire.",
        "Le sujet (qui fait l'action) porte toujours cette forme.",
        "Repère : « qui fait l'action ? » → nominatif.",
      ],
      family: ["Анна", "преподаватель", "они"],
    },
    commonMistakes: [
      "Croire qu'un mot non fléchi est automatiquement le sujet : au nominatif, un mot peut aussi être un attribut (« Он врач », il est médecin) sans être le sujet de la phrase.",
    ],
    relatedConcepts: ["noun-declension", "case-accusative"],
    relatedLemmas: ["Анна", "преподаватель"],
    examples: ["Преподава́тель улыба́ется.", "Они́ вхо́дят в университе́т."],
    progression: {
      beginner: "Repérer qui fait l'action — c'est lui qui porte le nominatif.",
      intermediate:
        "Le nominatif est le point de départ à partir duquel les cinq autres cas se comprennent.",
    },
    teacherNotes:
      'Statut brouillon — lot 04. Rôle fonctionnel Rossiyani : sujet (bleu, déjà existant). Aligné sur docs/lessons/content/six-cas/02-nominatif.json (même logique : forme du dictionnaire + cas du sujet) — aucun écart constaté. Résolution : ne route vers ce concept que si functionalRole === "subject" (cf. match-signals.ts) — le nominatif seul (mot non fléchi/attribut) ne suffit pas.',
  },
  {
    id: "case-accusative",
    slug: "case-accusative",
    title: "Accusatif",
    category: "Case System",
    difficulty: "A1",
    validationStatus: "brouillon",
    summary:
      "L'accusatif marque l'objet (ce qu'on lit, voit, prend) et la destination avec в/на.",
    coreIdea:
      "En français, l'ordre des mots dit qui fait quoi ; en russe, c'est souvent la fin du mot.",
    whyItExists:
      "Sans marque sur le mot, l'ordre libre des mots russes ne dirait pas clairement qui subit l'action.",
    mentalModel: "Action → mot qui reçoit l'action → forme d'objet (accusatif)",
    visualModel: {
      type: "comparison",
      nodes: ["кни́га (sujet)", "кни́гу (objet)"],
      caption: "Illustration — sujet → objet (terminaison)",
    },
    canonicalExplanation: {
      understand: [
        "En russe, la terminaison dit souvent qui est l'objet : кни́гу (avec -у) est ce qu'on lit.",
        "Avec в/на, la même logique de forme marque aussi la destination (куда́) : в университе́т.",
      ],
      scheme: ["кни́га", "кни́гу", "в университе́т"],
      contrasts: [
        {
          fromForm: "кни́га",
          toForm: "кни́гу",
          question: "Qu'est-ce qui change ?",
          explanation:
            "Même mot : forme de départ (sujet) vs objet (ce qu'on lit).",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "Objet (ce qu'on lit / voit) → souvent accusatif.",
        "в/на + accusatif = destination.",
      ],
      family: ["книга", "стол", "университет", "врач"],
    },
    commonMistakes: [
      "Nommer le cas avant d'identifier l'objet dans la phrase.",
    ],
    relatedConcepts: [
      "noun-declension",
      "noun-animacy",
      "preposition-government",
    ],
    relatedLemmas: ["книга", "университет", "стол"],
    examples: ["Я читаю книгу.", "Они входят в университет."],
    progression: {
      beginner: "Repérer l'objet d'abord, nommer l'accusatif ensuite.",
      intermediate: "Destination в/на + accusatif.",
    },
    teacherNotes:
      "Statut brouillon — lot 01. Couleur UI objet direct = corail (ne pas nommer à l'apprenant).",
  },
  {
    id: "noun-animacy",
    slug: "noun-animacy",
    title: "Animation (animé / inanimé)",
    category: "Animacy",
    difficulty: "A2",
    validationStatus: "brouillon",
    summary:
      "L'animation décide la forme de l'accusatif du masculin : être = comme le génitif, chose = comme le nominatif.",
    coreIdea:
      "Pour un masculin qui est l'objet de l'action, la forme dépend de l'animation : être vivant ou chose.",
    whyItExists:
      "Le russe distingue les êtres des choses là où la forme d'objet pourrait se confondre avec le sujet.",
    mentalModel: "Masculin objet → être ? → forme du génitif : oui / forme du nominatif : non",
    visualModel: {
      type: "comparison",
      nodes: ["стол (chose)", "врача́ (être)"],
      caption: "Illustration — chose vs être (objet)",
    },
    canonicalExplanation: {
      understand: [
        "стол (chose) : l'objet garde la forme de départ.",
        "врача́ (être) : l'objet prend la forme du génitif.",
      ],
      scheme: ["стол", "врача́"],
      contrasts: [
        {
          fromForm: "стол",
          toForm: "врача́",
          question: "Qu'est-ce qui change ?",
          explanation:
            "Même rôle d'objet : seul l'animé change la forme (chose vs être).",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "Masculin être objet → forme du génitif.",
        "Masculin chose objet → forme du nominatif.",
      ],
      family: ["стол", "врач", "книга"],
    },
    commonMistakes: [
      "Garder la forme de départ pour un masculin être objet (врач au lieu de врача́).",
    ],
    relatedConcepts: ["case-accusative", "noun-declension", "noun-gender"],
    relatedLemmas: ["врач", "стол"],
    examples: ["Я вижу стол.", "Я вижу врача."],
    progression: {
      beginner: "Être vs chose sur l'objet masculin.",
      intermediate: "Lien avec l'accusatif pluriel (tous genres).",
    },
    teacherNotes: "Statut brouillon — lot 01. Dépend de case-accusative.",
  },
  {
    id: "case-genitive",
    slug: "case-genitive",
    title: "Génitif",
    category: "Case System",
    difficulty: "A2",
    validationStatus: "brouillon",
    summary:
      "Le génitif marque qui possède, l'absence (нет + génitif) et suit до/из/от/у/без.",
    coreIdea:
      "En français, « le livre DE Anna » ajoute une préposition ; en russe, c'est А́нна qui change de forme.",
    whyItExists:
      "Sans préposition obligatoire devant chaque complément, le russe marque directement sur le mot qui possède — ou qui manque.",
    mentalModel: "Qui possède ? → ce mot-là change de forme, pas le mot possédé.",
    visualModel: {
      type: "comparison",
      nodes: ["А́нна (forme de départ)", "А́нны (qui possède)"],
      caption: "Illustration — qui possède",
    },
    canonicalExplanation: {
      understand: [
        "En français, « le livre de А́нна » ajoute une préposition (de) devant А́нна. En russe, c'est А́нна qui change de forme : кни́га А́нны.",
        "Le génitif marque aussi l'absence : « У Луи́ нет кни́ги » dit que Louis n'a pas de livre — кни́ги reste au génitif après нет.",
      ],
      scheme: ["А́нна", "А́нны", "кни́ги"],
      contrasts: [
        {
          fromForm: "А́нна",
          toForm: "А́нны",
          question: "Qu'est-ce qui change ?",
          explanation:
            "А́нна = forme de départ. А́нны = qui possède (le livre est à elle).",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "Qui possède → le mot qui possède change de forme (génitif).",
        "нет + génitif = absence.",
        "до, из, от, у, без imposent aussi le génitif.",
      ],
      family: ["книга", "Анна", "стол"],
    },
    commonMistakes: [
      "Garder la forme de départ du possesseur : dire « кни́га А́нна » au lieu de « кни́га А́нны ».",
    ],
    relatedConcepts: [
      "noun-declension",
      "case-accusative",
      "preposition-government",
    ],
    relatedLemmas: ["книга", "Анна"],
    examples: ["Кни́га А́нны.", "У Луи́ нет кни́ги."],
    progression: {
      beginner: "Repérer qui possède, avant de nommer le génitif.",
      intermediate:
        "Absence (нет) et prépositions до/из/от/у/без — même cas, rôles différents.",
      advanced: "Quantité (мно́го + génitif) — hors lot, même logique de cas.",
    },
    teacherNotes:
      "Statut brouillon — lot 02. Rôle fonctionnel Rossiyani : possession (violet, ne pas nommer à l'apprenant).",
  },
  {
    id: "case-dative",
    slug: "case-dative",
    title: "Datif",
    category: "Case System",
    difficulty: "A2",
    validationStatus: "brouillon",
    summary: "Le datif marque le destinataire — à qui on donne, dit, écrit — et suit к.",
    coreIdea:
      "En français, « je parle À Anna » ajoute une préposition ; en russe, c'est А́нна qui change de forme.",
    whyItExists:
      "Le russe marque directement sur le mot qui reçoit l'action (parole, don) sans dépendre de l'ordre des mots.",
    mentalModel: "À qui ? → ce mot-là change de forme, pas le verbe.",
    visualModel: {
      type: "comparison",
      nodes: ["А́нна (forme de départ)", "А́нне (à qui)"],
      caption: "Illustration — à qui",
    },
    canonicalExplanation: {
      understand: [
        "En français, « Louis parle à А́нна » ajoute une préposition (à) devant А́нна. En russe, c'est А́нна qui change de forme : говори́т А́нне.",
        "Cette forme dit à qui s'adresse l'action — donner, dire, écrire — sans préposition obligatoire.",
      ],
      scheme: ["А́нна", "А́нне"],
      contrasts: [
        {
          fromForm: "А́нна",
          toForm: "А́нне",
          question: "Qu'est-ce qui change ?",
          explanation:
            "А́нна = forme de départ. А́нне = à qui (celle qui reçoit la parole).",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "À qui → le destinataire change de forme (datif).",
        "к impose aussi le datif (destination vers quelqu'un).",
      ],
      family: ["Анна", "врач"],
    },
    commonMistakes: [
      "Garder la forme de départ pour le destinataire : dire « говори́т А́нна » au lieu de « говори́т А́нне ».",
    ],
    relatedConcepts: [
      "noun-declension",
      "case-accusative",
      "preposition-government",
    ],
    relatedLemmas: ["Анна", "врач"],
    examples: ["Луи́ говори́т А́нне.", "Пойдём к врачу́."],
    progression: {
      beginner: "Repérer à qui s'adresse l'action, avant de nommer le datif.",
      intermediate: "к + datif — même cas, préposition en plus.",
    },
    teacherNotes:
      "Statut brouillon — lot 02. Rôle fonctionnel Rossiyani : destinataire (ambre, ne pas nommer à l'apprenant).",
  },
  {
    id: "case-instrumental",
    slug: "case-instrumental",
    title: "Instrumental",
    category: "Case System",
    difficulty: "A2",
    validationStatus: "brouillon",
    summary:
      "L'instrumental marque le moyen (avec quoi on fait quelque chose) et, avec с, l'accompagnement.",
    coreIdea:
      "En français, « avec » ajoute une préposition devant l'outil ; en russe, c'est souvent le mot lui-même qui change de forme.",
    whyItExists:
      "Le russe marque directement sur le mot le moyen d'une action, sans dépendre d'une préposition à chaque fois.",
    mentalModel: "Avec quoi ? → ce mot-là change de forme, sans mot ajouté.",
    visualModel: {
      type: "comparison",
      nodes: ["ка́рта (forme de départ)", "ка́ртой (avec quoi)"],
      caption: "Illustration — avec quoi (le moyen)",
    },
    canonicalExplanation: {
      understand: [
        "En français, « Louis paie AVEC la carte » ajoute une préposition (avec) devant carte. En russe, c'est ка́рта qui change de forme : плати́т ка́ртой — sans aucun mot en plus.",
        "Cette même forme sert aussi après с (« avec ») pour dire avec qui on est : с А́нной. Là, une préposition reste nécessaire, mais c'est toujours la forme instrumentale.",
      ],
      scheme: ["ка́рта", "ка́ртой", "с А́нной"],
      contrasts: [
        {
          fromForm: "ка́рта",
          toForm: "ка́ртой",
          question: "Qu'est-ce qui change ?",
          explanation:
            "ка́рта = forme de départ. ка́ртой = avec quoi (le moyen), sans préposition.",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "Avec quoi (le moyen) → le mot change de forme, sans préposition (instrumental).",
        "с + instrumental = avec qui (accompagnement) — la préposition s'ajoute, la forme reste la même logique.",
      ],
      family: ["карта", "Анна"],
    },
    commonMistakes: [
      "Garder la forme de départ pour le moyen : dire « плати́т ка́рта » au lieu de « плати́т ка́ртой ».",
    ],
    relatedConcepts: [
      "noun-declension",
      "case-accusative",
      "preposition-government",
    ],
    relatedLemmas: ["карта", "Анна"],
    examples: ["Луи́ пла́тит ка́ртой.", "Он идёт с А́нной."],
    progression: {
      beginner: "Repérer le moyen (avec quoi), avant de nommer l'instrumental.",
      intermediate: "с + instrumental — même cas, préposition d'accompagnement en plus.",
    },
    teacherNotes:
      "Statut brouillon — lot 03. Rôle fonctionnel « moyen/instrument » (teal, #0D9488) — voir src/lib/lessons/lesson-colors.ts et src/lib/utils/russian.ts. Dérivé du cas instrumental détecté de façon fiable (paradigme linguistic_knowledge, morphologie curée ou régence prépositionnelle déterministe) ; jamais une devinette LLM.",
  },
  {
    id: "case-prepositional",
    slug: "case-prepositional",
    title: "Prépositionnel",
    category: "Case System",
    difficulty: "A2",
    validationStatus: "brouillon",
    summary:
      "Le prépositionnel marque le lieu où l'on est (в/на + prépositionnel) et le sujet dont on parle (о + prépositionnel) — jamais seul.",
    coreIdea:
      "En français, « à Moscou » ajoute une préposition ; en russe, la préposition ET la forme du mot changent ensemble — ce cas n'existe jamais sans préposition.",
    whyItExists:
      "Le russe marque sur le mot le lieu où l'on se trouve (et non où l'on va) : la forme distingue être là de s'y rendre.",
    mentalModel: "Où est-on (pas où va-t-on) ? → le mot après в/на/о change de forme.",
    visualModel: {
      type: "comparison",
      nodes: ["аудито́рия (forme de départ)", "аудито́рии (où, après в)"],
      caption: "Illustration — où, après в",
    },
    canonicalExplanation: {
      understand: [
        "En français, « à l'université » ajoute une préposition (à) devant université. En russe, в аудито́рии change la forme du mot après в : аудито́рии — et non аудито́рия — dit où sont les étudiants.",
        "Ce cas ne se rencontre jamais seul : toujours après в, на ou о. Après о, la même forme dit de quoi on parle : говори́т о Москве́ (il parle de Moscou).",
      ],
      scheme: ["аудито́рия", "в аудито́рии", "о Москве́"],
      contrasts: [
        {
          fromForm: "аудито́рия",
          toForm: "аудито́рии",
          question: "Qu'est-ce qui change ?",
          explanation: "аудито́рия = forme de départ. аудито́рии = où (le lieu), après в.",
        },
      ],
      miniTable: null,
      retentionPoints: [
        "Où l'on est (pas où l'on va) → в/на + prépositionnel.",
        "Ce cas n'apparaît jamais sans préposition (в, на ou о).",
        "о + prépositionnel = de quoi on parle.",
      ],
      family: ["аудитория", "Москва", "университет"],
    },
    commonMistakes: [
      "Utiliser в + accusatif (destination, куда́) pour un lieu où l'on est déjà — le prépositionnel répond à где, pas à куда́.",
    ],
    relatedConcepts: [
      "noun-declension",
      "case-accusative",
      "preposition-government",
    ],
    relatedLemmas: ["аудитория", "Москва", "университет"],
    examples: ["В аудито́рии уже́ есть студе́нты.", "А́нна в Москве́."],
    progression: {
      beginner: "Repérer où l'on est, avant de nommer le prépositionnel.",
      intermediate:
        "в/на + prépositionnel (lieu, где) vs в/на + accusatif (destination, куда́) — même préposition, cas différent selon le sens.",
      advanced: "о + prépositionnel (sujet dont on parle) — même cas, rôle différent.",
    },
    teacherNotes:
      "Statut brouillon — lot 03. Rôle fonctionnel Rossiyani : lieu (vert, ne pas nommer à l'apprenant) pour l'emploi locatif (в/на + prépositionnel). L'emploi avec о (sujet dont on parle) n'a pas de rôle fonctionnel coloré dédié dans le système actuel.",
  },
];
