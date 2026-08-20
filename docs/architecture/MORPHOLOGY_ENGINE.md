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
| **À TRANCHER PAR MARIO** | Import **à la demande** (uniquement lemmes rencontrés / pending) **vs** dump OpenRussian **complet**. |

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
| **À TRANCHER PAR MARIO** | Comportement UI exact quand rang 2 manque mais rang 3 a un lemme (afficher forme non accentuée ? omettre cellule ? flag `stress_status`). |

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
| **TRANCHÉ** (cadrage) | Toute apostrophe d’accent OpenRussian `'` → combining acute **U+0301** avant écriture / comparaison avec Rossiyani. |
| **À TRANCHER PAR MARIO** | Emplacement exact (script d’import vs couche SQL) et tests de non-régression sur le stock curé. |

### 2.6 Clé de jointure

| Système | Clé |
|---------|-----|
| OpenRussian | champ `bare` (sans accent) |
| Rossiyani `lemmas` | `form` souvent **avec** U+0301 (2026-08-20 : **179**/256 lemmes accentués) |

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (nécessité) | Fonction de **dé-accentuation** (NFD + strip U+0301 + NFC) pour joindre OR ↔ Rossiyani. |
| **À TRANCHER PAR MARIO** | Table de jointure dédiée vs colonne `lemma_bare` obligatoire sur toute ligne importée. |

### 2.7 Piège ё / е

| Statut | Décision |
|--------|----------|
| **À TRANCHER PAR MARIO** / **À VÉRIFIER** | Comportement ё↔е sur **pymorphy3** et **OpenRussian** (normalisation audit gold : `ё`→`е` dans `run-audit.py` — ne prouve pas le comportement runtime des deux libs). Mesure empirique requise avant import. |

### 2.8 Homonymie — scores pymorphy

pymorphy renvoie une **liste scorée** d’analyses.

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** | **Interdit** de prendre automatiquement le meilleur score (principe anti-scores magiques). |
| **TRANCHÉ** (D3, doc historique §8) | Homonymie verbale **sans override curée** → **pas de paradigme complet**. |
| Impact chiffré | Overrides curés existants connus : ex. `CURATED_BOLET_HURT`, `CURATED_SLUCHITSYA*` (`present-verbs.ts` / curated). Nombre de lemmes vocabulaire / gold **bloqués** par D3 si on importe OR sans override : **NON VÉRIFIÉ** — **À TRANCHER PAR MARIO** (mesure avant go). |

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
| **Ouverte** (noms, verbes, adjectifs) | Forte (96,8 % présence gold ; 96,8 % formes+accent sur V/N/Adj) | Import dictionnaire + analyseur |
| **Fermée** (mots-outils) | Faible utilité pédagogique des accents/paradigmes dans `others.csv` (0,34 Mo vs ~21 Mo de contenu) | **Curation manuelle permanente** |

Fichiers curés (classe fermée) — réponse **permanente**, pas une rustine :

- `pronouns.ts`
- `invariable-words.ts`
- `preposition-government.ts` (+ détection régence)
- numéraux / expressions figées (`genitive-numerals.ts`, `fixed-expressions.ts`)

| Statut | Décision |
|--------|----------|
| **TRANCHÉ** (cadrage) | Mots-outils = classe fermée → curation TS ; OpenRussian n’est **pas** la source de vérité pour cette classe. |

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

## 7. Schéma DB proposé (inchangé dans l’esprit)

Tables cibles : `morphology_lemmas`, `morphology_forms`, `morphology_sense_overrides`, `morphology_pending`.

Champs critiques à prévoir dès M1 :

- `source` / `source_version` (réversibilité §2.12)
- `lemma_bare` + `lemma_stressed` / `stress_status`
- `UNIQUE` métier à définir **après** décision import à la demande vs dump (**À TRANCHER**)

DDL détaillée : conserver le modèle du cadrage précédent (slots pédagogiques, `allowed_slots` pour défectivité). **Non appliqué** tant que Mario n’a pas lancé les SQL.

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
  → canonicalisation NFC + charset + strip monosyllabe
  → UPSERT morphology_* (source taggée)
  → rapport de diff AVANT purge cache / scénarios driftés
```

---

## 9. Phases (rappel)

| Phase | Action |
|-------|--------|
| **M0** | Mapping slot curé → `morphology_forms.slot` |
| **M1** | Import stock curé → DB |
| **M2** | Runtime dual-read DB puis fallback TS |
| **M3** | Batch deux sources pour pending / vocabulaire |
| **M4** | Retirer paradigmes utilisateur du LLM knowledge builder |
| **M5** | Deprecate TS curés pour la classe ouverte (garder classe fermée) |

---

## 10. Liste claire — À TRANCHER PAR MARIO

1. Import **à la demande** vs **dump complet** OpenRussian.  
2. UI quand dictionnaire manque l’accent mais l’analyseur a un lemme.  
3. Emplacement technique de la conversion `'` → U+0301 + batterie de tests.  
4. Modèle de jointure (`lemma_bare` obligatoire vs table de mapping).  
5. Comportement **ё/е** sur les deux sources (mesure empirique).  
6. Chiffrage d’impact **D3** (combien de lemmes sans paradigme tant qu’override absent).  
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
- `scripts/morphology-audit/coverage-report.md` — chiffres 96,8 % / 64,1 %
- `src/lib/vocabulary/canonicalize-lemma-form.ts` — gardes à répliquer en Python
