# M1 Phase 1 — Convention de slots, pièges, jointures

**Statut** : rapport seul — **aucun code d’import**, **aucune écriture en base**.  
**Date** : 2026-08-20.  
**Suite** : attendre validation Mario avant Phase 2 (`scripts/import-curated-morphology.ts`).

Inventaire recalculé depuis les fichiers TS (pas une reprise aveugle du chiffre M0).  
Résultat : **161** formes uniques `(lemma, slot, variant)` · **50** lemmes · **2** sense overrides.  
Écart vs M0 (163 / 49) : −2 formes / +1 lemme — M0 estimait les chevauchements ; le parsing soigneux (exclusion des `endings` de `CURATED_CHITAT`, pas de collision de formes) donne **161 / 50**. C’est le périmètre M1 proposé.

---

## 1a) Convention de slots (exhaustive)

Règle : **une forme curée = une ligne = un slot** (+ `variant`).  
Noms de slots en **anglais snake**, hiérarchie `famille.détail`.

### Cas (noms / pronoms / possessifs en citation)

| Slot | Usage |
|------|--------|
| `case.nominative` | Nominatif |
| `case.genitive` | Génitif |
| `case.dative` | Datif |
| `case.accusative` | Accusatif |
| `case.instrumental` | Instrumental |
| `case.prepositional` | Prépositionnel |

### Présent (verbes)

| Slot | Usage |
|------|--------|
| `present.sg1` | 1re sg |
| `present.sg2` | 2e sg |
| `present.sg3` | 3e sg |
| `present.pl1` | 1re pl |
| `present.pl2` | 2e pl |
| `present.pl3` | 3e pl |

### Passé (verbes)

| Slot | Usage |
|------|--------|
| `past.m` | Passé masculin sg |
| `past.f` | Passé féminin sg |
| `past.n` | Passé neutre sg |
| `past.pl` | Passé pluriel |

### Infinitif / lemme verbal en citation

| Slot | Usage |
|------|--------|
| `inf` | Infinitif (= forme de dictionnaire du verbe) |

### Adjectifs (accord — partials `CURATED_ADJECTIVES`)

| Slot | Usage |
|------|--------|
| `adj.m.nominative` | Masculin nominatif |
| `adj.f.nominative` | Féminin nominatif |
| `adj.n.nominative` | Neutre nominatif |
| `adj.pl.nominative` | Pluriel nominatif |

**Lemme adjectival** = citation masculine (`но́вый`, `хоро́ший`) ; les autres genres sont des forms du même `morphology_lemmas`.

### Hors slots (non importés)

- Chaînes `endings` (`-ю`, `-ешь`…) → colonne `ending` sur la form correspondante en Phase 2, **pas** un slot.
- Phrases multi-mots (`CURATED_EXAMPLE_PHRASES`, `direction`/`location` Moscou, exemples de régence) → **hors** `morphology_*` (§2.11).

### Couverture des 161 formes par slot

| Slot | N |
|------|--:|
| `case.nominative` | 24 |
| `case.genitive` | 19 |
| `case.instrumental` | 19 |
| `case.accusative` | 18 |
| `case.dative` | 16 |
| `case.prepositional` | 12 |
| `inf` | 21 |
| `present.sg2` | 5 |
| `present.sg3` | 5 |
| `present.sg1` | 4 |
| `present.pl3` | 3 |
| `present.pl1` | 1 |
| `present.pl2` | 1 |
| `past.m` | 2 |
| `past.n` | 2 |
| `past.f` | 1 |
| `past.pl` | 1 |
| `adj.m.nominative` | 2 |
| `adj.f.nominative` | 2 |
| `adj.n.nominative` | 2 |
| `adj.pl.nominative` | 1 |
| **Total** | **161** |

---

## 1b) Piège monosyllabes

Critère : exactement **une** voyelle russe (`аеёиоуыэюя`) après retrait de U+0301 — aligné sur `stripMonosyllableStress`.

Contrainte DB : `stress_status='present'` exige U+0301 dans `*_stressed` **et** `replace(stressed, U+0301, '') = *_bare`.  
Donc un monosyllabe **ne peut pas** être `present` → **`stress_status='missing'`**, `lemma_stressed` / `form_stressed` = **NULL**, bare = forme NFC sans accent.

### Lemmes monosyllabiques : **11 / 50**

`врач`, `вы`, `день`, `дом`, `мой`, `мы`, `он`, `свой`, `стол`, `ты`, `я`

### Formes monosyllabiques : **41 / 161**

Surfaces distinctes :

