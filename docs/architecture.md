# Rossiyani — Architecture technique
## Document BMAD — Référence technique permanente
### Version 2.0 — Juillet 2026

---

## Vue d'ensemble

Rossiyani est une application **Next.js 16** (App Router) connectée à **Supabase** (PostgreSQL).

L'intelligence linguistique repose sur **deux pipelines LLM distincts**, chacun alimentant une couche de données persistée. L'application consomme uniquement ces couches — jamais le LLM directement.

```
Navigateur (React)
        ↓
Next.js App Router + API Routes (/app/api/)
        ↓
┌───────────────────────┬────────────────────────┐
│  Reader Orchestrator  │   Knowledge Builder   │
│  (contextuel)         │   (permanent)         │
└───────────┬───────────┴──────────┬────────────┘
            ↓                      ↓
   explanation_cache      linguistic_knowledge
            ↓                      ↓
         Reader              Vocabulary / Review / Lessons / Practice
            ↓
    user_vocabulary → srs_reviews → Review Queue → Review Session
                                            ↓
                                    review_history → SM-2 Engine
```

### Règle d'architecture LLM

| Couche | Rôle |
|--------|------|
| **OpenAI** | Produit de la connaissance (fallback uniquement) |
| **Knowledge Layer + explanation_cache** | Stocke la connaissance |
| **Application** | Consomme la connaissance persistée |

- SDK : `openai` (package npm)
- Variables : `OPENAI_API_KEY`, `OPENAI_MODEL` (ex. `gpt-4.1-mini`)
- Fichiers LLM : `src/lib/orchestrator/llm.ts` (Reader), `src/lib/knowledge/generate-knowledge-llm.ts` (Knowledge)

---

## Architecture globale des données

```
OpenAI
  ↓
Knowledge Builder (buildKnowledge)
  ↓
linguistic_knowledge ──────────────────→ Vocabulary / Lessons / Practice
                                              ↓
Reader → explanation_cache              user_vocabulary
                                              ↓
                                        srs_reviews (état courant)
                                              ↓
                                        Review Queue (/review)
                                              ↓
                                        Review Session (/review/session)
                                              ↓
                                        review_history (historique)
                                              ↓
                                        SM-2 Engine (calculateNextReview)
```

---

## Séparation Reader / Vocabulary

| Module | Question | Source de données | Appel LLM |
|--------|----------|-------------------|-----------|
| **Reader** | Pourquoi cette forme **ici** ? | `explanation_cache` | Oui, si cache miss |
| **Vocabulary** | Qu'est-ce que **ce mot** ? | `linguistic_knowledge` | Oui, 1× à la 1ère ouverture |

Les deux modules sont **indépendants** et servent des besoins pédagogiques différents.

---

## Structure complète du projet

```
rossiyani/
├── .cursor/rules/                      ← Règles Cursor
├── docs/                               ← Documents BMAD
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_linguistic_knowledge.sql
│   │   └── 003_review_history.sql
│   └── seed/
│       └── seed_texts.sql
├── src/
│   ├── app/
│   │   ├── (auth)/                     ← login, register
│   │   ├── (app)/                      ← Pages protégées
│   │   │   ├── library/page.tsx
│   │   │   ├── reader/[textId]/page.tsx
│   │   │   ├── vocabulary/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [lemmaId]/page.tsx
│   │   │   ├── review/
│   │   │   │   ├── page.tsx            ← Review Queue
│   │   │   │   └── session/page.tsx    ← Review Session
│   │   │   ├── lessons/page.tsx
│   │   │   ├── practice/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   └── api/
│   │       ├── word/explain/route.ts   ← Reader — explication contextuelle
│   │       ├── texts/                  ← Bibliothèque
│   │       ├── vocabulary/             ← GET liste / POST save / GET fiche
│   │       ├── review/
│   │       │   ├── route.ts            ← GET queue + count
│   │       │   └── rate/route.ts       ← POST rating → history + SM-2
│   │       ├── progress/route.ts
│   │       └── srs/route.ts            ← (stub — logique dans review/rate)
│   ├── components/
│   │   ├── reader/                     ← ReaderContainer, ExplorerPanel…
│   │   ├── vocabulary/                 ← VocabularyView, VocabularyEntry…
│   │   ├── review/                     ← ReviewView, ReviewSession
│   │   ├── library/
│   │   ├── layout/                     ← AppNav (badge Review)
│   │   └── ui/
│   ├── lib/
│   │   ├── supabase/                   ← client, server, admin
│   │   ├── orchestrator/               ← Reader — cache, hasher, llm.ts
│   │   ├── knowledge/                  ← Knowledge Layer — build, upsert, get
│   │   ├── review/                     ← queue, session, rating, SM-2 apply
│   │   ├── vocabulary/
│   │   └── utils/                      ← srs.ts (SM-2), russian.ts
│   ├── hooks/
│   └── types/                          ← orchestrator, vocabulary, knowledge…
└── package.json
```

