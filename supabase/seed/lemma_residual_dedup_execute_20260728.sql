-- ============================================================
-- EXECUTION -- nettoyage des doublons de lemmes residuels (PROMPT CURSOR 28/07/2026)
-- Genere automatiquement depuis le dry-run live : NE PAS EDITER A LA MAIN.
-- Regenerer avec : npx tsx scripts/lemma-residual-dedup-generate-execute-sql.ts
-- Genere le 2026-07-28T18:26:36.362Z
--
-- PREALABLE OBLIGATOIRE : backup manuel deja confirme par le fondateur
-- (scripts/db-backup-manual.sql).
--
-- Transaction UNIQUE : soit tout reussit, soit tout est annule. Les gardes
-- ci-dessous (blocs DO) font echouer toute la transaction -- sans rien
-- supprimer -- si une donnee personnelle ou un savoir serait perdu(e), ou si
-- la paire exclue (boleth vs boleth accentue different) n'est plus 2 lignes
-- distinctes (voir garde 0 ci-dessous).
-- Les FK (explanation_cache.lemma_id, user_vocabulary.lemma_id, sans
-- ON DELETE CASCADE) bloquent aussi nativement le DELETE final si un remap
-- avait ete oublie : filet de securite supplementaire independant.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 0. GARDE-FOU D'EXCLUSION -- abandon si бо́леть/боле́ть ne sont plus 2 lignes
--    distinctes (mots reellement differents, jamais fusionnes par ce script).
--    AUCUNE ligne de ce fichier ne touche a ces deux ids -- ce garde ne fait que
--    confirmer l'etat attendu avant de continuer.
-- ------------------------------------------------------------

do $$
declare
  v_count integer;
begin
  select count(distinct id) into v_count from lemmas where form in ('бо́леть', 'боле́ть');
  if v_count <> 2 then
    raise exception 'ABANDON : % et % doivent etre 2 lignes distinctes (mots differents) -- etat inattendu (% ligne(s) trouvee(s)), aucune ecriture effectuee', 'бо́леть', 'боле́ть', v_count;
  end if;
end $$;

-- ------------------------------------------------------------
-- 1. GARDES PAR GROUPE -- abandon (rollback) si l'etat live a diverge du
--    dry-run de reference, plutot que de risquer une perte de donnee.
-- ------------------------------------------------------------

-- bare-accent : "день" (6449090c-a770-4160-8709-2cc3cc7dfe35) -> "де́нь" (5612ff4e-41fc-43b9-90e4-2beb2c55524c)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35' and b.lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '6449090c-a770-4160-8709-2cc3cc7dfe35', '5612ff4e-41fc-43b9-90e4-2beb2c55524c';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '6449090c-a770-4160-8709-2cc3cc7dfe35', '5612ff4e-41fc-43b9-90e4-2beb2c55524c';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '6449090c-a770-4160-8709-2cc3cc7dfe35'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '6449090c-a770-4160-8709-2cc3cc7dfe35';
  end if;
end $$;

-- bare-accent : "язык" (ad714a7b-7be4-42aa-9a33-16d8546e34a5) -> "язы́к" (1825e807-cb6a-4bf0-aba3-3202852896fa)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5' and b.lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', 'ad714a7b-7be4-42aa-9a33-16d8546e34a5', '1825e807-cb6a-4bf0-aba3-3202852896fa';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', 'ad714a7b-7be4-42aa-9a33-16d8546e34a5', '1825e807-cb6a-4bf0-aba3-3202852896fa';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', 'ad714a7b-7be4-42aa-9a33-16d8546e34a5';
  end if;
end $$;

-- bare-accent : "они" (89041c6d-e9f5-499a-bac5-a6e5600d99dc) -> "они́" (3d85f081-b8ea-4d90-b9bf-21e596a15f3a)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc' and b.lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '89041c6d-e9f5-499a-bac5-a6e5600d99dc', '3d85f081-b8ea-4d90-b9bf-21e596a15f3a';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '89041c6d-e9f5-499a-bac5-a6e5600d99dc', '3d85f081-b8ea-4d90-b9bf-21e596a15f3a';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '89041c6d-e9f5-499a-bac5-a6e5600d99dc'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '89041c6d-e9f5-499a-bac5-a6e5600d99dc';
  end if;
end $$;

