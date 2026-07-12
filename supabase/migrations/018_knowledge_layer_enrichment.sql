-- ============================================
-- KNOWLEDGE LAYER ENRICHMENT — profil linguistique structuré (RC-016)
-- Couches : morphologie, syntaxe, sémantique, pédagogie, paradigmes
-- Les colonnes historiques restent pour compatibilité ascendante.
-- ============================================

ALTER TABLE linguistic_knowledge
  ADD COLUMN IF NOT EXISTS morphology JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS syntax JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS semantics JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pedagogy JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS paradigms JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_version INTEGER NOT NULL DEFAULT 1;
