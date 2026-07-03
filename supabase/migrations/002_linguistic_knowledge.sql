-- ============================================
-- KNOWLEDGE LAYER — fiche linguistique par lemme
-- Partagée entre tous les utilisateurs
-- Écriture uniquement via API Routes avec service role
-- ============================================

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

CREATE INDEX idx_linguistic_knowledge_lemma ON linguistic_knowledge(lemma_id);

ALTER TABLE linguistic_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_linguistic_knowledge" ON linguistic_knowledge
  FOR SELECT TO authenticated USING (true);
