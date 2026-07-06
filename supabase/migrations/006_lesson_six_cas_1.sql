-- ============================================
-- Les six cas — leçon 1
-- ============================================
-- Accents toniques en NFC (о́, ы́, etc.) pour compatibilité LessonExampleSentence.
-- Idempotence : ON CONFLICT (path_id, slug) DO NOTHING.

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'pourquoi-les-cas',
  'Pourquoi le russe a des cas (et le français non)',
  1,
  '[
    {
      "type": "paragraph",
      "text": "En français, c''est l''ordre des mots qui indique leur rôle dans la phrase : « Le chat mange la souris » n''a pas le même sens que « La souris mange le chat ». En russe, le rôle d''un mot est porté par sa terminaison, pas par sa position. C''est ce qu''on appelle un cas."
    },
    {
      "type": "example",
      "russian": "Ко́шка ест мы́шку.",
      "translation": "Le chat mange la souris.",
      "words": [
        { "text": "Ко́шка", "role": "subject" },
        { "text": "ест", "role": null },
        { "text": "мы́шку", "role": "object" }
      ],
      "note": "« ко́шка » porte la terminaison du sujet (nominatif), « мы́шку » porte celle de l''objet direct (accusatif). C''est cette terminaison, pas la position dans la phrase, qui dit qui mange qui."
    },
    {
      "type": "example",
      "russian": "Мы́шку ест ко́шка.",
      "translation": "Le chat mange la souris.",
      "words": [
        { "text": "Мы́шку", "role": "object" },
        { "text": "ест", "role": null },
        { "text": "ко́шка", "role": "subject" }
      ],
      "note": "Même sens exact que la phrase précédente, alors que l''ordre des mots est inversé. En russe, on peut réorganiser une phrase librement sans en changer le sens, parce que les terminaisons portent l''information, pas la position."
    },
    {
      "type": "callout",
      "text": "Un cas, ce n''est rien d''autre qu''une terminaison qui répond à la question « quel est le rôle de ce mot ici ? » — sujet, objet, lieu, destinataire, possession... Le russe en a six."
    },
    {
      "type": "paragraph",
      "text": "Tu as déjà croisé plusieurs de ces rôles dans le parcours Fondations, à travers les couleurs fonctionnelles de Rossiyani : bleu pour le sujet, corail pour l''objet direct, vert pour le lieu, violet pour la possession, ambre pour le destinataire. Chaque couleur correspond en réalité à un cas grammatical russe. Ce parcours va te montrer, cas par cas, comment reconnaître leurs terminaisons et pourquoi elles prennent cette forme précise."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;
