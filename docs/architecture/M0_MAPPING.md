# M0 — Mapping des données curées → schéma `morphology_*`

**Statut** : rapport de lecture seule — **aucune** table créée, **aucune** écriture en base, **aucune** modification de `src/`.  
**Date** : 2026-08-20.  
**Référence schéma** : [`MORPHOLOGY_ENGINE.md`](./MORPHOLOGY_ENGINE.md) §7 (+ DDL détaillée du cadrage antérieur : `morphology_lemmas` / `_forms` / `_sense_overrides` / `_pending`, `UNIQUE (morphology_lemma_id, slot)`).

Objectif : préparer le déménagement TS → base. Rien ne bouge encore.

---

## 1. Inventaire des sources curées

Périmètre cherché : `src/lib/knowledge/morphology/curated/` (+ exports).  
Fichiers **exclus** de l’inventaire « données » (code / tests uniquement) :

| Fichier | Raison |
|---------|--------|
| `index.ts` | Réexports |
| `detect-preposition-government.ts` | Logique de détection (consomme la table de régence) |
| `compose-present-conjugation-demo.ts` | Composition UI / teaching (consomme `present-verbs`) |
| `*.test.ts` | Tests |

Aucune autre source `CURATED_*` morphologique hors ce dossier (les seeds teaching / concepts sont hors morphologie curée).

---

### 1.1 `pronouns.ts`

| | |
|--|--|
| **Chemin** | `src/lib/knowledge/morphology/curated/pronouns.ts` |
| **Type** | `TPronounParadigm` : `{ lemma, reflexive?, forms: Partial<Record<TPronounCase, TPronounCaseForm>> }` avec `TPronounCaseForm = { plain?, withN?, alt? }` |
| **Entrées** | **9** paradigmes (`CURATED_PRONOUNS`) |
| **Représente** | Lemme + **formes fléchies** (cas × variantes plain / н- / alt) — classe fermée |

Exemple (tel quel) :

```ts
const YA: TPronounParadigm = {
  lemma: "я",
  forms: {
    nominative: { plain: "я" },
    genitive: { plain: "меня́" },
    dative: { plain: "мне" },
    accusative: { plain: "меня́" },
    instrumental: { plain: "мной", alt: ["мно́ю"] },
    prepositional: { plain: "мне" },
  },
};
```

Métadonnée annexe (pas une forme) : `NEVER_POSSESSIVE_PRONOUN_HINT` — 5 paires lemme → possessif (consigne prompt).

---

### 1.2 `present-verbs.ts`

| | |
|--|--|
| **Chemin** | `src/lib/knowledge/morphology/curated/present-verbs.ts` |
| **Type** | `TCuratedVerbPresent` : `{ lemma, aliases[], conjugationClass, defective?, present, endings, past? }` |
| **Entrées** | **6** verbes (`CURATED_PRESENT_VERBS`) |
| **Représente** | Lemme + **formes fléchies** (présent / passé) + terminaisons + **défectivité de sens** |

Exemple (tel quel) :

```ts
export const CURATED_BOLET_HURT: TCuratedVerbPresent = {
  lemma: "боле́ть",
  aliases: ["болеть", "боле́ть"],
  conjugationClass: 2,
  defective: {
    allowedPersons: ["sg3", "pl3"],
    note: "Au sens « avoir mal », seules les 3es personnes s'emploient (sujet = partie du corps).",
  },
  present: {
    sg3: "боли́т",
    pl3: "боля́т",
  },
  endings: {
    sg3: "-ит",
    pl3: "-ят",
  },
};
```

Compteurs formes dans ce fichier : **16** cellules présent + **5** cellules passé.

---

### 1.3 `preposition-government.ts`

| | |
|--|--|
| **Chemin** | `src/lib/knowledge/morphology/curated/preposition-government.ts` |
| **Type** | `TPrepositionGovernmentEntry` : `{ preposition, cases[], senseDependent? }` |
| **Entrées** | **30** |
| **Représente** | **Règle** (préposition → cas régi), pas une flexion |

Exemple (tel quel) :

```ts
{ preposition: "после", cases: ["genitive"] },
```

et

```ts
{
  preposition: "в",
  cases: ["accusative", "prepositional"],
  senseDependent: true,
},
```

