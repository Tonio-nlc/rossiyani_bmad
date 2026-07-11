-- ============================================
-- Bibliothèque V1 — Gold #1 : Первый день в университете
-- ============================================
-- Source : docs/reader/content/texts/01-pervyy-den-universitet.json
-- Prépare leçons futures : в университет / в университете, в аудитории
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
  'Первый день в университете',
  'Луи́ прихо́дит к университе́ту ра́но. А́нна уже́ там. — Приве́т, Луи́! — Приве́т, А́нна! — Ты идёшь в университе́т? — Да, у нас сейча́с уро́к ру́сского языка́. Они́ вхо́дят в университе́т вме́сте. В аудито́рии уже́ есть студе́нты. Преподава́тель улыба́ется и говори́т: — До́брое у́тро! Сади́тесь, пожа́луйста. Луи́ открыва́ет тетра́дь и начина́ет писа́ть. Он ду́мает: «Ру́сский язы́к тру́дный, но о́чень интере́сный.»',
  'A1',
  'everyday_russian',
  62,
  3,
  '{
    "sentences": [
      {"text": "Луи́ прихо́дит к университе́ту ра́но.", "translationFr": "Louis arrive tôt à l''université."},
      {"text": "А́нна уже́ там.", "translationFr": "Anna est déjà là."},
      {"text": "— Приве́т, Луи́!", "translationFr": "Salut, Louis !"},
      {"text": "— Приве́т, А́нна!", "translationFr": "Salut, Anna !"},
      {"text": "— Ты идёшь в университе́т?", "translationFr": "Tu vas à l''université ?"},
      {"text": "— Да, у нас сейча́с уро́к ру́сского языка́.", "translationFr": "Oui, nous avons un cours de russe maintenant."},
      {"text": "Они́ вхо́дят в университе́т вме́сте.", "translationFr": "Ils entrent ensemble dans l''université."},
      {"text": "В аудито́рии уже́ есть студе́нты.", "translationFr": "Dans la salle, il y a déjà des étudiants."},
      {"text": "Преподава́тель улыба́ется и говори́т:", "translationFr": "Le professeur sourit et dit :"},
      {"text": "— До́брое у́тро! Сади́тесь, пожа́луйста.", "translationFr": "Bonjour ! Asseyez-vous, s''il vous plaît."},
      {"text": "Луи́ открыва́ет тетра́дь и начина́ет писа́ть.", "translationFr": "Louis ouvre son cahier et commence à écrire."},
      {"text": "Он ду́мает:", "translationFr": "Il pense :"},
      {"text": "«Ру́сский язы́к тру́дный, но о́чень интере́сный.»", "translationFr": "«Le russe est difficile, mais très intéressant.»"}
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
