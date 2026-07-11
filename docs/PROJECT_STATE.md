# Rossiyani — État du projet (source de vérité)

> **Document de référence unique** — miroir du code tel qu'il existe dans le repo.  
> Dernière mise à jour : **7 juillet 2026**  
> Dernier commit intégré : `5a2d046` — *Fix reader explorer panel layout and Russian accent handling.*

Ce document remplace tout résumé Cursor ou tableau PRD obsolète pour décider des prochaines stories.

---

## Légende des statuts

| Tag | Signification |
|-----|---------------|
| **PROD** | Intégré au flux utilisateur, utilisable de bout en bout, pas de blocker connu |
| **WIP** | Fonctionnel mais incomplet, instable visuellement, ou données/UI partielles |
| **EXP** | Coquille UI, placeholder, ou feature non branchée au backend |

| Évaluation module | Signification |
|-------------------|---------------|
| **Stable** | PROD sur le parcours principal |
| **Partiel** | PROD + lacunes documentées |
| **Cassé** | Bloquant ou non utilisable — *aucun module critique n'est dans cet état* |

---

## Vue d'ensemble

| Module | Statut | Évaluation | Route(s) |
|--------|--------|------------|----------|
| Auth | PROD | Stable | `/login`, `/register` |
| Onboarding | PROD | Stable | `/onboarding` |
| Home | PROD | Partiel | `/` |
| Library | PROD | Partiel | `/library` |
| Reader | PROD | Partiel | `/reader/[textId]` |
| Lessons | PROD | Stable | `/lessons`, `/lessons/[parcoursSlug]`, `/lessons/[parcoursSlug]/[lessonSlug]` |
| Vocabulary | PROD | Stable | `/vocabulary`, `/vocabulary/[lemmaId]` |
| Review (SRS) | PROD | Partiel | `/review`, `/review/session` |
| Practice | PROD | Partiel | `/practice`, `/practice/sentence-builder`, `/practice/context-translation` |

**Infrastructure transverse**

| Composant | Statut | Notes |
|-----------|--------|-------|
| Design system (tokens, PageHeader, cards) | PROD | `globals.css`, `tailwind.config.ts`, `src/components/ui/` |
| Orchestrateur Reader + cache | PROD | `src/lib/orchestrator/`, table `explanation_cache` |
| Knowledge Layer | PROD | `linguistic_knowledge`, génération LLM à l'ouverture fiche vocabulaire |
| Base de données | PROD | Migrations `001`–`008` (voir § Base de données) |
| Navigation | PROD | `AppNav` — hamburger mobile, liens desktop |

---

## Modules critiques (détail)

### Reader — PROD / **Partiel**

**Ce qui fonctionne**
- Affichage texte russe phrase par phrase, accents toniques (U+0301), Noto Serif 24px mobile / 26px desktop, interligne 1.65, max-width 680px
- Clic mot → `POST /api/word/explain` → ExplorerPanel
- **Desktop (≥768px)** : panel fixe porté sur `document.body`, gouttière droite constante (360px) — pas de reflow à l’ouverture
- **Mobile** : bottom sheet uniquement (portal + animation), lecture full-width, scroll body verrouillé à l’ouverture
- Sélection mot : surbrillance immédiate (accent) puis coloration suffixe après réponse API
- Traduction phrase par phrase si `content_annotated.sentences[].translationFr` présent
- Sauvegarde vocabulaire + création entrée SRS depuis le panel
- Progression % lue, persistance `user_progress` (intervalle 10 s + flush au départ)
- `ReaderHeader` responsive (padding mobile/desktop)

**Lacunes (WIP / non implémenté)**
- Pas d’écran « Lecture terminée » à 100 % (`completed_at` est écrit en base, aucune UI dédiée)
- Coloration terminaisons **non** active à l’ouverture (textes sans `content_annotated.words`)
- Fermeture panel au clic extérieur du texte : non implémentée (backdrop mobile + bouton Fermer desktop)

**Fichiers clés** : `ReaderContainer.tsx`, `ExplorerPanel.tsx`, `TextBody.tsx`, `Word.tsx`, `src/lib/orchestrator/`

---

### Lessons — PROD / **Stable** (système V1 terminé)

**Ce qui fonctionne**
- 5 parcours en base (`lesson_paths`)
- **10 leçons** avec contenu JSON (`content_blocks`) :
  - *Fondations du russe* : 3 leçons
  - *Les six cas* : 7 leçons
- Navigation fluide `/lessons` → parcours → leçon avec breadcrumb partagé (`LessonsBreadcrumb`)
- Retour contextuel Reader (`LessonsContextBack`) via `?from=reader&textId=`
- Cartes parcours et leçons unifiées (design system : `CARD_BASE_CLASS`, tokens accent/green)
- Progression utilisateur : barre par parcours, badges « Lu » / « Terminé », `POST /api/lessons/complete`
- Renderer tous blocs : `paragraph`, `example`, `comparison`, `schema`, `callout`, `takeaways`
- États robustes : parcours vide, leçon inexistante (`not-found`), erreur Supabase, loading skeleton

