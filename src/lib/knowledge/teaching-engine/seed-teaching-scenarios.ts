/**
 * Scénarios d'enseignement seed — contrat géométrie variable.
 *
 * Statut éditorial : à valider — relecture humaine requise avant prod.
 * validé manuellement — ne pas générer par LLM (formes via morphology/curated)
 */

import type { TTeachingScenarioContent } from "@/types/teaching-scenario";

import {
  CURATED_ADJECTIVES,
  CURATED_AGREEMENT_NOUNS,
  CURATED_ANNA,
  CURATED_AUDITORIYA,
  CURATED_CHITAT,
  CURATED_DELAT,
  CURATED_EXAMPLE_PHRASES,
  CURATED_GOVORIT,
  CURATED_KARTA,
  CURATED_KNIGA,
  CURATED_MOSKVA,
  CURATED_MOTION,
  CURATED_NAJTI_PAST,
  CURATED_NOUNS_GENDER,
  CURATED_OKNO_CASES,
  CURATED_PISAT,
  CURATED_POSSESSIVE,
  CURATED_PREP_GOVERNMENT_EXAMPLES,
  CURATED_PRESENT_SG2,
  CURATED_PROCHITAT,
  CURATED_SLUCHITSYA_PAST,
  CURATED_STOL,
  CURATED_UNIVERSITET,
  CURATED_VRACH,
} from "@/lib/knowledge/morphology/curated";

/** à valider — relecture humaine requise */
export const SEED_TEACHING_SCENARIOS_REVIEW_STATUS = "à-valider" as const;

/**
 * 11 scénarios seed.
 * Statut : à valider — relecture humaine requise.
 */
