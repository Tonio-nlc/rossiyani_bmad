# Moteur morphologique — architecture deux sources

**Statut** : cadrage — **aucune implémentation** runtime dans ce ticket.  
**Décision produit** : les formes russes fléchies ne doivent plus être produites par le LLM.  
**Stack** : Next.js / TypeScript / Supabase (Vercel) ; peuplement batch offline ; migrations SQL manuelles.

Dernière mise à jour document : **2026-08-20**.  
État du défaut actuel (lemmatisation LLM) : [`../PROJECT_STATE.md`](../PROJECT_STATE.md) § Dette.

---

## 0. Problème

Aujourd’hui Rossiyani délègue encore lemme + souvent traits au LLM (`generateWordExplanation` → `resolveOrCreateLemma`). Résultat observé : lemmes inexistants, accents faux, homoglyphes latins (rejetés depuis les gardes charset).

**Objectif** : formes fléchies + accents + traits structurels = **déterministes** ; LLM = prose pédagogique uniquement.

---

## 1. Deux sources — rôles distincts

| Source | Nature | Accent tonique | Licence (données) | Preuve / notes |
|--------|--------|----------------|-------------------|----------------|
| **pymorphy3** (+ dictionnaire OpenCorpora) | **ANALYSEUR** : forme quelconque → lemme + tags | **Non** (formes en général sans U+0301 pédagogique) | MIT (code) ; données OpenCorpora **CC BY-SA 3.0** | ~400k lemmes / ~5M formes — chiffres usuels du projet ; **NON VÉRIFIÉS** dans cette session contre un dump local |
| **OpenRussian** ([Badestrand/russian-dictionary](https://github.com/Badestrand/russian-dictionary), CSV figé ~2021) | **DICTIONNAIRE** lookup : lemme `bare` + inflexions | **Oui** (apostrophe `'` → à convertir en U+0301) | **CC BY-SA 4.0** | CSV locaux audit : `scripts/morphology-audit/data/` — total ~21,7 Mo (`nouns` 8,0 + `adjectives` 8,0 + `verbs` 5,4 + `others` 0,34 Mo) |

### Couverture OpenRussian sur le gold Rossiyani

Source : `scripts/morphology-audit/coverage-report.md` (281 formes de surface distinctes, 11 textes Library).

| Indicateur | Valeur |
|------------|--------|
| Présence (lemme ou forme) | **96,8 %** (272/281) |
| Formes + accent (toutes classes) | **64,1 %** (180/281) |
| V / N / Adj avec inflexions + accent | **96,8 %** (180/186) |

→ pymorphy3 = **parser** (désambiguïsation morphosyntaxique / tags).  
→ OpenRussian = **accent + paradigme dictionnaire** pour la classe ouverte (noms, verbes, adjectifs).

---

## 2. Décisions — TRANCHÉ vs À TRANCHER PAR MARIO

Chaque point ci-dessous porte un statut. **Aucune proposition de tranchage** sur les items À TRANCHER.

### 2.1 Rôle de chaque source

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (cadrage) | Analyseur (pymorphy3) pour tags / analyse de forme ; dictionnaire (OpenRussian) pour accent et paradigme de référence sur la classe ouverte. Les deux ne sont pas interchangeables. |

### 2.2 Périmètre d’import

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (intégration runtime) | Option batch offline → tables Supabase → **lecture TS seule** (pas de Python en prod Vercel). File `morphology_pending` pour lemmes manquants (§1b historique / §7). |
| **TRANCHÉ** (2026-08-20) | Import **à la demande** (lemmes rencontrés / `morphology_pending` uniquement). Cohérent avec la file pending ; bascule vers un dump complet possible plus tard — l’inverse (revenir d’un dump massif à du ciblé) coûterait cher. |

Note volume : base applicative citée ~16,45 Mo sur un plafond ~500 Mo — **le volume n’est PAS le facteur limitant**. Taille DB exacte : `pg_database_size` **NON VÉRIFIÉE** dans la session qui a rédigé `PROJECT_STATE.md` (2026-08-20).

### 2.3 Précédence à TROIS rangs

| Rang | Source |
|-----:|--------|
| 1 | **Curé** (TS / overrides sens / accents validés Mario) |
| 2 | **Dictionnaire** (OpenRussian, après conversion accent) |
| 3 | **Analyseur** (pymorphy3 — tags / lemme candidat ; **pas** d’accent inventé) |

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** | Curé > moteur (doc précédent). |
| **TRANCHÉ** (cadrage 2026-08) | Extension explicite : **curé > dictionnaire > analyseur**. |
| **TRANCHÉ** (2026-08-20, Mario) | Quand le dictionnaire **n’a pas** l’accent : **afficher la forme nue**, jamais d’accent inventé ; `stress_status = missing`. « Vaut mieux afficher un mot sans accent qu’une erreur. » |

### 2.4 Canonicalisation côté Python

Doit **répliquer** les gardes TypeScript actuelles, sinon deux conventions dans `lemmas` / `morphology_*` :

| Garde TS | Fichier |
|----------|---------|
| NFC | `canonicalizeLemmaForm` — `canonicalize-lemma-form.ts` |
| `assertLemmaFormCharset` | rejet hors cyrillique / `-` / U+0301 |
| `stripMonosyllableStress` | une voyelle ⇒ retire U+0301 |

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (principe) | Même pipeline de canonicalisation côté batch Python. |
| **TRANCHÉ** (convention Rossiyani) | Monosyllabes **sans** accent pédagogique. |
| Piège documenté | OpenRussian accentue souvent les monosyllabes (ex. `го'д`) — **doit** passer par `stripMonosyllableStress` équivalent. |

### 2.5 Conversion apostrophe → U+0301

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (cadrage) | Toute apostrophe d’accent OpenRussian `'` → combining acute **U+0301**. |
| **TRANCHÉ** (2026-08-20) | Conversion **dans le script Python d’import**, au **même endroit** que NFC + charset + strip-monosyllabe — **un seul** point de canonicalisation, pas de chemin parallèle SQL / runtime. |

### 2.6 Clé de jointure

| Système | Clé |
|---------|-----|
| OpenRussian | champ `bare` (sans accent apostrophe ; peut contenir **ё**) |
| Rossiyani `lemmas` | `form` souvent **avec** U+0301 (2026-08-20 : **179**/256 lemmes accentués) |
| `morphology_lemmas` | `lemma_bare` **obligatoire** + `lemma_stressed` / `stress_status` |

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (nécessité) | Fonction de **dé-accentuation** (NFD + strip U+0301 + NFC) pour joindre OR ↔ Rossiyani. |
| **TRANCHÉ** (2026-08-20) | Colonne **`lemma_bare` obligatoire** sur chaque ligne importée — **pas** de table de mapping dédiée. |
| **TRANCHÉ** (2026-08-20) | Clé `morphology_forms` = **MODÈLE B** : `UNIQUE (morphology_lemma_id, slot, variant)` avec `variant ∈ {plain, with_n, alt}`. Le slot décrit un **cas / cellule** ; plain/with_n est une variante contextuelle. OpenRussian → `plain` ; `with_n` / `alt` restent **curés** (classe fermée). Voir [`M0_FORM_VARIANT_KEY.md`](./M0_FORM_VARIANT_KEY.md). |

DDL : `supabase/seed/morphology_tables_ddl.sql` (**non exécutée** tant que Mario ne l’a pas collée après backup).

### 2.7 Piège ё / е — MESURÉ (2026-08-20)

Script : `scripts/morphology-audit/measure-yo-ye.py` (CSV locaux uniquement ; **pas** de `pip install`).

| Source | Résultat |
|--------|----------|
| **OpenRussian** | Les probes où ё compte (`нашёл`, `ещё`, `её`, `идёшь`, `всё`) sont stockées **avec ё** (U+0451) dans `bare` / formes. Variantes en **е** absentes pour ces probes (sauf `все`, entrée **distincte** de `всё`). **1799** lemmes `bare` et **1782** `accented` contiennent ё. |
| **pymorphy3** | **NON MESURÉ** — paquet absent localement ; non installé (consigne). |

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (constat OR) | OpenRussian **conserve ё** ; ce n’est pas un dump « tout en е ». |
| **TRANCHÉ** (constat risque) | Une jointure stricte échoue si **un seul** côté normalise ё→е (saisie `нашел`, audit `strip_stress` qui mappe ё→е, ou analyseur — **non mesuré**). Ex. vocabulaire : `берёт` normalisé → `берет` entre en collision avec le nom `берет`. |
| **À TRANCHER PAR MARIO** | Normaliser ou non ё→е **des deux côtés** pour la clé de jointure, tout en **conservant ё à l’affichage**. |

### 2.8 Homonymie / D3 — MESURÉ (2026-08-20)

pymorphy renvoie une **liste scorée** d’analyses.

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** | **Interdit** de prendre automatiquement le meilleur score (principe anti-scores magiques). |
| **TRANCHÉ** (D3) | Homonymie **sans override curée** → **pas de paradigme complet**. |

**Chiffrage** (proxy OpenRussian : forme normalisée présente dans ≥ 2 entrées `bare×POS` ; override = lemme bare dans `morphology/curated/` ; script `measure-d3-ambiguity.py`) :

| Corpus | Formes | Ambiguës OR | Dont override curé | **SANS paradigme (D3)** |
|--------|-------:|------------:|-------------------:|------------------------:|
| 11 textes gold | 281 | 54 | 23 | **31** |
| `user_vocabulary` (16 lignes → 23 formes lemme+surface) | 23 | 4 | 1 | **3** |

Liste gold **sans** override (31) :  
`берет`, `булочной`, `булочную`, `вечером`, `внутри`, `воды`, `все`, `второй`, `готов`, `домой`, `есть`, `зовут`, `извините`, `кафе`, `москвы`, `начало`, `нет`, `полке`, `потом`, `прохожего`, `русская`, `русский`, `русского`, `стоит`, `студенты`, `уже`, `урок`, `устал`, `французский`, `часов`, `это`.

Liste `user_vocabulary` **sans** override (3) :  
`берет` (lemme affiché `берёт` après ё→е), `булочная`, `прохожий`.

Lecture : D3 **ne vide pas** l’app (31/281 ≈ **11 %** des surfaces gold ; 3/23 vocabulaire). Tenable pour un pilote, avec file de curation sur cette liste. Limite méthodo : collisions d’index OR (préfixes / `other`) et normalisation ё→е ; pymorphy non mesuré.

### 2.9 Mots non couverts


| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (§1b / §7 historiques) | Lemme jamais vu → fiche dégradée (principe + bridge ; **paradigme omis**) ; enqueue `morphology_pending` pour le prochain batch. Pas d’invention LLM de formes. |

### 2.10 Régénération de prose post-import

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (exigence doc 2026-08) | Après import morpho massif, prévoir un **rapport de diff AVANT purge** (ex. `explanation_cache` / scénarios dont lemme ou formes change). |
| **À TRANCHER PAR MARIO** | Périmètre exact du rapport (quelles tables, critères de « drift »), et qui déclenche la purge. |

### 2.11 Classe OUVERTE vs FERMÉE

| Classe | Couverture OR | Réponse Rossiyani |
|--------|---------------|-------------------|
| **Ouverte** (noms, verbes, adjectifs) | Forte (96,8 % présence gold ; 96,8 % formes+accent sur V/N/Adj) | Import dictionnaire + analyseur → tables `morphology_*` |
| **Fermée** (mots-outils) | Faible utilité pédagogique des accents/paradigmes dans `others.csv` (0,34 Mo vs ~21 Mo de contenu) | **Curation manuelle permanente en TypeScript** |

Fichiers curés (classe fermée) — réponse **permanente**, pas une rustine **ni une dette de migration** :

- `pronouns.ts` (paradigme fermé ; variantes `with_n` restent curées même après M1)
- `invariable-words.ts`
- `preposition-government.ts` (+ détection régence)
- numéraux / expressions figées (`genitive-numerals.ts`, `fixed-expressions.ts`)

Les **~104 artefacts** identifiés en M0 (régence, invariables, numéraux, figés, phrases d’exemple) **restent en TS**. Ils n’entrent **pas** dans `morphology_*`. Ce n’est pas un backlog DDL : c’est la **frontière** posée ici. Seuls les paradigmes de classe ouverte (+ pronoms comme données de formes déjà mappées en M0 si import curé des paradigmes) utilisent les tables SQL.

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (cadrage) | Mots-outils = classe fermée → curation TS ; OpenRussian n’est **pas** la source de vérité pour cette classe. |
| **TRANCHÉ** (2026-08-20) | Les 104 hors schéma M0 **restent en TypeScript** — frontière §2.11, pas dette. |

### 2.12 Réversibilité + licence ShareAlike

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (cadrage) | Toute donnée importée porte une colonne **`source`** (ex. `openrussian`, `pymorphy3`, `curated`) → `DELETE WHERE source = 'openrussian'` possible. |
| **À TRANCHER PAR MARIO** | Portée ShareAlike sur **données dérivées redistribuées** (pas d’avis juridique dans ce document). |

### 2.13 Licence — attribution

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (cadrage) | Attribution **due** pour CC BY-SA (OpenCorpora / OpenRussian) dès usage des données. |
| **À TRANCHER PAR MARIO** | Emplacement UI exact (footer, page Légal, fiche lemme, etc.). |

---

## 3. Frontière moteur vs LLM

### Vient des sources déterministes (+ curé)

Lemme normalisé, POS/tags, genre, animacité, aspect, paradigme de formes, terminaisons dérivées, flags structurels — **jamais inventés par le LLM**.

### Reste au LLM

Explication contextuelle Reader, bridge teaching scenario, intuition / hook rédigés, erreurs fréquentes en français, traduction / nuances, choix de concept pédagogique (peut *consommer* les tags moteur).

### Règle d’or

> Toute chaîne cyrillique présentée comme **forme fléchie** dans l’UI ou en base doit être traçable à une ligne curée, dictionnaire, ou analyseur tagué `source`. Le LLM peut *citer* ; il ne *invente* pas.

---

## 4. Intégration — rappel options

| Option | Verdict |
|--------|---------|
| (a) Microservice Python runtime | Trop lourd pour Vercel-only à court terme |
| **(b) Batch offline Python → Supabase → TS lecture** | **TRANCHÉ** comme voie d’intégration |
| (c) Portage WASM/TS | Hors scope tant qu’aucune couverture équivalente |

Atténuation lemme manquant : mode dégradé + `morphology_pending` (§2.9).

---

## 5. Accentuation (U+0301)

```
Forme / lemme candidat
        ↓
1) Curé (priorité max)
        ↓
2) OpenRussian (apostrophe → U+0301 + strip monosyllabe)
        ↓
3) Analyseur (sans accent) + stress_status = missing/unknown
        ↓
4) JAMAIS le LLM pour placer un accent nouveau
```

Encounter reuse (surface déjà vue en Reader) : opportuniste, sous le curé.

---

## 6. Défectivité / homonymie de sens

Exemple pédagogique : `болеть₁` (être malade) vs `болеть₂` (avoir mal) — paradigme OpenCorpora complet ≠ paradigme pédagogique.

| Source | Rôle |
|--------|------|
| Dictionnaire / analyseur | Superset de formes |
| `morphology_sense_overrides` (curé) | Intersection des cellules autorisées **par sens** |

Sans override → **D3** : pas de paradigme complet (§2.8).

---

## 7. Schéma DB

Tables : `morphology_lemmas`, `morphology_forms`, `morphology_sense_overrides`, `morphology_pending`.

| Point | Décision |
|-------|----------|
| DDL | `supabase/seed/morphology_tables_ddl.sql` — **à coller à la main** après backup ; non appliquée tant que Mario ne l’a pas lancée |
| `source` / `source_version` | Sur lemmas / forms / sense_overrides — `curated` \| `openrussian` \| `pymorphy3` |
| `lemma_bare` + stress | Obligatoire ; `stress_status` ∈ present \| missing \| unknown ; missing → forme nue affichée |
| Clé forms | **MODÈLE B** : `UNIQUE (morphology_lemma_id, slot, variant)` |
| FK vers `lemmas` | **Absente** pendant M1/M2 (`app_lemma_id` UUID libre) |
| EXCLUDE bare↔accentué (`lemmas_no_bare_vs_accented_dup`) | **Non reproduit** : ici bare et stressed sont deux colonnes de la même ligne ; voir commentaire dans la DDL |
| Classe fermée (104) | **Hors tables** — reste en TS (§2.11) |

---

## 8. Flux cible (rappel)

```
Enregistrement mot (Reader)
  → user_vocabulary
  → enqueue morphology_pending (si absent)
  → compose teaching_scenario (formes = DB/curated only)
  → LLM = bridge / textes seulement

Batch offline
  → pymorphy3 (analyse) + OpenRussian (accents/paradigmes) + overrides curés
  → **un seul** point Python : `'`→U+0301 + NFC + charset + strip monosyllabe
  → UPSERT morphology_* (`lemma_bare` obligatoire, `source` taggée)
  → rapport de diff AVANT purge cache / scénarios driftés
```

---

## 9. Phases (rappel)

| Phase | Action |
|-------|--------|
| **M0** | Mapping slot curé → `morphology_forms.slot` |
| **M1** | Import stock curé → DB |
| **M2** | Runtime dual-read DB puis fallback TS |
| **M3** | Batch deux sources **à la demande** (pending / vocabulaire) |
| **M4** | Retirer paradigmes utilisateur du LLM knowledge builder |
| **M5** | Deprecate TS curés pour la classe ouverte (garder classe fermée) |

---

## 10. Liste claire — À TRANCHER PAR MARIO

1. ~~Import à la demande vs dump~~ → **TRANCHÉ** : à la demande (§2.2).  
2. ~~UI sans accent dict.~~ → **TRANCHÉ** : forme nue + `stress_status = missing` (§2.3).  
3. ~~Emplacement conversion `'`~~ → **TRANCHÉ** : script Python, même pipeline que NFC/charset/strip (§2.5).  
4. ~~Jointure bare~~ → **TRANCHÉ** : colonne `lemma_bare` obligatoire (§2.6).  
5. **ё/е** — OR mesuré (conserve ё) ; pymorphy **NON MESURÉ** ; **à trancher** : normaliser ou non ё→е sur la clé de jointure (§2.7).  
6. ~~Chiffrage D3~~ → **MESURÉ** : 31/281 gold, 3/23 vocab sans paradigme (§2.8) — D3 tenable ; liste de curation ouverte.  
7. Périmètre du **rapport de diff** pré-purge post-import.  
8. Emplacement UI de l’**attribution** CC BY-SA.  
9. Portée **ShareAlike** sur données dérivées redistribuées (hors avis juridique ici).

---

## 11. Hors scope de ce document

- Code applicatif et migrations appliquées.
- Avis juridique ShareAlike.
- Remplacement du Concept Graph.

---

## 12. Voir aussi

- [`../PROJECT_STATE.md`](../PROJECT_STATE.md) — dette lemmatisation LLM, baseline DB
- [`READER_ORCHESTRATOR.md`](./READER_ORCHESTRATOR.md) — overrides déterministes actuels
- [`M0_MAPPING.md`](./M0_MAPPING.md) — inventaire curé → tables
- [`M0_FORM_VARIANT_KEY.md`](./M0_FORM_VARIANT_KEY.md) — plain/with_n ; **MODÈLE B acté**
- `supabase/seed/morphology_tables_ddl.sql` — DDL (manuel)
- `scripts/morphology-audit/coverage-report.md` — chiffres 96,8 % / 64,1 %
- `scripts/morphology-audit/measure-yo-ye.py` — mesure ё/е OpenRussian
- `scripts/morphology-audit/measure-d3-ambiguity.py` — chiffrage D3
- `src/lib/vocabulary/canonicalize-lemma-form.ts` — gardes à répliquer en Python