**Contenu à venir (hors système)**
- 3 parcours **sans leçon** (empty state géré) :
  - `verbes-et-aspect`
  - `russe-du-quotidien`
  - `culture-et-civilisation`

**Fichiers clés** : `src/lib/lessons/`, `src/components/lessons/`, migrations `004`–`007`

---

### Vocabulary — PROD / **Stable**

**Ce qui fonctionne**
- Liste mots sauvegardés, recherche, filtres (tous / à réviser / nouveaux / appris)
- Fiche `/vocabulary/[lemmaId]` : en-tête, `InformationSection` (Knowledge Layer), exemples contextuels, état SRS
- `buildKnowledge()` : fiche LLM à la première ouverture si absente
- Sauvegarde depuis Reader avec contexte (`explanation_cache_id`, `text_id`)

**Lacunes mineures**
- Titre page encore « Vocabulary » (anglais)

**Fichiers clés** : `VocabularyView.tsx`, `VocabularyEntry.tsx`, `src/lib/vocabulary/`, `src/lib/knowledge/`

---

### Review (SRS) — PROD / **Partiel**

**Ce qui fonctionne**
- File d'attente : mots dont `next_review_at <= now()`
- Session `/review/session` : révélation, ratings `again|hard|good|easy`
- SM-2 (`src/lib/utils/srs.ts`), historique `review_history`, mise à jour `srs_reviews`
- Compteur due exposé sur Home et badge nav Vocabulaire
- Accès Home → « Réviser » → `/review`

**Lacunes**
- UI Review partiellement hors design system Rossiyani (session utilise encore quelques tokens `brand-*`)

**Fichiers clés** : `src/lib/review/`, `ReviewView.tsx`, `ReviewSession.tsx`

---

### Practice — PROD / **Partiel**

**Ce qui fonctionne**
- Hub `/practice` avec 2 modes
- **Constructeur de phrases** : formulaire + `POST /api/practice/sentence-builder` (LLM)
- **Traduction contextualisée** : registre (courant/soutenu/familier/argotique) + API LLM
- Les deux exercices sont **réellement fonctionnels** (pas des stubs)

**Lacunes**
- Home affiche des badges **factices** (« 3 EXERCICES RESTANTS », « 4 EXERCICES RESTANTS ») — hardcodés, pas de quota réel
- Styles Practice mélangent `brand-*` et design system

**Fichiers clés** : `SentenceBuilder.tsx`, `ContextTranslation.tsx`, `src/lib/practice/`

---

### Home — PROD / **Partiel**

**Ce qui fonctionne**
- Hero : reprise de lecture (`get-home-data`)
- Section « Aujourd'hui » : liens Practice + Review (compteur SRS réel pour la révision)
- Grille collections → filtre Library
- Activité récente : textes suggérés

**Lacunes**
- Badges exercices Practice fictifs (voir Practice)
- Dépend de 5 textes seed uniquement

**Fichiers clés** : `HomePage.tsx`, `useHomeData.ts`, `src/app/api/home/route.ts`

---

### Library — PROD / **Partiel**

**Ce qui fonctionne**
- 5 textes A1 (*everyday_russian*) en base
- Filtres niveau (pills), recherche titre, filtre collection
- Carte « Continuer » si lecture en cours
- 6 collections affichées (grille)
- Carte « Suggérer un texte » (UI seulement)
- Progression par texte (% lu)

**Lacunes**
- 5 collections sur 6 ont **0 texte** (`stories`, `dialogues`, `slow_news`, `travel`, `culture`)
- Import de textes (`imported_by` en schéma) : **EXP** — pas d'UI ni d'API
- « Suggérer un texte » : **EXP** — pas d'action

**Fichiers clés** : `library/page.tsx`, `useTexts.ts`, `src/lib/library/collections.ts`

---

### Auth & Onboarding — PROD / **Stable**

**Auth**
- Login, register, middleware protection routes, RLS Supabase
- Profil `user_profiles` créé à l'inscription

