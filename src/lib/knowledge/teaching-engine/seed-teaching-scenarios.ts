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
  CURATED_CHITAT,
  CURATED_DELAT,
  CURATED_EXAMPLE_PHRASES,
  CURATED_GOVORIT,
  CURATED_KNIGA,
  CURATED_MOSKVA,
  CURATED_MOTION,
  CURATED_NOUNS_GENDER,
  CURATED_PISAT,
  CURATED_POSSESSIVE,
  CURATED_PRESENT_SG2,
  CURATED_PROCHITAT,
  CURATED_STOL,
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
        caption: "Présent — trois personnes, trois terminaisons",
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
      caption: "Paire aspectuelle : processus vs résultat",
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
      caption: "Préfixes de déplacement : base → по- / у- / при-",
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
      caption: "Pied : идти́ / ходи́ть — véhicule : е́хать / е́здить",
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
      caption: "Possession : locuteur vs possesseur de la phrase",
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
        explanation: "Nominatif (sujet / citation) vs accusatif (objet direct).",
      },
    ],
    visual: {
      nodes: [
        `${CURATED_KNIGA.nom} (nominatif)`,
        `${CURATED_KNIGA.acc} (accusatif)`,
        `${CURATED_STOL.gen} (génitif)`,
      ],
      layout: "vertical",
      caption: "Même nom, cas différents = rôles différents",
    },
    commonMistake: `N'apprends pas les cas comme une liste : ${CURATED_KNIGA.acc} existe parce que le nom est objet direct.`,
    reuse: [
      `${CURATED_STOL.nom} / ${CURATED_STOL.gen} / ${CURATED_STOL.dat} — chaque forme = un rôle.`,
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
      caption: "Trois genres = trois familles d'accord",
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
      caption: "Même adjectif, trois genres",
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
      caption: "в + cas : куда́ vs где",
    },
    commonMistake: `Ne mélange pas ${CURATED_MOSKVA.direction} (куда́, accusatif) et ${CURATED_MOSKVA.location} (где, prépositionnel).`,
    reuse: [
      `${CURATED_EXAMPLE_PHRASES.yaEduVMoskvu} / ${CURATED_EXAMPLE_PHRASES.yaVMoskve} — même opposition partout.`,
    ],
    memoryAnchor: `в + accusatif = куда́ ; в + prépositionnel = где.`,
  },
};