export const SEED_TEACHING_SCENARIOS: Record<string, TTeachingScenarioContent> = {
  // ─── à valider ─────────────────────────────────────────────
  "verb-present-conjugation": {
    principle:
      "En russe, la terminaison du verbe dit qui fait l'action, maintenant.",
    fact: "En russe, la terminaison du verbe dit qui fait l'action, maintenant.",
    intuition:
      "Contrairement au français, le russe intègre souvent le pronom dans la terminaison : une seule forme suffit à dire qui agit.",
    contrast: [
      {
        fromForm: `ты ${CURATED_CHITAT.present.sg2}`,
        toForm: `он ${CURATED_CHITAT.present.sg3}`,
        explanation: "Même présent, seule la personne change.",
      },
    ],
    visual: {
      nodes: [
        `я ${CURATED_CHITAT.present.sg1} (${CURATED_CHITAT.endings.sg1})`,
        `ты ${CURATED_CHITAT.present.sg2} (${CURATED_CHITAT.endings.sg2})`,
        `он ${CURATED_CHITAT.present.sg3} (${CURATED_CHITAT.endings.sg3})`,
      ],
      layout: "vertical",
      caption: "Illustration — présent (1re conjugaison)",
    },
    commonMistake: `Ne confonds pas ${CURATED_CHITAT.present.sg2} (présent, 2e pers.) et ${CURATED_CHITAT.past.m} (passé).`,
    reuse: [
      `Ты ${CURATED_PRESENT_SG2.delaesh}, ты ${CURATED_PRESENT_SG2.govorish}, ты ${CURATED_PRESENT_SG2.pishesh} — même logique de personne au présent.`,
    ],
    memoryAnchor: "Terminaison du présent = qui agit, maintenant.",
    illustration: {
      label: "conjugaison au présent",
      fact: `La terminaison ${CURATED_CHITAT.endings.sg2} marque la 2e personne du singulier au présent (exemple : ${CURATED_CHITAT.infinitive}).`,
      contrast: [
        {
          fromForm: `ты ${CURATED_CHITAT.present.sg2}`,
          toForm: `он ${CURATED_CHITAT.present.sg3}`,
          explanation: "Même présent, seule la personne change.",
        },
      ],
      visual: {
        nodes: [
          `я ${CURATED_CHITAT.present.sg1} (${CURATED_CHITAT.endings.sg1})`,
          `ты ${CURATED_CHITAT.present.sg2} (${CURATED_CHITAT.endings.sg2})`,
          `он ${CURATED_CHITAT.present.sg3} (${CURATED_CHITAT.endings.sg3})`,
        ],
        layout: "vertical",
        caption: "Illustration — présent (trois personnes)",
      },
      commonMistake: `Ne confonds pas ${CURATED_CHITAT.present.sg2} (présent, 2e pers.) et ${CURATED_CHITAT.past.m} (passé).`,
      reuse: [
        `Ты ${CURATED_PRESENT_SG2.delaesh}, ты ${CURATED_PRESENT_SG2.govorish}, ты ${CURATED_PRESENT_SG2.pishesh} — même terminaison ${CURATED_CHITAT.endings.sg2}, même logique.`,
      ],
      memoryAnchor: `${CURATED_CHITAT.endings.sg2} = 2e personne du singulier, présent.`,
    },
  },

  // ─── à valider ─────────────────────────────────────────────
  "verb-imperfective-aspect": {
    intuition:
      "Avant de nommer l'imperfectif : le russe peut suivre une action comme un film — sans fixer le résultat.",
    fact: `${CURATED_CHITAT.infinitive} est à l'aspect imperfectif : il décrit un processus ou une habitude, pas un résultat fini.`,
    contrast: [
      {
        fromForm: CURATED_CHITAT.infinitive,
        toForm: CURATED_PROCHITAT.infinitive,
        explanation:
          "Même action « lire » : imperfectif = processus ; perfectif = résultat atteint.",
      },
    ],
    commonMistake: `Ne traduis pas imperfectif par « imparfait » français — ${CURATED_CHITAT.infinitive} n'est pas un temps, c'est un aspect.`,
    reuse: [
      `${CURATED_DELAT.imperfective} / ${CURATED_DELAT.perfective}, ${CURATED_PISAT.imperfective} / ${CURATED_PISAT.perfective} — même logique.`,
    ],
    memoryAnchor: `${CURATED_CHITAT.infinitive} = aspect imperfectif : processus, pas résultat fini.`,
  },

  // ─── à valider — mètre-étalon (aspect perfectif) ───────────
  "verb-perfective-aspect": {
    hook: "Pourquoi le russe choisit parfois un autre verbe pour une action terminée ?",
    question: `Pourquoi ${CURATED_PROCHITAT.infinitive} et pas ${CURATED_CHITAT.infinitive} ?`,
    intuition:
      "Le russe peut photographier une action : pas le déroulement, le résultat. Le perfectif, c'est ce regard final.",
    fact: `${CURATED_PROCHITAT.infinitive} est à l'aspect perfectif : l'action est vue comme terminée, résultat atteint.`,
    contrast: [
      {
        fromForm: CURATED_CHITAT.infinitive,
        toForm: CURATED_PROCHITAT.infinitive,
        explanation:
          "Même action « lire » : imperfectif = en cours ; perfectif = livre lu jusqu'au bout.",
      },
    ],
    visual: {
      nodes: [CURATED_CHITAT.infinitive, CURATED_PROCHITAT.infinitive],
      layout: "comparison",
      caption: "Illustration — paire aspectuelle (processus vs résultat)",
    },
    commonMistake: `Ne confonds pas ${CURATED_CHITAT.infinitive} (processus, imperfectif) et ${CURATED_PROCHITAT.infinitive} (résultat, perfectif).`,
    reuse: [
      `${CURATED_DELAT.perfective}, ${CURATED_PISAT.perfective} — même logique de résultat.`,
    ],
    memoryAnchor: `${CURATED_PROCHITAT.infinitive} = aspect perfectif : l'action est terminée.`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "aspect-pairs": {
    intuition:
      "En russe, beaucoup de verbes voyagent à deux : un pour le processus, un pour le résultat.",
    fact: `${CURATED_CHITAT.infinitive} (aspect imperfectif) et ${CURATED_PROCHITAT.infinitive} (aspect perfectif) forment une paire : même action, deux aspects.`,
    contrast: [
      {
        fromForm: CURATED_DELAT.imperfective,
        toForm: CURATED_DELAT.perfective,
        explanation:
          "Paire aspectuelle : imperfectif (processus) vs perfectif (résultat).",
      },
    ],
    commonMistake: `N'apprends pas ${CURATED_PROCHITAT.infinitive} sans ${CURATED_CHITAT.infinitive} — c'est une paire.`,
    reuse: [
      `${CURATED_PISAT.imperfective} / ${CURATED_PISAT.perfective}, ${CURATED_GOVORIT.imperfective} / ${CURATED_GOVORIT.perfective} — même type de paires.`,
    ],
    memoryAnchor: `Une paire aspectuelle = imperfectif + perfectif pour la même action (${CURATED_CHITAT.infinitive} / ${CURATED_PROCHITAT.infinitive}).`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "verb-movement-prefixes": {
    intuition:
      "En russe, la direction du déplacement vit souvent dans un préfixe collé au verbe.",
    fact: `Le préfixe по- dans ${CURATED_MOTION.poehat} ajoute l'idée d'un départ (aspect et direction), par rapport à ${CURATED_MOTION.ehat}.`,
    contrast: [
      {
        fromForm: CURATED_MOTION.ehat,
        toForm: CURATED_MOTION.poehat,
        explanation: "Même mode (véhicule) : sans préfixe vs départ (по-).",
      },
    ],
    visual: {
      nodes: [
        CURATED_MOTION.ehat,
        CURATED_MOTION.poehat,
        CURATED_MOTION.uehat,
        CURATED_MOTION.priehat,
      ],
      layout: "vertical",
      caption: "Illustration — préfixes de déplacement (по- / у- / при-)",
    },
    commonMistake: `Ne confonds pas ${CURATED_MOTION.poehat} (véhicule) et ${CURATED_MOTION.pojti} (à pied) — le préfixe по- s'attache à la bonne base.`,
    reuse: [
      `${CURATED_MOTION.prijti}, ${CURATED_MOTION.uiti}, ${CURATED_MOTION.vyiti} — mêmes préfixes, base à pied.`,
    ],
    memoryAnchor: `по- dans ${CURATED_MOTION.poehat} = départ ; le préfixe porte la direction.`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "verbs-of-motion": {
    intuition:
      "En russe, « aller » n'est jamais neutre : pied ou véhicule, trajet simple ou allers-retours.",
    fact: `${CURATED_MOTION.idti} = un trajet à pied (une direction) ; ${CURATED_MOTION.hodit} = allers-retours ou habitude à pied.`,
    contrast: [
      {
        fromForm: CURATED_MOTION.idti,
        toForm: CURATED_MOTION.hodit,
        explanation:
          "Même mode (à pied) : un trajet vs allers-retours / habitude.",
      },
    ],
    visual: {
      nodes: [
        CURATED_MOTION.idti,
        CURATED_MOTION.hodit,
        CURATED_MOTION.ehat,
        CURATED_MOTION.ezdit,
      ],
      layout: "comparison",
      caption: "Illustration — pied (идти́ / ходи́ть) vs véhicule (е́хать / е́здить)",
    },
    commonMistake: `N'utilise pas ${CURATED_MOTION.idti} pour un trajet en voiture — prends ${CURATED_MOTION.ehat}.`,
    reuse: [
      `${CURATED_EXAMPLE_PHRASES.yaIdu} — le mode (à pied) reste explicite dans le verbe.`,
    ],
    memoryAnchor: `${CURATED_MOTION.idti} = un trajet à pied ; ${CURATED_MOTION.hodit} = allers-retours ou habitude.`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "reflexive-possessive": {
    intuition:
      "свой ne dit pas « à moi » : il dit « au possesseur dont on parle déjà dans la phrase ».",
    fact: `${CURATED_POSSESSIVE.svoj} = possessif du sujet de la phrase ; ${CURATED_POSSESSIVE.moj} = possessif du locuteur (1re personne).`,
    contrast: [
      {
        fromForm: CURATED_POSSESSIVE.moj,
        toForm: CURATED_POSSESSIVE.svoj,
        explanation:
          "мой = à moi (locuteur). свой = au possesseur déjà nommé dans la phrase.",
      },
    ],
    visual: {
      nodes: [CURATED_POSSESSIVE.moj, CURATED_POSSESSIVE.svoj],
      layout: "comparison",
      caption: "Illustration — possession (locuteur vs possesseur de la phrase)",
    },
    commonMistake: `Ne traduis pas ${CURATED_POSSESSIVE.svoj} par « mon » systématiquement — regarde qui possède dans la phrase.`,
    reuse: [
      `${CURATED_EXAMPLE_PHRASES.onLyubitSvoyuRabotu} — ${CURATED_POSSESSIVE.svoj} suit le sujet он.`,
    ],
    memoryAnchor: `${CURATED_POSSESSIVE.svoj} = au possesseur de la phrase ; ${CURATED_POSSESSIVE.moj} = à moi (locuteur).`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "noun-declension": {
    intuition:
      "En russe, la terminaison du nom montre son rôle dans la phrase — sujet, objet, lieu…",
    fact: `${CURATED_KNIGA.acc} est à l'accusatif : objet direct — ce n'est pas la forme du dictionnaire (${CURATED_KNIGA.nom}, nominatif).`,
    contrast: [
      {
        fromForm: CURATED_KNIGA.nom,
        toForm: CURATED_KNIGA.acc,
        explanation: "Nominatif (sujet / forme de départ) vs accusatif (objet).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_KNIGA.nom} (nominatif)`,
        `${CURATED_KNIGA.acc} (accusatif)`,
        `${CURATED_KNIGA.gen} (génitif)`,
      ],
      layout: "vertical",
      caption: "Illustration — même nom, cas différents (rôles)",
    },
    commonMistake: `N'apprends pas les cas comme une liste : ${CURATED_KNIGA.acc} existe parce que le nom est objet direct.`,
    reuse: [
      `${CURATED_KNIGA.nom} / ${CURATED_KNIGA.acc} / ${CURATED_KNIGA.gen} — chaque forme = un rôle.`,
    ],
    memoryAnchor: `${CURATED_KNIGA.acc} = accusatif (objet direct) ; ${CURATED_KNIGA.nom} = nominatif.`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "noun-gender": {
    fact: `Chaque nom russe a un genre (masculin, féminin, neutre) : ${CURATED_NOUNS_GENDER.kniga} est féminin — d'où ${CURATED_ADJECTIVES.novaya}, pas ${CURATED_ADJECTIVES.novyj}.`,
    contrast: [
      {
        fromForm: `${CURATED_ADJECTIVES.novyj} ${CURATED_NOUNS_GENDER.stol}`,
        toForm: `${CURATED_ADJECTIVES.novaya} ${CURATED_NOUNS_GENDER.kniga}`,
        explanation: "Même adjectif : le genre du nom change, l'accord suit.",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_NOUNS_GENDER.stol} (m.)`,
        `${CURATED_NOUNS_GENDER.kniga} (f.)`,
        `${CURATED_NOUNS_GENDER.okno} (n.)`,
      ],
      layout: "vertical",
      caption: "Illustration — trois genres, trois familles d'accord",
    },
    commonMistake: `Vérifie le genre avant l'accord : ${CURATED_NOUNS_GENDER.kniga} → ${CURATED_ADJECTIVES.novaya}.`,
    reuse: [
      `${CURATED_ADJECTIVES.novyj} ${CURATED_NOUNS_GENDER.dom}, ${CURATED_ADJECTIVES.novaya} ${CURATED_NOUNS_GENDER.kvartira}, ${CURATED_ADJECTIVES.novoe} ${CURATED_NOUNS_GENDER.okno}.`,
    ],
    memoryAnchor: `Genre du nom (${CURATED_NOUNS_GENDER.kniga} = féminin) → forme de l'adjectif (${CURATED_ADJECTIVES.novaya}).`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "adjective-agreement": {
    intuition:
      "L'adjectif copie le genre, le nombre et le cas du nom — pas de forme libre.",
    fact: `${CURATED_ADJECTIVES.novaya} s'accorde avec ${CURATED_KNIGA.nom} : féminin singulier — c'est l'accord de l'adjectif.`,
    contrast: [
      {
        fromForm: `${CURATED_ADJECTIVES.novyj} ${CURATED_NOUNS_GENDER.stol}`,
        toForm: `${CURATED_ADJECTIVES.novaya} ${CURATED_KNIGA.nom}`,
        explanation: "Seul le genre du nom change : l'adjectif suit (accord).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_ADJECTIVES.novyj} ${CURATED_NOUNS_GENDER.stol}`,
        `${CURATED_ADJECTIVES.novaya} ${CURATED_KNIGA.nom}`,
        `${CURATED_ADJECTIVES.novoe} ${CURATED_NOUNS_GENDER.okno}`,
      ],
      layout: "vertical",
      caption: "Illustration — même adjectif, trois genres",
    },
    commonMistake: `N'oublie pas le pluriel : ${CURATED_ADJECTIVES.novye} ${CURATED_AGREEMENT_NOUNS.knigi} — l'accord continue.`,
    reuse: [
      `${CURATED_ADJECTIVES.horoshij} ${CURATED_AGREEMENT_NOUNS.den}, ${CURATED_ADJECTIVES.horoshaya} ${CURATED_AGREEMENT_NOUNS.pogoda}, ${CURATED_ADJECTIVES.horoshee} ${CURATED_AGREEMENT_NOUNS.nastroenie} — même règle.`,
    ],
    memoryAnchor: `Adjectif = accord avec le nom : ${CURATED_ADJECTIVES.novaya} suit ${CURATED_KNIGA.nom} (féminin).`,
  },

  // ─── à valider ─────────────────────────────────────────────
  "preposition-government": {
    intuition:
      "Chaque préposition russe impose un cas — ce n'est pas un choix libre.",
    // Défaut canonique : в / на (direction vs lieu) — remplacé si variante match.
    fact: `Après в : l'accusatif marque куда́ (${CURATED_MOSKVA.direction}) ; le prépositionnel marque где (${CURATED_MOSKVA.location}).`,
    contrast: [
      {
        fromForm: CURATED_MOSKVA.direction,
        toForm: CURATED_MOSKVA.location,
        explanation:
          "Même préposition в : accusatif (куда́) vs prépositionnel (где).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_MOSKVA.direction} (accusatif)`,
        `${CURATED_MOSKVA.location} (prépositionnel)`,
      ],
      layout: "comparison",
      caption: "Illustration — в + cas (куда́ vs где)",
    },
    commonMistake: `Ne mélange pas ${CURATED_MOSKVA.direction} (куда́, accusatif) et ${CURATED_MOSKVA.location} (где, prépositionnel).`,
    reuse: [
      `${CURATED_EXAMPLE_PHRASES.yaEduVMoskvu} / ${CURATED_EXAMPLE_PHRASES.yaVMoskve} — même opposition partout.`,
    ],
    memoryAnchor: `в + accusatif = куда́ ; в + prépositionnel = где.`,
    illustrationVariants: [
      {
        id: "genitive",
        cases: ["genitive"],
        prepositions: ["до", "из", "от", "без", "для", "после", "около"],
        fact: `Après до / из / от : le génitif est obligatoire — ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.doSvidaniya}, ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.izMoskvy}.`,
        contrast: [
          {
            fromForm: CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.doSvidaniya,
            toForm: CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.otStola,
            explanation:
              "Même cas (génitif) : до et от imposent la forme génitive au nom qui suit.",
          },
        ],
        visual: {
          nodes: [
            CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.doSvidaniya,
            CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.izMoskvy,
            CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.otStola,
          ],
          layout: "vertical",
          caption: "Illustration — до / из / от + génitif",
        },
        commonMistake: `Après до, le génitif est fixe : ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.doSvidaniya} — pas un autre cas.`,
        reuse: [
          `${CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.izMoskvy}, ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.otStola} — même régence génitive.`,
        ],
        memoryAnchor: `до / из / от + génitif (ex. ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitive.doSvidaniya}).`,
      },
      {
        id: "genitive-near",
        cases: ["genitive"],
        prepositions: ["у"],
        fact: `Après у : le génitif dit « près de » — ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitiveNear.uOkna} (près de la fenêtre), et non « chez » comme до/из/от.`,
        contrast: [
          {
            fromForm: CURATED_OKNO_CASES.nom,
            toForm: CURATED_PREP_GOVERNMENT_EXAMPLES.genitiveNear.uOkna,
            explanation: "у impose le génitif : окно́ → у окна́ (près de la fenêtre).",
          },
        ],
        visual: {
          nodes: [
            CURATED_PREP_GOVERNMENT_EXAMPLES.genitiveNear.uOkna,
            CURATED_PREP_GOVERNMENT_EXAMPLES.genitiveNear.uStola,
          ],
          layout: "vertical",
          caption: "Illustration — у + génitif (près de)",
        },
        commonMistake: `Après у, garde le génitif même pour un lieu : ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitiveNear.uOkna}, pas ${CURATED_OKNO_CASES.nom}.`,
        reuse: [
          `${CURATED_PREP_GOVERNMENT_EXAMPLES.genitiveNear.uStola} — même régence génitive, sens « près de ».`,
        ],
        memoryAnchor: `у + génitif = près de (ex. ${CURATED_PREP_GOVERNMENT_EXAMPLES.genitiveNear.uOkna}).`,
      },
      {
        id: "dative",
        cases: ["dative"],
        prepositions: ["к", "по"],
        fact: `Après к : le datif est obligatoire — ${CURATED_PREP_GOVERNMENT_EXAMPLES.dative.kStolu}.`,
        contrast: [
          {
            fromForm: CURATED_STOL.nom,
            toForm: CURATED_PREP_GOVERNMENT_EXAMPLES.dative.kStolu,
            explanation: "к impose le datif : стол → к столу́.",
          },
        ],
        visual: {
          nodes: [
            CURATED_PREP_GOVERNMENT_EXAMPLES.dative.kStolu,
            CURATED_PREP_GOVERNMENT_EXAMPLES.dative.kDrugu,
          ],
          layout: "vertical",
          caption: "Illustration — к + datif",
        },
        commonMistake: `Après к, utilise le datif : ${CURATED_PREP_GOVERNMENT_EXAMPLES.dative.kStolu}, pas le nominatif.`,
        reuse: [
          `${CURATED_PREP_GOVERNMENT_EXAMPLES.dative.kDrugu} — même régence datif après к.`,
        ],
        memoryAnchor: `к + datif (ex. ${CURATED_PREP_GOVERNMENT_EXAMPLES.dative.kStolu}).`,
      },
      {
        id: "direction-location",
        cases: ["accusative", "prepositional"],
        prepositions: ["в", "во", "на"],
        fact: `Après в / на : l'accusatif marque куда́ (${CURATED_MOSKVA.direction}) ; le prépositionnel marque где (${CURATED_MOSKVA.location}).`,
        contrast: [
          {
            fromForm: CURATED_MOSKVA.direction,
            toForm: CURATED_MOSKVA.location,
            explanation:
              "Même préposition в : accusatif (куда́) vs prépositionnel (где).",
          },
        ],
        visual: {
          nodes: [
            `${CURATED_MOSKVA.direction} (accusatif)`,
            `${CURATED_MOSKVA.location} (prépositionnel)`,
            `${CURATED_PREP_GOVERNMENT_EXAMPLES.directionLocation.naDirection} / ${CURATED_PREP_GOVERNMENT_EXAMPLES.directionLocation.naLocation}`,
          ],
          layout: "comparison",
          caption: "Illustration — в / на + cas (куда́ vs где)",
        },
        commonMistake: `Ne mélange pas ${CURATED_MOSKVA.direction} (куда́, accusatif) et ${CURATED_MOSKVA.location} (где, prépositionnel).`,
        reuse: [
          `${CURATED_EXAMPLE_PHRASES.yaEduVMoskvu} / ${CURATED_EXAMPLE_PHRASES.yaVMoskve} — même opposition partout.`,
        ],
        memoryAnchor: `в / на + accusatif = куда́ ; + prépositionnel = где.`,
      },
    ],
  },

  // ─── brouillon — lot 01 ────────────────────────────────────
  "case-accusative": {
    principle:
      "En français, l'ordre des mots dit qui fait quoi. En russe, c'est souvent la fin du mot qui le dit.",
    fact: `En français, « le chat voit le chien » n'est pas « le chien voit le chat » : l'ordre décide. En russe, ${CURATED_KNIGA.acc} (terminaison -у) est ce qu'on lit — l'objet — où qu'il soit dans la phrase. Cette forme s'appelle l'accusatif.`,
    contrast: [
      {
        fromForm: CURATED_KNIGA.nom,
        toForm: CURATED_KNIGA.acc,
        explanation:
          "Même mot : forme de départ (sujet) vs objet (ce qu'on lit).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_KNIGA.nom} (sujet)`,
        `${CURATED_KNIGA.acc} (objet)`,
      ],
      layout: "comparison",
      caption: "Illustration — sujet → objet (terminaison)",
    },
    commonMistake: `Repère d'abord l'objet dans la phrase : ${CURATED_KNIGA.acc} (ce qu'on lit), avant de nommer le cas.`,
    reuse: [
      `в ${CURATED_UNIVERSITET.acc} : même logique de forme pour dire où l'on va avec в (texte « Premier jour »).`,
    ],
    memoryAnchor: `${CURATED_KNIGA.acc} = objet (ce qu'on lit) ; la terminaison -у porte ce rôle — c'est l'accusatif.`,
  },

  // ─── brouillon — lot 01 ────────────────────────────────────
  "noun-animacy": {
    principle:
      "Pour un masculin qui est l'objet de l'action, la forme dépend de l'animation : être vivant ou chose.",
    fact: `${CURATED_VRACH.acc} (même forme que le génitif) marque un masculin animé objet ; ${CURATED_STOL.acc} (même forme que le nominatif) marque un masculin inanimé objet.`,
    contrast: [
      {
        fromForm: CURATED_STOL.acc,
        toForm: CURATED_VRACH.acc,
        explanation:
          "Même rôle d'objet : seul l'animé change la forme (chose vs être).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_STOL.acc} (chose)`,
        `${CURATED_VRACH.acc} (être)`,
      ],
      layout: "comparison",
      caption: "Illustration — chose vs être (objet masculin)",
    },
    commonMistake: `Pour un être objet, prends ${CURATED_VRACH.acc}, pas ${CURATED_VRACH.nom} (texte « У врача »).`,
    reuse: [
      `${CURATED_STOL.acc} garde la forme de départ ; ${CURATED_VRACH.acc} reprend ${CURATED_VRACH.gen}.`,
    ],
    memoryAnchor: `Masculin objet : être → ${CURATED_VRACH.acc} (forme du génitif) ; chose → ${CURATED_STOL.acc} (forme du nominatif).`,
  },

  // ─── brouillon — lot 02 ────────────────────────────────────
  "case-genitive": {
    principle:
      "En français, la possession ajoute une préposition : « le livre DE Anna ». En russe, c'est А́нна qui change de forme.",
    fact: `Dans « кни́га ${CURATED_ANNA.gen} » (le livre d'Anna), ${CURATED_ANNA.gen} — et non ${CURATED_ANNA.nom} — dit qui possède le livre. Cette forme s'appelle le génitif.`,
    contrast: [
      {
        fromForm: CURATED_ANNA.nom,
        toForm: CURATED_ANNA.gen,
        explanation:
          "А́нна = forme de départ. А́нны = qui possède (le livre est à elle).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_ANNA.nom} (forme de départ)`,
        `${CURATED_ANNA.gen} (qui possède)`,
      ],
      layout: "comparison",
      caption: "Illustration — qui possède",
    },
    commonMistake: `Garde la forme du possesseur : dis « кни́га ${CURATED_ANNA.gen} », pas « кни́га ${CURATED_ANNA.nom} ».`,
    reuse: [
      `L'absence suit la même logique : « У Луи́ нет ${CURATED_KNIGA.gen} » (Louis n'a pas de livre, texte « У врача ») — ${CURATED_KNIGA.gen} reste au génitif après нет.`,
      `до, из, от, у, без imposent aussi le génitif (ex. « из ${CURATED_MOSKVA.genitive} », texte « Знакомство ») — c'est la préposition qui décide, pas ce concept seul.`,
    ],
    memoryAnchor: `${CURATED_ANNA.gen} = qui possède ; c'est le génitif.`,
  },

  // ─── brouillon — lot 02 ────────────────────────────────────
  "case-dative": {
    principle:
      "En français, on ajoute une préposition pour dire à qui : « je parle À Anna ». En russe, c'est А́нна qui change de forme.",
    fact: `Dans « Луи́ говори́т ${CURATED_ANNA.dat} » (Louis parle à Anna), ${CURATED_ANNA.dat} — et non ${CURATED_ANNA.nom} — dit à qui il parle. Cette forme s'appelle le datif.`,
    contrast: [
      {
        fromForm: CURATED_ANNA.nom,
        toForm: CURATED_ANNA.dat,
        explanation:
          "А́нна = forme de départ. А́нне = à qui (celle qui reçoit la parole).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_ANNA.nom} (forme de départ)`,
        `${CURATED_ANNA.dat} (à qui)`,
      ],
      layout: "comparison",
      caption: "Illustration — à qui",
    },
    commonMistake: `Garde la forme de départ pour le destinataire : dis « говори́т ${CURATED_ANNA.dat} », pas « говори́т ${CURATED_ANNA.nom} ».`,
    reuse: [
      `к suit la même logique de forme (texte « У врача » : « Пойдём к ${CURATED_VRACH.dat} ») — mais c'est la préposition к qui impose le datif, pas ce concept seul.`,
    ],
    memoryAnchor: `${CURATED_ANNA.dat} = à qui ; c'est le datif.`,
  },

  // ─── brouillon — lot 03 ────────────────────────────────────
  "case-instrumental": {
    principle:
      "En français, « avec » ajoute une préposition devant l'outil. En russe, c'est souvent le mot lui-même qui change de forme.",
    fact: `Dans « Луи́ пла́тит ${CURATED_KARTA.instr} » (Louis paie par carte), ${CURATED_KARTA.instr} — et non ${CURATED_KARTA.nom} — dit avec quoi il paie, sans aucun mot en plus. Cette forme s'appelle l'instrumental.`,
    contrast: [
      {
        fromForm: CURATED_KARTA.nom,
        toForm: CURATED_KARTA.instr,
        explanation:
          `${CURATED_KARTA.nom} = forme de départ. ${CURATED_KARTA.instr} = avec quoi (le moyen), sans préposition.`,
      },
    ],
    visual: {
      nodes: [
        `${CURATED_KARTA.nom} (forme de départ)`,
        `${CURATED_KARTA.instr} (avec quoi)`,
      ],
      layout: "comparison",
      caption: "Illustration — avec quoi (le moyen)",
    },
    commonMistake: `Ne garde pas ${CURATED_KARTA.nom} après плати́ть : dis « пла́тит ${CURATED_KARTA.instr} », pas « пла́тит ${CURATED_KARTA.nom} ».`,
    reuse: [
      `с ${CURATED_ANNA.instr} suit la même forme pour dire avec qui on est (accompagnement) — mais c'est la préposition с qui impose l'instrumental, pas ce concept seul.`,
    ],
    memoryAnchor: `${CURATED_KARTA.instr} = avec quoi (le moyen), sans préposition ; c'est l'instrumental.`,
  },

  // ─── brouillon — lot 03 ────────────────────────────────────
  "case-prepositional": {
    principle:
      "En français, « à Moscou » ajoute une préposition. En russe, la préposition ET la forme du mot changent ensemble — ce cas n'existe jamais seul.",
    fact: `Dans « В ${CURATED_AUDITORIYA.prep} уже́ есть студе́нты » (Dans la salle, il y a déjà des étudiants), ${CURATED_AUDITORIYA.prep} — et non ${CURATED_AUDITORIYA.nom} — dit où sont les étudiants. Cette forme s'appelle le prépositionnel : elle n'apparaît jamais sans préposition (в, на ou о).`,
    contrast: [
      {
        fromForm: CURATED_AUDITORIYA.nom,
        toForm: CURATED_AUDITORIYA.prep,
        explanation: `${CURATED_AUDITORIYA.nom} = forme de départ. ${CURATED_AUDITORIYA.prep} = où (le lieu), après в.`,
      },
    ],
    visual: {
      nodes: [
        `${CURATED_AUDITORIYA.nom} (forme de départ)`,
        `в ${CURATED_AUDITORIYA.prep} (où)`,
      ],
      layout: "comparison",
      caption: "Illustration — où, après в",
    },
    commonMistake: `Ne dis pas « в ${CURATED_AUDITORIYA.nom} » : pour dire où l'on est, il faut в ${CURATED_AUDITORIYA.prep} (prépositionnel), pas la forme de départ.`,
    reuse: [
      `${CURATED_MOSKVA.location} suit la même logique — à distinguer de ${CURATED_MOSKVA.direction} (accusatif, destination, куда́, régi par la même préposition в).`,
      `о + prépositionnel suit la même forme pour parler de quelque chose : « говори́т о ${CURATED_MOSKVA.prepositional} » (il parle de Moscou) — même cas, sujet différent.`,
    ],
    memoryAnchor: `${CURATED_AUDITORIYA.prep} = où (après в) ; ce cas ne va jamais sans préposition — c'est le prépositionnel.`,
  },

  // ─── brouillon — lot 04 ────────────────────────────────────
  "case-nominative": {
    principle:
      "En russe, chaque mot a une forme neutre — celle du dictionnaire. C'est cette forme que porte le sujet, celui qui fait l'action.",
    fact: `Dans « ${CURATED_ANNA.nom} говори́т » (Anna parle), ${CURATED_ANNA.nom} garde sa forme de départ : c'est elle qui fait l'action. Cette forme s'appelle le nominatif.`,
    contrast: [
      {
        fromForm: CURATED_ANNA.nom,
        toForm: CURATED_ANNA.acc,
        explanation:
          `${CURATED_ANNA.nom} fait l'action : c'est le sujet, la forme de départ. ${CURATED_ANNA.acc} subit l'action : la forme change pour devenir l'objet.`,
      },
    ],
    visual: {
      nodes: [
        `${CURATED_ANNA.nom} (sujet, fait l'action)`,
        `${CURATED_ANNA.acc} (objet, subit l'action)`,
      ],
      layout: "comparison",
      caption: "Illustration — le nominatif ne change pas, les autres cas si",
    },
    commonMistake:
      "Ne crois pas qu'un mot non fléchi est toujours le sujet : au nominatif, un mot peut aussi être un attribut (« Он врач », il est médecin) sans être le sujet de la phrase.",
    reuse: [
      "Le nominatif est aussi la forme qui s'affiche pour chaque mot que tu consultes — c'est la forme de référence à partir de laquelle les autres cas se comprennent.",
    ],
    memoryAnchor: `${CURATED_ANNA.nom} = qui fait l'action ; c'est le nominatif, la forme de départ.`,
  },

  // ─── brouillon — lot 04 ────────────────────────────────────
  "verb-past-tense": {
    principle:
      "Au présent, la terminaison dit qui parle (je/tu/il). Au passé, c'est le genre et le nombre du sujet qui comptent — jamais la personne.",
    fact: `${CURATED_NAJTI_PAST.m} (il a trouvé) devient ${CURATED_NAJTI_PAST.f} dès que le sujet est féminin, et ${CURATED_NAJTI_PAST.pl} au pluriel. C'est l'accord du passé.`,
    contrast: [
      {
        fromForm: CURATED_NAJTI_PAST.m,
        toForm: CURATED_NAJTI_PAST.f,
        explanation:
          `${CURATED_NAJTI_PAST.m} = sujet masculin. ${CURATED_NAJTI_PAST.f} = sujet féminin — seul le genre change.`,
      },
    ],
    visual: {
      nodes: [
        `${CURATED_NAJTI_PAST.m} (m.)`,
        `${CURATED_NAJTI_PAST.f} (f.)`,
        `${CURATED_NAJTI_PAST.pl} (pl.)`,
      ],
      layout: "vertical",
      caption: "Illustration — accord du passé (genre/nombre du sujet)",
    },
    commonMistake: `Ne cherche pas une terminaison par personne comme au présent : я/ты/он ${CURATED_NAJTI_PAST.m} sont identiques au masculin — seul le genre du sujet change la forme.`,
    reuse: [
      `${CURATED_SLUCHITSYA_PAST.n} (« que s'est-il passé ? ») reste au neutre singulier dans son emploi le plus courant : ${CURATED_SLUCHITSYA_PAST.infinitive} décrit un évènement sans sujet nommé.`,
    ],
    memoryAnchor: `${CURATED_NAJTI_PAST.m} / ${CURATED_NAJTI_PAST.f} / ${CURATED_NAJTI_PAST.pl} : le passé suit le genre et le nombre du sujet, pas la personne.`,
  },
};
