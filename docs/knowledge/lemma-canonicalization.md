# Canonicalisation des lemmes à l'insertion

> Ticket : « Canonicalisation des lemmes à l'insertion (+ script de backup
> manuel rejouable) », 28/07/2026. Suite de la dédup du 27/07/2026
> (vagon/ваго́н, человек/челове́к, читать/чита́ть, дорога/дорога́, Анна/А́нна,
> иди́ти→идти́) : cette dédup corrigeait les symptômes, ce ticket corrige la
> cause (les lemmes étaient insérés sans normalisation forcée).

## Règle d'unicité

**La forme canonique d'un lemme est sa forme ACCENTUÉE (U+0301), normalisée
NFC.**

1. Une forme **sans aucun accent** ("nue") qui désigne le même mot qu'une
   forme déjà accentuée en base **réutilise** la ligne existante — elle n'en
   crée jamais une nouvelle.
2. Deux formes qui portent **chacune** un accent, mais à une **position
   différente**, sont des **mots distincts** et ne sont **jamais fusionnées**,
   même si leurs lettres de base sont identiques une fois l'accent retiré.
   Exemples réels : му́ка "tourment" / мука́ "farine", за́мок "château" /
   замо́к "serrure".

Le point 2 est la garde-fou anti-régression le plus important de ce ticket :
« retirer l'accent pour comparer deux formes » ne suffit jamais seul — il
faut aussi savoir SI un accent existe déjà de chaque côté avant de décider
si un rapprochement est sûr. Un algorithme qui ignore cette distinction
(comme le faisait implicitement l'ancien code, voir plus bas) risquerait de
fusionner deux mots réellement différents.

### Pourquoi la position de l'accent est ce qui compte, pas sa seule présence

| Cas | Exemple | Action |
|---|---|---|
| Une forme nue + UNE forme accentuée pour le même mot | вагон / ваго́н | **Fusion** — même mot, accent juste absent d'une ligne |
| Deux formes accentuées à des positions différentes | му́ка / мука́ | **Jamais de fusion** — mots distincts |
| Une forme nue + PLUSIEURS formes accentuées distinctes pour la même base | (aucun cas connu actuellement, mais possible) | **Jamais de fusion automatique** — ambigu, on ne peut pas deviner laquelle est visée |

## Implémentation

### `src/lib/vocabulary/canonicalize-lemma-form.ts`

Trois fonctions pures, sans effet de bord :

- `canonicalizeLemmaForm(form)` — NFC + trim. C'est la forme à **stocker**.
- `hasStressMark(form)` — détecte la présence d'un accent tonique (U+0301).
  Le russe n'a pas de lettre accentuée précomposée : même en NFC, l'accent
  reste un caractère combinant séparé placé juste après la voyelle
  accentuée (ex. "ваго́н" = в-а-г-о-◌́-н, 6 points de code).
- `stripStressMark(form)` — retire uniquement ce caractère, ne touche à
  aucune autre lettre.

Testé dans `src/lib/vocabulary/canonicalize-lemma-form.test.ts`
(`npm run test:vocabulary`).

### `resolveOrCreateLemma` (`src/lib/orchestrator/cache.ts`)

**Seul point d'écriture** dans `lemmas` de toute l'application (diagnostic
exhaustif fait avant modification — import de texte, sauvegarde de
vocabulaire, bootstrap de connaissances, curation morphologique et seeds ne
créent jamais de lemme directement ; ils lisent tous un `lemmaId` déjà
résolu par ce chemin). Appelé uniquement depuis `explainWord`
(`src/lib/orchestrator/index.ts`), 2 fois : après génération LLM (mot
inconnu) et pour les corrections de morphologie curée.

Algorithme (dans l'ordre) :

1. **Correspondance exacte** (NFC) — cas le plus fréquent, un aller simple.
2. **Repli accent manquant ↔ accent présent**, restreint au cas sûr :
   - forme entrante accentuée + **exactement une** ligne nue existante pour
     la même base → la ligne existante est **mise à jour** vers la forme
     accentuée (elle devient enfin canonique) et son id est réutilisé ;
   - forme entrante nue + **exactement une** forme accentuée distincte
     existante pour la même base (aucune ambiguïté) → réutilise cette
     ligne ;
   - **tout autre cas** (aucune correspondance, ou plusieurs formes
     accentuées distinctes pour la même base) → pas de fusion, on continue
     à l'étape 3.
3. **Création** d'une nouvelle ligne avec la forme canonique.

Détail technique sur la recherche de candidats : le préfixe utilisé pour la
requête `ilike` est réduit à **1 seul caractère** (contre 4 dans l'ancien
code). L'accent (U+0301) étant toujours un caractère combinant séparé placé
APRÈS la voyelle accentuée, la toute première lettre d'une forme n'est
jamais déplacée par l'accent, quelle que soit sa position dans le mot — un
préfixe de plusieurs lettres peut au contraire "sauter" par-dessus un accent
placé tôt (ex. и́мя, у́рок) et manquer la ligne existante. C'était une
limitation réelle de l'ancien code, corrigée ici.

### Ce qui a changé par rapport à l'ancien code

L'ancien `resolveOrCreateLemma` utilisait `normalizeRussianWord`, qui retire
**tous** les accents sans regarder leur position, pour décider si deux
lignes étaient "équivalentes". C'est exactement le défaut signalé dans ce
ticket : un tel algorithme fusionnerait му́ка et мука́ s'ils existaient tous
les deux en base, ce qui serait une régression linguistique. La nouvelle
version ne fusionne **jamais** deux formes qui portent chacune un accent à
une position différente (voir l'étape 2 ci-dessus).

`normalizeRussianWord` (`src/lib/vocabulary/normalize-russian-word.ts`)
n'est pas modifiée : elle sert à d'autres usages légitimement
accent-insensibles (ex. `sentenceContainsLemma`, matching contre une phrase
où l'accent n'apparaît pas forcément) qui ne sont pas concernés par cette
règle d'unicité.

## Garde-fou DB (SQL à coller manuellement)

Fichier : `supabase/seed/lemma_canonicalization_guardrail.sql`. **Pas
d'exécution automatique** — le fondateur le colle dans le SQL Editor
Supabase, étape par étape, en lisant les commentaires.

### Pourquoi un simple index sur la forme désaccentuée est dangereux

Un index UNIQUE naïf sur `replace(form, '\u0301', '')` **rejetterait** la
paire légitime му́ка/мука́ (les deux ont la même forme désaccentuée "мука"),
et casserait toute future curation d'un vrai homographe distinctif par
l'accent. Ce n'est **pas** la solution retenue.

### La solution retenue : contrainte EXCLUDE conditionnelle

```sql
alter table lemmas
  add column if not exists form_unaccented text
  generated always as (replace(form, chr(769), '')) stored;

alter table lemmas
  add column if not exists has_stress_mark boolean
  generated always as (strpos(form, chr(769)) > 0) stored;

create extension if not exists btree_gist;

alter table lemmas
  add constraint lemmas_no_bare_vs_accented_dup
  exclude using gist (form_unaccented with =, has_stress_mark with <>);
```

Une contrainte `EXCLUDE` rejette l'insertion d'une ligne **seulement si
toutes** les conditions listées sont vraies **simultanément** pour une paire
de lignes :

- му́ка (`has_stress_mark = true`) vs мука́ (`has_stress_mark = true`) → la
  condition `<>` est **fausse** (les deux sont `true`, pas "différents") →
  **aucun conflit**, les deux peuvent coexister.
- вагон (`has_stress_mark = false`) vs ваго́н (`has_stress_mark = true`) →
  même base ET `true ≠ false` → **conflit détecté**, la ligne en double est
  refusée. C'est exactement le bug corrigé.

En complément, une contrainte `CHECK (form is nfc normalized)` renforce
l'`UNIQUE(form)` déjà existant (`lemmas_form_key`) : elle garantit qu'aucune
forme ne peut être stockée dans une normalisation Unicode autre que NFC (sans
ce filet, deux représentations octet-à-octet différentes de la même chaîne
visuelle, NFC vs NFD, pourraient contourner l'`UNIQUE(form)`).

### Prérequis avant d'appliquer la contrainte EXCLUDE

La contrainte valide les lignes **déjà en base** au moment de sa création :
si des doublons "nu vs accent" existent encore, elle **échouera**. Voir
diagnostic ci-dessous.

## État constaté en base le 28/07/2026 (260 lemmes)

Script : `npm run lemma:audit-accents`
(`scripts/audit-lemma-accent-duplicates.ts`, lecture seule).

- **Formes non-NFC : 0.** Le `CHECK (form is nfc normalized)` peut être
  appliqué immédiatement sans conflit.
- **12 doublons résiduels "nu vs accent"** (préexistants, la dédup du
  27/07/2026 ne portait que sur 6 groupes précis issus des textes gold, pas
  sur l'intégralité de la table) :
  день/де́нь, язык/язы́к, они/они́, ка́ждый/каждый, ко́фе/кофе, суп/су́п,
  Олег/Оле́г, Луи́/Луи, уже/уже́, по́сле/после, я/я́, пи́ть/пить.
  **À corriger** via l'outil de dédup existant
  (`npx tsx scripts/lemma-dedup-plan.ts` puis
  `npx tsx scripts/lemma-dedup-generate-execute-sql.ts`) **avant** d'appliquer
  la contrainte EXCLUDE — sinon sa création échouera.
- **4 paires accentuées ambiguës**, à vérifier manuellement (dictionnaire
  russe) avant toute action — **ne surtout pas les passer dans l'outil de
  dédup tel quel** :
  бо́леть/боле́ть, ду́мать/дума́ть, у́рок/уро́к, до́мой/домо́й.
  Ces 4 paires ne bloquent PAS la contrainte EXCLUDE (elle est conçue pour
  les laisser coexister), mais elles révèlent une limite de l'outil de dédup
  existant : sa logique de groupement (`scripts/lemma-dedup/compute-groups.ts`)
  utilise `normalizeRussianWord`, qui ignore la position de l'accent — si on
  le relance sans filtrer manuellement ces 4 groupes, il proposerait de les
  fusionner à tort. Le rapport dry-run généré doit être relu ligne par
  ligne ; ces 4 groupes doivent être exclus de toute exécution tant que leur
  statut linguistique (mots distincts vs erreur d'accent) n'est pas confirmé.

Ni la dédup des 12 doublons ni la vérification des 4 paires ambiguës ne
sont faites dans ce ticket (portée : mécanisme d'insertion + garde-fou, pas
nettoyage de données existantes) — mais le mécanisme livré ici garantit
qu'aucun **nouveau** doublon de ce type ne peut apparaître désormais.

## Validation effectuée

- 18/18 tests passent (`npm test`), dont 6 nouveaux tests logiques sur
  `canonicalize-lemma-form.ts`.
- `npx tsc --noEmit` : 0 erreur.
- Lint : 0 erreur sur les fichiers modifiés (les erreurs préexistantes dans
  `ExplorerPanel.tsx`/`ReaderContainer.tsx` ne sont pas liées à ce ticket).
- Test d'intégration manuel contre la base réelle (créé puis nettoyé,
  aucune trace laissée) : création d'un lemme nu, réutilisation exacte,
  upgrade nu→accentué avec conservation de l'id, réutilisation de la forme
  accentuée depuis une requête nue, non-fusion d'une paire minimale simulée
  (deux formes accentuées distinctes + une forme nue ambiguë), non-fusion
  d'une 3e forme accentuée distincte. Tous les scénarios se comportent comme
  attendu.
- `npm run lemma:audit-accents` avant/après : toujours 260 lemmes, toujours
  12 doublons résiduels connus, toujours 4 paires ambiguës connues — aucune
  dérive introduite par les changements de code.

## Fichiers livrés

| Fichier | Rôle |
|---|---|
| `scripts/db-backup-manual.sql` | Backup manuel rejouable (Partie A) |
| `docs/ops/manual-backup.md` | Doc du geste de backup manuel |
| `src/lib/vocabulary/canonicalize-lemma-form.ts` | Fonctions de canonicalisation |
| `src/lib/vocabulary/canonicalize-lemma-form.test.ts` | Tests logiques |
| `src/lib/orchestrator/cache.ts` | `resolveOrCreateLemma` réécrit |
| `scripts/audit-lemma-accent-duplicates.ts` | Audit permanent, lecture seule (`npm run lemma:audit-accents`) |
| `supabase/seed/lemma_canonicalization_guardrail.sql` | Garde-fou DB, SQL à coller manuellement |
| `docs/knowledge/lemma-canonicalization.md` | Ce document |