---

### 1.4 `invariable-words.ts`

| | |
|--|--|
| **Chemin** | `src/lib/knowledge/morphology/curated/invariable-words.ts` |
| **Type** | `readonly string[]` (formes nues) |
| **Entrées** | **27** |
| **Représente** | **Mot sans flexion** (flag UI : aucun badge) — pas de paradigme |

Exemple (tel quel) :

```ts
"тоже",
```

dans

```ts
export const CURATED_INVARIABLE_WORDS: readonly string[] = [
  "и", "а", "но", /* … */ "тоже", /* … */ "по-французски",
];
```

---

### 1.5 `genitive-numerals.ts`

| | |
|--|--|
| **Chemin** | `src/lib/knowledge/morphology/curated/genitive-numerals.ts` |
| **Type** | `readonly string[]` |
| **Entrées** | **30** |
| **Représente** | **Règle / déclencheur** (forme qui impose le génitif au suivant) — pas un paradigme de déclinaison du numéral |

Exemple (tel quel) :

```ts
"десять",
```

---

### 1.6 `fixed-expressions.ts`

| | |
|--|--|
| **Chemin** | `src/lib/knowledge/morphology/curated/fixed-expressions.ts` |
| **Type** | `TCuratedFixedExpression` : `{ preposition, governedSurface, citation }` |
| **Entrées** | **2** |
| **Représente** | **Expression multi-mots** (règle de matching + citation) |

Exemple (tel quel) :

```ts
{
  preposition: "до",
  governedSurface: "свидания",
  citation: "до свида́ния",
},
```

---

### 1.7 `forms.ts`

| | |
|--|--|
| **Chemin** | `src/lib/knowledge/morphology/curated/forms.ts` |
| **Type** | Objets `as const` hétérogènes (pas d’interface unique) — partials de paradigmes, listes d’exemples, phrases |
| **Entrées** | **24** constantes exportées `CURATED_*` |
| **Représente** | Mélange : **lemmes** + **formes fléchies** partielles + **phrases** multi-mots d’illustration |

Exemple forme (tel quel) :

```ts
export const CURATED_KNIGA = {
  nom: "кни́га",
  acc: "кни́гу",
  /** Génitif singulier */
  gen: "кни́ги",
} as const;
```

Exemple phrase (tel quel) :

```ts
export const CURATED_EXAMPLE_PHRASES = {
  onLyubitSvoyuRabotu: "Он лю́бит свою́ рабо́ту",
  yaIdu: "Я иду́",
  yaEduVMoskvu: "Я е́ду в Москву́",
  yaVMoskve: "Я в Москве́",
} as const;
```

Compteurs : **82** chaînes mono-mot ; **15** chaînes / templates multi-mots (prép collée, phrases). Chevauchement réel avec `present-verbs.ts` (чита́ть, говори́ть, пойти́, найти́, случи́ться).

---

## 2. Mapping vers les tables cibles

Colonnes de référence (cadrage) :

- `morphology_lemmas` : `lemma_bare`, `lemma_stressed`, `pos`, `gender`, `animacy`, `aspect`, `conjugation_class`, `source`, `stress_status`, `lemma_id?`
- `morphology_forms` : `morphology_lemma_id`, `slot`, `form_bare`, `form_stressed`, `ending?`, `stress_status`, `tags?` — **UNIQUE (`morphology_lemma_id`, `slot`)**
- `morphology_sense_overrides` : `morphology_lemma_id`, `sense_key`, `label_fr?`, `allowed_slots[]`, `notes_fr?`, `validated`
- `morphology_pending` : file d’attente batch (lemmes manquants) — **vide** pour un import M1 du stock déjà curé

### 2.1 Tableau source → table