-- bare-accent : "каждый" (9b1b8cbe-85b5-49de-945e-518bd1796c53) -> "ка́ждый" (b9a9daf6-6c27-4125-8b01-e394876f5ed1)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53' and b.lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '9b1b8cbe-85b5-49de-945e-518bd1796c53', 'b9a9daf6-6c27-4125-8b01-e394876f5ed1';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '9b1b8cbe-85b5-49de-945e-518bd1796c53', 'b9a9daf6-6c27-4125-8b01-e394876f5ed1';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '9b1b8cbe-85b5-49de-945e-518bd1796c53'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '9b1b8cbe-85b5-49de-945e-518bd1796c53';
  end if;
end $$;

-- bare-accent : "кофе" (7817ebbc-e68d-444c-adec-ebe6a0adad46) -> "ко́фе" (b66a2de0-018f-4695-9db0-df4ce5a63038)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46' and b.lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '7817ebbc-e68d-444c-adec-ebe6a0adad46', 'b66a2de0-018f-4695-9db0-df4ce5a63038';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '7817ebbc-e68d-444c-adec-ebe6a0adad46', 'b66a2de0-018f-4695-9db0-df4ce5a63038';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '7817ebbc-e68d-444c-adec-ebe6a0adad46'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '7817ebbc-e68d-444c-adec-ebe6a0adad46';
  end if;
end $$;

-- bare-accent : "суп" (4a2ec642-c8ad-476e-a64a-562a64677f76) -> "су́п" (a948831a-69b4-454e-a475-9a86e37ae449)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76' and b.lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '4a2ec642-c8ad-476e-a64a-562a64677f76', 'a948831a-69b4-454e-a475-9a86e37ae449';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '4a2ec642-c8ad-476e-a64a-562a64677f76', 'a948831a-69b4-454e-a475-9a86e37ae449';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '4a2ec642-c8ad-476e-a64a-562a64677f76'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '4a2ec642-c8ad-476e-a64a-562a64677f76';
  end if;
end $$;

-- bare-accent : "Олег" (67b2a6ff-ab87-4354-b95f-27a2e5a799db) -> "Оле́г" (97403c75-efec-4e84-8362-4a0b93702bf7)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db' and b.lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '67b2a6ff-ab87-4354-b95f-27a2e5a799db', '97403c75-efec-4e84-8362-4a0b93702bf7';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '67b2a6ff-ab87-4354-b95f-27a2e5a799db', '97403c75-efec-4e84-8362-4a0b93702bf7';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '67b2a6ff-ab87-4354-b95f-27a2e5a799db'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '67b2a6ff-ab87-4354-b95f-27a2e5a799db';
  end if;
end $$;

-- bare-accent : "Луи" (4e91cf38-8e91-4fca-8aa8-90bf4723ebc0) -> "Луи́" (c369ba8d-1211-4163-9620-2fa448726f57)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0' and b.lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0', 'c369ba8d-1211-4163-9620-2fa448726f57';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0', 'c369ba8d-1211-4163-9620-2fa448726f57';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0';
  end if;
end $$;

-- bare-accent : "уже" (8d7c38d5-8544-47e2-adb9-d05daecff01a) -> "уже́" (2b177685-2be8-401e-90ad-bb9c4d56fa57)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a' and b.lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '8d7c38d5-8544-47e2-adb9-d05daecff01a', '2b177685-2be8-401e-90ad-bb9c4d56fa57';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '8d7c38d5-8544-47e2-adb9-d05daecff01a', '2b177685-2be8-401e-90ad-bb9c4d56fa57';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '8d7c38d5-8544-47e2-adb9-d05daecff01a'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '8d7c38d5-8544-47e2-adb9-d05daecff01a';
  end if;
end $$;

-- bare-accent : "после" (ce542be7-2711-4ff5-8fbf-b86ca8e314d8) -> "по́сле" (efd9a35d-9fa1-4634-88f2-8571b1e26258)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8' and b.lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8', 'efd9a35d-9fa1-4634-88f2-8571b1e26258';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8', 'efd9a35d-9fa1-4634-88f2-8571b1e26258';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8';
  end if;
end $$;

