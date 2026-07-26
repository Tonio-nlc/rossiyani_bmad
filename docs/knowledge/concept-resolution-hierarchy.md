# Hiérarchie de résolution de concept

> Source code :
> - `src/lib/knowledge/concept-graph/pedagogical-hierarchy.ts` (familles)
> - `src/lib/knowledge/concept-graph/case-concept-routing.ts` (cas → concept)
> - `src/lib/knowledge/concept-graph/match-signals.ts` (règles + scores intra-famille)

## Principe

**Interdit** de trancher entre phénomènes par un écart de score de 2–3 points.

1. Chaque concept appartient à une **famille**.
2. L’ordre des familles est **déclaratif** (`FAMILY_PRIORITY`).
3. Les **scores** des règles ne départagent **qu’à l’intérieur** d’une même famille
   (et un ordre intra-famille explicite : ex. `verbs-of-motion` > préfixes).

## Familles (priorité décroissante)

| Rang | Famille | Concepts |
|-----:|---------|----------|
| 100 | `preposition-government` | régence |
| 90 | `motion` | verbes de mouvement, préfixes de mouvement |
| 80 | `specific-case` | `case-accusative`, `case-genitive`, `case-dative`, `case-instrumental`, `case-prepositional`, `case-nominative` |
| 70 | `conjugation` | présent, passé |
| 65 | `agreement` | accord adjectival |
| 60 | `pronoun` | possessif réfléchi |
| 50 | `aspect` | perfectif, imperfectif, paires |
| 40 | `noun-umbrella` | **`noun-declension` (parapluie)** |
| 35 | `animacy` | `noun-animacy` (lié, pas primary si cas précis) |
| 30 | `gender` | genre |
| 10 | `other` | reste |

### Règles dérivées

- **Régence > cas seul > déclinaison** : si `preposition-government` matche, il gagne ;
  sinon si le cas morphologique a un concept dédié, ce concept gagne ;
  `noun-declension` seulement si aucun cas précis ne s’applique (nominatif sans rôle sujet
  confirmé, cas sans concept, ou cas inconnu avec indices de déclinaison).
- **Mouvement > aspect > conjugaison** : un verbe de mouvement ne résout jamais vers l’aspect en primary.
- **Passé / présent ne collisionnent jamais avec les cas** : `verb-past-tense` et
  `verb-present-conjugation` n’matchent que `partOfSpeech === "verb"` ; les concepts de
  cas n’matchent que noms/pronoms(/adjectifs). Les deux familles ne peuvent jamais
  matcher le même mot.

## Table cas → concept

| Cas | Concept | Statut |
|-----|---------|--------|
| nominative | `case-nominative` **si et seulement si** `functionalRole === "subject"` ; sinon parapluie `noun-declension` | lot 04 |
| accusative | `case-accusative` | lot 01 |
| genitive | `case-genitive` | lot 02 |
| dative | `case-dative` | lot 02 |
| instrumental | `case-instrumental` | lot 03 |
| prepositional | `case-prepositional` | lot 03 |

Les six cas russes ont désormais chacun un concept dédié (lot 04 ferme le nominatif).

`case-nominative` est un cas particulier : contrairement aux 5 autres cas, il n’est **pas**
routé via `CASE_CONCEPT_BY_CASE` (cette entrée reste `null` volontairement — voir le
commentaire dans `case-concept-routing.ts`). Le nominatif est aussi la forme de repli
d’ambiguïté (`disambiguateCase`) et la forme d’attribut/apposition (« Он врач ») : router
« cas nominatif → concept » sans condition ferait passer n’importe quel mot au cas
indéterminé — ou un attribut — pour « le sujet ». `case-nominative` n’est donc atteint
que via sa propre règle de signal (`match-signals.ts`), qui exige en plus
`functionalRole === "subject"`.

Source du cas (dans l’ordre) : paradigme `linguistic_knowledge` → formes curées univoques →
désambiguïsation (rôle fonctionnel `object_direct`/`subject`, régence, prose d’explication).

## Exemples

| Surface | Primary | Secondaire typique |
|---------|---------|-------------------|
| кни́гу | `case-accusative` | — |
| врача́ | `case-accusative` | `noun-animacy` |
| до свида́ния | `preposition-government` | — |
| у окна́ | `preposition-government` (variante illustration `genitive-near`) | `case-genitive` |
| в Москве́ | `preposition-government` (variante illustration `direction-location`) | `case-prepositional` |
| ка́ртой (sans régence) | `case-instrumental` | — |
| аудито́рии (sans régence) | `case-prepositional` | — |
| пойдём → пойти́ | `verbs-of-motion` | aspect perfectif |
| стол (nom. / cas inconnu) | `noun-declension` | genre |
| А́нна (role=subject, nominatif) | `case-nominative` | — |
| врач (attribut, nominatif, role≠subject : « Он врач ») | `noun-declension` (jamais `case-nominative`) | — |
| нашёл / нашла́ / нашли́ (tense=passé) | `verb-past-tense` | — |
| случи́лось (tense=passé, impersonnel) | `verb-past-tense` | aspect perfectif |
| чита́ет (tense=présent) | `verb-present-conjugation` | — |

## Pourquoi les scores bruts restent listés

| Concept | Score brut | Rôle |
|---------|----------:|------|
| `preposition-government` | 96 | intra-famille régence |
| `verb-perfective-aspect` | 95 | intra-famille aspect |
| `verb-movement-prefixes` | 92 | intra-famille motion |
| `case-accusative` | 88 | intra-famille cas |
| `case-nominative` | 88 | intra-famille cas |
| `verb-past-tense` | 90 | intra-famille conjugaison (jamais concurrent de présent, tenses exclusifs) |
| `noun-declension` | 80 | parapluie (souvent secondary) |

Écarts historiques fragiles (Δ≤3) : perfectif vs préfixes, préfixes vs présent —
**ne plus jamais « corriger » en ±5** : passer par `FAMILY_PRIORITY`.

### Correction lot 04 — `verb-movement-prefixes` trop permissif

La règle testait seulement `/^(по|у|при|вы|в|с|пере)/` sur la forme de surface : tout
verbe commençant par ces lettres matchait (ex. `случи́ться` via « с- », `сде́лать`),
volant le primary à `verb-past-tense` ou `verb-perfective-aspect` sans aucun rapport
avec le mouvement. La règle exige désormais en plus `isMotionVerbLemma()` (racine de
mouvement connue) avant de tester le préfixe — corrigé en marge du lot 04 car il
bloquait la résolution de `случи́лось` (exemple imposé du lot).

## Audit orphelins

`auditOrphanConcepts()` / `docs/knowledge/orphan-concepts.md` :
signale tout concept du catalogue jamais atteignable (ni primary ni secondary).
