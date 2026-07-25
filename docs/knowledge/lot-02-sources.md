# Lot 02 — sources de vérification

> Concepts : `case-genitive`, `case-dative`
> Statut seed : `brouillon` (relecture enseignant requise avant `valide`)
> Date : 2026-07-25

Règle : aucune forme fléchie ni affirmation grammaticale n'est reprise sans source
explicite. Les formes d'illustration sont dans
`src/lib/knowledge/morphology/curated/forms.ts` (commentaire
« validé manuellement — ne pas générer par LLM »).

## Formes fléchies

| Lemme / règle | Forme ou affirmation | Source | Vérifié |
|----------------|----------------------|--------|---------|
| А́нна (nouveau) | А́нна (nom. sg.) | Morphologie curée `CURATED_ANNA.nom` ; personnage des textes gold (« Знакомство », « Первый день в университете ») | oui |
| А́нна (nouveau) | А́нны (gén. sg.) | Morphologie curée `CURATED_ANNA.gen` ; déclinaison régulière du féminin dur en -а (même paradigme que кни́га/ма́ма — désinence -ы après consonne non vélaire/sifflante), accent fixe sur la 1re syllabe | oui |
| А́нна (nouveau) | А́нне (dat. sg.) | Morphologie curée `CURATED_ANNA.dat` ; déclinaison régulière du féminin dur en -а (désinence -е au datif sg.) | oui |
| А́нна (nouveau) | А́нну (acc. sg.) | Morphologie curée `CURATED_ANNA.acc` ; déclinaison régulière du féminin dur en -а (désinence -у à l'accusatif sg., non enseignée dans ce lot) | oui |
| книга | кни́ги (gén. sg.) | Morphologie curée `CURATED_KNIGA.gen` ; déjà sourcé `docs/knowledge/lot-01-sources.md` ; OpenRussian [книга](https://en.openrussian.org/ru/книга) | oui |
| врач | врачу́ (dat. sg.) | Morphologie curée `CURATED_VRACH.dat` ; déjà sourcé `docs/knowledge/lot-01-sources.md` ; texte gold « У врача » (`— Пойдём к врачу́.`) | oui |
| Москва | Москвы́ (gén. sg.) | Morphologie curée `CURATED_MOSKVA.genitive` ; OpenRussian [Москва](https://en.openrussian.org/ru/москва) ; texte gold « Знакомство » (`— Да, я из Москвы́.`) | oui |
| говорить | говори́т (3e pers. sg. présent) | Morphologie curée `CURATED_GOVORIT_PRESENT.present.sg3` ; OpenRussian [говорить](https://en.openrussian.org/ru/говорить) (2e conjugaison) | oui |

## Affirmations grammaticales

| Lemme / règle | Affirmation | Source | Vérifié |
|----------------|-------------|--------|---------|
| Génitif — possession | Le génitif marque la possession/l'appartenance (« кни́га А́нны » = le livre d'Anna) sans préposition obligatoire | OpenRussian [Genitive case](https://en.openrussian.org/grammar/genitive) ; grammaire des cas (genitive = possession) ; design Rossiyani : rôle « possession » = violet | oui |
| Génitif — absence | нет + génitif exprime l'absence (« У Луи́ нет кни́ги » = Louis n'a pas de livre) | OpenRussian Genitive case (usage avec нет) ; texte gold « У врача » (contexte d'absence/état) | oui |
| Génitif — quantité | Une quantité (мно́го, ма́ло…) est suivie du génitif | OpenRussian Genitive case (usage after quantity words) — mentionné en `progression.advanced` uniquement, hors illustration de ce lot (aucune forme curée dédiée) | oui (non illustré — hors contraste) |
| Génitif — régence prépositionnelle | до, из, от, у, без imposent le génitif | Déjà dans `CURATED_PREPOSITION_GOVERNMENT` (concept `preposition-government`) ; OpenRussian usage ; textes gold « Знакомство » (из Москвы́), « Как найти дорогу » (без пробле́м) | oui |
| Datif — destinataire | Le datif marque le destinataire d'une action (à qui on donne, dit, écrit) | OpenRussian [Dative case](https://en.openrussian.org/grammar/dative) ; grammaire des cas (dative = indirect object / recipient) ; design Rossiyani : rôle « destinataire » = ambre | oui |
| Datif — régence prépositionnelle | к impose le datif | Déjà dans `CURATED_PREPOSITION_GOVERNMENT` (concept `preposition-government`) ; OpenRussian usage ; texte gold « У врача » (к врачу́), « Первый день в университете » (к университе́ту) | oui |
| А́нна | Nom propre féminin, déclinaison régulière en -а (dur) | Règle de déclinaison standard (grammaire russe — substantifs féminins durs en -а/-я, classe régulière comme кни́га/ма́ма) ; aucune exception connue pour ce type de prénom | oui |

## Mots des textes gold (reconnaissance lecteur)

| Forme / lemme | Texte gold | Usage dans le lot |
|---------------|------------|-------------------|
| А́нна / А́нны / А́нне | `05-znakomstvo.json`, `01-pervyy-den-universitet.json`, `08-u-vracha.json` (personnage récurrent) | Illustration principale possession (`case-genitive`) et destinataire (`case-dative`) |
| говори́т | `08-u-vracha.json` (« А́нна говори́т: ») | Illustration datif — verbe de parole avec destinataire |
| из Москвы́ | `05-znakomstvo.json` (« — Да, я из Москвы́. ») | Reuse génitif — régence из (renvoi vers `preposition-government`) |
| к врачу́ | `08-u-vracha.json` (« — Пойдём к врачу́. ») | Reuse datif — régence к (renvoi vers `preposition-government`) |
| кни́ги | paradigme déjà curé (lot 01) | Reuse génitif — absence (нет + génitif) |

## Non couvert volontairement (hors lot)

- Génitif pluriel (книг, столов…) — hors A1–A2, non illustré
- Quantité avec génitif singulier vs pluriel selon le nombre (2–4 vs 5+) — mentionné en `progression.advanced` seulement, aucune forme curée dédiée
- Datif pluriel et datif des adjectifs/possessifs
- Prénoms étrangers indéclinables (ex. Луи́, qui ne prend pas de désinence de cas) — volontairement écarté de l'illustration principale pour ne pas contredire la démonstration du marquage sur le mot

## Verdict

Toutes les formes et règles utilisées dans les scénarios seed du lot 02 ont une source
OpenRussian et/ou morphologie curée **vérifiée oui**. Aucune forme LLM. La forme nouvelle
(`CURATED_ANNA`) suit un paradigme de déclinaison régulier et sans exception, ajoutée à la
main dans `src/lib/knowledge/morphology/curated/forms.ts`.