-- bare-accent : "я" (d0258cc0-3071-4d2c-9019-9ca3df769290) -> "я́" (61ff3872-3321-4b4d-8f0c-ce8a35d83fde)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290' and b.lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', 'd0258cc0-3071-4d2c-9019-9ca3df769290', '61ff3872-3321-4b4d-8f0c-ce8a35d83fde';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', 'd0258cc0-3071-4d2c-9019-9ca3df769290', '61ff3872-3321-4b4d-8f0c-ce8a35d83fde';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = 'd0258cc0-3071-4d2c-9019-9ca3df769290'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', 'd0258cc0-3071-4d2c-9019-9ca3df769290';
  end if;
end $$;

-- bare-accent : "пить" (4c734772-c882-4390-a779-462c25463386) -> "пи́ть" (d05f363b-6c78-4f5b-9ff0-31b5342cc2a7)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '4c734772-c882-4390-a779-462c25463386' and b.lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '4c734772-c882-4390-a779-462c25463386', 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '4c734772-c882-4390-a779-462c25463386')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '4c734772-c882-4390-a779-462c25463386', 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '4c734772-c882-4390-a779-462c25463386'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '4c734772-c882-4390-a779-462c25463386';
  end if;
end $$;

-- accent-correction : "дума́ть" (b769020e-68a1-47ea-a966-58d326a09599) -> "ду́мать" (fa1bac55-b856-4eb9-859b-1f32e42e470b)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599' and b.lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', 'b769020e-68a1-47ea-a966-58d326a09599', 'fa1bac55-b856-4eb9-859b-1f32e42e470b';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', 'b769020e-68a1-47ea-a966-58d326a09599', 'fa1bac55-b856-4eb9-859b-1f32e42e470b';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = 'b769020e-68a1-47ea-a966-58d326a09599'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', 'b769020e-68a1-47ea-a966-58d326a09599';
  end if;
end $$;

-- accent-correction : "у́рок" (4caeb40c-0c09-4cd1-8135-d9b73ba0a344) -> "уро́к" (3b050e8b-8021-4353-b2c0-3d80ba2da509)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344' and b.lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', '4caeb40c-0c09-4cd1-8135-d9b73ba0a344', '3b050e8b-8021-4353-b2c0-3d80ba2da509';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '4caeb40c-0c09-4cd1-8135-d9b73ba0a344', '3b050e8b-8021-4353-b2c0-3d80ba2da509';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', '4caeb40c-0c09-4cd1-8135-d9b73ba0a344';
  end if;
end $$;

-- accent-correction : "до́мой" (c22888aa-602d-4cfc-aa57-2369015290b8) -> "домо́й" (b450a8a5-37b2-409c-81df-10f0767554c9)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8' and b.lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', 'c22888aa-602d-4cfc-aa57-2369015290b8', 'b450a8a5-37b2-409c-81df-10f0767554c9';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', 'c22888aa-602d-4cfc-aa57-2369015290b8', 'b450a8a5-37b2-409c-81df-10f0767554c9';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = 'c22888aa-602d-4cfc-aa57-2369015290b8'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', 'c22888aa-602d-4cfc-aa57-2369015290b8';
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. REMAP DES REFERENCES -- doublon -> lemme conserve
--    (delete-then-update sur les tables avec contrainte UNIQUE incluant
--    lemma_id, pour eviter une erreur de contrainte si l'utilisateur/mot a
--    deja une ligne cote lemme conserve.)
-- ------------------------------------------------------------

-- "день" -> "де́нь"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c' where lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35' and k.lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c' where lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35' and k.lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c' where lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35' and k.lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '5612ff4e-41fc-43b9-90e4-2beb2c55524c' where lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35';

-- "язык" -> "язы́к"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa' where lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5' and k.lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa' where lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5' and k.lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa' where lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5' and k.lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '1825e807-cb6a-4bf0-aba3-3202852896fa' where lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5';

-- "они" -> "они́"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a' where lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc' and k.lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a' where lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc' and k.lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a' where lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc' and k.lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '3d85f081-b8ea-4d90-b9bf-21e596a15f3a' where lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc';

-- "каждый" -> "ка́ждый"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1' where lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53' and k.lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1' where lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53' and k.lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1' where lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53' and k.lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'b9a9daf6-6c27-4125-8b01-e394876f5ed1' where lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53';

-- "кофе" -> "ко́фе"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038' where lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46' and k.lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038' where lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46' and k.lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038' where lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46' and k.lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'b66a2de0-018f-4695-9db0-df4ce5a63038' where lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46';

-- "суп" -> "су́п"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449' where lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76' and k.lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449' where lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76' and k.lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449' where lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76' and k.lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'a948831a-69b4-454e-a475-9a86e37ae449' where lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76';

