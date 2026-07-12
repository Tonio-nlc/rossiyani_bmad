# RC-3 — Audit pédagogique de la méthode Rossiyani

> **Analyse uniquement** — aucune modification de code ni de contenu.  
> Date : 2026-07-12 · Auditeur : relecture éditoriale (concepteur pédagogique)  
> Sources : textes Reader (migrations + JSON), leçons (migrations 004–016 + JSON `six-cas`), `METHODE_ROSSIYANI.md`, `BIBLIOTHEQUE_V1_GOLD_10.md`, `TEXT_LESSON_LINKS.md`

## Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Conforme — présentable à un enseignant de russe sans réserve |
| ⚠️ | À améliorer — acceptable en A1 mais perfectible avant bêta profs |
| ❌ | Problème majeur — erreur qu'un professeur remarquera immédiatement |

## Synthèse exécutive

| Domaine | Verdict global |
|---------|----------------|
| **11 textes Reader** | ⚠️ — voix et progression solides ; **accent `тоже` erroné** sur 2 textes + leçon datif |
| **11 leçons** *(3 fondations + 8 six cas)* | ⚠️ — parcours six cas mature ; fondations plus légères, 2 erreurs ciblées |
| **Liens Reader ↔ Lessons** | ⚠️ — 60 % des gold texts couverts ; trous sur 4 vignettes parallèles |
| **Takeaways** | ⚠️ — présents et cohérents sur les six cas ; absents en fondations |
| **Schémas** | ✅ — six cas : clairs et alignés couleurs Reader ; fondations : aucun |
| **Progression A1** | ✅ — i+1, fil Anna/Louis, consolidation #10 : méthode respectée |
| **Cohérence méthode Rossiyani** | ✅ — lecture → exploration → leçon : principe tenu ; dettes documentées |

**Bloquants avant bêta enseignants (contenu, pas code)** : corriger `тоже` (accent + propagation leçon/textes) ; corriger le rôle grammatical de `стоит` dans `accents-toniques`.

---

## 1. Les 11 textes du Reader

Référence : 10 gold (`BIBLIOTHEQUE_V1_GOLD_10.md`) + `По дороге` (complémentaire, migration 008).

### 1.1 Fil narratif Anna & Louis (6 textes)

| # | Titre | Russe | Traduction FR | Phénomène cible | Narration | Global |
|---|-------|-------|---------------|-----------------|-----------|--------|
| 5 | `Знакомство` | ❌ `Мне то́же` — accent sur **о** au lieu de **ó** (`тóже`) | ✅ naturelles, registre dialogue cohérent | ✅ *звать*, présentations, datif semé (`мне`) | ✅ point d'entrée du fil | ❌ |
| 1 | `Первый день в университете` | ⚠️ accents partiels (titres, mots courants non marqués) | ⚠️ `аудитории` → « la salle » (perd « amphithéâtre ») | ✅ *в + acc.* vs *в аудитории* — pivot méthode | ✅ lendemain de #5 | ⚠️ |
| 2 | `В булочной` | ⚠️ accents partiels (`После университета`, `В булочной`…) | ✅ | ✅ accusatif objet direct — cœur du parcours cas | ✅ après cours | ⚠️ |
| 9 | `Как найти дорогу?` | ✅ meilleure couverture d'accents du lot gold | ✅ directions naturelles | ✅ mouvement + indications | ⚠️ Anna déjà dans la bibliothèque sans transition | ⚠️ |
| 8 | `У врача` | ✅ accents corrects sur termes clés | ⚠️ tirets dialogue FR incohérents (attribution sans `—`, répliques avec) | ✅ état / `у меня` / `болит` | ✅ lendemain de #9 | ⚠️ |
| 10 | `Обычный день студента` | ❌ `Луи́ то́же` — même erreur d'accent ; ⚠️ `хлеб` non accentué | ✅ | ✅ consolidation volontaire (aucune notion nouvelle) | ⚠️ café quotidien de Louis vs `Первый кофе` (Masha) — documenté mais friction narrative | ❌ |

### 1.2 Vignettes parallèles (4 gold + 1 complémentaire)

