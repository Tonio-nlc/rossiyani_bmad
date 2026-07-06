-- ============================================
-- LESSON PATHS & LESSONS — contenu pédagogique structuré
-- lesson_paths / lessons : lecture authentifiée
-- user_lesson_progress : RLS utilisateur
-- ============================================

CREATE TABLE lesson_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level_range TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES lesson_paths(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(path_id, slug)
);

CREATE TABLE user_lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_lesson_paths_order ON lesson_paths(order_index);
CREATE INDEX idx_lessons_path_order ON lessons(path_id, order_index);
CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);

ALTER TABLE lesson_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_lesson_paths" ON lesson_paths
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_lessons" ON lessons
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_own_lesson_progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SEED — 5 parcours + 1 leçon complète
-- ============================================

INSERT INTO lesson_paths (slug, title, description, level_range, color, order_index) VALUES
  (
    'fondations-du-russe',
    'Fondations du russe',
    'Comprendre pourquoi le russe change les formes des mots — avant d''apprendre les étiquettes grammaticales.',
    'A1',
    '#4F46E5',
    1
  ),
  (
    'les-six-cas',
    'Les six cas',
    'Les six façons dont un nom peut se comporter dans une phrase — toujours expliquées par le rôle du mot.',
    'A1-B2',
    '#EF7C5A',
    2
  ),
  (
    'verbes-et-aspect',
    'Verbes & aspect',
    'Perfectif et imperfectif : deux manières de voir l''action, pas deux temps à mémoriser.',
    'A2-B2',
    '#22C55E',
    3
  ),
  (
    'russe-du-quotidien',
    'Russe du quotidien',
    'Situations concrètes — métro, courses, conversations — pour relier la grammaire à la vie réelle.',
    'A1-B1',
    '#F59E0B',
    4
  ),
  (
    'culture-et-civilisation',
    'Culture & civilisation',
    'Contexte historique et culturel pour donner du sens à ce que vous lisez.',
    'Tous niveaux',
    '#A78BFA',
    5
  );

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'pourquoi-les-mots-changent-de-terminaison',
  'Pourquoi les mots russes changent de terminaison',
  1,
  '[
    {
      "type": "paragraph",
      "text": "En français, l''ordre des mots indique souvent qui fait quoi : « Marie voit Pierre ». En russe, c''est souvent la terminaison du mot qui porte cette information — le mot peut se déplacer dans la phrase sans changer le sens fondamental."
    },
    {
      "type": "example",
      "russian": "Са́ша идёт на рабо́ту пешко́м.",
      "translation": "Sacha va au travail à pied.",
      "words": [
        { "text": "рабо́ту", "role": "place" }
      ],
      "note": "рабо́ту (travail) se termine en -у : le russe marque ici la direction du mouvement, le lieu vers lequel Sacha se rend — pas seulement le mot « travail » isolé."
    },
    {
      "type": "callout",
      "text": "Une terminaison n''est pas une étiquette grammaticale abstraite : elle dit ce que le mot fait dans cette phrase précise."
    },
    {
      "type": "example",
      "russian": "Са́ша идёт на рабо́ту пешко́м.",
      "translation": "Sacha va au travail à pied.",
      "words": [
        { "text": "Са́ша", "role": "subject" }
      ],
      "note": "Са́ша est le sujet : c''est lui qui marche. En russe, le sujet est souvent reconnaissable à sa forme de base — ici le prénom à la forme nominative."
    },
    {
      "type": "paragraph",
      "text": "Ce n''est qu''un aperçu. Le parcours « Les six cas » explore systématiquement chaque rôle que peuvent jouer les mots — toujours avec des exemples tirés de phrases réelles."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'fondations-du-russe';