| Source | Table(s) | Colonnes / slots |
|--------|----------|------------------|
| `pronouns.ts` paradigmes | `morphology_lemmas` + `morphology_forms` | 1 lemme (`pos=pronoun`) ; **plusieurs** forms : slots `case.{nom\|gen\|…}` et variantes `case.gen.with_n`, `case.instr.alt`, etc. |
| `NEVER_POSSESSIVE_PRONOUN_HINT` | **Aucune** | Métadonnée prompt |
| `present-verbs.ts` | `morphology_lemmas` + `morphology_forms` + éventuellement `morphology_sense_overrides` | Lemme (`pos=verb`, `conjugation_class`, `aspect?`) ; forms `present.sg1`… / `past.m`… ; `ending` depuis `endings` ; defective → override (`sense_key` ex. `boleть.hurt`, `allowed_slots`) |
| `forms.ts` (partials nom/cas/verbe) | `morphology_lemmas` + `morphology_forms` | Même modèle ; slots à normaliser (`nom` → `case.nom`, `instr` → `case.inst`, etc.) |
| `forms.ts` phrases / exemples régence | **Aucune** (tel quel) | Contenu pédagogique multi-mots — hors cellules de paradigme |
| `preposition-government.ts` | **Aucune** | Règle, pas forme |
| `invariable-words.ts` | **Aucune** claire (voir §3) | Mot sans flexion |
| `genitive-numerals.ts` | **Aucune** claire | Déclencheur de régence |
| `fixed-expressions.ts` | **Aucune** | Multi-mots |
| (runtime) lemmes non curés | `morphology_pending` | Pas M1 curated |

### 2.2 Données qui ne rentrent dans **aucune** table prévue

1. **Régence prépositionnelle** (`preposition-government.ts`) — règle `prep → cases[]`.  
2. **Numéraux gouvernants** (`genitive-numerals.ts`) — même famille « déclencheur ».  
3. **Expressions figées** (`fixed-expressions.ts`) — multi-mots.  
4. **Invariables** (`invariable-words.ts`) — pas de flexion ; le schéma n’a pas de table « liste de surfaces / flags UI ».  
5. **Phrases d’exemple** (`CURATED_EXAMPLE_PHRASES`, `CURATED_PREP_GOVERNMENT_EXAMPLES`, `CURATED_MOSKVA.direction/location`) — chaînes multi-mots.  
6. **`NEVER_POSSESSIVE_PRONOUN_HINT`** — consigne LLM.  
7. **Logique** (`detect-preposition-government.ts`, `compose-present-conjugation-demo.ts`, helpers `inferPresentPersonFromSurface`, etc.).

### 2.3 Colonnes prévues **non remplies** par le stock curé actuel

| Colonne | Constat |
|---------|---------|
| `morphology_lemmas.gender` | Quasi absent (sauf commentaires informels : врач masculin animé) — pas de champ structuré |
| `morphology_lemmas.animacy` | Idem (commentaire врач) — pas de donnée machine |
| `morphology_lemmas.aspect` | Non renseigné dans `TCuratedVerbPresent` (найти́ perfectif seulement en commentaire) |
| `morphology_lemmas.lemma_id` | Lien `lemmas` applicatif : à résoudre à l’import, pas dans le TS |
| `morphology_forms.tags` | Variantes `withN` / `alt` / syncrétisme : aujourd’hui dans la structure TS, pas dans un JSON tags |
| `morphology_pending.*` | Aucune ligne M1 (stock déjà connu) |
| `stress_status` | Implicite « complete » pour le curé, jamais stocké explicitement en TS |

### 2.4 Une entrée TS → **plusieurs** lignes en base

| Entrée TS | Lignes produites |
|-----------|------------------|
| 1 pronom (`TPronounParadigm`) | **1** `morphology_lemmas` + **N** `morphology_forms` (jusqu’à 6 cas × plain/withN/alt). Ex. `я` → 7 form-rows si on compte `instr.alt` ; total pronoms : **73** form-rows. |
| 1 verbe `TCuratedVerbPresent` | **1** lemma + **1 form-row par cellule** présent/passé renseignée (**16+5** au total fichier) ; si `defective` → **+1** `morphology_sense_overrides`. |
| 1 objet `forms.ts` (ex. `CURATED_KNIGA`) | **1** lemma + **1 form-row par clé** (`nom`, `acc`, `gen` → 3). |
| 1 préposition / 1 invariable / 1 numéral / 1 figé | **0** ligne `morphology_*` sous le schéma actuel (voir §2.2). |

---

## 3. Questions de structure (faits, sans trancher)

### 3.1 Invariables et prépositions — place dans `morphology_forms` ?