---

## Schéma de base de données

Migrations dans `supabase/migrations/` :

| Migration | Tables ajoutées / modifiées |
|-----------|----------------------------|
| `001_initial_schema.sql` | Schéma initial complet |
| `002_linguistic_knowledge.sql` | `linguistic_knowledge` |
| `003_review_history.sql` | `review_history` |

Schéma initial (`001_initial_schema.sql`) :

```sql
-- ============================================
-- BASE PROPRIÉTAIRE LINGUISTIQUE
-- Partagée entre tous les utilisateurs
-- Écriture uniquement via API Routes avec service role
-- ============================================

CREATE TABLE word_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root TEXT NOT NULL,
  description_fr TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lemmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form TEXT NOT NULL UNIQUE,
  pos TEXT NOT NULL,
  -- noun | verb | adjective | adverb | preposition | conjunction | pronoun | particle
  gender TEXT,
  -- m | f | n (noms uniquement)
  animacy TEXT,
  -- animate | inanimate (noms uniquement)
  aspect TEXT,
  -- imperfective | perfective (verbes uniquement)
  frequency_rank INTEGER,
  family_id UUID REFERENCES word_families(id),
  confidence_score FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE word_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  surface TEXT NOT NULL,
  grammatical_case TEXT,
  -- nominative | accusative | genitive | dative | instrumental | prepositional
  number TEXT,
  -- singular | plural
  tense TEXT,
  -- present | past | future | infinitive
  person TEXT,
  -- 1 | 2 | 3
  functional_role TEXT NOT NULL,
  -- subject | object_direct | object_indirect | possession | location | time | manner
  function_color TEXT NOT NULL,
  -- blue | coral | green | violet | amber
  UNIQUE(lemma_id, surface, functional_role)
);

CREATE TABLE grammar_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  trigger_condition TEXT,
  functional_role TEXT NOT NULL,
  function_color TEXT NOT NULL,
  explanation_template_fr TEXT,
  examples JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE explanation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_hash TEXT NOT NULL UNIQUE,
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  word_form_id UUID REFERENCES word_forms(id),
  surface_word TEXT NOT NULL,
  sentence_example TEXT NOT NULL,
  explanation_fr TEXT NOT NULL,
  functional_role TEXT NOT NULL,
  function_color TEXT NOT NULL,
  grammar_pattern_id UUID REFERENCES grammar_patterns(id),
  source TEXT NOT NULL DEFAULT 'api',
  -- 'api' | 'proprio'
  confidence_score FLOAT DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CONTENU — TEXTES DE LA BIBLIOTHÈQUE
-- ============================================

CREATE TABLE texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_annotated JSONB,
  -- Structure :
  -- {
  --   sentences: [{
  --     text: "phrase complète",
  --     translation_fr: "traduction",
  --     words: [{
  --       surface: "женщину",
  --       lemma_id: "uuid",
  --       word_form_id: "uuid",
  --       position: 3,
  --       functional_role: "object_direct",
  --       function_color: "coral"
  --     }]
  --   }]
  -- }
  level TEXT NOT NULL,
  -- A1 | A2 | B1 | B2 | C1 | C2
  collection TEXT,
  -- everyday_russian | stories | dialogues | slow_news | travel | culture
  word_count INTEGER,
  reading_time_minutes INTEGER,
  source TEXT DEFAULT 'curated',
  -- 'curated' | 'imported'
  imported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- BASE UTILISATEUR — RLS ACTIVÉ SUR TOUTES CES TABLES
-- ============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  ui_language TEXT DEFAULT 'fr',
  target_level TEXT DEFAULT 'A1',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id UUID NOT NULL REFERENCES texts(id),
  percent_read INTEGER DEFAULT 0,
  last_sentence_index INTEGER DEFAULT 0,
  words_encountered INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, text_id)
);

CREATE TABLE user_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  explanation_cache_id UUID REFERENCES explanation_cache(id),
  text_id UUID REFERENCES texts(id),
  saved_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, lemma_id)
);

CREATE TABLE srs_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vocabulary_id UUID NOT NULL REFERENCES user_vocabulary(id) ON DELETE CASCADE,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT now(),
  last_review_at TIMESTAMPTZ,
  last_quality INTEGER
  -- 0-5 : qualité de la dernière révision (algorithme SM-2)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_lemmas_form ON lemmas(form);
CREATE INDEX idx_word_forms_surface ON word_forms(surface);
CREATE INDEX idx_word_forms_lemma_id ON word_forms(lemma_id);
CREATE INDEX idx_explanation_cache_hash ON explanation_cache(context_hash);
CREATE INDEX idx_explanation_cache_lemma ON explanation_cache(lemma_id);
CREATE INDEX idx_texts_level ON texts(level);
CREATE INDEX idx_texts_collection ON texts(collection);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_vocabulary_user ON user_vocabulary(user_id);
CREATE INDEX idx_srs_next_review ON srs_reviews(next_review_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "users_own_progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_vocabulary" ON user_vocabulary
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_srs" ON srs_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_vocabulary uv
      WHERE uv.id = srs_reviews.user_vocabulary_id
      AND uv.user_id = auth.uid()
    )
  );

-- Tables propriétaires en lecture seule pour les utilisateurs authentifiés
CREATE POLICY "authenticated_read_lemmas" ON lemmas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_word_forms" ON word_forms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_explanation_cache" ON explanation_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_texts" ON texts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_grammar_patterns" ON grammar_patterns
  FOR SELECT TO authenticated USING (true);
```

