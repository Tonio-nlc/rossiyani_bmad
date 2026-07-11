-- ============================================
-- [PARCOURS] — [Titre court de la leçon]
-- ============================================
-- Pipeline : docs/lessons/PIPELINE.md
-- Checklist : docs/lessons/CHECKLIST.md
-- Idempotence : ON CONFLICT (path_id, slug) DO NOTHING

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'mon-slug-de-lecon',                    -- kebab-case, unique dans le parcours
  'Pourquoi в школу mais в школе ?',      -- Question de départ (= title)
  8,                                       -- order_index dans le parcours
  '[
    {
      "type": "paragraph",
      "text": "Intuition : explication simple sans jargon."
    },
    {
      "type": "example",
      "russian": "Он идёт в шко́лу.",
      "translation": "Il va à l''école.",
      "words": [
        { "text": "Он", "role": "subject" },
        { "text": "идёт", "role": null },
        { "text": "в", "role": null },
        { "text": "шко́лу", "role": "place" }
      ],
      "note": "Explication de ce qui se passe dans cette phrase précise."
    },
    {
      "type": "paragraph",
      "text": "Explication détaillée : le pourquoi avant la règle."
    },
    {
      "type": "takeaways",
      "items": [
        "Première idée clé.",
        "Deuxième idée clé.",
        "Troisième idée clé."
      ]
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'              -- slug du parcours cible
ON CONFLICT (path_id, slug) DO NOTHING;
