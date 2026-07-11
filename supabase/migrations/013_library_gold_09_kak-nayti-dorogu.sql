-- ============================================
-- Bibliothèque V1 — Gold #9 : Как найти дорогу?
-- ============================================
-- Source : docs/reader/content/texts/09-kak-nayti-dorogu.json
-- Phénomène principal : mouvement + indications de direction
-- Suite narrative : après В булочной
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
  'Как найти дорогу?',
  'После булочной Луи́ хочет пойти́ в библиоте́ку. Но он не зна́ет, где она́. Он спра́шивает прохо́жего: — Извини́те, где библиоте́ка? — Иди́те пря́мо. — Пото́м поверни́те напра́во. — Библиоте́ка бу́дет сле́ва. — Спаси́бо большо́е! — Не за что. Луи́ находи́т библиоте́ку без пробле́м. А́нна уже́ ждёт его́ внутри́. — Ты бы́стро нашёл доро́гу!',
  'A1',
  'travel',
  48,
  2,
  '{
    "sentences": [
      {"text": "После булочной Луи́ хочет пойти́ в библиоте́ку.", "translationFr": "Après la boulangerie, Louis veut aller à la bibliothèque."},
      {"text": "Но он не зна́ет, где она́.", "translationFr": "Mais il ne sait pas où elle est."},
      {"text": "Он спра́шивает прохо́жего:", "translationFr": "Il demande à un passant :"},
      {"text": "— Извини́те, где библиоте́ка?", "translationFr": "Excusez-moi, où est la bibliothèque ?"},
      {"text": "— Иди́те пря́мо.", "translationFr": "Allez tout droit."},
      {"text": "— Пото́м поверни́те напра́во.", "translationFr": "Ensuite, tournez à droite."},
      {"text": "— Библиоте́ка бу́дет сле́ва.", "translationFr": "La bibliothèque sera sur votre gauche."},
      {"text": "— Спаси́бо большо́е!", "translationFr": "Merci beaucoup !"},
      {"text": "— Не за что.", "translationFr": "De rien."},
      {"text": "Луи́ находи́т библиоте́ку без пробле́м.", "translationFr": "Louis trouve la bibliothèque sans problème."},
      {"text": "А́нна уже́ ждёт его́ внутри́.", "translationFr": "Anna l''attend déjà à l''intérieur."},
      {"text": "— Ты бы́стро нашёл доро́гу!", "translationFr": "Tu as trouvé ton chemin rapidement !"}
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
