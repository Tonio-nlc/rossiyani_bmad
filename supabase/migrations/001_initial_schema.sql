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