| # | Titre | Russe | Traduction FR | Phénomène cible | Lien méthode | Global |
|---|-------|-------|---------------|-----------------|--------------|--------|
| 3 | `В метро` | ✅ accents complets (référence qualité) | ✅ | ✅ *в + acc.*, comportement social | ⚠️ Anna seule — hors fil ; **0 leçon liée** | ⚠️ |
| 4 | `Первый кофе` | ✅ accents complets | ✅ | ✅ routine présent, *на кухне* | ⚠️ Masha hors univers Anna/Louis ; **0 leçon** | ⚠️ |
| 6 | `В магазине` | ✅ accents complets | ✅ | ✅ *нужен + nom*, courses | ⚠️ Ivan isolé ; recoupe #2 (intentionnel) ; **0 leçon** | ⚠️ |
| 7 | `Дома вечером` | ✅ accents complets | ✅ | ✅ séquence soirée | ⚠️ Oleg isolé ; **0 leçon** | ⚠️ |
| — | `По дороге` | ⚠️ titre DB sans accent (`По дороге` vs `По доро́ге` dans le corps) | ✅ | ✅ A1 simple, pas de phénomène désigné | ⚠️ hors gold 10 ; **0 leçon** | ⚠️ |

### 1.3 Points transversaux — textes

| Élément | Verdict | Détail |
|---------|---------|--------|
| Principe « un texte = un phénomène » | ✅ | Respecté sur le fil ; #10 = consolidation explicite |
| Registre & ton Rossiyani | ✅ | Micro-scènes crédibles, pas de texte « leçon déguisée » |
| Traductions phrase à phrase | ✅ | Globalement exactes et lisibles |
| Accents toniques | ⚠️ | Deux niveaux : batch 008 (complet) vs gold Anna/Louis (partiel) |
| Orthographe / stress | ❌ | `тоже` → `то́же` dans #5, #10, leçon `datif`, migrations — **erreur factuelle** |
| Réutilisation vocabulaire | ✅ | #10 recycle хлеб, университет, кафе, дорога — conforme charte |
| `content_annotated` | ✅ | Phrases + `translationFr` ; pas d'annotations mot (by design, Explorer/LLM) |

---

## 2. Les leçons (11)

> Le produit en contient **11** (3 fondations + 8 six cas), pas 10. Comptage : `PROJECT_STATE.md`, `METHODE_ROSSIYANI.md` §6.

### 2.1 Parcours « Fondations du russe » (3 leçons)

| Slug | Titre | Contenu russe/FR | Exemples Reader | Takeaways | Schéma | Global |
|------|-------|------------------|-----------------|-----------|--------|--------|
| `pourquoi-les-mots-changent-de-terminaison` | Terminaisons = rôles | ✅ métaphore claire | ⚠️ aucun `related_texts` | ⚠️ absents | ⚠️ absent | ⚠️ |
| `accents-toniques` | Accents toniques | ❌ `стоит` tagué `subject` — c'est le **verbe**, pas le sujet (`Замок`) | ⚠️ aucun lien Reader | ⚠️ absents | ⚠️ absent | ❌ |
| `genre-des-mots` | Genre au premier coup d'œil | ⚠️ heuristique A1 simplifiée (exceptions non mentionnées) | ⚠️ aucun lien Reader | ⚠️ absents | ⚠️ absent (tableau comparatif à la place) | ⚠️ |

### 2.2 Parcours « Les six cas » (8 leçons)

| Ord | Slug | Russe / grammaire | Lien textes gold | Takeaways | Schéma | Global |
|-----|------|-------------------|------------------|-----------|--------|--------|
| 0 | `les-cas-changent-le-role` | ✅ métaphore théâtre, exemples `школа` | ✅ #1, #2, #9 | ✅ 5 items, alignés méthode | ✅ arbre ÉCOLE (sujet / destination / lieu) | ✅ |
| 1 | `pourquoi-les-cas` | ⚠️ `прямо`, `направо`, `слева` présentés comme relevant du « même principe » de terminaisons — ce sont des **adverbes** | ✅ #1, #2, #9 | ✅ | ✅ grille 6 cas + couleurs | ⚠️ |
| 2 | `nominatif` | ✅ définition, sujet = bleu | ✅ #1, #5, #10 | ✅ | ✅ форme dictionnaire → qui agit ? | ✅ |
| 3 | `accusatif` | ✅ objet direct, `-а → -у`, inanimé inchangé | ✅ #2 | ✅ | ✅ ACHETER (sujet → objet) | ✅ |
| 4 | `genitif` | ✅ possession + amorce `у меня` | ✅ #8, #10 | ⚠️ intro « de qui » vs takeaway « à qui appartient » — léger décalage FR | ✅ POSSESSION | ⚠️ |
| 5 | `datif` | ❌ exemple Reader `Мне то́же` reprend l'accent faux ; note cite « тоже » sans accent correct | ✅ #5, #8 | ✅ | ✅ DONNER (objet + destinataire) | ❌ |
| 6 | `instrumental` | ⚠️ `вместе` cité comme preuve instrumental — **adverbe**, pas forme au cas instrumental ; `платит картой` ✅ | ✅ #2, #10 | ✅ honnête sur l'absence de couleur Reader | ✅ INSTRUMENTAL | ⚠️ |
| 7 | `prepositionnel` | ✅ meilleure leçon du parcours — piège `в` direction/position | ⚠️ `внутри` = adverbe, pas prépositionnel nominal | ✅ #1, #9 | ✅ côte à côte acc. vs prép. | ✅ |

