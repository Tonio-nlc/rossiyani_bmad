# Méthode Rossiyani — V1

> **Document de référence officiel** — Story 2.5  
> Dernière mise à jour : juillet 2026

Ce document définit le parcours pédagogique que suit chaque utilisateur Rossiyani.  
Toute nouvelle fonctionnalité, tout contenu, tout message produit doit pouvoir répondre à :

> **« À quel moment de la méthode Rossiyani intervient-elle ? »**

Si la réponse n'existe pas, la fonctionnalité n'est probablement pas prioritaire.

**Documents liés**

| Document | Rôle |
|----------|------|
| [PROJECT_STATE.md](./PROJECT_STATE.md) | État technique réel du produit |
| [project-brief.md](./project-brief.md) | Vision produit et positionnement |
| [lessons/PIPELINE.md](./lessons/PIPELINE.md) | Pipeline éditorial des leçons |
| [reader/CHARTE_EDITORIALE.md](./reader/CHARTE_EDITORIALE.md) | Charte éditoriale des textes Reader |
| [architecture.md](./architecture.md) | Architecture technique |

---

## 1. La boucle d'apprentissage Rossiyani

La méthode repose sur un cycle fermé. L'utilisateur ne « consomme » pas des modules isolés — il progresse en faisant tourner cette boucle.

```
        ┌──────────────────────────────────────────┐
        │                                          │
        ▼                                          │
     LIRE ──→ COMPRENDRE ──→ EXPLORER ──→ RETENIR │
        ▲                                    │     │
        │                                    ▼     │
     RELIRE ←──── RÉVISER ←──────────────────┘     │
        │                                          │
        └──────────────────────────────────────────┘
```

Les **Lessons** et la **Library** interviennent *à côté* de la boucle, pas à la place d'une de ses étapes (voir §2).

---

### Étape 1 — Lire

| | |
|---|---|
| **Objectif pédagogique** | Exposer l'utilisateur à du russe authentique, dans un texte continu, à son niveau (input compréhensible i+1). |
| **Module** | **Reader** (`/reader/[textId]`) |
| **Déclencheur suivant** | L'utilisateur rencontre une forme qu'il ne comprend pas, ou veut approfondir un mot → **Explorer**. S'il comprend globalement la phrase grâce à la traduction → continue à lire. |

**Ce qui se passe** : lecture phrase par phrase, accents toniques visibles, progression sauvegardée.

---

### Étape 2 — Comprendre

| | |
|---|---|
| **Objectif pédagogique** | Saisir le sens global du texte — pas encore la grammaire, mais *ce que la phrase dit*. |
| **Module** | **Reader** (traduction phrase par phrase, flux de lecture) |
| **Déclencheur suivant** | Une forme spécifique intrigue ou bloque → **Explorer**. Sinon, lecture continue. |

**Ce qui se passe** : la traduction française sous chaque phrase permet de lire sans décrocher du texte russe. La compréhension globale précède toujours l'analyse d'une forme.

> **Comprendre ≠ Explorer.** Comprendre, c'est « qu'est-ce que cette phrase veut dire ? ». Explorer, c'est « pourquoi CE mot a CETTE forme ICI ? ».

---

### Étape 3 — Explorer

| | |
|---|---|
| **Objectif pédagogique** | Expliquer le *pourquoi* d'une forme linguistique dans son contexte exact — consciousness-raising sur un phénomène précis. |
| **Module** | **Explorer** (panneau contextuel du Reader — `ExplorerPanel`) |
| **Déclencheur suivant** | L'explication satisfait la curiosité → retour à **Lire**. Le mot mérite d'être mémorisé → **Retenir**. Le phénomène révèle un concept plus large → **Lesson** recommandée (hors boucle, puis retour à **Lire**). |

**Ce qui se passe** : clic sur un mot → `POST /api/word/explain` → explication contextuelle (cache `explanation_cache`), coloration fonctionnelle du rôle (sujet, objet, lieu…).

**Ce que l'Explorer ne fait pas** : donner une fiche grammaticale complète du mot, ni remplacer une leçon structurée.