-- "Олег" -> "Оле́г"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7' where lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db' and k.lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7' where lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db' and k.lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7' where lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db' and k.lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '97403c75-efec-4e84-8362-4a0b93702bf7' where lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db';

-- "Луи" -> "Луи́"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57' where lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0' and k.lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57' where lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0' and k.lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57' where lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0' and k.lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'c369ba8d-1211-4163-9620-2fa448726f57' where lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0';

-- "уже" -> "уже́"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57' where lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a' and k.lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57' where lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a' and k.lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57' where lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a' and k.lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '2b177685-2be8-401e-90ad-bb9c4d56fa57' where lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a';

-- "после" -> "по́сле"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258' where lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8' and k.lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258' where lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8' and k.lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258' where lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8' and k.lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'efd9a35d-9fa1-4634-88f2-8571b1e26258' where lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8';

-- "я" -> "я́"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde' where lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290' and k.lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde' where lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290' and k.lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde' where lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290' and k.lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '61ff3872-3321-4b4d-8f0c-ce8a35d83fde' where lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290';

-- "пить" -> "пи́ть"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7' where lemma_id = '4c734772-c882-4390-a779-462c25463386';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '4c734772-c882-4390-a779-462c25463386' and k.lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7' where lemma_id = '4c734772-c882-4390-a779-462c25463386';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '4c734772-c882-4390-a779-462c25463386' and k.lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7' where lemma_id = '4c734772-c882-4390-a779-462c25463386';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '4c734772-c882-4390-a779-462c25463386' and k.lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'd05f363b-6c78-4f5b-9ff0-31b5342cc2a7' where lemma_id = '4c734772-c882-4390-a779-462c25463386';

-- "дума́ть" -> "ду́мать"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b' where lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599' and k.lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b' where lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599' and k.lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b' where lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599' and k.lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'fa1bac55-b856-4eb9-859b-1f32e42e470b' where lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599';

-- "у́рок" -> "уро́к"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509' where lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344' and k.lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509' where lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344' and k.lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509' where lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344' and k.lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '3b050e8b-8021-4353-b2c0-3d80ba2da509' where lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344';

-- "до́мой" -> "домо́й"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9' where lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8' and k.lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9' where lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8' and k.lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9' where lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8' and k.lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'b450a8a5-37b2-409c-81df-10f0767554c9' where lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8';

