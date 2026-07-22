# Audit de couverture OpenRussian — textes gold Rossiyani

**Type** : audit seul — aucun code applicatif modifié.  
**Source dictionnaire** : [Badestrand/russian-dictionary](https://github.com/Badestrand/russian-dictionary) (OpenRussian, CSV, licence CC BY-SA 4.0).  
**Textes** : 11 textes Library (migrations `008_seed_library_texts.sql` + `010`–`015_library_gold_*.sql`).

## Méthode

1. Extraction des chaînes `content` des INSERT SQL des 11 textes.
2. Tokenisation des mots cyrilliques ; normalisation (suppression U+0301 / apostrophes OpenRussian, `ё`→`е`, minuscules).
3. Unité d’analyse = **forme de surface distincte** dans les textes (pas de lemmatiseur externe). Une forme est **couverte** si elle apparaît comme lemme (`bare`) **ou** comme forme fléchie dans l’un des 4 CSV.
4. **Formes + accent** : l’entrée OpenRussian résolue a au moins une inflexion renseignée **et** au moins un marquage d’accent (apostrophe `'` OpenRussian sur lemme ou forme).

## Textes audités

| # | Titre | Fichier source |
|---|-------|----------------|
| 1 | В булочной | `012_library_gold_02_bulochnoy.sql` |
| 2 | В магазине | `008_seed_library_texts.sql` |
| 3 | В метро | `008_seed_library_texts.sql` |
| 4 | Дома вечером | `008_seed_library_texts.sql` |
| 5 | Знакомство | `010_library_gold_05_znakomstvo.sql` |
| 6 | Как найти дорогу? | `013_library_gold_09_kak-nayti-dorogu.sql` |
| 7 | Обычный день студента | `015_library_gold_10_obychnyy-den-studenta.sql` |
| 8 | Первый день в университете | `011_library_gold_01_pervyy-den.sql` |
| 9 | Первый кофе | `008_seed_library_texts.sql` |
| 10 | По дороге | `008_seed_library_texts.sql` |
| 11 | У врача | `014_library_gold_08_u-vracha.sql` |

## Synthèse chiffrée

| Indicateur | Valeur |
|------------|--------|
| Formes de surface distinctes (textes gold) | **281** |
| Présentes dans OpenRussian (lemme ou forme) | **272** (96.8 %) |
| Dont entrée avec inflexions **et** accent | **180** (64.1 %) |
| Non couvertes | **9** (3.2 %) |
| Lemmes OpenRussian distincts résolus | 234 |

**Couverture globale (présence OR)** : **96.8 %**  
**Couverture « formes fléchies + accent »** : **64.1 %**

## Couverture par POS (OpenRussian)

Les totaux POS portent sur les formes **couvertes** (POS = entrée OR résolue). Les non-couvertes sont dans `unknown` / `other` (heuristique).

| POS | Formes analysées* | Couvertes | Avec inflexions + accent | Couverture |
|-----|-------------------|-----------|---------------------------|------------|
| Verbes | 72 | 72 | 72 | 100.0 % |
| Noms | 83 | 83 | 78 | 100.0 % |
| Adjectifs | 31 | 31 | 30 | 100.0 % |
| Autres (others.csv / outils) | 86 | 86 | 0 | 100.0 % |
| Non résolues (hors OR) | 9 | 0 | 0 | 0.0 % |

**Mots de contenu seuls (verbes + noms + adjectifs)** : 186/186 présents ; **180/186 (96.8 %)** avec inflexions + accent.  
Le taux global « formes + accent » (64 %) est tiré vers le bas par `others.csv` (particules, adverbes, etc.) qui n’ont souvent **aucune** colonne d’inflexion / accent — c’est attendu.

\* Pour les lignes POS OR, « Formes analysées » = formes gold matchées vers ce POS. Pour `unknown`, = formes gold sans match.

## Lemmes / formes NON couverts

9 formes de surface absentes d’OpenRussian (ni comme `bare`, ni comme cellule fléchie).

| Forme (normalisée) | Textes gold |
|--------------------|-----------|
| `ваш` | В булочной |
| `луи` | В булочной, Знакомство, Как найти дорогу?, Обычный день студента, Первый день в университете, У врача |
| `анна` | В булочной, В метро, Знакомство, Как найти дорогу?, Обычный день студента, Первый день в университете, У врача |
| `маша` | Первый кофе |
| `него` | У врача |
| `олег` | Дома вечером |
| `саша` | По дороге |
| `кофемашину` | Первый кофе |
| `французски` | Знакомство |

## Lecture pour la décision moteur morphologique

- Couverture **forte** sur le corpus gold (96.8 % présence globale ; 96.8 % formes+accent sur V/N/Adj) : OpenRussian est un candidat crédible comme source batch de paradigmes pour Rossiyani, avec une petite liste de manquants (surtout noms propres / composés).
- Les % « formes + accent » sont en général plus bas que la présence brute : certaines entrées `others.csv` n’ont pas d’inflexions (attendu pour particules / adverbes).
- Cet audit ne mesure **pas** la qualité pédagogique des accents OpenRussian (apostrophe `'`) vs norme Rossiyani (U+0301) — seulement la *disponibilité* d’un marquage.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `data/nouns.csv` | OpenRussian noms |
| `data/verbs.csv` | OpenRussian verbes |
| `data/adjectives.csv` | OpenRussian adjectifs |
| `data/others.csv` | OpenRussian autres |
| `run-audit.py` | Script d’audit reproductible |
| `coverage-report.md` | Ce rapport |