`вам`, `вас`, `врач`, `вы`, `день`, `дом`, `ей`, `им`, `их`, `мне`, `мной`, `мой`, `мы`, `нам`, `нас`, `ней`, `ним`, `них`, `нём`, `он`, `свой`, `стол`, `ты`, `я`

(Plusieurs lignes peuvent partager une surface — ex. `им` pour он/оно́/они́ — chacune en `missing`.)

**Non monosyllabes** malgré n- : ex. `него́`, `мно́ю`, `тобо́й` (plusieurs voyelles et/ou accent) → peuvent être `present` si accentué.

---

## 1c) Variantes

| `variant` | Lignes | Origine TS |
|-----------|-------:|------------|
| `plain` | **137** | `plain` ou forme unique |
| `with_n` | **20** | `withN` (он/она́/оно́/они́) |
| `alt` | **4** | `alt: […]` — **une seule** entrée par case dans le TS actuel |

Les 4 `alt` : `я/case.instrumental` → `мно́ю` ; `ты` → `тобо́ю` ; `она́` → `е́ю` ; `себя́` → `собо́ю`.

**Unicité `(lemma_bare, slot, variant)`** : **0 collision** (aucune paire avec deux formes différentes).  
Aucun case n’a deux `alt` (sinon Model B serait insuffisant — non observé).

---

## 1d) `app_lemma_id` ↔ `public.lemmas`

Jointure : `stripStress(curated.lemma).lower()` vs idem sur `lemmas.form` (259 lignes en base, lecture seule 2026-08-20).

| Résultat | N | Action M1 |
|----------|--:|-----------|
| Correspondance **unique** (1 forme bare en base) | **29** | Remplir `app_lemma_id` |
| **Ambigu** (plusieurs accents distincts pour la même bare) | **3** | **Ne pas remplir** |
| **Absent** de `lemmas` | **18** | `app_lemma_id` NULL |

### Ambigus (ne pas lier)

| Curé | Hits en `lemmas` |
|------|------------------|
| `боле́ть` | `бо́леть`, `боле́ть` |
| `идти́` | `идти́`, `и́дти` |
| `себя́` | `се́бя`, `себя́` |

### Absents (échantillon / liste complète)

`выйти́`, `дом`, `е́здить`, `кварти́ра`, `кни́ги`, `мой`, `написа́ть`, `настрое́ние`, `но́вый`, `оно́`, `пое́хать`, `прие́хать`, `прийти́`, `сде́лать`, `сказа́ть`, `уе́хать`, `уйти́`, `ходи́ть`

Note : `кни́ги` comme « lemme » vient de `CURATED_AGREEMENT_NOUNS` (forme d’illustration stockée comme tête) — quirk TS, pas une erreur de jointure.

Correspondance exacte caractère à caractère curated ↔ `lemmas.form` : **26** (sous-ensemble des 29 uniques).

---

## 1e) Charset / NFC

Vérification sur les **161** forms et **50** lemmes :

| Check | Échecs |
|-------|-------:|
| NFC (`unicodedata.normalize('NFC')` ≠ stocké) | **0** |
| Charset (hors U+0400–U+04FF / `-` / U+0301) | **0** |

Aucune ligne curée ne violerait `*_is_nfc` ni `*_charset` telle que définie dans `morphology_tables_ddl.sql`.

---

## Synthèse pour validation

1. **Slots** : liste ci-dessus (21 noms) — suffisante pour 161 formes.  
2. **Monosyllabes** : 11 lemmes + 41 forms → `stress_status='missing'`, stressed NULL.  
3. **Variantes** : 137 / 20 / 4 — clé unique OK.  
4. **`app_lemma_id`** : 29 oui · 3 ambigu (vide) · 18 NULL.  
5. **Charset/NFC** : clean.

**Écart M0** : importer **161+50+2**, pas 163+49 — à confirmer par Mario comme nouveau chiffre de vérité.

---

**STOP Phase 1.** Pas de script Phase 2 tant que non validé.

---

## Phase 2 (après validation) — ENDINGS

Les terminaisons curées (`TCuratedVerbPresent.endings` / `CURATED_CHITAT.endings`) atterrissent dans **`morphology_forms.ending`**, sur la même ligne que la forme de présent (`present.sg1`…), pas dans un slot séparé.

Script : `scripts/import-curated-morphology.ts`  
- Dry-run (défaut) : `npx tsx scripts/import-curated-morphology.ts`  
- Écriture : `npx tsx scripts/import-curated-morphology.ts --apply`
