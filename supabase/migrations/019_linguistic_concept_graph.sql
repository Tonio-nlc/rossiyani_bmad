-- ============================================
-- RC-025 — Linguistic Concept Graph
-- Le savoir appartient aux concepts, pas aux lemmes
-- ============================================

CREATE TABLE linguistic_concepts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'A1',
  summary TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_linguistic_concepts_category ON linguistic_concepts(category);
CREATE INDEX idx_linguistic_concepts_slug ON linguistic_concepts(slug);

CREATE TABLE concept_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_concept_id TEXT NOT NULL REFERENCES linguistic_concepts(id) ON DELETE CASCADE,
  to_concept_id TEXT NOT NULL REFERENCES linguistic_concepts(id) ON DELETE CASCADE,
  relation TEXT NOT NULL CHECK (relation IN ('prerequisite', 'related', 'extends')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_concept_id, to_concept_id, relation)
);

CREATE INDEX idx_concept_relations_from ON concept_relations(from_concept_id);
CREATE INDEX idx_concept_relations_to ON concept_relations(to_concept_id);

CREATE TABLE lemma_concept_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES linguistic_concepts(id) ON DELETE CASCADE,
  weight TEXT NOT NULL CHECK (weight IN ('primary', 'secondary', 'advanced')),
  signal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lemma_id, concept_id)
);

CREATE INDEX idx_lemma_concept_links_lemma ON lemma_concept_links(lemma_id);
CREATE INDEX idx_lemma_concept_links_concept ON lemma_concept_links(concept_id);

ALTER TABLE linguistic_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lemma_concept_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_linguistic_concepts" ON linguistic_concepts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_concept_relations" ON concept_relations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_lemma_concept_links" ON lemma_concept_links
  FOR SELECT TO authenticated USING (true);
