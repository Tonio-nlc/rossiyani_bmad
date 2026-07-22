# Moteur morphologique déterministe — cadrage (étape 1)

**Statut** : cadrage uniquement — **aucune implémentation** dans ce ticket.  
**Décision produit** : les formes russes fléchies ne doivent plus être produites par le LLM.  
**Cible technique** : `pymorphy3` (dictionnaire OpenCorpora) ou équivalent déterministe.  
**Stack runtime** : Next.js 16 / TypeScript / Supabase (Vercel) ; migrations appliquées manuellement via SQL Editor (CLI Supabase non utilisable ici).

---

## 0. Problème à résoudre

Aujourd’hui Rossiyani mélange encore :

| Source | Rôle actuel | Risque |
|--------|-------------|--------|
| LLM (`generate-knowledge-llm`) | Remplit parfois `paradigms`, conjugaisons, cas | Hallucinations de formes |
| Curated TS (`src/lib/knowledge/morphology/curated/`) | Paradigmes validés à la main (petit stock) | Non scalable |
| Seed teaching scenarios | Exemples illustratifs (чита́ть…) | Confusion si utilisés comme démo d’un autre lemme |

**Objectif** : une seule source de vérité pour **toute forme fléchie** affichée ou stockée ; le LLM ne rédige plus que du texte pédagogique.

---

## 1. Intégration — trois options

### a) Microservice Python (FastAPI) appelé par Next au bootstrap / enregistrement

**Flux** : `POST /api/vocabulary` ou `buildKnowledge` → HTTP → service Python (pymorphy3) → paradigme JSON → écriture Supabase / réponse synchrone.

| Avantages | Inconvénients |
|-----------|---------------|
| Paradigme à la demande pour tout lemme nouveau | **Hébergement séparé** (Vercel ne fait pas tourner Python durablement) |
| Toujours à jour dès l’enregistrement | Latence + point de défaillance réseau |
| API unique réutilisable (batch + runtime) | Coût ops (Fly.io / Railway / Cloud Run…) |
| | Secrets, monitoring, versioning dictionnaire |
| | Complexité hors stack actuelle (règles AGENTS : stack contrôlée) |

**Verdict pour Rossiyani** : viable à moyen terme si le volume de lemmes *nouveaux* est élevé et qu’on accepte un second service. **Trop lourd pour l’étape 1** et incompatible avec « Vercel-only » sans infra supplémentaire.

---

### b) Génération batch offline (script Python) → table Supabase → runtime TS lecture seule

**Flux** :

1. Script local / CI Python (`pymorphy3` + couches accent / défectivité).
2. Export SQL ou upsert via service role (psql / SQL Editor / script `supabase-js` Node).
3. Runtime Next.js : **lit uniquement** Postgres — **aucun Python en prod**.

| Avantages | Inconvénients |
|-----------|---------------|
| Aligne parfaitement stack Vercel + TS | Lemme jamais vu → pas de paradigme tant que le batch n’a pas tourné |
| Zéro dépendance runtime Python | Pipeline ops à documenter (qui lance le batch, quand) |
| Migrations SQL manuelles OK (INSERT/UPSERT) | Délai entre premier enregistrement et enrichissement morpho |
| Idempotent, auditable, rejouable | |
| Compatible avec le modèle déjà en place (`linguistic_knowledge.paradigms`, `user_vocabulary.teaching_scenario`) | |

**Atténuation du « lemme manquant »** : à l’enregistrement, la fiche reste en mode dégradé (principe + bridge, **paradigme omis** — déjà le comportement voulu). Une file `morphology_pending` alimente le prochain batch.

**Verdict pour Rossiyani** : **recommandé**.

---

### c) Portage / wrapper morphologique en TS ou WASM

Ex. : bindings WASM d’un analyseur, réimplémentation, ou API pure JS.

| Avantages | Inconvénients |
|-----------|---------------|
| Tout dans le même déploiement Vercel | **Pas d’équivalent mature à pymorphy3** en TS aujourd’hui |
| Latence nulle (in-process) | Qualité / couverture OpenCorpora difficile à égaler |
| | Maintenance lourde ; risque de « faux déterminisme » |

**Verdict** : **hors scope** tant qu’aucun package WASM/TS n’atteint la couverture OpenCorpora + licence claire. Réévaluer uniquement si un binding officiel apparaît.

---

### Recommandation

