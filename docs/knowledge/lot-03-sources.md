# Lot 03 — sources de vérification

> Concepts : `case-instrumental`, `case-prepositional`
> Illustration complétée : `preposition-government` — variantes `у` (génitif, proximité)
> et confirmation de la variante `к` (datif) déjà en place
> Statut seed : `brouillon` (relecture enseignant requise avant `valide`)
> Date : 2026-07-25

Règle : aucune forme fléchie ni affirmation grammaticale n'est reprise sans source
explicite. Les formes d'illustration sont dans
`src/lib/knowledge/morphology/curated/forms.ts` (commentaire
« validé manuellement — ne pas générer par LLM »).

## Formes fléchies

| Lemme / règle | Forme ou affirmation | Source | Vérifié |
|----------------|----------------------|--------|---------|
| ка́рта (nouveau) | ка́рта (nom. sg.) | Morphologie curée `CURATED_KARTA.nom` ; déclinaison régulière du féminin dur en -а (même paradigme que кни́га/А́нна) | oui |
| ка́рта (nouveau) | ка́ртой (instr. sg.) | Morphologie curée `CURATED_KARTA.instr` ; **attestée dans le texte gold** « В булочной » (`— Луи́ платит ка́ртой.`) | oui |
| А́нна | А́нной (instr. sg.) | Morphologie curée `CURATED_ANNA.instr` ; déclinaison régulière du féminin dur en -а (désinence -ой à l'instrumental, même paradigme que А́нны/А́нне déjà sourcées lot 02) ; **pas attestée** dans les textes gold actuels — forme régulière déduite, sans exception connue pour ce type de prénom | oui (règle), non (occurrence gold) |
| аудито́рия (nouveau) | аудито́рии (prép. sg.) | Morphologie curée `CURATED_AUDITORIYA.prep` ; **attestée dans le texte gold** « Первый день в университете » (`В аудито́рии уже́ есть студе́нты.`) | oui |
| аудито́рия (nouveau) | аудито́рия (nom. sg.) | Morphologie curée `CURATED_AUDITORIYA.nom` ; déclinaison régulière du féminin en -ия (désinence -ии au prépositionnel, comme Росси́я/в Росси́и) ; **pas attestée** telle quelle dans les textes gold (seule la forme fléchie аудито́рии y figure) | oui (règle), non (occurrence gold pour le nominatif) |
| университе́т | университе́те (prép. sg.) | Morphologie curée `CURATED_UNIVERSITET.prep` (déjà existante, ajoutée avant ce lot) ; déclinaison régulière du masculin dur (désinence -е au prépositionnel) ; mentionnée comme leçon future dans le commentaire du texte gold « Первый день в университете » (`Prépare leçons futures : в университет / в университете`), mais forme non lue verbatim dans le corps du texte | oui (règle), non (occurrence gold verbatim) |
| Москва́ | Москве́ (prép. sg., nu) | Morphologie curée `CURATED_MOSKVA.prepositional` (nouveau champ, même forme que `CURATED_MOSKVA.location` déjà sourcée lot 02, sans le « в » collé) ; OpenRussian [Москва](https://en.openrussian.org/ru/москва) | oui |
| окно́ (nouveau) | окно́ (nom. sg.) | Morphologie curée `CURATED_OKNO_CASES.nom` = `CURATED_NOUNS_GENDER.okno` déjà curée (lot 01) | oui |
| окно́ (nouveau) | окна́ (gén. sg.) | Morphologie curée `CURATED_OKNO_CASES.gen` ; déclinaison régulière du neutre dur (désinence -а, accent qui se déplace sur la finale) ; OpenRussian [окно](https://en.openrussian.org/ru/окно) ; **pas attestée** dans les textes gold actuels — forme régulière, homographe non accentué avec о́кна (nominatif pluriel) déjà traité en amont (accent-sensitive matching, `case-concept-routing.ts`) | oui (règle), non (occurrence gold) |
| стол | стола́ (gén. sg.) | Morphologie curée `CURATED_STOL.gen` ; déjà sourcée `docs/knowledge/lot-01-sources.md` — réutilisée pour l'illustration у + génitif (у столá) | oui |
| стол | столу́ (dat. sg.) | Morphologie curée `CURATED_STOL.dat` ; déjà sourcée `docs/knowledge/lot-01-sources.md` — illustration к + datif (déjà en place avant ce lot) | oui |

## Affirmations grammaticales

| Lemme / règle | Affirmation | Source | Vérifié |
|----------------|-------------|--------|---------|
| Instrumental — moyen | L'instrumental marque le moyen d'une action (avec quoi on fait quelque chose), sans préposition obligatoire | OpenRussian [Instrumental case](https://en.openrussian.org/grammar/instrumental) (usage « instrument/means ») ; grammaire des cas | oui |
| Instrumental — accompagnement | с + instrumental marque l'accompagnement (« avec qui ») | OpenRussian Instrumental case (usage avec с) ; déjà dans `CURATED_PREPOSITION_GOVERNMENT` (`с`, cases: `["instrumental","genitive"]`, `senseDependent: true`) | oui |
| Prépositionnel — lieu | в/на + prépositionnel marque le lieu où l'on est (где), par opposition à в/на + accusatif (destination, куда́) | OpenRussian [Prepositional case](https://en.openrussian.org/grammar/prepositional) ; déjà établi lot 01/02 pour `case-accusative` (`в университе́т` = куда́) et `CURATED_PREPOSITION_GOVERNMENT` (`в`/`на`, `senseDependent: true`) | oui |
| Prépositionnel — jamais sans préposition | Le prépositionnel est le seul cas russe qui n'existe jamais sans préposition (в, на, о, об, обо, при) | OpenRussian Prepositional case (« always used with a preposition ») ; grammaire russe standard | oui |
| Prépositionnel — sujet dont on parle | о (+ об/обо) + prépositionnel marque le sujet dont on parle | OpenRussian Prepositional case (usage avec о) ; déjà dans `CURATED_PREPOSITION_GOVERNMENT` (`о`, `об`, `обо`, cases: `["prepositional"]`) | oui |
| у + génitif — proximité | у + génitif marque la proximité (« près de »), un sens distinct de до (« jusqu'à »)/из (« hors de »)/от (« loin de ») | OpenRussian [у](https://en.openrussian.org/ru/у) (sens « by, near, at ») ; déjà dans `CURATED_PREPOSITION_GOVERNMENT` (`у`, cases: `["genitive"]`) — seul le contenu d'illustration manquait avant ce lot | oui |
| к + datif — direction vers quelqu'un/quelque chose | к + datif marque la direction vers un destinataire (déjà illustré et sourcé lot 02) | Déjà dans `docs/knowledge/lot-02-sources.md` ; illustration `dative` de `preposition-government` inchangée dans ce lot (vérifiée conforme, non dupliquée) | oui |

## Vérification ciblée — в/на : prépositionnel (lieu) vs accusatif (direction)

| Forme | Cas | Sens | Source |
|-------|-----|------|--------|
| `в Москву́` | Accusatif | Direction (куда́ — vers où) | `CURATED_MOSKVA.direction` ; déjà sourcé lot 01/02 ; illustration `case-accusative` et variante `direction-location` de `preposition-government` |
| `в Москве́` | Prépositionnel | Lieu (где — où l'on est) | `CURATED_MOSKVA.location` / nouveau champ `CURATED_MOSKVA.prepositional` ; illustration `case-prepositional` (`reuse`) et variante `direction-location` de `preposition-government` |
| `В аудито́рии` | Prépositionnel | Lieu (attesté texte gold, sans ambiguïté possible : le texte décrit un état, pas un mouvement) | `CURATED_AUDITORIYA.prep` ; texte gold « Первый день в университете » |

Vérification de la hiérarchie de résolution (script `matchConceptSignals` exécuté
manuellement pendant ce lot, non conservé dans le dépôt) :

- `в Москве́` (régence в détectée + cas prépositionnel) → concept primaire
  `preposition-government` (score 96, famille régence = priorité 100), concept
  `case-prepositional` relégué en secondaire (score 88, famille cas précis = priorité 80).
  **La régence prépositionnelle reste prioritaire sur le cas seul, comme exigé.**
- `аудито́рии` seul (aucune régence détectée dans le contexte) → concept primaire
  `case-prepositional`.
- `у окна́` (régence у détectée + cas génitif) → concept primaire
  `preposition-government`, variante d'illustration sélectionnée : `genitive-near`
  (contenu « près de », plus « до/из/от » comme avant ce lot).
- `с А́нной` (régence с détectée + cas instrumental) → concept primaire
  `preposition-government` ; `case-instrumental` en secondaire.
- `ка́ртой` seul (aucune régence détectée) → concept primaire `case-instrumental`.

## Mots des textes gold (reconnaissance lecteur)

| Forme / lemme | Texte gold | Usage dans le lot |
|---------------|------------|-------------------|
| ка́ртой | `02-bulochnoy.json` (« Луи́ платит ка́ртой. ») | Illustration principale instrumental — moyen de paiement (`case-instrumental`) |
| В аудито́рии | `01-pervyy-den-universitet.json` (« В аудито́рии уже́ есть студе́нты. ») | Illustration principale prépositionnel — lieu (`case-prepositional`) |
| в Москве́ | Déjà curé lot 02 (`CURATED_MOSKVA.location`) | Reuse prépositionnel — lieu, contraste avec в Москву́ (`case-prepositional`) |
| у Москвы́ / из Москвы́ | `05-znakomstvo.json` (« — Да, я из Москвы́. ») | Contexte de référence pour у (proximité) vs из (provenance) — non ré-illustré, из déjà sourcé lot 02 |
| к врачу́ | `08-u-vracha.json` (« — Пойдём к врачу́. ») | Illustration к + datif de `preposition-government`, déjà en place et sourcée lot 02, vérifiée inchangée |

## Non couvert volontairement (hors lot)

- Instrumental pluriel et instrumental des adjectifs/possessifs.
- Prépositionnel pluriel.
- Emploi de l'instrumental comme attribut du sujet avec « быть » au passé/futur
  (« он был врачо́м ») — hors A1–A2 pour ce lot, non illustré.
- Toutes les autres prépositions régissant l'instrumental (над, под, перед, за,
  между) et le prépositionnel (об, обо, при) — déjà dans `CURATED_PREPOSITION_GOVERNMENT`
  mais non illustrées individuellement (`preposition-government` reste l'entrée
  générique pour ces cas, non dupliquée par variante).
- Rôle fonctionnel / couleur Rossiyani pour l'emploi « moyen » (instrumental) :
  **non tranché dans ce lot** — aucune couleur dédiée n'existe dans
  `src/lib/lessons/lesson-colors.ts` (subject=bleu, object=corail, place=vert,
  possession=violet, recipient=ambre). Décision à prendre hors périmètre
  Teaching Engine/design de ce lot ; documentée dans `teacherNotes` de
  `case-instrumental`.

## Verdict

Toutes les formes et règles utilisées dans les scénarios seed du lot 03 ont une source
OpenRussian et/ou morphologie curée **vérifiée oui**. Deux formes sont attestées
verbatim dans les textes gold (`ка́ртой`, `аудито́рии`) — privilégiées comme illustrations
principales conformément à la consigne. Les formes nouvelles sans occurrence gold
(`CURATED_ANNA.instr`, `CURATED_AUDITORIYA.nom`, `CURATED_OKNO_CASES.gen`) suivent des
paradigmes de déclinaison réguliers et sans exception, ajoutées à la main dans
`src/lib/knowledge/morphology/curated/forms.ts` avec mention explicite de leur statut
(règle déduite vs occurrence gold). Aucune forme LLM.

La distinction в/на + prépositionnel (lieu, где) vs в/на + accusatif (direction, куда́)
est vérifiée et sourcée des deux côtés (`case-accusative` pour l'accusatif, déjà en
place ; `case-prepositional` pour le prépositionnel, nouveau dans ce lot) ; la
hiérarchie de résolution a été testée et confirme que la régence prépositionnelle
(concept `preposition-government`) reste prioritaire sur le cas nu dans tous les cas
de régence détectée.
