# Rossiyani — Project Brief
## Document BMAD — Phase Upstream
### Version 1.0 — Juin 2026

---

## Vision du produit

**Rossiyani est un environnement de lecture intelligent qui rend le russe progressivement compréhensible** en expliquant toujours le pourquoi des formes linguistiques dans le contexte de phrases réelles — parce que comprendre une langue, c'est en voir la logique, pas en accumuler les règles.

**Phrase de positionnement :**
> Rossiyani t'explique pourquoi le russe fonctionne comme il fonctionne — toujours dans le contexte de ce que tu lis.

**Différence fondamentale avec les concurrents :**
- Duolingo : gamification, apprentissage fragmenté, sans contexte
- LingQ : lecture extensive mais explications superficielles, UX complexe
- Méthodes traditionnelles : grammaire abstraite, tableaux à mémoriser
- **Rossiyani** : lecture authentique + explication contextuelle de la logique de la langue

---

## Le problème résolu

Le russe est une langue de relations : chaque mot change de forme selon son rôle dans la phrase. Les applications existantes traitent ces formes comme des règles isolées à mémoriser. Rossiyani les traite comme une logique à comprendre — dans le contexte de phrases réelles.

---

## La méthode pédagogique

> **Référence officielle V1** : [docs/METHODE_ROSSIYANI.md](./METHODE_ROSSIYANI.md) — boucle, rôles modules, principes.  
> **Textes Reader** : [docs/reader/CHARTE_EDITORIALE.md](./reader/CHARTE_EDITORIALE.md) — charte éditoriale V1.

### Les 4 principes (non-négociables dans tout le produit)

**1. Le contexte avant l'information**
Chaque explication répond à "pourquoi CE MOT a CETTE FORME dans CETTE PHRASE" — jamais une information grammaticale sans son contexte.

**2. Le mot dans sa phrase, jamais seul**
L'unité d'analyse minimale est toujours : mot + phrase complète. Le Reader affiche des couleurs fonctionnelles sur les terminaisons pour signaler le rôle (pas le cas grammatical).

Système de couleurs :
- Bleu → sujet
- Coral → objet direct
- Vert → lieu / temps
- Violet → possession
- Ambre → destinataire

**3. Les mots dans leurs familles**
Le russe a une logique morphologique riche. читать → прочитать → зачитать → начитать. Ce sont des familles, pas des mots isolés.

**4. Comprendre d'abord, mémoriser ensuite**
Lire → Comprendre → Revoir en contexte → Mémoriser naturellement
La mémoire est une conséquence, pas un objectif.

### Base scientifique
- Krashen (1982) : input compréhensible i+1
- VanPatten (1996) : form-meaning connection
- Schmidt (1990) : consciousness-raising hypothesis

---

## Architecture produit — les 5 outils

| Outil | Rôle unique | Priorité |
|-------|-------------|----------|
| **Reader** | Lire un texte russe annoté — cœur du produit | P0 |
| **Library** | Naviguer et choisir les textes par niveau/collection | P0 |
| **Vocabulary** | Stocker les mots EN CONTEXTE (pas dictionnaire) | P1 |
| **Practice** | Sentence Builder + Traduction contextualisée | P1 |
| **Lessons** | Expliquer la logique du russe avec schémas | P2 |

**La boucle centrale** *(détail complet : [METHODE_ROSSIYANI.md](./METHODE_ROSSIYANI.md))* :

Lire → Comprendre → Explorer → Retenir → Réviser → Relire

---

## Architecture technique

### Stack
- **Frontend** : Next.js 14+ (App Router), TypeScript strict, Tailwind CSS, shadcn/ui
- **State** : Zustand + React Query (TanStack Query)
- **Backend** : Next.js API Routes (toute la logique serveur)
- **Base de données** : Supabase (PostgreSQL)
- **IA** : Anthropic API (claude-sonnet-4-6) — uniquement via API Routes

### Principe architectural central — la base propriétaire

Rossiyani construit progressivement une base de connaissances linguistiques propriétaire :

```
Jour 1   → API Claude : 90% | Base proprio : 10%
6 mois   → API Claude : 50% | Base proprio : 50%
An 2     → API Claude : 15% | Base proprio : 85%
```

