# M0b — Clé métier `morphology_forms` et variantes н- (plain / withN)

**Statut** : rapport seul — **aucune DDL**.  
**Date** : 2026-08-20.  
**Fait suite à** : [`M0_MAPPING.md`](./M0_MAPPING.md) (défaut `UNIQUE (lemma, slot)` vs `его́` / `него́`).

---

## 1. Comment `pronouns.ts` stocke et comment le runtime choisit

### 1.1 Structure exacte

Par cas, un objet `TPronounCaseForm` :

```ts
interface TPronounCaseForm {
  plain?: string;   // sans н- (ou seule forme)
  withN?: string;   // obligatoire après préposition — он/она́/оно́/они́ seulement
  alt?: string[];   // variantes orthographiques (мной / мно́ю, …)
}
```

Exemple 3e personne (`он`) :

```ts
genitive: { plain: "его́", withN: "него́" },
dative: { plain: "ему́", withN: "нему́" },
accusative: { plain: "его́", withN: "него́" },
instrumental: { plain: "им", withN: "ним" },
prepositional: { withN: "нём" },  // plain absent : le prép. n'existe pas sans préposition
```

Comptes dans le fichier actuel :

| Situation | Nombre |
|-----------|-------:|
| Champs `withN` renseignés | **20** |
| Cases avec **plain + withN** ensemble | **16** |
| Cases **withN seul** (prépositionnel 3e pers.) | **4** |
| Formes `alt` | **4** |

La distinction plain/withN ne concerne que **он / она́ / оно́ / они́**. я/ты/мы/вы/себя́ : plain (± alt) uniquement.

### 1.2 Choix runtime — reconnaissance, pas génération

Il **n’existe pas** de fonction du type `(lemme, cas, afterPrep?) → forme`.

Au chargement du module, **toutes** les variantes sont indexées surface → cas :

```ts
registerForm(entry.plain, pronounCase);
registerForm(entry.withN, pronounCase);
for (const alt of entry.alt ?? []) registerForm(alt, pronounCase);
```

Comportement :

1. L’utilisateur clique une surface déjà dans la phrase (`него́` ou `его́`).  
2. `getPronounCaseCandidates(surface)` renvoie le(s) cas (ex. génitif + accusatif pour les deux).  
3. La désambiguïsation de cas (régence / contexte) est ailleurs (`case-concept-routing.ts` / `disambiguateCase`).  
4. `findPronounLemmaForCase` accepte la surface si elle égale **plain OU withN OU alt** pour ce cas.

Donc : le runtime **ne choisit pas** entre его́ et него́ — la phrase a déjà choisi. Les deux sont des **alias de reconnaissance** du même (lemme, cas).  
Aucun chemin teaching trouvé qui *génère* la variante н- depuis un flag « après préposition ».

Implication pour la base : il faut pouvoir **stocker les deux chaînes** ; le critère de sélection à l’affichage pédagogique (si un jour on génère le paradigme) est un problème **séparé** de la clé d’unicité.

---

## 2. Modèles de clé métier proposés (sans trancher)

Rappel du défaut : `UNIQUE (morphology_lemma_id, slot)` avec un seul slot `case.gen` ne peut pas porter `его́` et `него́`.

### Modèle A — Slots dédiés (`case.gen` / `case.gen.after_prep`, …)

| | |
|--|--|
| **Idée** | Un slot = une cellule pédagogique. Variante н- = second slot. |
| **Slots en plus** | **+16** pour les paires plain+withN ; les **4** prépositionnels withN-only restent un slot chacun (`case.prep` ou `case.prep.after_prep`). `alt` : +**4** slots du type `case.instr.alt` (même problème, orthographe libre). |
| **Syncrétisme** | Intact : `меня́` reste deux lignes `case.gen` + `case.acc` (même `form_*`). |
| **OpenRussian** | OR ne modèle en général **pas** plain vs withN comme deux cellules de paradigme standard. Import OR → remplir surtout `case.*` « plain » ; `*.after_prep` resterait **curé / null** (stress_status / source distincts). |
| **+** | Compatible avec l’unicité actuelle ; lecture simple `WHERE slot = …`. |
| **−** | Explosion contrôlée du vocabulaire de slots ; convention à figer avant M1. |

