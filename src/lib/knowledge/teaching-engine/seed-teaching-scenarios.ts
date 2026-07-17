import type { TTeachingScenarioContent } from "@/types/teaching-scenario";

export const SEED_TEACHING_SCENARIOS: Record<string, TTeachingScenarioContent> = {
  "verb-present-conjugation": {
    hook: "Pourquoi le russe change la fin du verbe au présent ?",
    hookWithSurface: "Pourquoi cette phrase utilise-t-elle « {surface} » ?",
    question: "Pourquoi -ешь ?",
    intuition:
      "En russe, la terminaison du verbe répond à une seule question : qui fait l'action, maintenant ? Le pronom est souvent invisible — la terminaison le remplace.",
    visual: {
      nodes: ["читать", "я читаю", "ты читаешь", "он читает"],
      layout: "vertical",
      caption: "Du lemme à la forme conjuguée",
    },
    explanation: [
      "Tu vois читаешь dans la phrase : la terminaison -ешь signale que c'est « tu » qui agis, maintenant.",
      "Ce n'est pas une variante décorative — c'est la conjugaison du présent : le russe intègre le pronom dans le verbe.",
    ],
    comparison: [
      {
        fromForm: "читать",
        toForm: "читаешь",
        explanation: "читать = lemme. читаешь = tu + maintenant.",
      },
      {
        fromForm: "читаешь",
        toForm: "читал",
        explanation: "Le passé (читал) remplace le présent — autre temps, autre terminaison.",
      },
    ],
    commonMistake: "Ne pas confondre читаешь (présent) et читал (passé).",
    reuse: [
      "Ты делаешь, ты говоришь, ты пишешь — même terminaison, même logique.",
      "Dans tout texte au présent, cherche qui agit : la terminaison te le dira.",
    ],
    memoryAnchor: "Pense à une grille : lignes = personnes, colonne = présent.",
  },
  "verb-imperfective-aspect": {
    hook: "Pourquoi le russe a deux façons de dire « lire » ?",
    hookWithSurface: "Pourquoi « {surface} » décrit une action en cours ?",
    question: "Pourquoi deux verbes pour la même action ?",
    intuition:
      "Le russe regarde une action comme un film : soit il suit le déroulement, soit il fixe le résultat. Avant de parler d'imperfectif, pense au film.",
    visual: {
      nodes: ["читать", "────────────>"],
      layout: "horizontal",
      caption: "Processus en cours",
    },
    explanation: [
      "читать ne promet pas qu'un livre est fini : il décrit la lecture comme activité — en cours ou habituelle.",
      "C'est l'aspect imperfectif : le russe regarde l'action de l'intérieur, pas le point final.",
    ],
    comparison: [
      {
        fromForm: "читать",
        toForm: "прочитать",
        explanation: "прочитать place un point final. читать, non.",
      },
    ],
    commonMistake: "Ne pas confondre imperfectif russe et imparfait français.",
    reuse: [
      "делать / сделать, писать / написать — même logique partout.",
      "Action en cours dans un texte ? Cherche l'imperfectif.",
    ],
    memoryAnchor: "Pense à un film — l'action se déroule.",
  },
  "verb-perfective-aspect": {
    hook: "Pourquoi cette phrase utilise-t-elle un verbe différent pour une action terminée ?",
    hookWithSurface: "Pourquoi « {surface} » marque une action terminée ?",
    question: "Pourquoi прочитать et pas читать ?",
    intuition:
      "Le russe peut photographier une action : pas le déroulement, le résultat. Le perfectif, c'est la photo finale.",
    visual: {
      nodes: ["читать", "прочитать •"],
      layout: "comparison",
      caption: "Processus vs résultat",
    },
    explanation: [
      "прочитать ne décrit pas une lecture en cours : le livre est lu jusqu'au bout.",
      "Le préfixе про- renforce l'achèvement. Même action, regard différent — c'est l'aspect perfectif.",
    ],
    comparison: [
      {
        fromForm: "читать",
        toForm: "прочитать",
        explanation: "Processus → résultat atteint.",
      },
    ],
    commonMistake: "Ne pas confondre читать (en cours) et прочитать (terminé).",
    reuse: [
      "сделать, понять, написать — même logique de résultat.",
      "Action terminée dans un récit ? Le perfectif est souvent là.",
    ],
    memoryAnchor: "Pense à une photo — l'action est finie.",
  },
  "aspect-pairs": {
    hook: "Pourquoi apprendre deux verbes pour une seule action ?",
    question: "Pourquoi читать et прочитать ensemble ?",
    intuition:
      "En russe, les verbes voyagent en paires : un pour le processus, un pour le résultat. Apprendre une paire, c'est apprendre deux regards sur la même action.",
    visual: {
      nodes: ["читать", "↔", "прочитать"],
      layout: "comparison",
    },
    explanation: [
      "читать et прочитать ne sont pas des synonymes : ils forment une paire aspectuelle.",
      "Quand tu rencontres l'un, cherche toujours l'autre — c'est la même action, deux angles.",
    ],
    comparison: [
      {
        fromForm: "делать",
        toForm: "сделать",
        explanation: "Faire (processus) → faire jusqu'au bout (résultat).",
      },
    ],
    commonMistake: "Apprendre прочитать sans connaître читать.",
    reuse: [
      "писать / написать, говорить / сказать — des dizaines de paires identiques.",
    ],
    memoryAnchor: "Pense à deux faces d'une même pièce.",
  },
  "verb-movement-prefixes": {
    hook: "Pourquoi un petit préfixe change tout le sens du déplacement ?",
    hookWithSurface: "Pourquoi « {surface} » ajoute une direction ?",
    question: "Pourquoi un préfixe ?",
    intuition:
      "En russe, la direction du mouvement vit dans le verbe. по-, у-, при- ne sont pas des décorations — ce sont des morceaux de sens réutilisables.",
    visual: {
      nodes: ["ехать", "поехать", "уехать", "приехать"],
      layout: "vertical",
    },
    explanation: [
      "поехать ne remplace pas ехать au hasard : по- ajoute l'idée d'un départ vers un but.",
      "Chaque préfixe est une brique : по- (départ), у- (éloignement), при- (arrivée).",
    ],
    comparison: [
      {
        fromForm: "ехать",
        toForm: "поехать",
        explanation: "Se déplacer → partir vers un lieu.",
      },
      {
        fromForm: "поехать",
        toForm: "уехать",
        explanation: "Partir → quitter, s'éloigner.",
      },
    ],
    commonMistake: "Confondre поехать (véhicule) et пойти (à pied).",
    reuse: [
      "прийти, уйти, выйти — mêmes préfixes, autres verbes de base.",
    ],
    memoryAnchor: "Pense à des flèches : → départ, ← éloignement, ↓ arrivée.",
  },
  "verbs-of-motion": {
    hook: "Pourquoi le russe distingue « aller » à pied et en véhicule ?",
    hookWithSurface: "Pourquoi « {surface} » implique un mode de déplacement ?",
    question: "Pourquoi deux verbes pour « aller » ?",
    intuition:
      "En russe, « aller » n'est jamais neutre : le mode (pied ou véhicule) et la direction (aller simple ou aller-retour) sont obligatoires.",
    visual: {
      nodes: ["идти →", "ходить ⇄⇄⇄"],
      layout: "comparison",
    },
    explanation: [
      "идти = déplacement à pied, une direction. ходить = allers-retours ou habitude à pied.",
      "De même : ехать (trajet en véhicule) vs ездить (déplacements répétés en véhicule).",
    ],
    comparison: [
      {
        fromForm: "идти",
        toForm: "ходить",
        explanation: "Un trajet → aller-retour ou habitude.",
      },
      {
        fromForm: "ехать",
        toForm: "ездить",
        explanation: "Un trajet en voiture → déplacements répétés.",
      },
    ],
    commonMistake: "Utiliser идти pour un trajet en voiture.",
    reuse: [
      "Я иду домой / Мы ездим на работу — le mode est toujours explicite.",
    ],
    memoryAnchor: "Pense à une flèche (→) vs des allers-retours (⇄).",
  },
  "reflexive-possessive": {
    hook: "Pourquoi le russe utilise свой au lieu de « mon » ?",
    hookWithSurface: "Pourquoi « {surface} » renvoie au possesseur de la phrase ?",
    question: "Pourquoi свой et pas мой ?",
    intuition:
      "свой ne dit pas « à moi » — il dit « au possesseur dont on parle déjà ». Le russe évite l'ambiguïté : à qui appartient vraiment la chose ?",
    visual: {
      nodes: ["мой", "свой"],
      layout: "comparison",
    },
    explanation: [
      "Quand le sujet possède quelque chose, le russe préfère свой à мой/твой/его.",
      "свой renvoie au possesseur du groupe nominal — pas au locuteur.",
    ],
    comparison: [
      {
        fromForm: "мой",
        toForm: "свой",
        explanation: "мой = à moi (locuteur). свой = au possesseur de la phrase.",
      },
    ],
    commonMistake: "Traduire свой par « mon » systématiquement.",
    reuse: [
      "Он любит свою работу, Она взяла свою сумку — même logique.",
    ],
    memoryAnchor: "Pense au propriétaire de la phrase.",
  },
  "noun-declension": {
    hook: "Pourquoi un nom change de forme dans la phrase ?",
    hookWithSurface: "Pourquoi « {surface} » n'a pas la forme du dictionnaire ?",
    question: "Pourquoi книгу et pas книга ?",
    intuition:
      "En russe, chaque nom joue un rôle — comme un acteur. Sa terminaison montre ce rôle : sujet, objet, lieu, moyen…",
    visual: {
      nodes: ["Я вижу", "↓", "кого ?", "↓", "Машу"],
      layout: "vertical",
    },
    explanation: [
      "книгу n'est pas une faute : c'est l'accusatif — le nom change parce qu'il est l'objet direct de « je vois ».",
      "Le nominatif (книга) est la forme du dictionnaire. Les autres cas montrent le rôle dans la phrase.",
    ],
    comparison: [
      {
        fromForm: "книга",
        toForm: "книгу",
        explanation: "Sujet (книга) → objet direct (книгу).",
      },
    ],
    commonMistake: "Apprendre les cas comme une liste sans fonction.",
    reuse: [
      "стол / стола / столу — chaque forme = un rôle différent.",
    ],
    memoryAnchor: "Pense au rôle que joue chaque acteur.",
  },
  "noun-gender": {
    hook: "Pourquoi le genre compte autant en russe ?",
    question: "Pourquoi новая et pas новый ?",
    intuition:
      "Chaque nom russe appartient à une famille : masculin, féminin ou neutre. Cette famille détermine toutes les formes autour du nom.",
    visual: {
      nodes: ["стол (m.)", "книга (f.)", "окно (n.)"],
      layout: "vertical",
    },
    explanation: [
      "Le genre n'est pas optionnel : il conditionne déclinaison, adjectifs, pronoms.",
      "книга est féminin — c'est pourquoi l'adjectif devient новая, pas новый.",
    ],
    comparison: [
      {
        fromForm: "новый стол",
        toForm: "новая книга",
        explanation: "Masculin → féminin : l'adjectif suit.",
      },
    ],
    commonMistake: "Deviner le genre sans vérifier l'accord.",
    reuse: [
      "Новый дом, новая квартира, новое окно — trois genres, trois formes.",
    ],
    memoryAnchor: "Pense à trois familles de mots.",
  },
  "adjective-agreement": {
    hook: "Pourquoi l'adjectif change quand le nom change ?",
    hookWithSurface: "Pourquoi l'adjectif s'accorde avec « {surface} » ?",
    question: "Pourquoi новая et pas новый ?",
    intuition:
      "L'adjectif est le miroir du nom : il copie son genre, son nombre et son cas. Pas de liberté — c'est un reflet.",
    visual: {
      nodes: ["книга", "новая книга"],
      layout: "vertical",
    },
    explanation: [
      "новая s'accorde avec книга (féminin singulier). Ce n'est pas une variante — c'est l'accord.",
      "Change le nom, l'adjectif suit : masculin, féminin, neutre, pluriel.",
    ],
    comparison: [
      {
        fromForm: "новый стол",
        toForm: "новая книга",
        explanation: "Le genre du nom change, l'adjectif suit.",
      },
    ],
    commonMistake: "Oublier l'accord au pluriel (новые книги).",
    reuse: [
      "Хороший день, хорошая погода, хорошее настроение — même règle.",
    ],
    memoryAnchor: "Pense à un miroir — l'adjectif reflète le nom.",
  },
  "preposition-government": {
    hook: "Pourquoi la même préposition exige des formes différentes ?",
    hookWithSurface: "Pourquoi « {surface} » suit une préposition précise ?",
    question: "Pourquoi в Москву et в Москве ?",
    intuition:
      "Chaque préposition russe impose un cas — comme un contrat. в + direction ≠ в + lieu. Le cas n'est pas libre.",
    visual: {
      nodes: ["в + Acc.", "в + Prép."],
      layout: "comparison",
    },
    explanation: [
      "в Москву (accusatif) = direction. в Москве (prépositionnel) = lieu.",
      "La préposition в ne change pas — le cas, oui. C'est la régence.",
    ],
    comparison: [
      {
        fromForm: "в Москву",
        toForm: "в Москве",
        explanation: "Direction (accusatif) → lieu (prépositionnel).",
      },
    ],
    commonMistake: "Mélanger direction et lieu avec в/на.",
    reuse: [
      "Я еду в Москву / Я в Москве — à retrouver dans tout texte de voyage.",
    ],
    memoryAnchor: "Pense à un contrat : préposition + cas fixe.",
  },
};