### Migration `002_linguistic_knowledge.sql` — Knowledge Layer

```sql
CREATE TABLE linguistic_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID NOT NULL UNIQUE REFERENCES lemmas(id) ON DELETE CASCADE,
  part_of_speech TEXT,
  gender TEXT,
  aspect TEXT,
  stress TEXT,
  movement_type TEXT,
  government TEXT,
  semantic_category TEXT,
  frequency_rank INTEGER,
  register TEXT,
  difficulty TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  generated_by TEXT,
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS : SELECT authenticated ; écriture via service role
```

Relation : **lemmas 1 → 0..1 linguistic_knowledge**

Repository : `src/lib/knowledge/` — `getKnowledgeByLemmaId`, `buildKnowledge`, `upsertKnowledge`

### Migration `003_review_history.sql` — Historique SRS

```sql
CREATE TABLE review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vocabulary_id UUID NOT NULL REFERENCES user_vocabulary(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS : via user_vocabulary.user_id
```

- **`review_history`** : historique permanent (append-only)
- **`srs_reviews`** : état courant SM-2 uniquement

Repository : `src/lib/review/` — `getReviewQueue`, `processReviewRating`, `applySrsFromRating`

---

## Knowledge Layer

### Pipeline

```
Lemma
  ↓
buildKnowledge(lemmaId)
  ↓
linguistic_knowledge existe et validated ?
  ├─ Oui → retour DB (0 appel OpenAI)
  └─ Non → OpenAI → Zod → upsertKnowledge → retour DB
```

