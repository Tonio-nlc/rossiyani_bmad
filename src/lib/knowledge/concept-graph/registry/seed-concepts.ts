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
      "Contrairement au français, le russe intègre le pronom dans la forme verbale. « читаешь » dit à lui seul : tu lis, maintenant.",
    mentalModel:
      "Pense à une grille : lignes = personnes (я, ты, он…), colonne = présent. Chaque case a sa terminaison.",
    visualModel: {
      type: "diagram",
      nodes: ["читать", "я читаю", "ты читаешь", "он читает"],
      caption: "Du lemme à la forme conjuguée",
    },
    canonicalExplanation: {
      understand: [
        "Le russe ne choisit jamais une terminaison au hasard. Ici, la phrase exige que ce soit « tu » qui effectues l'action maintenant — c'est pourquoi читать devient читаешь.",
        "La terminaison -ешь signale la 2e personne du singulier au présent. Tu la retrouveras sur des centaines d'autres verbes imperfectifs.",
      ],
      scheme: ["читать", "я читаю", "ты читаешь", "он читает"],
      contrasts: [
        {
          fromForm: "читать",
          toForm: "читаешь",
          question: "Pourquoi ?",
          explanation:
            "читать est le lemme (l'infinitif). читаешь est la forme conjuguée : c'est « tu » qui lis, maintenant.",
        },
        {
          fromForm: "читаешь",
          toForm: "читал",
          question: "Qu'est-ce qui change ?",
          explanation:
            "читал place l'action dans le passé. Le présent (читаешь) dit que l'action se déroule maintenant.",
        },
      ],
      miniTable: {
        title: "Présent",
        rows: [
          { label: "я", form: "читаю" },
          { label: "ты", form: "читаешь" },
          { label: "он/она", form: "читает" },
        ],
      },
      retentionPoints: [
        "La terminaison -ешь = tu, maintenant (2e personne singulier).",
        "читать décrit une lecture en cours ou habituelle.",
        "Pour le passé, le russe utilisera читал, pas читаешь.",
      ],
      family: ["читать", "прочитать", "дочитать", "перечитать"],
    },
    commonMistakes: [
      "Oublier que le pronom est souvent omis — la terminaison suffit.",
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
      intermediate: "Comparer présent et passé sur le même verbe.",
      advanced: "Exceptions de conjugaison (читать → читаю, pas *читаюсь).",
    },
    teacherNotes: "Valider une fois — tous les verbes imperfectifs du présent réutilisent cette explication.",
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
    relatedConcepts: ["noun-gender", "noun-animacy", "preposition-government"],
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
    relatedConcepts: ["noun-declension"],
    relatedLemmas: ["в", "на", "к"],
    examples: ["Я еду в Москву.", "Я в Москве."],
    progression: { beginner: "Préposition + cas fixe." },
  },
];
