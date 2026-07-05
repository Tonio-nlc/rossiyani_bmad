-- ============================================
-- REVIEW HISTORY — réponses utilisateur (SRS story 3.4)
-- RLS activé — une entrée par évaluation
-- ============================================

CREATE TABLE review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vocabulary_id UUID NOT NULL REFERENCES user_vocabulary(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_history_user_vocabulary ON review_history(user_vocabulary_id);
CREATE INDEX idx_review_history_created_at ON review_history(created_at);

ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_review_history" ON review_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_vocabulary uv
      WHERE uv.id = review_history.user_vocabulary_id
      AND uv.user_id = auth.uid()
    )
  );
