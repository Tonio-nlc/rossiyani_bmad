-- Scénario d'enseignement personnalisé par mot enregistré
-- (principe partagé du concept + démonstration/bridge du lemme + forme rencontrée)

ALTER TABLE user_vocabulary
  ADD COLUMN IF NOT EXISTS teaching_scenario JSONB;

COMMENT ON COLUMN user_vocabulary.teaching_scenario IS
  'Scénario composé à l''enregistrement : démonstration + bridge du lemme (pas le principe du concept).';