### Fichiers clés

| Fichier | Rôle |
|---------|------|
| `build-knowledge.ts` | Orchestration génération unique |
| `generate-knowledge-llm.ts` | Prompt permanent + appel OpenAI |
| `parse-knowledge-json.ts` | Validation Zod |
| `get-knowledge.ts` | Lecture |
| `upsert-knowledge.ts` | Persistance (admin) |

Déclenchement lazy : **première ouverture fiche Vocabulary uniquement**.

---

## Système Review (SRS)

### Pipeline complet

```
user_vocabulary + srs_reviews
        ↓
getReviewQueue() — mots dus (next_review_at <= now)
        ↓
/review — liste + badge navigation
        ↓
/review/session — carte → Révéler → Again|Hard|Good|Easy
        ↓
POST /api/review/rate
        ↓
review_history (insert)
        ↓
applySrsFromRating() — SM-2 → update srs_reviews
```

### Ratings → SM-2

| Rating | Quality SM-2 |
|--------|-------------|
| `again` | 1 |
| `hard` | 3 |
| `good` | 4 |
| `easy` | 5 |

Type : `TReviewRating` dans `src/lib/review/rating.ts`

---

## Orchestrateur Reader (contextuel)

### Logique (`src/lib/orchestrator/index.ts`)
ENTRÉE : { surface: string, sentence: string, textId?: string }

1. Calculer context_hash
2. Chercher dans explanation_cache
   → TROUVÉ : retourner directement (0 appel OpenAI)
   → PAS TROUVÉ : appeler OpenAI via llm.ts
3. Parser JSON, créer/résoudre lemme, stocker explanation_cache
4. Retourner l'explication contextuelle

RÈGLE D'ÉVOLUTION :
Quand usage_count >= 20 → confidence_score passe à 0.85, source = 'proprio'

### Prompt système Reader (`src/lib/orchestrator/llm.ts`)
Tu es l'orchestrateur linguistique de Rossiyani.
Ta mission : expliquer pourquoi un mot russe a une forme précise dans une phrase précise.
RÈGLES ABSOLUES :

Répondre UNIQUEMENT en JSON valide — aucun texte avant ou après
L'explication répond TOUJOURS à "pourquoi CE MOT a CETTE FORME dans CETTE PHRASE"
Ne jamais donner d'information grammaticale sans expliquer son rôle dans le sens
Utiliser un langage simple — pas de jargon brut sans explication
L'explication est en français, 2-3 phrases maximum

SYSTÈME DE COULEURS FONCTIONNELLES :