-- ------------------------------------------------------------
-- 3. linguistic_knowledge : MIGRATION (si le conserve n'en a pas) OU
--    SUPPRESSION du doublon (si le conserve a deja la sienne).
-- ------------------------------------------------------------

delete from linguistic_knowledge where lemma_id = '6449090c-a770-4160-8709-2cc3cc7dfe35'; -- "день"
delete from linguistic_knowledge where lemma_id = 'ad714a7b-7be4-42aa-9a33-16d8546e34a5'; -- "язык"
delete from linguistic_knowledge where lemma_id = '89041c6d-e9f5-499a-bac5-a6e5600d99dc'; -- "они"
delete from linguistic_knowledge where lemma_id = '9b1b8cbe-85b5-49de-945e-518bd1796c53'; -- "каждый"
delete from linguistic_knowledge where lemma_id = '7817ebbc-e68d-444c-adec-ebe6a0adad46'; -- "кофе"
delete from linguistic_knowledge where lemma_id = '4a2ec642-c8ad-476e-a64a-562a64677f76'; -- "суп"
delete from linguistic_knowledge where lemma_id = '67b2a6ff-ab87-4354-b95f-27a2e5a799db'; -- "Олег"
delete from linguistic_knowledge where lemma_id = '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0'; -- "Луи"
delete from linguistic_knowledge where lemma_id = '8d7c38d5-8544-47e2-adb9-d05daecff01a'; -- "уже"
delete from linguistic_knowledge where lemma_id = 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8'; -- "после"
delete from linguistic_knowledge where lemma_id = 'd0258cc0-3071-4d2c-9019-9ca3df769290'; -- "я"
delete from linguistic_knowledge where lemma_id = '4c734772-c882-4390-a779-462c25463386'; -- "пить"
delete from linguistic_knowledge where lemma_id = 'b769020e-68a1-47ea-a966-58d326a09599'; -- "дума́ть"
delete from linguistic_knowledge where lemma_id = '4caeb40c-0c09-4cd1-8135-d9b73ba0a344'; -- "у́рок"
delete from linguistic_knowledge where lemma_id = 'c22888aa-602d-4cfc-aa57-2369015290b8'; -- "до́мой"

-- ------------------------------------------------------------
-- 4. SUPPRESSION DES LEMMES DOUBLONS
--    Aucun renommage necessaire dans ce lot : chaque lemme conserve porte
--    deja sa forme finale correcte (accentuee) en base. Si une reference
--    avait ete oubliee plus haut, les FK explanation_cache.lemma_id /
--    user_vocabulary.lemma_id -- sans ON DELETE CASCADE -- bloquent ce DELETE
--    et annulent toute la transaction : aucune suppression partielle possible.
-- ------------------------------------------------------------

delete from lemmas where id in ('6449090c-a770-4160-8709-2cc3cc7dfe35', 'ad714a7b-7be4-42aa-9a33-16d8546e34a5', '89041c6d-e9f5-499a-bac5-a6e5600d99dc', '9b1b8cbe-85b5-49de-945e-518bd1796c53', '7817ebbc-e68d-444c-adec-ebe6a0adad46', '4a2ec642-c8ad-476e-a64a-562a64677f76', '67b2a6ff-ab87-4354-b95f-27a2e5a799db', '4e91cf38-8e91-4fca-8aa8-90bf4723ebc0', '8d7c38d5-8544-47e2-adb9-d05daecff01a', 'ce542be7-2711-4ff5-8fbf-b86ca8e314d8', 'd0258cc0-3071-4d2c-9019-9ca3df769290', '4c734772-c882-4390-a779-462c25463386', 'b769020e-68a1-47ea-a966-58d326a09599', '4caeb40c-0c09-4cd1-8135-d9b73ba0a344', 'c22888aa-602d-4cfc-aa57-2369015290b8');

commit;

-- ============================================================
-- VERIFICATION POST-EXECUTION -- a lancer juste apres le commit ci-dessus
-- ============================================================

-- 1. Comptes globaux (comparer aux comptes AVANT, voir rapport dry-run)
select 'lemmas' as table_name, count(*) from lemmas
union all select 'explanation_cache', count(*) from explanation_cache
union all select 'word_forms', count(*) from word_forms
union all select 'linguistic_knowledge', count(*) from linguistic_knowledge
union all select 'lemma_concept_links', count(*) from lemma_concept_links
union all select 'user_vocabulary', count(*) from user_vocabulary
union all select 'srs_reviews', count(*) from srs_reviews
union all select 'review_history', count(*) from review_history;

-- 2. Doublons "forme nue / forme accentuee" restants : doit renvoyer 0 ligne.
--    ⚠️ Contrairement a un simple regroupement par forme desaccentuee (qui
--    fusionnerait a tort des paires comme бо́леть/боле́ть), cette requete ne
--    signale QUE les groupes qui melangent une forme SANS accent et une forme
--    AVEC accent -- deux formes accentuees a des positions differentes ne sont
--    JAMAIS signalees ici (voir requete 3 pour les distinguer explicitement).
with base as (
  select
    form,
    replace(form, chr(769), '') as form_unaccented,
    (strpos(form, chr(769)) > 0) as has_accent
  from lemmas
)
select form_unaccented, array_agg(form order by has_accent, form) as forms
from base
group by form_unaccented
having count(*) filter (where not has_accent) > 0
   and count(distinct form) filter (where has_accent) > 0;

-- 3. Confirmation explicite : боле́ть et бо́леть doivent TOUJOURS etre 2 lignes
--    distinctes (mots differents, jamais fusionnes). Doit renvoyer 2 lignes.
select id, form from lemmas where form in ('бо́леть', 'боле́ть');

-- 4. Lemmes orphelins / references pendantes : doit renvoyer 0 ligne sur les 4 requetes
select ec.id, ec.lemma_id from explanation_cache ec
left join lemmas l on l.id = ec.lemma_id where l.id is null;

select uv.id, uv.lemma_id from user_vocabulary uv
left join lemmas l on l.id = uv.lemma_id where l.id is null;

select wf.id, wf.lemma_id from word_forms wf
left join lemmas l on l.id = wf.lemma_id where l.id is null;

select lcl.id, lcl.lemma_id from lemma_concept_links lcl
left join lemmas l on l.id = lcl.lemma_id where l.id is null;