**L'orchestrateur linguistique** (`/src/lib/orchestrator/`) :
1. Reçoit : mot + phrase complète
2. Cherche dans `explanation_cache` (hash du contexte)
3. Si trouvé et confiance ≥ 0.8 → retourne directement (0 appel API)
4. Sinon → appelle Claude, stocke la réponse, enrichit la base

### Tables principales
- `lemmas` — formes de base des mots russes
- `word_forms` — formes fléchies avec rôle fonctionnel
- `grammar_patterns` — patterns grammaticaux réutilisables
- `explanation_cache` — explications générées et validées (cœur de la base proprio)
- `texts` — textes de la bibliothèque
- `user_vocabulary` — mots sauvegardés par utilisateur
- `srs_reviews` — révision espacée (algorithme SM-2)
- `user_progress` — progression par texte

---

## Rôles dans le projet

| Rôle | Responsabilité |
|------|----------------|
| **Architecte (Claude)** | Vision technique, specs BMAD, prompts Cursor, debug |
| **Développeur (Cursor)** | Implémentation story par story |
| **Product Owner (fondateur)** | Validation de la méthode, tests utilisateur, vision produit |

### Workflow
1. Claude produit une story avec specs complètes
2. Fondateur colle la story dans Cursor
3. Cursor implémente
4. Fondateur teste dans le navigateur
5. Feedback → Claude debug ou valide → story suivante

---

## Contraintes et décisions figées

### Décisions prises (ne pas remettre en question)
- Couleurs par **fonction** grammaticale (pas par cas)
- Le mot est toujours expliqué dans le contexte de sa **phrase complète**
- **Pas de gamification** (pas de streaks obligatoires, pas de points)
- Interface en **français**, contenu en **russe**
- **Pas de chatbot** — l'IA est un orchestrateur invisible
- Stack : **Next.js + Supabase** — pas d'alternative

### Hors scope (version 1.0)
- Application mobile native (PWA acceptable)
- Mode hors-ligne
- Collaboration entre utilisateurs
- Génération de textes par IA
- Traduction automatique complète des textes

---

## Contenu au lancement

Objectif : **100 à 200 textes** au lancement, organisés en collections :
- Everyday Russian (A1) — vie quotidienne
- Russian Stories (A1-A2) — contes et nouvelles courtes
- Dialogues (A1-B1) — conversations
- Slow News (B1-B2) — actualités simplifiées
- Travel Russian (A2-B1) — voyages et transports
- Russian Culture (tous niveaux) — culture et civilisation

Chaque texte : titre en russe, niveau CECR, durée de lecture estimée, collection, accents toniques pré-annotés.

---

## Métriques de succès (version 1.0)

- Utilisateur lit au moins 3 textes dans sa première semaine
- Temps moyen par session > 15 minutes
- Taux de sauvegarde de mots > 30% des sessions Reader
- Taux de retour J7 > 40%
- NPS > 50 chez les utilisateurs A1-A2

---

## Roadmap épics

| Epic | Contenu | Statut |
|------|---------|--------|
| **Epic 1** | Reader + Explorer + couleurs fonctionnelles | À faire |
| **Epic 2** | Library + textes + navigation | À faire |
| **Epic 3** | Vocabulary + fiches contextuelles | À faire |
| **Epic 4** | Authentification + user_progress | À faire |
| **Epic 5** | Onboarding 5 écrans | À faire |
| **Epic 6** | Practice (Sentence Builder + Traduction) | À faire |
| **Epic 7** | SRS — révision espacée | À faire |
| **Epic 8** | Lessons avec schémas | À faire |
| **Epic 9** | Import de textes personnels | À faire |

---

## Référence aux autres documents BMAD

- **`docs/METHODE_ROSSIYANI.md`** — méthode d'apprentissage V1 (boussole produit)
- `docs/architecture.md` — schéma DB complet + orchestrateur
- `docs/front-end-spec.md` — composants, UX, design system
- `docs/prd.md` — toutes les features en détail
- `docs/stories/epic-*/` — stories de développement
- `.cursor/rules/` — règles permanentes pour Cursor
