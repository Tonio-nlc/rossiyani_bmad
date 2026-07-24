-- ============================================
-- RC-025 — Linguistic Concept Graph
-- Le savoir appartient aux concepts, pas aux lemmes
--
-- À appliquer MANUELLEMENT via le SQL Editor Supabase
-- (pas de `supabase db push` sur ce projet).
--
-- Ordre : 1) ce fichier 019  2) puis 021_seed_linguistic_concept_graph.sql
-- ============================================

CREATE TABLE IF NOT EXISTS linguistic_concepts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'A1',
  summary TEXT NOT NULL DEFAULT '',
  -- Contenu riche (coreIdea, whyItExists, mentalModel, visualModel,
  -- canonicalExplanation, teachingScenario, commonMistakes, relatedConcepts,
  -- relatedLemmas, examples, progression, teacherNotes) — miroir de TLinguisticConcept
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Statut éditorial pour relecture professeur
  validation_status TEXT NOT NULL DEFAULT 'a-valider'
    CHECK (validation_status IN ('brouillon', 'a-valider', 'valide')),
  -- Dérivé pratique : true ssi validation_status = 'valide'
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linguistic_concepts_category
  ON linguistic_concepts(category);
CREATE INDEX IF NOT EXISTS idx_linguistic_concepts_slug
  ON linguistic_concepts(slug);
CREATE INDEX IF NOT EXISTS idx_linguistic_concepts_validation_status
  ON linguistic_concepts(validation_status);

CREATE TABLE IF NOT EXISTS concept_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_concept_id TEXT NOT NULL REFERENCES linguistic_concepts(id) ON DELETE CASCADE,
  to_concept_id TEXT NOT NULL REFERENCES linguistic_concepts(id) ON DELETE CASCADE,
  relation TEXT NOT NULL CHECK (relation IN ('prerequisite', 'related', 'extends')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_concept_id, to_concept_id, relation)
);

CREATE INDEX IF NOT EXISTS idx_concept_relations_from
  ON concept_relations(from_concept_id);
CREATE INDEX IF NOT EXISTS idx_concept_relations_to
  ON concept_relations(to_concept_id);

CREATE TABLE IF NOT EXISTS lemma_concept_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES linguistic_concepts(id) ON DELETE CASCADE,
  weight TEXT NOT NULL CHECK (weight IN ('primary', 'secondary', 'advanced')),
  signal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lemma_id, concept_id)
);

CREATE INDEX IF NOT EXISTS idx_lemma_concept_links_lemma
  ON lemma_concept_links(lemma_id);
CREATE INDEX IF NOT EXISTS idx_lemma_concept_links_concept
  ON lemma_concept_links(concept_id);

ALTER TABLE linguistic_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lemma_concept_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_linguistic_concepts" ON linguistic_concepts;
CREATE POLICY "authenticated_read_linguistic_concepts" ON linguistic_concepts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_concept_relations" ON concept_relations;
CREATE POLICY "authenticated_read_concept_relations" ON concept_relations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_read_lemma_concept_links" ON lemma_concept_links;
CREATE POLICY "authenticated_read_lemma_concept_links" ON lemma_concept_links
  FOR SELECT TO authenticated USING (true);

-- Si une ancienne 019 sans validation_status a déjà été appliquée :
ALTER TABLE linguistic_concepts
  ADD COLUMN IF NOT EXISTS validation_status TEXT NOT NULL DEFAULT 'a-valider';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'linguistic_concepts_validation_status_check'
  ) THEN
    ALTER TABLE linguistic_concepts
      ADD CONSTRAINT linguistic_concepts_validation_status_check
      CHECK (validation_status IN ('brouillon', 'a-valider', 'valide'));
  END IF;
END $$;