### Modèle B — Colonne variante sur `morphology_forms`

| | |
|--|--|
| **Idée** | Clé = `(morphology_lemma_id, slot, variant)` avec `variant ∈ { 'plain', 'with_n', 'alt', … }` (défaut `'plain'`). `UNIQUE (lemma_id, slot, variant)`. |
| **Syncrétisme** | Intact : même `form` sur `(…, gen, plain)` et `(…, acc, plain)`. |
| **OpenRussian** | Import → `variant='plain'` (ou NULL traité comme plain). Lignes `with_n` absentes d’OR, ajoutées seulement par source `curated`. |
| **+** | Slot reste le cas morphologique « nu » ; la variante est orthogonale (proche du TS `plain`/`withN`/`alt`). |
| **−** | Toute requête « la forme du génitif » doit préciser la variante ou une règle de repli (plain si with_n absent). |

### Modèle C — Une ligne par forme + tags / liaisons cas (autre)

| | |
|--|--|
| **Idée** | Clé = `(morphology_lemma_id, form_bare)` ou id technique ; les cas et le contexte н- vivent dans `tags` JSONB (`cases: ['gen','acc'], after_prep: true`) ou table de liaison. |
| **Syncrétisme** | Naturel pour la forme unique `меня́` → un row, plusieurs cas en tags. |
| **OpenRussian** | Plus proche d’un dump « liste de formes » ; moins proche de la grille pédagogique `slot`. |
| **+** | Его́ / него́ = deux rows naturellement. |
| **−** | Abandon de `UNIQUE (lemma, slot)` comme grille ; le teaching engine actuel pense en **slots** (`present.sg3`, etc.) — impedance mismatch. |

### Synthèse comparative (pour décision Mario)

| Critère | A slots dédiés | B colonne variant | C forme + tags |
|---------|----------------|-------------------|----------------|
| Syncrétisme (1 forme, 2 cas) | OK (2 rows) | OK (2 rows) | OK (1 row, multi-cas) |
| его́ / него́ | OK (2 slots) | OK (2 variants) | OK (2 forms) |
| Fidélité au TS actuel | Moyenne | **Haute** | Basse |
| Import OpenRussian | Slots after_prep souvent vides | variant plain rempli | Formes OR sans flag н- |
| Changement vs §7 actuel | Vocabulaire de slots | Élargir UNIQUE | Refonte clé |

---

## 3. Les « 104 hors schéma » — classe fermée ?

Décomposition M0 : **30** régences + **27** invariables + **30** numéraux déclencheurs + **2** figés + **15** phrases/exemples = **104**.

| Bloc | Classe | Verdict |
|------|--------|---------|
| Régence prépositionnelle (30) | Fermée | Oui |
| Invariables (27) | Fermée | Oui |
| Numéraux gouvernants (30) | Fermée (liste finie curée) | Oui |
| Expressions figées (2) | Fermée | Oui |
| Phrases / exemples collés (15) | Liste pédagogique **fermée** | Oui en tant qu’artefacts |

**Aucun des 104 n’est un paradigme de classe ouverte manquant** (nom/verbe/adj à déménager en `morphology_*`).

Nuance factuelle : les **15 phrases** *citent* des mots de classe ouverte (`Москву́`, `стола́`, `рабо́ту`…). Ces lemmes / formes sont déjà (ou doivent déjà être) dans le volume paradigmatique M0 via `forms.ts` (`CURATED_MOSKVA`, `CURATED_STOL`, …) — **pas** via les 104. Les 104 sont les **chaînes multi-mots / règles**, pas ces paradigmes.

**Signalement** : rien à faire entrer en base *à la place* d’un trou de classe ouverte dans ces 104. Le trou de schéma reste : tables/colonnes pour **règles & flags** de classe fermée (hors sujet de la clé его́/него́).

---

## Décision actée (2026-08-20)

**MODÈLE B retenu** pour `morphology_forms` :
`UNIQUE (morphology_lemma_id, slot, variant)` avec `variant ∈ {plain, with_n, alt}`.

Justification Mario : la grille de slots décrit des **cas** ; plain/withN est une variante contextuelle. OpenRussian → `plain` ; `with_n` / `alt` restent curés (classe fermée).

DDL : `supabase/seed/morphology_tables_ddl.sql`.