**Option (b) — batch offline Python → table(s) Supabase → lecture TS exclusive.**

Raisons liées à *ce* projet :

1. Vercel héberge le front/API Next — pas de Python durable sans second cloud.
2. Migrations / peuplement déjà manuels via SQL Editor — le batch peut émettre des `UPSERT` SQL ou un JSON importable.
3. Sépare clairement « formes » (déterministe, offline) et « pédagogie » (LLM, runtime).
4. S’inscrit dans le chemin déjà amorcé : morphologie curée TS → démonstration composée → `teaching_scenario` persisté ; le moteur remplace la *source* des formes, pas l’architecture pédagogique.

**Évolution possible (étape 3+)** : ajouter un worker FastAPI *uniquement* pour vider `morphology_pending` en continu — toujours en écrivant la même table ; le runtime TS ne change pas.

---

## 2. Frontière moteur vs LLM

### Vient du moteur morphologique (déterministe)

| Donnée | Exemple | Notes |
|--------|---------|--------|
| Lemme normalisé | `болеть` | Clé de jointure |
| POS / tags OpenCorpora | `VERB`, `inan`, etc. | Mappés vers le modèle Rossiyani |
| Genre, animacité (noms/adj) | `f`, `inanimate` | |
| Aspect (verbe) | imperfective / perfective | Si présent dans le dictionnaire |
| Classe de conjugaison (dérivée) | 1 / 2 | Heuristique déterministe sur les formes, pas LLM |
| **Paradigme de formes** | présent, passé, cas, etc. | **Sans exception : jamais LLM** |
| Terminaisons dérivées | `-ит`, `-ешь` | Calculées depuis surface − radical |
| Flags structurels | `impersonal`, `invariable` | Si exposés ou dérivables |
| Score / source | `pymorphy3@1.x` | Traçabilité |

### Reste au LLM (et/ou rédaction curée)

| Donnée | Exemple |
|--------|---------|
| Explication contextuelle (Reader) | Pourquoi *cette* forme dans *cette* phrase |
| Bridge teaching scenario | « Dans ta phrase… » |
| Intuition / hook / memoryAnchor *rédigés* | Métaphore pédagogique |
| Erreurs fréquentes *en français* | Texte ; les formes citées viennent du moteur |
| Traduction, registre, nuances sémantiques | |
| Choix du *concept* pédagogique | Graph / matching (peut utiliser tags moteur) |

### Règle d’or

> Toute chaîne cyrillique présentée comme **forme fléchie** dans l’UI ou en base doit être traçable à une ligne du moteur (ou à une **override curée** explicitement versionnée). Le LLM peut *citer* ces formes ; il ne doit pas les *inventer*.

---

## 3. Accentuation (U+0301)

### État des lieux

- **pymorphy3 / OpenCorpora** : les lemmes et formes sont en général **sans** accent tonique pédagogique.
- **Rossiyani** : l’accent (combining acute U+0301) est **non négociable** (Reader, leçons, fiches).

### Stratégie en couches

```
Forme brute moteur (без ударения)
        ↓
1) Table accents curés (lemme / forme → forme accentuée)   ← priorité max
        ↓
2) Lexique d’accentuation externe (si licence OK)            ← batch
        ↓
3) Conservation de l’accent déjà vu en Reader
   (surface explanation_cache / textes seed)                 ← opportuniste
        ↓
4) Forme non accentuée + flag stress_status = 'missing'      ← jamais inventé par LLM
```

| Couche | Rôle |
|--------|------|
| **Curated accents** | Source de vérité pédagogique (comme `CURATED_*` aujourd’hui) |
| **Lexique batch** | Accélérer la couverture (Wiktionary dumps, etc. — à valider licence) |
| **Encounter reuse** | Si l’utilisateur a cliqué `боли́т`, on peut propager cet accent à la cellule du paradigme correspondante |
| **LLM** | **Interdit** pour placer U+0301 sur une forme nouvelle |

### Validation

- Gate qualité : toute forme affichée en grand (lemmaStressed, visual nodes) doit passer un check `hasCombiningAcute` *ou* être explicitement `stress_status = 'unknown'` et affichée avec un style « accent à confirmer » (produit à trancher — v1 : préférer omettre plutôt que mal placer).
- Les overrides curés gagnent toujours sur le dump moteur.

---

## 4. Défectivité (болеть « avoir mal », случиться)

### Ce que le dictionnaire donne

