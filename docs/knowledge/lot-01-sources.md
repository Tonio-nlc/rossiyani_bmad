# Lot 01 — sources de vérification

> Concepts : `case-accusative`, `noun-animacy`  
> Statut seed : `brouillon` (relecture enseignant requise avant `valide`)  
> Date : 2026-07-24

Règle : aucune forme fléchie ni affirmation grammaticale n’est reprise sans source
explicite. Les formes d’illustration sont dans
`src/lib/knowledge/morphology/curated/forms.ts` (commentaire
« validé manuellement — ne pas générer par LLM »).

## Formes fléchies

| Lemme / règle | Forme ou affirmation | Source | Vérifié |
|----------------|----------------------|--------|---------|
| книга | кни́га (nom. sg.) | Morphologie curée `CURATED_KNIGA.nom` ; OpenRussian [книга](https://en.openrussian.org/ru/книга) | oui |
| книга | кни́гу (acc. sg.) | Morphologie curée `CURATED_KNIGA.acc` ; OpenRussian книга (acc. = кни́гу) | oui |
| стол | стол (nom. / acc. sg. inanimé) | Morphologie curée `CURATED_STOL.nom` / `.acc` ; OpenRussian [стол](https://en.openrussian.org/ru/стол) (acc. sg. = nom. sg.) | oui |
| стол | стола́ (gén. sg.) | Morphologie curée `CURATED_STOL.gen` ; OpenRussian стол | oui |
| врач | врач (nom. sg.) | Morphologie curée `CURATED_VRACH.nom` ; OpenRussian [врач](https://en.openrussian.org/ru/врач) (animate) | oui |
| врач | врача́ (gén. / acc. sg. animé) | Morphologie curée `CURATED_VRACH.gen` / `.acc` ; OpenRussian врач (acc. sg. = gen. sg. врача́) | oui |
| врач | врачу́ (dat. sg.) | Morphologie curée `CURATED_VRACH.dat` ; OpenRussian врач ; texte gold « У врача » (`к врачу́`) | oui |
| университе́т | университе́т (nom. / acc. sg.) | Morphologie curée `CURATED_UNIVERSITET` ; OpenRussian [университет](https://en.openrussian.org/ru/университет) (acc. = nom., inanimé) | oui |
| университе́т | университе́те (prép. sg.) | Morphologie curée `CURATED_UNIVERSITET.prep` ; OpenRussian университет ; textes gold « Premier jour » | oui |

## Affirmations grammaticales

| Lemme / règle | Affirmation | Source | Vérifié |
|----------------|-------------|--------|---------|
| Accusatif — rôle | L’accusatif marque notamment l’**objet direct** | OpenRussian / grammaire des cas (accusative = direct object) ; design Rossiyani : rôle « objet direct » = corail | oui |
| Accusatif — destination | в / на + **accusatif** = destination (куда́) | Déjà dans le concept `preposition-government` ; OpenRussian usage ; textes gold « в университе́т » | oui |
| Animation — définition | Les noms russes sont **animés** (êtres) ou **inanimés** (choses) ; l’effet principal est sur l’accusatif | OpenRussian [Nouns Aliveness](https://en.openrussian.org/grammar/nouns-aliveness) | oui |
| Animation — masculin sg. | Masculin **inanimé** : acc. = nom. ; masculin **animé** : acc. = gén. | OpenRussian Nouns Aliveness ; Russian for free — Accusative ; Elon.io animacy rule | oui |
| Animation — féminin sg. | Au féminin sg. (-а/-я), l’animacy ne change pas la terminaison d’accusatif (-у/-ю) | OpenRussian Nouns Aliveness (explicit : feminine singular no change) | oui (non enseigné dans ce lot — hors contraste) |
| врач | Nom **animé** | OpenRussian врач : « masculine, animate » | oui |
| стол | Nom **inanimé** | OpenRussian стол : « masculine, inanimate » | oui |
| книга | Nom **inanimé** (féminin) | OpenRussian книга : « feminine, inanimate » | oui |

## Mots des textes gold (reconnaissance lecteur)

| Forme / lemme | Texte gold | Usage dans le lot |
|---------------|------------|-------------------|
| врач / врачу́ | `08-u-vracha.json` | Illustration animé (`noun-animacy`) |
| университе́т | `01-pervyy-den-universitet.json`, `10-obychnyy-den-studenta.json` | Destination accusatif (`case-accusative` reuse) |
| книга | paradigme déjà curé (leçons / scénarios existants) | Objet direct (`case-accusative`) |
| стол | paradigme déjà curé | Contraste inanimé (`noun-animacy`) |

## Non couvert volontairement (hors lot)

- Accusatif pluriel (tous genres) selon l’animacy — mentionné en `progression.intermediate` seulement
- Accusatif des adjectifs / possessifs
- Exceptions lexicales d’animacy (ex. names of cards, toys) — hors A1–A2

## Verdict

Toutes les formes et règles utilisées dans les scénarios seed du lot 01 ont une source
OpenRussian et/ou morphologie curée **vérifiée oui**. Aucune forme LLM.
