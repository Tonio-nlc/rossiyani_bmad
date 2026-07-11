# Rossiyani — Base de données et orchestrateur

---

## Architecture en deux bases distinctes

Rossiyani utilise deux catégories de tables dans Supabase :

1. **Base propriétaire linguistique** — connaissances sur le russe, partagées entre tous les utilisateurs, construite progressivement
2. **Base utilisateur** — données propres à chaque utilisateur, protégées par RLS

---

## Schéma complet — Base propriétaire linguistique

### `lemmas` — unité centrale de la base
```sql
CREATE TABLE lemmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form TEXT NOT NULL UNIQUE,          -- forme de base : "женщина"
  pos TEXT NOT NULL,                  -- part of speech : noun, verb, adj, adv, prep...
  gender TEXT,                        -- m, f, n (pour les noms)
  animacy TEXT,                       -- animate, inanimate (pour les noms)
  aspect TEXT,                        -- imperfective, perfective (pour les verbes)
  frequency_rank INTEGER,             -- rang de fréquence dans le russe courant
  family_id UUID REFERENCES word_families(id),
  confidence_score FLOAT DEFAULT 0.5, -- monte avec l'usage et la validation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `word_forms` — toutes les formes fléchies d'un lemme
```sql
CREATE TABLE word_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  surface TEXT NOT NULL,              -- forme telle qu'elle apparaît : "женщину"
  grammatical_case TEXT,             -- nominative, accusative, genitive, dative, instrumental, prepositional
  number TEXT,                        -- singular, plural
  grammatical_gender TEXT,           -- m, f, n (pour les formes adjectivales)
  person TEXT,                        -- 1, 2, 3 (pour les verbes)
  tense TEXT,                         -- present, past, future, infinitive
  functional_role TEXT,              -- subject, object_direct, object_indirect, possession, location, time
  function_color TEXT,               -- blue, coral, green, violet, amber (couleur UI correspondante)
  UNIQUE(lemma_id, surface, functional_role)
);
```

### `word_families` — familles de mots par racine
```sql
CREATE TABLE word_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root TEXT NOT NULL,                 -- racine : "чит"
  description_fr TEXT,               -- "famille du verbe lire"
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `grammar_patterns` — patterns grammaticaux réutilisables
```sql
CREATE TABLE grammar_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,          -- "accusative_direct_object"
  trigger_condition TEXT,             -- "transitive verb + noun after"
  function_color TEXT NOT NULL,       -- "coral"
  explanation_template_fr TEXT,       -- template d'explication avec variables
  examples JSONB,                     -- exemples canoniques
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `explanation_cache` — cœur de la base propriétaire (Reader contextuel)
```sql
CREATE TABLE explanation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_hash TEXT NOT NULL UNIQUE,  -- hash(lemma_id + functional_role + sentence_structure)
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  word_form_id UUID REFERENCES word_forms(id),
  sentence_example TEXT NOT NULL,     -- phrase d'exemple complète
  word_in_sentence TEXT NOT NULL,     -- le mot tel qu'il apparaît
  explanation_fr TEXT NOT NULL,       -- explication en français
  grammar_pattern_id UUID REFERENCES grammar_patterns(id),
  source TEXT NOT NULL DEFAULT 'api', -- 'api' ou 'proprio'
  confidence_score FLOAT DEFAULT 0.5, -- monte avec usage_count et validations
  usage_count INTEGER DEFAULT 0,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `linguistic_knowledge` — Knowledge Layer (fiche permanente par lemme)

Migration : `supabase/migrations/002_linguistic_knowledge.sql`

Relation : **1 lemme → 0..1 fiche** (`lemma_id UNIQUE`).

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
  generated_by TEXT,               -- 'manual' | 'llm' | 'import' | 'migration'
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- **Lecture** : utilisateurs authentifiés (RLS SELECT)
- **Écriture** : API Routes serveur avec service role (`upsertKnowledge`, `buildKnowledge`)
- **Ne remplace pas** les colonnes de `lemmas` — complète la connaissance permanente
- **Consommée par** : Vocabulary Entry, Review Session (révélation), Lessons/Practice (futur)

---

## Schéma complet — Base utilisateur (RLS activé)

### `users` — profil utilisateur
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  ui_language TEXT DEFAULT 'fr',
  target_level TEXT DEFAULT 'A1',     -- niveau CECR visé
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `user_vocabulary` — mots sauvegardés par l'utilisateur
```sql
CREATE TABLE user_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  explanation_cache_id UUID REFERENCES explanation_cache(id), -- contexte de découverte
  text_id UUID REFERENCES texts(id),  -- texte où le mot a été rencontré
  saved_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, lemma_id)
);
```

### `srs_reviews` — état courant SRS (SM-2)

État **courant** uniquement — recalculé à chaque rating. Ne pas confondre avec `review_history`.