**Onboarding** *(le PRD indique encore « placeholder » — c'est faux)*
- Flux 5 étapes interactif (`OnboardingFlow`) avec démo Reader
- `POST /api/onboarding/complete` → `onboarding_completed = true`
- Middleware redirige vers `/onboarding` tant que non complété

---

## Contenu seed (données essentielles)

| Entité | Quantité | Source migration |
|--------|----------|------------------|
| Textes bibliothèque | 5 | `008_seed_library_texts.sql` |
| Parcours leçons | 5 | `004_lesson_paths.sql` |
| Leçons avec contenu | 10 | `004`–`007` |
| Collections avec textes | 1 (`everyday_russian`) | — |

Traductions phrase : **5/5 textes** (après migration 008 appliquée sur Supabase distant).

---

## Base de données

| Migration | Contenu |
|-----------|---------|
| `001` | Schéma initial (linguistique + utilisateur + texts) |
| `002` | `linguistic_knowledge` |
| `003` | `review_history` |
| `004` | `lesson_paths`, `lessons`, `user_lesson_progress` + seed parcours + leçon 1 |
| `005` | Leçons Fondations 2–3 |
| `006` | Leçon Les six cas 1 |
| `007` | Leçons Les six cas 2–7 |
| `008` | Seed 5 textes bibliothèque (accents + `content_annotated`) |

**Reconstruction** : `supabase db push` sur projet vierge, ou `npm run db:reset:local` (Docker).  
**Scripts** : `scripts/db-reset.sh`, `scripts/db-repair-remote-history.sh`, `scripts/verify-db-state.mjs`

> ⚠️ **Working tree local** : fichiers Story 0.2 (migration `008`, `config.toml`, scripts DB) présents mais **non commités** au moment de cette rédaction. Supabase distant : migrations `001`–`008` appliquées et historique réparé.

Fichiers `supabase/seed/*.sql` hors migrations : **DEPRECATED** — référence dev uniquement.

---

## API Routes (inventaire)

| Route | Statut | Rôle |
|-------|--------|------|
| `POST /api/word/explain` | PROD | Explication contextuelle Reader |
| `GET/POST /api/vocabulary` | PROD | Liste + sauvegarde mot |
| `GET /api/vocabulary/[lemmaId]` | PROD | Détail fiche |
| `GET /api/texts`, `GET /api/texts/[id]` | PROD | Bibliothèque |
| `POST /api/progress` | PROD | Progression lecture |
| `GET /api/home` | PROD | Dashboard accueil |
| `GET /api/review`, `POST /api/review/rate` | PROD | SRS |
| `GET /api/srs` | PROD | État SRS |
| `POST /api/lessons/complete` | PROD | Progression leçon |
| `POST /api/practice/sentence-builder` | PROD | Évaluation phrase |
| `POST /api/practice/context-translation` | PROD | Traduction LLM |
| `POST /api/onboarding/complete` | PROD | Fin onboarding |
| `POST /api/auth/signout` | PROD | Déconnexion |

---

## Éléments EXP / fantômes (ne pas traiter comme implémentés)

| Élément | Où | Réalité |
|---------|-----|---------|
| Import de textes utilisateur | Schéma `texts.imported_by` | Aucune UI/API |
| Suggérer un texte | Library | Carte sans action |
| 5 collections vides | Library / Home | UI catalogue, 0 contenu |
| 3 parcours leçons vides | Lessons | Fiches parcours sans leçons |
| Quotas exercices Home | `HomePage.tsx` | Chaînes hardcodées |
| Écran fin de lecture | PRD Feature 1.4 | Non codé |
| PRD § État d'implémentation | `docs/prd.md` | **Obsolète** — Lessons/Practice/Onboarding sous-évalués |

---

## Stack technique (rappel)

- Next.js 16 App Router, React 19, TypeScript
- Supabase (Auth, Postgres, RLS)
- Tailwind 4 + tokens Rossiyani
- OpenAI via orchestrateur Reader, Knowledge Builder, Practice
- Zustand (état Reader), TanStack Query (fetch client)

---

## Prochaine story planifiée

**Story 2.2 — Production de contenu Lessons** (remplir les parcours vides + compléter les 25 premières leçons)

---

## Pipeline éditorial Lessons (Story 2.1)

| Livrable | Emplacement |
|----------|-------------|
| Modèle pédagogique (6 sections) | `docs/lessons/PIPELINE.md` |
| Règles éditoriales (15 règles) | `docs/lessons/PIPELINE.md` |
| Référence technique blocs | `docs/lessons/CONTENT_BLOCKS.md` |
| Checklist publication | `docs/lessons/CHECKLIST.md` |
| Template JSON | `docs/lessons/templates/lesson.template.json` |
| Template SQL | `docs/lessons/templates/lesson.template.sql` |

**Validation format** : 5 types existants + `takeaways` ajouté pour la section « À retenir ». Aucun autre type requis avant production de contenu.

---

## Lessons — système V1 (Story 1.3)

| Aspect | Comportement |
|--------|--------------|
| Navigation | Breadcrumb partagé, liens avec contexte Reader préservé |
| Progression | `user_lesson_progress`, barre % par parcours, bouton « Marquer comme lu » |
| UX | Cartes unifiées, responsive, hover/focus design system |
| Renderer | 5 types de blocs, tokens Rossiyani |
| Robustesse | Empty states, `not-found`, erreur chargement, `loading.tsx` |

---

## Navigation et flux (Story 1.2)

| Flux | Comportement |
|------|--------------|
| Home → Reader | `Reprendre →` sur carte lecture en cours |
| Reader → Vocabulary / Review / Lessons | Liens contextuels avec `?from=reader&textId=` |
| Retour depuis Vocabulary / Review / Lessons | `Retour à la lecture` si contexte Reader |
| AppNav actif | `/reader/*` → Bibliothèque ; `/review/*` → Vocabulaire |
| Session Reader | Position scroll + mot sélectionné restaurés (`sessionStorage`) |

---

## Maintenance de ce document

Mettre à jour `PROJECT_STATE.md` à chaque story qui change le statut d'un module.  
Ne pas dupliquer l'état dans le PRD — le PRD reste la spec comportementale cible ; ce fichier est l'état **réel** du repo.