OpenCorpora / pymorphy traitent surtout des **lexèmes**. Ils ne modélisent pas toujours la distinction pédagogique :

- `болеть₁` « être malade » → paradigme complet (`боле́ю`…)
- `болеть₂` « avoir mal » (sujet = partie du corps) → **3e personne seulement**

pymorphy peut lister un paradigme *complet* pour `болеть` sans flag « ce sens est défectif ».

### Position Rossiyani

| Source | Rôle |
|--------|------|
| Moteur | Fournit le **superset** de formes du lemme |
| **Couche de correction curée** (`morphology_sense_overrides`) | Restreint les personnes / cellules autorisées **par sens** |
| Teaching engine | N’affiche que les cellules `allowed` |

Le flag `defective` / `allowed_persons` / `sense_key` **ne vient pas de pymorphy de façon fiable** : il faut une **couche curée par-dessus**, déjà amorcée dans `present-verbs.ts` (`CURATED_BOLET_HURT`, `CURATED_SLUCHITSYA`).

### Modèle mental

```
lemma_id + sense_key
  → paradigme moteur (toutes formes)
  → ∩ override curée (allowed cells)
  → paradigme pédagogique affiché
```

Sans override : afficher le paradigme moteur **complet** *ou* (politique prudente v1) n’afficher que la forme rencontrée + lemme jusqu’à curation du sens.

**Recommandation v1** : politique prudente — si `sense_key` ambigu (homonymie verbale), ne pas afficher le paradigme complet tant qu’un override n’existe pas ; loguer pour curation.

---

## 5. Schéma DB proposé

Pensé pour **remplissage batch** et **lecture TS**. Migrations manuelles via SQL Editor.

### 5.1 `morphology_lemmas` — tête de lexème

```sql
CREATE TABLE morphology_lemmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID REFERENCES lemmas(id) ON DELETE SET NULL,
  -- forme dictionnaire sans accent (clé moteur)
  lemma_bare TEXT NOT NULL,
  lemma_stressed TEXT,                 -- si connu
  pos TEXT NOT NULL,                   -- noun | verb | adjective | ...
  gender TEXT,
  animacy TEXT,
  aspect TEXT,                         -- imperfective | perfective | null
  conjugation_class SMALLINT,          -- 1 | 2 | null
  source TEXT NOT NULL DEFAULT 'pymorphy3',
  source_version TEXT,
  stress_status TEXT NOT NULL DEFAULT 'unknown',
  -- unknown | partial | complete
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lemma_bare, pos, aspect)
);
```

### 5.2 `morphology_forms` — cellules du paradigme

```sql
CREATE TABLE morphology_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  morphology_lemma_id UUID NOT NULL
    REFERENCES morphology_lemmas(id) ON DELETE CASCADE,
  -- grille pédagogique
  slot TEXT NOT NULL,
  -- ex: present.sg3 | past.m | case.acc.sg | ...
  form_bare TEXT NOT NULL,
  form_stressed TEXT,
  stress_status TEXT NOT NULL DEFAULT 'unknown',
  ending TEXT,                         -- dérivé, ex: -ит
  tags JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (morphology_lemma_id, slot)
);

CREATE INDEX idx_morphology_forms_lemma ON morphology_forms(morphology_lemma_id);
CREATE INDEX idx_morphology_forms_bare ON morphology_forms(form_bare);
```

### 5.3 `morphology_sense_overrides` — défectivité / sens

```sql
CREATE TABLE morphology_sense_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  morphology_lemma_id UUID NOT NULL
    REFERENCES morphology_lemmas(id) ON DELETE CASCADE,
  sense_key TEXT NOT NULL,             -- ex: boleть.hurt | boleть.ill
  label_fr TEXT,
  -- personnes / slots autorisés (null = tous)
  allowed_slots TEXT[],
  notes_fr TEXT,
  validated BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (morphology_lemma_id, sense_key)
);
```

### 5.4 `morphology_pending` — file batch

```sql
CREATE TABLE morphology_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID REFERENCES lemmas(id) ON DELETE CASCADE,
  lemma_bare TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,                         -- save | bootstrap | backfill
  UNIQUE (lemma_bare)
);
```

### 5.5 Lien avec l’existant