### 2.3 Points transversaux — leçons

| Élément | Verdict | Détail |
|---------|---------|--------|
| Principe « leçon après lecture » (§4.4) | ✅ | Exemples ancrés dans textes gold via `sourceText` |
| Rôles fonctionnels vs noms de cas (§4.6) | ✅ | Intro pilote sans jargon ; noms de cas introduits progressivement |
| Ton pédagogique (pourquoi avant règle) | ✅ | Cohérent sur tout le parcours six cas |
| Couverture instrumental en Reader | ⚠️ | Callout explicite — intégrité éditoriale ✅, lacune produit ⚠️ |
| Fondations vs six cas (maturité) | ⚠️ | Écart de richesse (pas de takeaways/schémas/liens en fondations) |
| Cohérence couleurs schémas ↔ Reader | ✅ | Bleu / corail / vert / violet / ambre respectés |

---

## 3. Liens Reader ↔ Lessons

### 3.1 Matrice de couverture (gold 10)

| Texte | Leçons liées | Verdict |
|-------|--------------|---------|
| #1 `Первый день…` | 4 (pilote, pourquoi, nominatif, prépositionnel) | ✅ hub central |
| #2 `В булочной` | 4 (pilote, pourquoi, accusatif, instrumental) | ✅ hub le plus riche |
| #3 `В метро` | 0 | ⚠️ phénomène *в + acc.* non relié à une leçon |
| #4 `Первый кофе` | 0 | ⚠️ |
| #5 `Знакомство` | 2 (nominatif, datif) | ✅ |
| #6 `В магазине` | 0 | ⚠️ *нужен* sans leçon dédiée |
| #7 `Дома вечером` | 0 | ⚠️ |
| #8 `У врача` | 2 (génitif, datif) | ✅ |
| #9 `Как найти дорогу?` | 3 | ✅ |
| #10 `Обычный день…` | 3 | ✅ |

**Couverture globale :** 6/10 gold texts liés — ⚠️

### 3.2 Trois ponts UI

| Pont | Mécanisme | Verdict |
|------|-----------|---------|
| **Approfondir** (Explorer) | `functionColor` → leçon cas (5 couleurs) | ⚠️ instrumental et leçons intro (`les-cas-changent-le-role`, `pourquoi-les-cas`) **inaccessibles** depuis l'Explorer |
| **« Tu viens de rencontrer »** (fin de lecture) | Toutes les leçons liées au texte | ✅ |
| **Annexe leçon → Reader** | `related_texts` → retour lecture | ✅ |

### 3.3 Cohérence phénomène texte ↔ leçon

