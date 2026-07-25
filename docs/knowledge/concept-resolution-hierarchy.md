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
| 80 | `specific-case` | `case-accusative`, `case-genitive`, `case-dative`, `case-instrumental`, `case-prepositional` |
| 70 | `conjugation` | présent |
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
  `noun-declension` seulement si aucun cas précis ne s’applique (nominatif, cas sans concept, ou cas inconnu avec indices de déclinaison).
- **Mouvement > aspect > conjugaison** : un verbe de mouvement ne résout jamais vers l’aspect en primary.

## Table cas → concept

| Cas | Concept | Statut |
|-----|---------|--------|
| nominative | — (parapluie `noun-declension`) | — |
| accusative | `case-accusative` | lot 01 |
| genitive | `case-genitive` | lot 02 |
| dative | `case-dative` | lot 02 |
| instrumental | `case-instrumental` | lot 03 |
| prepositional | `case-prepositional` | lot 03 |

Les six cas russes ont désormais chacun un concept dédié (lot 03).

Source du cas (dans l’ordre) : paradigme `linguistic_knowledge` → formes curées univoques →
désambiguïsation (rôle fonctionnel `object_direct`, régence, prose d’explication).

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

## Pourquoi les scores bruts restent listés

| Concept | Score brut | Rôle |
|---------|----------:|------|
| `preposition-government` | 96 | intra-famille régence |
| `verb-perfective-aspect` | 95 | intra-famille aspect |
| `verb-movement-prefixes` | 92 | intra-famille motion |
| `case-accusative` | 88 | intra-famille cas |
| `noun-declension` | 80 | parapluie (souvent secondary) |

Écarts historiques fragiles (Δ≤3) : perfectif vs préfixes, préfixes vs présent —
**ne plus jamais « corriger » en ±5** : passer par `FAMILY_PRIORITY`.

## Audit orphelins

`auditOrphanConcepts()` / `docs/knowledge/orphan-concepts.md` :
signale tout concept du catalogue jamais atteignable (ni primary ni secondary).
