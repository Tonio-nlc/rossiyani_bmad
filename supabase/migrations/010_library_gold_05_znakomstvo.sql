-- ============================================
-- Bibliothèque V1 — Gold #5 : Знакомство
-- ============================================
-- Source : docs/reader/content/texts/05-znakomstvo.json
-- Charte : docs/reader/CHARTE_EDITORIALE.md
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
  'Знакомство',
  '— Привет! — Привет! Меня́ зову́т А́нна. А тебя́? — Меня́ зову́т Луи́. — О́чень прия́тно! — Мне то́же. — Ты францу́з? — Да, я францу́з. А ты ру́сская? — Да, я из Москвы́. — Ты говори́шь по-францу́зски? — Нет, но я изуча́ю францу́зский. — А я изуча́ю ру́сский. — Тогда́ уда́чи нам!',
  'A1',
  'dialogues',
  48,
  2,
  '{
    "sentences": [
      {"text": "— Привет!", "translationFr": "Salut !"},
      {"text": "— Привет! Меня́ зову́т А́нна. А тебя́?", "translationFr": "Salut ! Je m''appelle Anna. Et toi ?"},
      {"text": "— Меня́ зову́т Луи́.", "translationFr": "Je m''appelle Louis."},
      {"text": "— О́чень прия́тно!", "translationFr": "Enchantée !"},
      {"text": "— Мне то́же.", "translationFr": "Moi aussi."},
      {"text": "— Ты францу́з?", "translationFr": "Tu es français ?"},
      {"text": "— Да, я францу́з. А ты ру́сская?", "translationFr": "Oui, je suis français. Et toi, tu es russe ?"},
      {"text": "— Да, я из Москвы́.", "translationFr": "Oui, je viens de Moscou."},
      {"text": "— Ты говори́шь по-францу́зски?", "translationFr": "Tu parles français ?"},
      {"text": "— Нет, но я изуча́ю францу́зский.", "translationFr": "Non, mais j''apprends le français."},
      {"text": "— А я изуча́ю ру́сский.", "translationFr": "Et moi, j''apprends le russe."},
      {"text": "— Тогда́ уда́чи нам!", "translationFr": "Alors, bonne chance à nous !"}
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
