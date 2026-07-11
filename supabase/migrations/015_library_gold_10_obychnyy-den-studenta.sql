-- ============================================
-- Bibliothèque V1 — Gold #10 : Обычный день студента
-- ============================================
-- Source : docs/reader/content/texts/10-obychnyy-den-studenta.json
-- Phénomène principal : consolidation (aucune nouvelle notion majeure)
-- Conclusion du fil narratif Anna & Louis
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
  'Обычный день студента',
  'Каждое у́тро Луи́ ра́но встаёт. Он пьёт ко́фе и ест хлеб. Пото́м он идёт в университе́т. А́нна уже́ ждёт его́ у вхо́да. Вме́сте они́ иду́т на уро́к ру́сского языка́. После заня́тий они́ иногда́ идут в кафе́. И́ногда они́ покупа́ют хлеб и молоко́ по доро́ге домо́й. Е́сли ну́жно, Луи́ уже́ мо́жет спроси́ть доро́гу. Он всё ещё изуча́ет ру́сский язы́к ка́ждый день. И ка́ждый день он понима́ет немно́го бо́льше. А́нна улыба́ется: — Ты де́лаешь большо́й прогре́сс. Луи́ то́же улыба́ется. Он зна́ет, что э́то то́лько нача́ло.',
  'A1',
  'everyday_russian',
  82,
  4,
  '{
    "sentences": [
      {"text": "Каждое у́тро Луи́ ра́но встаёт.", "translationFr": "Chaque matin, Louis se lève tôt."},
      {"text": "Он пьёт ко́фе и ест хлеб.", "translationFr": "Il boit un café et mange du pain."},
      {"text": "Пото́м он идёт в университе́т.", "translationFr": "Ensuite, il va à l''université."},
      {"text": "А́нна уже́ ждёт его́ у вхо́да.", "translationFr": "Anna l''attend déjà à l''entrée."},
      {"text": "Вме́сте они́ иду́т на уро́к ру́сского языка́.", "translationFr": "Ensemble, ils vont au cours de russe."},
      {"text": "После заня́тий они́ иногда́ идут в кафе́.", "translationFr": "Après les cours, ils vont parfois au café."},
      {"text": "И́ногда они́ покупа́ют хлеб и молоко́ по доро́ге домо́й.", "translationFr": "Parfois, ils achètent du pain et du lait sur le chemin du retour."},
      {"text": "Е́сли ну́жно, Луи́ уже́ мо́жет спроси́ть доро́гу.", "translationFr": "Si nécessaire, Louis peut maintenant demander son chemin."},
      {"text": "Он всё ещё изуча́ет ру́сский язы́к ка́ждый день.", "translationFr": "Il continue d''étudier le russe chaque jour."},
      {"text": "И ка́ждый день он понима́ет немно́го бо́льше.", "translationFr": "Et chaque jour, il comprend un peu plus."},
      {"text": "А́нна улыба́ется:", "translationFr": "Anna sourit :"},
      {"text": "— Ты де́лаешь большо́й прогре́сс.", "translationFr": "— Tu fais de grands progrès."},
      {"text": "Луи́ то́же улыба́ется.", "translationFr": "Louis sourit lui aussi."},
      {"text": "Он зна́ет, что э́то то́лько нача́ло.", "translationFr": "Il sait que ce n''est que le début."}
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