| Existant | Relation |
|----------|----------|
| `lemmas` | `morphology_lemmas.lemma_id` |
| `linguistic_knowledge.paradigms` | **Projection** dérivée (job ou trigger) pour ne pas casser le profil actuel ; à terme lecture directe depuis `morphology_*` |
| `user_vocabulary.teaching_scenario` | Continue de stocker la démo *composée* ; les formes citées doivent matcher `morphology_forms` |
| Curated TS | Migré vers `morphology_sense_overrides` + `form_stressed` (voir §6) |

**RLS** : tables morphologiques = base propriétaire (lecture `authenticated`, écriture service role uniquement) — même modèle que `linguistic_knowledge`.

---

## 6. Migration depuis `src/lib/knowledge/morphology/curated/`

### Inventaire actuel (à ne pas perdre)

- `forms.ts` — exemples teaching (чита́ть, кни́га, motion…)
- `present-verbs.ts` — paradigmes + **défectivité** (болеть, случиться)
- Seeds teaching — illustrations de *concept*, pas de lemme utilisateur

### Plan sans régression

| Phase | Action | Critère de done |
|-------|--------|-----------------|
| **M0** | Documenter le mapping slot curé → `morphology_forms.slot` | Table de correspondance figée |
| **M1** | Script d’import : chaque `TCuratedVerbPresent` → `morphology_lemmas` + forms + `sense_overrides` | Smoke : болеть.hurt = sg3/pl3 only |
| **M2** | Runtime : `getCuratedPresentVerb(lemma)` lit **d’abord** DB, fallback fichier TS | Parité bit-à-bit sur le stock curé |
| **M3** | Batch pymorphy pour lemmes `user_vocabulary` / `lemmas` absents | `morphology_pending` se vide |
| **M4** | Retirer les paradigmes *utilisateur* du LLM knowledge builder (prompt + Zod reject) | Aucune forme nouvelle sans `source` moteur/curated |
| **M5** | Deprecate fichiers TS curés (garder seeds *illustration concept* séparés) | Un seul chemin de lecture |

### Garde-fous anti-régression

1. **Test de parité** : pour chaque lemme curé, snapshot des formes accentuées avant/après import DB.
2. **Gate `SCENARIO_FOREIGN_LEMMA_FORM`** : inchangé — s’applique aux scénarios persistés.
3. **Pas de big-bang** : le teaching engine continue d’omettre le visual si paradigme absent (comportement déjà en place).
4. **Seeds concept** (чита́ть dans « Illustration — … ») restent du contenu *illustratif* du concept, clairement étiquetés — hors chemin « lemme consulté ».

---

## 7. Implications pour le flux actuel (rappel, sans implémenter)

```
Enregistrement mot (Reader)
  → user_vocabulary
  → enqueue morphology_pending (si pas en morphology_lemmas)
  → compose teaching_scenario (formes = DB/curated only)
  → LLM = bridge / textes seulement

Batch offline (ops)
  → pymorphy3 + accents + overrides
  → UPSERT morphology_*
  → optionnel : re-compose teaching_scenario si visual était omis
```

---

## 8. Décisions à trancher avant l’étape 2 (implémentation)

| # | Question | Proposition par défaut |
|---|----------|------------------------|
| D1 | Option intégration | **(b) batch offline** |
| D2 | Affichage sans accent | Omettre l’accent plutôt que LLM |
| D3 | Homonymie verbale sans override | Pas de paradigme complet |
| D4 | Où tourne le batch | Machine locale / CI GitHub Actions Python |
| D5 | Format d’import SQL Editor | Fichiers `supabase/seed/morphology_*.sql` générés |

---

## 9. Hors scope de ce document

- Code applicatif, migrations appliquées, choix de licence d’un lexique d’accents précis.
- Hébergement concret du futur worker FastAPI (étape 3+).
- Remplacement du matching de concepts / graph.

---

## 10. Synthèse

| Sujet | Position |
|-------|----------|
| Intégration | **Batch Python offline → Supabase ; runtime TS lecture seule** |
| Frontière | Moteur = formes + traits ; LLM = prose pédagogique |
| Accents | Couches curées + lexique + encounter ; **jamais LLM** |
| Défectivité | **Override curée par sens** au-dessus du dictionnaire |
| DB | `morphology_lemmas` / `_forms` / `_sense_overrides` / `_pending` |
| Migration curated | Import DB → dual-read → parité → deprecate TS |

**Prochaine étape (ticket séparé)** : migration SQL des tables + script Python d’import du stock curé (M0–M1), sans brancher encore pymorphy sur tout le vocabulaire.