**Fait** : elles n’ont pas de paradigme de flexion dans le TS.  
`morphology_forms` est défini autour de `slot` + forme fléchie (`UNIQUE (lemma, slot)`).  
Les mettre dans `morphology_forms` avec un slot artificiel (`lemma` / `invariable`) forcerait une sémantique que le schéma n’exprime pas (flag « pas de badge », régence).  
**Alternative factuelle non tranchée** : table / colonnes hors `morphology_*` (ex. `morphology_particles`, JSON de flags sur `morphology_lemmas`, ou garder la curation TS pour la classe fermée — déjà la position produit §2.11 du moteur).

### 3.2 Expressions figées multi-mots — le schéma les gère-t-il ?

**Fait** : non.  
`morphology_forms` = une forme liée à **un** `morphology_lemma_id`.  
`fixed-expressions` = couple `(preposition, governedSurface)` + `citation`. Aucune colonne multi-token / expression dans §7.

### 3.3 `preposition-government.ts` — où va la règle ?

**Fait** : nulle part dans les quatre tables.  
Ce n’est ni un lemme, ni une cellule de paradigme, ni un sense override, ni un pending.  
C’est une **table de régence** (consommé aujourd’hui par `detect-preposition-government.ts` + overrides Reader).  
Toute migration implique **étendre le schéma** ou **laisser cette règle en TS**.

### 3.4 Identifiant métier unique pour `morphology_forms` ?

**Fait (schéma prévu)** : `UNIQUE (morphology_lemma_id, slot)` — la clé métier est **lemme + slot**, pas lemme + forme.  
Conséquences observables sur le stock curé :

- Même surface dans deux cas (ex. `меня́` = genitif **et** accusatif) → **deux** lignes, slots distincts, `form_*` identiques — **permis**.  
- Deux variantes pour le même cas (`его́` / `него́`) → **ne peuvent pas** partager le même `slot` ; il faut des slots distincts (`case.gen` vs `case.gen.with_n`) ou abandonner l’unicité actuelle.  
- `UNIQUE (lemma, form)` serait **incompatible** avec le syncrétisme (même forme, deux cas).

---

## 4. Volume attendu M1 (chiffres)

Hypothèse de périmètre M1 : **importer uniquement ce qui mappe aux quatre tables** (paradigmes : pronoms + verbes présents + partials `forms.ts` mono-mot), **après déduplication** des chevauchements `present-verbs` ↔ `forms.ts`.  
**Exclus** du volume : régence, invariables, numéraux, figés, phrases, pending.

| Table | Lignes M1 | Détail du compte |
|-------|----------:|------------------|
| `morphology_lemmas` | **49** | 9 pronoms + 6 verbes + 34 têtes `forms.ts` non déjà couvertes (union = 49) |
| `morphology_forms` | **163** | 73 (pronoms) + 21 (présent/passé verbes) + 82 (`forms.ts` mono-mot) − **13** chevauchements estimés verbe/`forms.ts` |
| `morphology_sense_overrides` | **2** | `CURATED_BOLET_HURT`, `CURATED_SLUCHITSYA` |
| `morphology_pending` | **0** | Stock curé déjà connu |

**Total lignes créées M1 (4 tables)** : **49 + 163 + 2 + 0 = 214**.

Hors tables (resteraient en TS ou schéma à inventer) : **30** prépositions + **27** invariables + **30** numéraux + **2** figés + **15** phrases/exemples ≈ **104** artefacts non importables tels quels.

---

## 5. Synthèse — ce que ce M0 révèle sur le §7

1. Le schéma **couvre bien** le cœur paradigmatique (pronoms, verbes défectifs, partials de noms/adj/verbes).  
2. Il **ne couvre pas** la classe fermée « règles & flags » qui fait tourner le Reader aujourd’hui (régence, figés, invariables, numéraux déclencheurs).  
3. L’unicité **`lemma + slot`** est adaptée au syncrétisme, mais **exige** une convention de slots pour `withN` / `alt` avant M1.  
4. `forms.ts` est **hétérogène** (paradigme partiel + phrases) : un filtre d’import est obligatoire, sinon pollution de `morphology_forms` par des multi-mots.

**Prochaine étape naturelle (hors ce ticket)** : trancher le sort des règles / invariables / figés **avant** toute DDL — sinon M1 déménage incomplet et le runtime continuera de dépendre du TS pour le chemin critique Reader.