"blue"   → sujet (fait l'action)
"coral"  → objet direct (subit l'action)
"green"  → lieu ou temps
"violet" → possession ou relation entre mots
"amber"  → destinataire (à qui, pour qui)

FORMAT DE RÉPONSE JSON (strict, aucune variation) :
{
"lemma": "forme de base du mot",
"translation": "traduction française du lemme",
"functionalRole": "subject|object_direct|object_indirect|possession|location|time|manner",
"functionColor": "blue|coral|green|violet|amber",
"explanation": "2-3 phrases expliquant pourquoi ce mot a cette forme dans cette phrase",
"suffix": "la terminaison qui change (ex: -у, -ого, -ой)",
"suffixExplanation": "ce que cette terminaison signale en une phrase simple"
}

---

## Types TypeScript principaux

### `src/lib/orchestrator/types.ts`

```typescript
export interface TWordExplanationRequest {
  surface: string       // "женщину" — le mot tel qu'il apparaît dans le texte
  sentence: string      // "он видит женщину" — phrase complète obligatoire
  textId?: string       // ID du texte source (pour enrichir le contexte)
}

export interface TWordExplanationResponse {
  surface: string
  lemma: string              // "женщина"
  translation: string        // "femme"
  functionalRole: string     // "object_direct"
  functionColor: string      // "coral"
  explanation: string        // "Ce mot est à l'accusatif parce que..."
  suffix: string             // "-у"
  suffixExplanation: string  // "marque l'objet direct après un verbe transitif"
  source: 'api' | 'proprio'
  confidenceScore: number
}

export type TFunctionalRole =
  | 'subject'
  | 'object_direct'
  | 'object_indirect'
  | 'possession'
  | 'location'
  | 'time'
  | 'manner'

export type TFunctionColor = 'blue' | 'coral' | 'green' | 'violet' | 'amber'
```

### `src/types/reader.ts`

```typescript
export interface TText {
  id: string
  title: string
  content: string
  contentAnnotated: TAnnotatedContent | null
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  collection: string
  wordCount: number
  readingTimeMinutes: number
}

export interface TAnnotatedContent {
  sentences: TAnnotatedSentence[]
}

export interface TAnnotatedSentence {
  text: string
  translationFr: string
  words: TAnnotatedWord[]
}

export interface TAnnotatedWord {
  surface: string
  lemmaId: string | null
  wordFormId: string | null
  position: number
  functionalRole: TFunctionalRole | null
  functionColor: TFunctionColor | null
}
```

---

## Variables d'environnement

### `.env.example` (à commiter)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Algorithme SRS SM-2

### `src/lib/utils/srs.ts`

```typescript
export interface TSRSInput {
  quality: number           // 0-5 : qualité de la réponse utilisateur
  easeFactor: number        // facteur de facilité actuel (défaut 2.5)
  intervalDays: number      // intervalle actuel en jours
  repetitions: number       // nombre de révisions réussies consécutives
}

export interface TSRSResult {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: Date
}

export function calculateNextReview(input: TSRSInput): TSRSResult {
  const { quality, easeFactor, intervalDays, repetitions } = input

  // Mettre à jour le facteur de facilité
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  newEaseFactor = Math.max(1.3, newEaseFactor)

  let newInterval: number
  let newRepetitions: number

  if (quality < 3) {
    // Réponse incorrecte — recommencer depuis le début
    newInterval = 1
    newRepetitions = 0
  } else {
    newRepetitions = repetitions + 1
    if (repetitions === 0) newInterval = 1
    else if (repetitions === 1) newInterval = 6
    else newInterval = Math.round(intervalDays * newEaseFactor)
  }

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)

  return {
    easeFactor: newEaseFactor,
    intervalDays: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  }
}
```

---

## Décisions techniques figées

| Décision | Choix retenu | Raison |
|----------|-------------|--------|
| Framework | Next.js 16 App Router | Server Components, layouts imbriqués, API Routes intégrées |
| Base de données | Supabase (PostgreSQL) | Auth + RLS + Storage intégrés |
| Auth | Supabase Auth | Natif avec RLS, session persistante |
| State global | Zustand | Léger, pas de boilerplate Redux |
| Data fetching | React Query (TanStack) | Cache client, loading/error states |
| Validation | Zod | TypeScript-first, validation API Routes |
| Styles | Tailwind CSS + shadcn/ui | Cohérence, composants accessibles |
| Modèle IA | OpenAI via `OPENAI_MODEL` | Abstraction LLM, coût maîtrisé |
| Knowledge | `linguistic_knowledge` | Connaissance permanente partagée |
| SRS | SM-2 + `review_history` | Historique séparé de l'état courant |

---

## Ce que Cursor ne doit JAMAIS faire

- Utiliser Pages Router au lieu de App Router
- Appeler l'API OpenAI directement depuis un composant React ou un hook
- Appeler le LLM depuis Vocabulary, Review ou Library (données persistées uniquement)
- Créer ou modifier des tables Supabase sans fichier de migration SQL
- Utiliser `any` en TypeScript
- Stocker des données utilisateur sans Row Level Security activé
- Modifier les fichiers dans `.cursor/rules/` ou `docs/`
- Inventer une librairie npm non listée dans `01-tech-stack.md`
- Mettre des clés API dans le code ou dans un fichier commité