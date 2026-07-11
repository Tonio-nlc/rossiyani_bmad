-- ============================================
-- Bibliothèque V1 — Gold #2 : В булочной
-- ============================================
-- Source : docs/reader/content/texts/02-v-bulochnoy.json
-- Phénomène principal : accusatif objet direct (купить хлеб)
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
  'В булочной',
  'После университета А́нна и Луи́ идут в булочную. В булочной па́хнет све́жим хлебом. — Что ты хо́чешь? — Я хочу́ ку́пить хлеб. — То́лько хлеб? — Нет, ещё молоко́. Продаве́ц улыба́ется. — Вот ваш хлеб и молоко́. Луи́ платит ка́ртой. — Спаси́бо! — Пожа́луйста! До свида́ния! Они́ выхо́дят из булочной и идут домо́й.',
  'A1',
  'everyday_russian',
  52,
  3,
  '{
    "sentences": [
      {"text": "После университета А́нна и Луи́ идут в булочную.", "translationFr": "Après l''université, Anna et Louis vont à la boulangerie."},
      {"text": "В булочной па́хнет све́жим хлебом.", "translationFr": "Dans la boulangerie, ça sent le pain frais."},
      {"text": "— Что ты хо́чешь?", "translationFr": "Qu''est-ce que tu veux ?"},
      {"text": "— Я хочу́ ку́пить хлеб.", "translationFr": "Je veux acheter du pain."},
      {"text": "— То́лько хлеб?", "translationFr": "Seulement du pain ?"},
      {"text": "— Нет, ещё молоко́.", "translationFr": "Non, aussi du lait."},
      {"text": "Продаве́ц улыба́ется.", "translationFr": "Le vendeur sourit."},
      {"text": "— Вот ваш хлеб и молоко́.", "translationFr": "Voici votre pain et votre lait."},
      {"text": "Луи́ платит ка́ртой.", "translationFr": "Louis paie par carte."},
      {"text": "— Спаси́бо!", "translationFr": "Merci !"},
      {"text": "— Пожа́луйста! До свида́ния!", "translationFr": "Je vous en prie ! Au revoir !"},
      {"text": "Они́ выхо́дят из булочной и идут домо́й.", "translationFr": "Ils sortent de la boulangerie et rentrent à la maison."}
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
