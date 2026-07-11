-- ============================================
-- Story 4.2 — Import : schéma, RLS, contraintes, index
-- ============================================
-- Propriétaire des imports : texts.imported_by (pas de colonne owner séparée)
-- Limites alignées sur docs/import/CONCEPTION_V1.md
-- Idempotent où possible (DROP IF EXISTS avant CREATE)

-- ---------------------------------------------------------------------------
-- 1. Normaliser les données existantes (curated seed)
-- ---------------------------------------------------------------------------

UPDATE texts
SET source = 'curated'
WHERE source IS NULL;

UPDATE texts
SET imported_by = NULL
WHERE source = 'curated' AND imported_by IS NOT NULL;

ALTER TABLE texts
  ALTER COLUMN source SET DEFAULT 'curated';

ALTER TABLE texts
  ALTER COLUMN source SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Index titre : curated global, imports par propriétaire
-- ---------------------------------------------------------------------------

DROP INDEX IF EXISTS texts_title_unique;

CREATE UNIQUE INDEX IF NOT EXISTS texts_curated_title_unique
  ON texts (title)
  WHERE source = 'curated';

CREATE UNIQUE INDEX IF NOT EXISTS texts_imported_title_owner_unique
  ON texts (imported_by, title)
  WHERE source = 'imported';

-- ---------------------------------------------------------------------------
-- 3. Contraintes d'intégrité
-- ---------------------------------------------------------------------------

ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_source_check;
ALTER TABLE texts
  ADD CONSTRAINT texts_source_check
  CHECK (source IN ('curated', 'imported'));

ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_source_owner_check;
ALTER TABLE texts
  ADD CONSTRAINT texts_source_owner_check
  CHECK (
    (source = 'curated' AND imported_by IS NULL)
    OR (source = 'imported' AND imported_by IS NOT NULL)
  );

ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_imported_collection_check;
ALTER TABLE texts
  ADD CONSTRAINT texts_imported_collection_check
  CHECK (
    source = 'curated'
    OR (source = 'imported' AND collection = 'imported')
  );

ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_imported_word_count_check;
ALTER TABLE texts
  ADD CONSTRAINT texts_imported_word_count_check
  CHECK (
    source = 'curated'
    OR (
      word_count IS NOT NULL
      AND word_count >= 30
      AND word_count <= 15000
    )
  );

ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_imported_content_length_check;
ALTER TABLE texts
  ADD CONSTRAINT texts_imported_content_length_check
  CHECK (
    source = 'curated'
    OR char_length(content) <= 500000
  );

ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_title_length_check;
ALTER TABLE texts
  ADD CONSTRAINT texts_title_length_check
  CHECK (char_length(title) BETWEEN 1 AND 120);

-- ---------------------------------------------------------------------------
-- 4. Triggers — quota, quota journalier, phrases, immutabilité propriétaire
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION enforce_import_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  total_imports INTEGER;
  daily_imports INTEGER;
  sentence_count INTEGER;
BEGIN
  IF NEW.source <> 'imported' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*)::INTEGER
    INTO total_imports
    FROM texts
    WHERE source = 'imported'
      AND imported_by = NEW.imported_by;

    IF total_imports >= 20 THEN
      RAISE EXCEPTION 'import_quota_exceeded'
        USING HINT = 'Maximum 20 imported texts per user.';
    END IF;

    SELECT COUNT(*)::INTEGER
    INTO daily_imports
    FROM texts
    WHERE source = 'imported'
      AND imported_by = NEW.imported_by
      AND created_at >= (NOW() - INTERVAL '1 day');

    IF daily_imports >= 5 THEN
      RAISE EXCEPTION 'import_daily_limit_exceeded'
        USING HINT = 'Maximum 5 imports per day.';
    END IF;
  END IF;

  IF NEW.content_annotated IS NOT NULL
     AND jsonb_typeof(NEW.content_annotated -> 'sentences') = 'array' THEN
    sentence_count := jsonb_array_length(NEW.content_annotated -> 'sentences');

    IF sentence_count > 500 THEN
      RAISE EXCEPTION 'import_sentence_limit_exceeded'
        USING HINT = 'Maximum 500 sentences per imported text.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_import_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.source = 'imported' THEN
    IF NEW.source <> 'imported' OR NEW.imported_by <> OLD.imported_by THEN
      RAISE EXCEPTION 'import_ownership_immutable'
        USING HINT = 'Cannot change owner or source of an imported text.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_texts_enforce_import_limits ON texts;
CREATE TRIGGER trg_texts_enforce_import_limits
  BEFORE INSERT OR UPDATE ON texts
  FOR EACH ROW
  EXECUTE FUNCTION enforce_import_limits();

DROP TRIGGER IF EXISTS trg_texts_prevent_import_mutation ON texts;
CREATE TRIGGER trg_texts_prevent_import_mutation
  BEFORE UPDATE ON texts
  FOR EACH ROW
  EXECUTE FUNCTION prevent_import_mutation();

-- ---------------------------------------------------------------------------
-- 5. Indexation Library / imports
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_texts_source
  ON texts (source);

CREATE INDEX IF NOT EXISTS idx_texts_imported_by
  ON texts (imported_by)
  WHERE source = 'imported';

CREATE INDEX IF NOT EXISTS idx_texts_imported_library
  ON texts (imported_by, created_at DESC)
  WHERE source = 'imported';

CREATE INDEX IF NOT EXISTS idx_texts_curated_library
  ON texts (level, collection)
  WHERE source = 'curated';

CREATE INDEX IF NOT EXISTS idx_texts_title_lower
  ON texts (lower(title));

-- ---------------------------------------------------------------------------
-- 6. RLS — curated publics (auth), imports privés
-- ---------------------------------------------------------------------------

ALTER TABLE texts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_texts" ON texts;

CREATE POLICY "texts_select_curated_or_own_imports"
  ON texts
  FOR SELECT
  TO authenticated
  USING (
    source = 'curated'
    OR imported_by = auth.uid()
  );

CREATE POLICY "texts_insert_own_imports"
  ON texts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    source = 'imported'
    AND imported_by = auth.uid()
  );

CREATE POLICY "texts_update_own_imports"
  ON texts
  FOR UPDATE
  TO authenticated
  USING (
    source = 'imported'
    AND imported_by = auth.uid()
  )
  WITH CHECK (
    source = 'imported'
    AND imported_by = auth.uid()
  );

CREATE POLICY "texts_delete_own_imports"
  ON texts
  FOR DELETE
  TO authenticated
  USING (
    source = 'imported'
    AND imported_by = auth.uid()
  );

-- curated : INSERT/UPDATE/DELETE réservés au service role (migrations / admin)

COMMENT ON COLUMN texts.imported_by IS
  'Propriétaire d''un texte importé (auth.users.id). NULL pour source=curated.';

COMMENT ON COLUMN texts.source IS
  'curated = bibliothèque Rossiyani | imported = texte privé utilisateur';
