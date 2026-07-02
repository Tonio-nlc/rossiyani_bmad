# Rossiyani — Architecture technique
## Document BMAD — Référence technique permanente
### Version 1.0 — Juillet 2026

---

## Vue d'ensemble

Rossiyani est une application Next.js 14 (App Router) connectée à Supabase (PostgreSQL).
L'intelligence linguistique passe par un orchestrateur central qui décide à chaque requête
si la réponse vient de la base propriétaire ou de l'API Claude.
Navigateur (React)
↓
Next.js App Router (Frontend)
↓
Next.js API Routes (Backend — /app/api/)
↓
Linguistic Orchestrator (/src/lib/orchestrator/)
↓                          ↓
Supabase PostgreSQL         API Claude
(base propriétaire)         (fallback)
↑___________________________|
(réponse stockée après chaque appel API)

---

## Structure complète du projet
rossiyani/
├── .cursor/
│   └── rules/                          ← Règles Cursor (ne jamais modifier)
├── docs/                               ← Documents BMAD (ne jamais modifier)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      ← Schéma complet
│   └── seed/
│       └── seed_grammar_patterns.sql   ← Données initiales des patterns
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← Layout racine
│   │   ├── page.tsx                    ← Home
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/                      ← Pages protégées (auth requise)
│   │   │   ├── layout.tsx              ← Layout avec nav principale
│   │   │   ├── library/page.tsx
│   │   │   ├── reader/[textId]/page.tsx
│   │   │   ├── vocabulary/page.tsx
│   │   │   ├── lessons/page.tsx
│   │   │   └── practice/page.tsx
│   │   └── api/
│   │       ├── word/
│   │       │   └── explain/route.ts    ← Endpoint principal du Reader
│   │       ├── texts/
│   │       │   ├── route.ts            ← GET tous les textes
│   │       │   └── [id]/route.ts       ← GET un texte par ID
│   │       ├── vocabulary/
│   │       │   ├── route.ts            ← GET liste / POST sauvegarder
│   │       │   └── [id]/route.ts       ← DELETE un mot
│   │       ├── progress/
│   │       │   └── route.ts            ← POST mise à jour progression
│   │       └── srs/
│   │           └── route.ts            ← GET mots à réviser / POST résultat
│   ├── components/
│   │   ├── reader/
│   │   │   ├── ReaderContainer.tsx
│   │   │   ├── TextBody.tsx
│   │   │   ├── Sentence.tsx
│   │   │   ├── Word.tsx               ← Mot cliquable avec couleur fonctionnelle
│   │   │   └── ExplorerPanel.tsx      ← Panel d'explication contextuelle
│   │   ├── vocabulary/
│   │   │   ├── VocabularyGrid.tsx
│   │   │   └── WordCard.tsx
│   │   ├── practice/
│   │   │   ├── SentenceBuilder.tsx
│   │   │   └── ContextTranslation.tsx
│   │   ├── library/
│   │   │   ├── TextCard.tsx
│   │   │   └── CollectionCard.tsx
│   │   ├── onboarding/
│   │   │   └── OnboardingFlow.tsx
│   │   └── ui/                        ← shadcn/ui + composants génériques
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              ← Client Supabase côté navigateur
│   │   │   ├── server.ts              ← Client Supabase côté serveur
│   │   │   └── admin.ts               ← Client admin (service role key)
│   │   ├── orchestrator/
│   │   │   ├── index.ts               ← Point d'entrée principal
│   │   │   ├── cache.ts               ← Logique explanation_cache
│   │   │   ├── hasher.ts              ← Calcul du context_hash
│   │   │   ├── claude.ts              ← Appel API Claude + prompt système
│   │   │   └── types.ts               ← Types TypeScript de l'orchestrateur
│   │   └── utils/
│   │       ├── russian.ts             ← Utilitaires texte russe
│   │       └── srs.ts                 ← Algorithme SM-2
│   ├── hooks/
│   │   ├── useWordExplanation.ts
│   │   ├── useTextProgress.ts
│   │   ├── useVocabulary.ts
│   │   └── useSRS.ts
│   ├── stores/
│   │   ├── readerStore.ts             ← State Reader (mot sélectionné, panel ouvert)
│   │   └── userStore.ts               ← State utilisateur global
│   └── types/
│       ├── supabase.ts                ← Types générés par Supabase CLI
│       ├── reader.ts
│       └── orchestrator.ts
├── public/
├── .env.local                         ← Jamais commité
├── .env.example                       ← Template à commiter
├── next.config.ts
├── tailwind.config.ts
└── package.json

---

## Schéma de base de données complet

À placer dans `supabase/migrations/001_initial_schema.sql`

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

---

## L'orchestrateur linguistique

### Logique de décision (à implémenter dans `src/lib/orchestrator/index.ts`)
ENTRÉE : { surface: string, sentence: string, textId?: string }

Calculer context_hash = SHA256(surface.toLowerCase() + "::" + sentence.toLowerCase()).slice(0,32)
Chercher dans explanation_cache WHERE context_hash = hash
→ TROUVÉ et confidence_score >= 0.8 :
- Incrémenter usage_count en background (fire and forget)
- Retourner l'explication directement → 0 appel API Claude
→ TROUVÉ et confidence_score < 0.8 :
- Retourner quand même (éviter la latence)
- Déclencher une re-validation en background
→ PAS TROUVÉ : aller à l'étape 3
Appeler l'API Claude (claude-sonnet-4-6) avec :

System prompt : instructions méthode Rossiyani + format JSON strict
User prompt : le mot + la phrase complète


Parser la réponse JSON de Claude
Résoudre ou créer le lemme dans la table lemmas
Stocker dans explanation_cache :
source = 'api', confidence_score = 0.5, usage_count = 1
Retourner la réponse formatée

RÈGLE D'ÉVOLUTION :
Quand usage_count >= 20 sur une même entrée → confidence_score passe à 0.85
Quand confidence_score >= 0.85 → source passe à 'proprio'

### Prompt système Claude (à placer dans `src/lib/orchestrator/claude.ts`)
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

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

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
| Framework | Next.js 14+ App Router | Server Components, layouts imbriqués, API Routes intégrées |
| Base de données | Supabase (PostgreSQL) | Auth + RLS + Storage intégrés, pas d'infra à gérer |
| Auth | Supabase Auth | Natif avec RLS, session persistante |
| State global | Zustand | Léger, pas de boilerplate Redux |
| Data fetching | React Query (TanStack) | Cache client, loading/error states, refetch automatique |
| Validation | Zod | TypeScript-first, validation API Routes et formulaires |
| Styles | Tailwind CSS + shadcn/ui | Cohérence, rapidité, composants accessibles |
| Modèle IA | claude-sonnet-4-6 | Meilleur équilibre coût / qualité pour des explications courtes |
| SRS | Algorithme SM-2 | Standard éprouvé, simple à implémenter |

---

## Ce que Cursor ne doit JAMAIS faire

- Utiliser Pages Router au lieu de App Router
- Appeler l'API Anthropic directement depuis un composant React ou un hook
- Créer ou modifier des tables Supabase sans fichier de migration SQL
- Utiliser `any` en TypeScript
- Stocker des données utilisateur sans Row Level Security activé
- Modifier les fichiers dans `.cursor/rules/` ou `docs/`
- Inventer une librairie npm non listée dans `01-tech-stack.md`
- Mettre des clés API dans le code ou dans un fichier commité