| Lien | Verdict |
|------|---------|
| #2 → `accusatif` (*купить хлеб*) | ✅ |
| #1 → `prepositionnel` (*в университет* / *в аудитории*) | ✅ |
| #5 → `datif` (*мне*) | ❌ contenu exemple accent faux |
| #2 → `instrumental` (*картой*) | ✅ |
| #8 → `genitif` (*у меня*) | ⚠️ cadrage « semi génitif » honnête mais ambitieux pour A1 |
| Textes parallèles (#3–7) sans lien | ⚠️ choix éditorial documenté, mais opportunité manquée (*нужен*, *в метро*) |

### 3.4 Documentation

| Document | Verdict |
|----------|---------|
| `TEXT_LESSON_LINKS.md` | ⚠️ à jour sur la matrice ; § « Hors scope UI » **obsolète** (ponts implémentés) |
| `sentenceIndices` en base | ⚠️ référence éditoriale uniquement — non exploités en UI |

---

## 4. Takeaways

| Périmètre | Verdict | Commentaire |
|-----------|---------|-------------|
| Présence (six cas) | ✅ | 5 items par leçon, structure homogène |
| Absence (fondations) | ⚠️ | 3 leçons sans bloc `takeaways` |
| Alignement méthode §4 | ✅ | Rôle > cas ; lecture d'abord ; pas de tables à mémoriser |
| Exactitude linguistique | ⚠️ | `datif` takeaway #2 cite `мне` ✅ mais s'appuie sur texte #5 avec `тоже` faux |
| Formulation FR | ✅ | Accessible, tutoiement cohérent avec le produit |
| Leçon `instrumental` takeaway #3 | ⚠️ | « Après с… » correct ; takeaway #2 mélange `картой` (solide) et `вместе` (faible) |

---

## 5. Schémas

| Schéma | Leçon | Verdict | Commentaire |
|--------|-------|---------|-------------|
| Arbre ÉCOLE | `les-cas-changent-le-role` | ✅ | 3 rôles, couleurs cohérentes |
| Grille 6 cas | `pourquoi-les-cas` | ✅ | Mapping couleurs Reader explicite |
| Nominatif | `nominatif` | ✅ | Dictionnaire → qui agit ? |
| ACHETER | `accusatif` | ✅ | Sujet → objet direct |
| POSSESSION | `genitif` | ✅ | Nominatif → génitif |
| DONNER | `datif` | ✅ | Objet + destinataire |
| INSTRUMENTAL | `instrumental` | ✅ | Sujet → avec quoi |
| в + lieu | `prepositionnel` | ✅ | Meilleur schéma pédagogique du parcours |
| Fondations (aucun) | 3 leçons | ⚠️ | Pas de support visuel |

**Point méthodologique transversal :** le vert Reader / schéma regroupe **accusatif de direction** et **prépositionnel de lieu** sous le rôle « place » — ⚠️ cohérent en produit (§4.6), à expliciter clairement aux enseignants pour éviter la confusion cas / couleur.

---

## 6. Progression A1

| Critère (charte §3) | Verdict | Observations |
|---------------------|---------|--------------|
| 8–12 phrases, présent dominant | ✅ | Tous les textes respectent la fourchette |
| 1 phénomène nouveau / texte | ✅ | #10 exception documentée (consolidation) |
| i+1 | ✅ | Instrumental en #2 avant leçon dédiée — exposition naturelle |
| Fil Anna/Louis ordonné | ✅ | #5→#1→#2→#9→#8→#10 produit |
| Vignettes parallèles | ✅ | #3,4,6,7 enrichissent l'univers sans casser le fil |
| Niveau unique A1 en V1 | ✅ | Pas de dérive A2 dans le contenu publié |
| Accents visibles en lecture | ⚠️ | Exigence méthode § Lire ; mise en œuvre inégale |
| Traduction obligatoire | ✅ | `content_annotated.sentences` sur les 11 textes |

### Séquence pédagogique recommandée (lecture + leçons)

```
Onboarding → Знакомство → Первый день → В булочной → [leçons pilote → cas] → …
```

| Étape | Verdict |
|-------|---------|
| Onboarding (post RC-001) | ✅ cohérent avec leçon pilote |
| Textes avant leçons correspondantes | ✅ |
| Consolidation #10 en fin de fil | ✅ |

---

## 7. Cohérence de la méthode Rossiyani

Référence : `METHODE_ROSSIYANI.md`

| Principe | Verdict | Preuve / écart |
|----------|---------|----------------|
| **4.1** Contexte avant règle | ✅ | Leçons six cas : `sourceText` systématique |
| **4.2** Comprendre avant mémoriser | ✅ | Traductions Reader ; onboarding corrigé |
| **4.3** Progression par la lecture | ✅ | Bibliothèque → Reader centrale ; #10 consolidation |
| **4.4** Leçons après rencontre | ✅ | `related_texts` ; pas de prérequis leçon→texte |
| **4.5** Mot dans sa phrase | ✅ | Explorer + exemples leçons contextualisés |
| **4.6** Couleurs par fonction | ✅ | Cohérent Reader / onboarding / leçons ; instrumental en attente |
| **4.7** IA invisible | ✅ | Pas de contenu « chatbot » dans le corpus audité |
| **4.8** Pas de gamification dans le contenu | ✅ | Ton neutre, pas de streaks dans les textes/leçons |
| Boucle Lire → Explorer → Lesson → Relire | ✅ | Ponts UI + annonces fin de texte |
| Identité « micro-scène de vie » | ✅ | Aucun texte ne viole la charte §1 |
| Documentation produit vs réalité | ⚠️ | `METHODE_ROSSIYANI.md` §6 cite « 5/5 textes annotés » — 11 en base |

### Différenciation méthode (lecture comme manuel)

| Force Rossiyani | Verdict |
|-----------------|---------|
| Même personnages, même voix | ✅ |
| Phénomène rencontré avant nommé | ✅ |
| Pont lecture ↔ leçon bidirectionnel | ✅ |
| Honnêteté sur les limites (instrumental, `у меня`) | ✅ |
| Risque de crédibilité si `тоже` non corrigé | ❌ |

---

## 8. Tableau récapitulatif par élément

### Textes (11)

| Élément | ✅ | ⚠️ | ❌ |
|---------|---:|---:|---:|
| `Знакомство` | 3 | 0 | 1 |
| `Первый день в университете` | 2 | 3 | 0 |
| `В булочной` | 2 | 2 | 0 |
| `В метро` | 2 | 2 | 0 |
| `Первый кофе` | 2 | 2 | 0 |
| `В магазине` | 2 | 2 | 0 |
| `Дома вечером` | 2 | 2 | 0 |
| `У врача` | 2 | 2 | 0 |
| `Как найти дорогу?` | 3 | 1 | 0 |
| `Обычный день студента` | 2 | 1 | 1 |
| `По дороге` | 1 | 3 | 0 |

### Leçons (11)

| Élément | ✅ | ⚠️ | ❌ |
|---------|---:|---:|---:|
| `pourquoi-les-mots-changent-de-terminaison` | 1 | 4 | 0 |
| `accents-toniques` | 1 | 2 | 1 |
| `genre-des-mots` | 1 | 3 | 0 |
| `les-cas-changent-le-role` | 5 | 0 | 0 |
| `pourquoi-les-cas` | 3 | 1 | 0 |
| `nominatif` | 5 | 0 | 0 |
| `accusatif` | 5 | 0 | 0 |
| `genitif` | 3 | 1 | 0 |
| `datif` | 3 | 0 | 1 |
| `instrumental` | 3 | 1 | 0 |
| `prepositionnel` | 4 | 1 | 0 |

### Systèmes transversaux

| Élément | Verdict |
|---------|---------|
| Liens Reader ↔ Lessons (couverture) | ⚠️ |
| Liens Reader ↔ Lessons (cohérence phénomènes liés) | ✅ |
| Pont Approfondir (complétude) | ⚠️ |
| Takeaways six cas | ✅ |
| Takeaways fondations | ⚠️ |
| Schémas six cas | ✅ |
| Schémas fondations | ⚠️ |
| Progression A1 | ✅ |
| Cohérence méthode globale | ✅ |

---

## 9. Priorités avant bêta enseignants

Sans nouvelle fonctionnalité — **corrections de contenu uniquement**, par ordre de gravité :

| Priorité | Élément | Verdict actuel | Action attendue |
|----------|---------|----------------|-----------------|
| P0 | Accent `тоже` | ❌ | Corriger en `тóже` dans #5, #10, leçon `datif`, migrations/JSON |
| P0 | Rôle `стоит` dans `accents-toniques` | ❌ | Retagger : `Замок` = sujet, `стоит` = verbe |
| P1 | Accents gold Anna/Louis | ⚠️ | Harmoniser au niveau du batch 008 |
| P1 | `pourquoi-les-cas` — adverbes de direction | ⚠️ | Reformuler : pas des cas, mais même logique de rôles en contexte |
| P1 | `instrumental` — exemple `вместе` | ⚠️ | Ne pas présenter comme forme instrumental ; garder `картой` comme preuve principale |
| P2 | 4 textes sans lien leçon | ⚠️ | Décision éditoriale : lier ou documenter comme hors parcours cas V1 |
| P2 | Fondations : takeaways + schémas + liens Reader | ⚠️ | Enrichir ou assumer l'écart de maturité |
| P2 | `TEXT_LESSON_LINKS.md` § UI hors scope | ⚠️ | Mettre à jour la doc |
| P2 | `METHODE_ROSSIYANI.md` §6 « 5/5 textes » | ⚠️ | Aligner sur 11 textes |

---

## 10. Conclusion RC-3

La **méthode Rossiyani est conforme** sur son architecture pédagogique : lire d'abord, comprendre par la phrase, explorer le rôle, approfondir par les leçons, consolider par la relecture. Le parcours **Les six cas** est **présentable** avec deux réserves de fond (`тоже`, `стоит`). Le fil **Anna/Louis** et la **progression A1** sont des atouts différenciants réels.

Les **écarts** sont concentrés sur : (1) **exactitude accentuelle** sur un mot très fréquent, (2) **maturité inégale** fondations vs six cas, (3) **couverture partielle** des liens texte–leçon sur les vignettes parallèles.

**Verdict RC-3 :** ⚠️ **Méthode validée, contenu à polir** avant tests avec enseignants — pas de refonte, pas de nouvelles features : une passe éditoriale ciblée sur les items P0–P1 suffit pour atteindre le seuil « manuel irréprochable ».

---

*Audit RC-3 — analyse uniquement. Aucun fichier de contenu ni de code modifié.*