```sql
CREATE TABLE srs_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vocabulary_id UUID NOT NULL REFERENCES user_vocabulary(id),
  ease_factor FLOAT DEFAULT 2.5,      -- algorithme SM-2
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT now(),
  last_review_at TIMESTAMPTZ,
  last_quality INTEGER                -- 0-5, qualité SM-2 de la dernière révision
);
```

### `review_history` — historique permanent des réponses utilisateur

Migration : `supabase/migrations/003_review_history.sql`

```sql
CREATE TABLE review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vocabulary_id UUID NOT NULL REFERENCES user_vocabulary(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- **Rôle** : journal append-only des évaluations utilisateur
- **RLS** : via `user_vocabulary.user_id = auth.uid()`
- **Pipeline** : `POST /api/review/rate` → insert `review_history` → SM-2 → update `srs_reviews`
- **Ratings** : `again` (quality 1) | `hard` (3) | `good` (4) | `easy` (5)
- **Ne jamais supprimer** — base pour recalcul futur si l'algorithme change

---

### `user_progress` — progression par texte
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  text_id UUID NOT NULL REFERENCES texts(id),
  percent_read INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,    -- index de la dernière phrase lue
  words_encountered INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, text_id)
);
```

### `texts` — textes de la bibliothèque
```sql
CREATE TABLE texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,              -- texte russe complet
  content_annotated JSONB,            -- texte pré-annoté (phrases + mots + lemma_ids)
  level TEXT NOT NULL,               -- A1, A2, B1, B2, C1, C2
  collection TEXT,                   -- "everyday_russian", "stories", etc.
  word_count INTEGER,
  reading_time_minutes INTEGER,
  source TEXT DEFAULT 'curated',     -- 'curated' ou 'imported'
  user_id UUID REFERENCES users(id), -- null si texte officiel
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Migrations Supabase

| Fichier | Contenu |
|---------|---------|
| `001_initial_schema.sql` | Schéma initial (lemmas, explanation_cache, user_vocabulary, srs_reviews…) |
| `002_linguistic_knowledge.sql` | Knowledge Layer — table `linguistic_knowledge` |
| `003_review_history.sql` | Historique SRS — table `review_history` |
| `004_lesson_paths.sql` | Parcours et leçons — tables + seed parcours + leçon 1 |
| `005_lessons_fondations_2_3.sql` | Leçons Fondations 2–3 |
| `006_lesson_six_cas_1.sql` | Leçon Les six cas 1 |
| `007_lessons_six_cas_2_7.sql` | Leçons Les six cas 2–7 |
| `008_seed_library_texts.sql` | 5 textes bibliothèque A1 (accents + traductions phrase) |

Reconstruction complète : `npm run db:reset:local` (Docker) ou `supabase db push` sur projet vierge.
Vérification : `npm run db:verify`.
Scripts : `scripts/db-reset.sh`, `scripts/db-repair-remote-history.sh` (projet existant migré via SQL Editor).

---

## Orchestrateur Reader (contextuel)

Fichier : `src/lib/orchestrator/index.ts` → LLM : `src/lib/orchestrator/llm.ts`

```
ENTRÉE : { surface: string, sentence: string, textId?: string }

1. Calculer context_hash
2. Chercher dans explanation_cache
   → TROUVÉ : retourner (0 appel OpenAI)
   → PAS TROUVÉ : appeler OpenAI via llm.ts
3. Stocker dans explanation_cache (source='api')
4. Retourner l'explication contextuelle
```

**Question répondue** : « Pourquoi cette forme ici ? »

---

## Knowledge Builder (permanent)

Fichier : `src/lib/knowledge/build-knowledge.ts` → LLM : `src/lib/knowledge/generate-knowledge-llm.ts`

```
ENTRÉE : lemmaId

1. Fiche validated existe ? → retour DB (0 appel OpenAI)
2. Sinon → OpenAI → validation Zod → upsert linguistic_knowledge
3. Déclenché uniquement à la première ouverture d'une fiche Vocabulary
```

**Question répondue** : « Qu'est-ce que ce mot ? »

---

## Pipeline Review (SRS)

```
user_vocabulary → srs_reviews → Review Queue (/review)
  → Review Session (/review/session)
  → POST /api/review/rate
  → review_history (historique)
  → SM-2 (src/lib/utils/srs.ts)
  → srs_reviews (état courant)
```

---

## Règles absolues sur la base de données

- **Ne jamais modifier une migration existante** — toujours créer une nouvelle migration
- **Ne jamais supprimer de colonne** sans une migration de rollback prête
- **Toujours utiliser des UUID** comme clés primaires
- **RLS activé** sur toutes les tables utilisateur (`user_*`, `srs_reviews`, `review_history`)
- **Les tables de la base propriétaire** (`lemmas`, `word_forms`, `grammar_patterns`, `explanation_cache`, `linguistic_knowledge`) sont en lecture seule pour les clients — écriture uniquement via API Routes serveur (service role)
