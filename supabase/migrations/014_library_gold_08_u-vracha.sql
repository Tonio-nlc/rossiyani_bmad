-- ============================================
-- Bibliothèque V1 — Gold #8 : У врача
-- ============================================
-- Source : docs/reader/content/texts/08-u-vracha.json
-- Phénomène principal : exprimer un état (j'ai mal, je me sens...)
-- Suite narrative : lendemain de Как найти дорогу?
-- Idempotent : ON CONFLICT (title) DO UPDATE

INSERT INTO texts (
  title,
  content,
  level,
  collection,
  word_count,
  reading_time_minutes,
  content_annotated
) VALUES (
  'У врача',
  'На сле́дующий день Луи́ чу́вствует себя́ плохо́. У него́ боли́т го́рло. А́нна говори́т: — Пойдём к врачу́. Врач улыба́ется и спрашива́ет: — Что случи́лось? — У меня́ боли́т го́рло и немно́го боли́т голова́. Врач осма́тривает Луи́. — Ничего́ серьёзного. — Вам ну́жно отдыха́ть и пить больше воды́. — Спаси́бо, до свида́ния! Через два дня Луи́ уже́ чу́вствует себя́ хорошо́.',
  'A1',
  'everyday_russian',
  50,
  2,
  '{
    "sentences": [
      {"text": "На сле́дующий день Луи́ чу́вствует себя́ плохо́.", "translationFr": "Le lendemain, Louis ne se sent pas bien."},
      {"text": "У него́ боли́т го́рло.", "translationFr": "Il a mal à la gorge."},
      {"text": "А́нна говори́т:", "translationFr": "Anna dit :"},
      {"text": "— Пойдём к врачу́.", "translationFr": "— Allons chez le médecin."},
      {"text": "Врач улыба́ется и спрашива́ет:", "translationFr": "Le médecin sourit et demande :"},
      {"text": "— Что случи́лось?", "translationFr": "— Que s''est-il passé ?"},
      {"text": "— У меня́ боли́т го́рло и немно́го боли́т голова́.", "translationFr": "— J''ai mal à la gorge et un peu mal à la tête."},
      {"text": "Врач осма́тривает Луи́.", "translationFr": "Le médecin examine Louis."},
      {"text": "— Ничего́ серьёзного.", "translationFr": "— Rien de grave."},
      {"text": "— Вам ну́жно отдыха́ть и пить больше воды́.", "translationFr": "— Vous devez vous reposer et boire plus d''eau."},
      {"text": "— Спаси́бо, до свида́ния!", "translationFr": "— Merci, au revoir !"},
      {"text": "Через два дня Луи́ уже́ чу́вствует себя́ хорошо́.", "translationFr": "Deux jours plus tard, Louis se sent déjà bien."}
    ]
  }'::jsonb
)
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  level = EXCLUDED.level,
  collection = EXCLUDED.collection,
  word_count = EXCLUDED.word_count,
  reading_time_minutes = EXCLUDED.reading_time_minutes,
  content_annotated = EXCLUDED.content_annotated;