---

### Étape 4 — Retenir

| | |
|---|---|
| **Objectif pédagogique** | Capturer ce qui a été *rencontré en contexte* pour pouvoir le retrouver plus tard — la mémoire commence ici, pas dans une liste abstraite. |
| **Module** | **Vocabulary** (`/vocabulary`, `/vocabulary/[lemmaId]`) — sauvegarde depuis l'Explorer |
| **Déclencheur suivant** | Mot sauvegardé → entrée SRS créée automatiquement → **Réviser** (quand `next_review_at` est atteint). Sinon → retour à **Lire**. |

**Ce qui se passe** : le mot est stocké avec son contexte (`explanation_cache_id`, `text_id`). La fiche vocabulaire enrichit ensuite via la Knowledge Layer (permanente, distincte de l'Explorer).

---

### Étape 5 — Réviser

| | |
|---|---|
| **Objectif pédagogique** | Consolider la mémoire à long terme par réactivation espacée — pas par relecture passive. |
| **Module** | **Review** (`/review`, `/review/session`) — algorithme SM-2 |
| **Déclencheur suivant** | File de révision vide ou session terminée → **Relire** (reprendre le texte en cours ou en choisir un nouveau via Library). |

**Ce qui se passe** : révélation du mot, rappel du contexte, notation `again | hard | good | easy`, mise à jour `srs_reviews` + `review_history`.

---

### Étape 6 — Relire

| | |
|---|---|
| **Objectif pédagogique** | Réinjecter les acquis dans du russe réel — la boucle se referme sur l'input authentique. |
| **Module** | **Reader** (+ **Library** si changement de texte) |
| **Déclencheur suivant** | Nouvelle lecture → retour à **Lire**. |

**Ce qui se passe** : l'utilisateur reprend là où il s'était arrêté (`user_progress`) ou ouvre un nouveau texte. Les formes déjà explorées et révisées deviennent transparentes à la relecture.

---

### Modules satellites (hors boucle principale)

Ces modules ne remplacent aucune étape. Ils soutiennent la boucle.

| Module | Moment d'intervention | Lien avec la boucle |
|--------|----------------------|---------------------|
| **Lessons** | Après **Explorer**, quand un phénomène récurrent mérite une explication structurée | Approfondit ce qui a été *rencontré* en lecture → retour à **Relire** |
| **Library** | Avant **Lire**, quand l'utilisateur choisit ou change de texte | Alimente l'input de la boucle |
| **Practice** | Optionnel, entre **Retenir** et **Réviser** (ou après **Réviser**) | Réactivation productive — renforce, ne remplace pas la lecture |
| **Home** | Entrée de session | Oriente vers l'étape où l'utilisateur doit reprendre |
| **Onboarding** | Première connexion uniquement | Initie à **Lire** → **Explorer** → **Retenir** |

---

## 2. Rôle unique de chaque module

Chaque module répond à **une seule question**. Si un module semble répondre à plusieurs questions, c'est une dette produit à documenter.

| Module | Question unique | Route(s) | Rôle secondaire *(dette connue)* |
|--------|-----------------|----------|----------------------------------|
| **Reader** | *Qu'est-ce que ce texte dit, et pourquoi ces mots prennent-ils cette forme ici ?* | `/reader/[textId]` | Porte aussi la traduction (**Comprendre**) et héberge l'**Explorer** |
| **Explorer** | *Pourquoi cette forme apparaît-elle dans cette phrase précise ?* | Panneau du Reader | — |
| **Vocabulary** | *Qu'ai-je déjà rencontré en lisant, et où le retrouver ?* | `/vocabulary` | Fiche permanente du mot (Knowledge Layer) — répond à « qu'est-ce que ce mot ? » en dehors du contexte de lecture |
| **Review** | *Est-ce que je me souviens encore de ce que j'ai retenu ?* | `/review`, `/review/session` | — |
| **Lessons** | *Quelle est la logique derrière ce phénomène que j'ai croisé en lisant ?* | `/lessons/*` | — |
| **Library** | *Quel texte lire ensuite ?* | `/library` | Affiche la progression par texte |
| **Practice** | *Est-ce que je peux produire du russe avec ce que j'ai compris ?* | `/practice/*` | **Hors boucle quotidienne V1** — renforcement optionnel |
| **Home** | *Par où reprendre aujourd'hui ?* | `/` | Agrège compteur SRS, reprise de lecture, liens Practice |
| **Onboarding** | *Comment fonctionne Rossiyani ?* | `/onboarding` | Démo interactive de l'Explorer |

### Dettes produit assumées (V1)

1. **Reader cumule Lire + Comprendre + héberger Explorer** — acceptable car les trois sont indissociables dans l'acte de lecture. Ne pas ajouter d'autres responsabilités au Reader (pas de leçons inline, pas de révision).
2. **Vocabulary cumule Retenir + fiche permanente** — la fiche répond à une question différente (« qu'est-ce que ce mot ? ») mais toujours *après* une rencontre en lecture. La Knowledge Layer ne doit jamais précéder l'Explorer.
3. **Practice existe mais n'est pas dans la boucle quotidienne cible** — utile pour la production, pas indispensable à la méthode V1.

---

## 3. Parcours quotidien idéal (15–20 minutes)

Scénario cible d'une session type. L'ordre respecte la boucle ; les durées sont indicatives.

| # | Étape | Durée | Action concrète | Module |
|---|-------|-------|-----------------|--------|
| 1 | **Reprendre** | 1 min | Ouvrir l'app → « Reprendre la lecture » sur Home | Home → Reader |
| 2 | **Lire + Comprendre** | 8–10 min | Continuer le texte en cours, phrase par phrase, traduction active | Reader |
| 3 | **Explorer** | 3–4 min | Cliquer sur 2–4 formes inconnues, lire les explications | Explorer |
| 4 | **Retenir** | 1–2 min | Sauvegarder 1–3 mots vraiment utiles (pas tous) | Vocabulary (depuis Explorer) |
| 5 | **Réviser** | 3–5 min | Faire la file du jour si des mots sont dus | Review |
| 6 | **Lesson** *(si pertinent)* | 3–5 min | Lire une leçon recommandée si un nouveau concept apparaît (ex. un cas inconnu vu 3 fois) | Lessons → retour Reader |
| 7 | **Relire** | — | Reprendre la lecture ou planifier la prochaine session | Reader / Home |

### Règles de session

- **La lecture est non négociable** — une session sans lecture n'est pas une session Rossiyani.
- **La révision ne précède pas la lecture** — on consolide ce qu'on a rencontré, pas l'inverse.
- **Les leçons sont déclenchées par la lecture** — jamais lues « pour avancer dans le parcours » sans lien avec un phénomène croisé.
- **Sauvegarder moins, mieux** — 1–3 mots par session suffisent ; la qualité du contexte prime sur la quantité.
- **Practice est optionnel** — ajouter 5 min de Practice seulement si la session dépasse 20 min et que l'utilisateur veut produire.

### Parcours hebdomadaire (indicatif)

| Jour | Focus |
|------|-------|
| Lun–Ven | Boucle quotidienne (lecture + révision) |
| Sam | Lecture longue + leçon si un parcours est en cours |
| Dim | Révision uniquement ou pause — pas de culpabilisation (pas de streaks) |

---

## 4. Principes non négociables

Ces principes s'appliquent au produit, au contenu, au marketing et à l'onboarding. Ils ne se discutent pas en V1.

### 4.1 Contexte avant règle

Chaque explication part d'une phrase réelle. On ne présente jamais une règle grammaticale sans avoir montré *où* elle apparaît. L'Explorer explique le contexte ; les Lessons généralisent à partir d'exemples rencontrés.

### 4.2 Comprendre avant mémoriser

L'ordre est fixe : lire → comprendre → explorer → retenir → réviser. On ne demande jamais à l'utilisateur de mémoriser une forme qu'il n'a pas d'abord comprise en contexte. Le SRS ne s'active qu'après une sauvegarde depuis l'Explorer.

### 4.3 Progression par la lecture

Le progrès se mesure en textes lus et en compréhension accrue — pas en leçons complétées ou en points. Les leçons, la révision et le vocabulaire servent la lecture, pas l'inverse.

### 4.4 Les leçons expliquent ce qui a été rencontré — jamais l'inverse

On ne prescrit pas « lisez la leçon 4 avant le texte 7 ». Une leçon répond à une question née de la lecture. Le pipeline éditorial ([PIPELINE.md](./lessons/PIPELINE.md)) en découle : question → exemple réel → explication.

### 4.5 Le mot dans sa phrase, jamais seul

L'unité minimale d'analyse est le couple **mot + phrase**. L'Explorer, le vocabulaire sauvegardé et les exemples de leçons respectent cette unité. Pas de flashcards décontextualisées.

### 4.6 Couleurs par fonction, pas par cas

Rossiyani montre le **rôle** du mot (sujet, objet, lieu, possession, destinataire) — pas le nom du cas grammatical. Les noms de cas apparaissent dans les Lessons, après l'intuition.

### 4.7 L'IA est invisible

Pas de chatbot, pas de conversation libre. L'IA produit de la connaissance (Explorer, Knowledge Layer, Practice) que l'application consomme. L'utilisateur interagit avec un livre intelligent, pas avec un assistant.

### 4.8 Pas de gamification

Pas de streaks obligatoires, pas de points, pas de classements. La motivation vient de la compréhension progressive du russe réel.

---

## 5. Test d'acceptation des futures fonctionnalités

Avant de prioriser une feature, répondre à ces trois questions :

| # | Question | Si la réponse est « non » |
|---|----------|---------------------------|
| 1 | À quelle étape de la boucle (Lire → Comprendre → Explorer → Retenir → Réviser → Relire) intervient-elle ? | Repositionner ou abandonner |
| 2 | Quelle question unique ce module / cette feature pose-t-elle ? | Simplifier ou fusionner avec un module existant |
| 3 | Respecte-t-elle les 8 principes §4 ? | Repenser avant d'implémenter |

### Exemples appliqués

| Feature envisagée | Verdict |
|-------------------|---------|
| Quiz de grammaire hors contexte | ❌ Hors méthode — pas de phrase réelle, précède la lecture |
| Recommandation de leçon après 3× le même phénomène en Explorer | ✅ Entre Explorer et Relire — approfondit une rencontre |
| Import de textes personnels | ✅ Alimente Library → Lire |
| Chatbot « pose-moi une question de grammaire » | ❌ Viole 4.7 et 4.1 |
| Écran « lecture terminée » avec stats | ✅ Clôture de Lire → encourage Relire (nouveau texte) |
| Flashcards sans contexte | ❌ Viole 4.5 et 4.2 |

---

## 6. Carte produit ↔ méthode (état V1)

Correspondance avec l'implémentation actuelle ([PROJECT_STATE.md](./PROJECT_STATE.md)).

| Étape boucle | Module | Statut juillet 2026 |
|--------------|--------|---------------------|
| Lire | Reader | PROD — partiel (pas d'écran fin de lecture) |
| Comprendre | Reader (traductions) | PROD — 5/5 textes annotés |
| Explorer | ExplorerPanel | PROD |
| Retenir | Vocabulary | PROD — stable |
| Réviser | Review (SRS) | PROD — partiel (UI) |
| Relire | Reader + Library | PROD |
| *(satellite)* | Lessons | PROD — stable (11 leçons dont pilote) |
| *(satellite)* | Practice | PROD — hors boucle quotidienne |
| *(satellite)* | Home | PROD — oriente la reprise |

---

## Maintenance

Mettre à jour ce document quand :

- un nouveau module est ajouté ;
- un module assume un second rôle (dette produit) ;
- la boucle quotidienne cible change ;
- un principe est amendé (version V2+).

Ne pas dupliquer ce document dans le PRD ou le project-brief — y pointer depuis une seule ligne de renvoi.
