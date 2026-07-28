-- ============================================================
-- EXECUTION -- dedup des lemmes (PROMPT CURSOR 27/07/2026)
-- Genere automatiquement depuis le dry-run live : NE PAS EDITER A LA MAIN.
-- Regenerer avec : npx tsx scripts/lemma-dedup-generate-execute-sql.ts
-- Genere le 2026-07-28T10:29:59.803Z
--
-- PREALABLE OBLIGATOIRE : supabase/seed/lemma_dedup_backup_20260727.sql
-- doit deja avoir ete execute et verifie (comptes backup = comptes live).
--
-- Transaction UNIQUE : soit tout reussit, soit tout est annule. Les gardes
-- ci-dessous (blocs DO) font echouer toute la transaction -- sans rien
-- supprimer -- si une donnee personnelle ou un savoir serait perdu(e).
-- Les FK (explanation_cache.lemma_id, user_vocabulary.lemma_id, sans
-- ON DELETE CASCADE) bloquent aussi nativement le DELETE final si un remap
-- avait ete oublie : filet de securite supplementaire independant.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 0. GARDE-FOUS -- abandon (rollback) si l'etat live a diverge du dry-run
--    de reference, plutot que de risquer une perte de donnee.
-- ------------------------------------------------------------

-- Garde вагон : "вагон" (568bf0a3-08ed-4cd0-a984-829315f05c5a) -> "ваго́н" (f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a' and b.lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise avant dedup, aucune donnee personnelle supprimee', '568bf0a3-08ed-4cd0-a984-829315f05c5a', 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '568bf0a3-08ed-4cd0-a984-829315f05c5a', 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '568bf0a3-08ed-4cd0-a984-829315f05c5a'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant dedup (hors perimetre de ce script)', '568bf0a3-08ed-4cd0-a984-829315f05c5a';
  end if;
end $$;

-- Garde читать : "читать" (6b92f2ef-5179-41e9-9cf7-f1e868919c59) -> "чита́ть" (81772f4b-3be2-4b6e-a809-03ffaaa26f0b)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59' and b.lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise avant dedup, aucune donnee personnelle supprimee', '6b92f2ef-5179-41e9-9cf7-f1e868919c59', '81772f4b-3be2-4b6e-a809-03ffaaa26f0b';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '6b92f2ef-5179-41e9-9cf7-f1e868919c59', '81772f4b-3be2-4b6e-a809-03ffaaa26f0b';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '6b92f2ef-5179-41e9-9cf7-f1e868919c59'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant dedup (hors perimetre de ce script)', '6b92f2ef-5179-41e9-9cf7-f1e868919c59';
  end if;
end $$;

-- Garde анна : "Анна" (68c2a23e-891b-4c75-b187-f4454e37e733) -> "А́нна" (99b45cd6-19ef-4866-8945-9b7461c77323)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733' and b.lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise avant dedup, aucune donnee personnelle supprimee', '68c2a23e-891b-4c75-b187-f4454e37e733', '99b45cd6-19ef-4866-8945-9b7461c77323';
  end if;

  -- '68c2a23e-891b-4c75-b187-f4454e37e733' porte la seule linguistic_knowledge du groupe : migree (UPDATE) vers '99b45cd6-19ef-4866-8945-9b7461c77323' en section 2, pas de garde de perte ici.

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '68c2a23e-891b-4c75-b187-f4454e37e733'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant dedup (hors perimetre de ce script)', '68c2a23e-891b-4c75-b187-f4454e37e733';
  end if;
end $$;

-- Garde человек : "человек" (e1759615-d365-4a26-8d4e-0fb068327e75) -> "челове́к" (d10ed22b-8562-4cdb-a424-33c94ead2dec)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75' and b.lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise avant dedup, aucune donnee personnelle supprimee', 'e1759615-d365-4a26-8d4e-0fb068327e75', 'd10ed22b-8562-4cdb-a424-33c94ead2dec';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', 'e1759615-d365-4a26-8d4e-0fb068327e75', 'd10ed22b-8562-4cdb-a424-33c94ead2dec';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = 'e1759615-d365-4a26-8d4e-0fb068327e75'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant dedup (hors perimetre de ce script)', 'e1759615-d365-4a26-8d4e-0fb068327e75';
  end if;
end $$;

-- Garde дорога : "дорога" (214abe48-e15f-4d41-a8a2-24f9ceaa3427) -> "дорога́" (e1221f82-6abc-4968-8c0e-04da3873b066)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427' and b.lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise avant dedup, aucune donnee personnelle supprimee', '214abe48-e15f-4d41-a8a2-24f9ceaa3427', 'e1221f82-6abc-4968-8c0e-04da3873b066';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427')
     and not exists (select 1 from linguistic_knowledge where lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '214abe48-e15f-4d41-a8a2-24f9ceaa3427', 'e1221f82-6abc-4968-8c0e-04da3873b066';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '214abe48-e15f-4d41-a8a2-24f9ceaa3427'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant dedup (hors perimetre de ce script)', '214abe48-e15f-4d41-a8a2-24f9ceaa3427';
  end if;
end $$;

-- Garde идити→идти : "иди́ти" (0a82c80e-1622-48a7-b933-748e73abd509) -> "идти́" (2359b010-21b8-4cd4-b60c-0c38d7ba369f)
do $$
begin
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509' and b.lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f'
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise avant dedup, aucune donnee personnelle supprimee', '0a82c80e-1622-48a7-b933-748e73abd509', '2359b010-21b8-4cd4-b60c-0c38d7ba369f';
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509')
     and not exists (select 1 from linguistic_knowledge where lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f') then
    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', '0a82c80e-1622-48a7-b933-748e73abd509', '2359b010-21b8-4cd4-b60c-0c38d7ba369f';
  end if;

  if exists (
    select 1 from texts,
    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = '0a82c80e-1622-48a7-b933-748e73abd509'
  ) then
    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant dedup (hors perimetre de ce script)', '0a82c80e-1622-48a7-b933-748e73abd509';
  end if;
end $$;

-- ------------------------------------------------------------
-- 1. REMAP DES REFERENCES -- doublon -> lemme conserve
--    (dedup-safe : sur les tables avec contrainte UNIQUE incluant
--    lemma_id, on supprime d'abord le doublon en collision avec une
--    ligne deja existante cote lemme conserve, pour eviter une erreur
--    de contrainte -- jamais l'inverse.)
-- ------------------------------------------------------------

-- вагон : "вагон" -> "ваго́н"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d' where lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a' and k.lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d' where lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a' and k.lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d' where lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a' and k.lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d' where lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a';

-- читать : "читать" -> "чита́ть"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b' where lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59' and k.lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b' where lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59' and k.lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b' where lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59' and k.lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '81772f4b-3be2-4b6e-a809-03ffaaa26f0b' where lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59';

-- анна : "Анна" -> "А́нна"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323' where lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733' and k.lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323' where lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733' and k.lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323' where lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733' and k.lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323' where lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733';

-- человек : "человек" -> "челове́к"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec' where lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75' and k.lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec' where lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75' and k.lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec' where lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75' and k.lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'd10ed22b-8562-4cdb-a424-33c94ead2dec' where lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75';

-- дорога : "дорога" -> "дорога́"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066' where lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427' and k.lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066' where lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427' and k.lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066' where lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427' and k.lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = 'e1221f82-6abc-4968-8c0e-04da3873b066' where lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427';

-- идити→идти : "иди́ти" -> "идти́"
-- explanation_cache (pas de contrainte unique sur lemma_id seul)
update explanation_cache set lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f' where lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509';

-- word_forms (UNIQUE(lemma_id, surface, functional_role))
delete from word_forms d
using word_forms k
where d.lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509' and k.lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f' and k.surface = d.surface and k.functional_role = d.functional_role;
update word_forms set lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f' where lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509';

-- lemma_concept_links (UNIQUE(lemma_id, concept_id))
delete from lemma_concept_links d
using lemma_concept_links k
where d.lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509' and k.lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f' and k.concept_id = d.concept_id;
update lemma_concept_links set lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f' where lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509';

-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)
delete from user_vocabulary d
using user_vocabulary k
where d.lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509' and k.lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f' and k.user_id = d.user_id;
update user_vocabulary set lemma_id = '2359b010-21b8-4cd4-b60c-0c38d7ba369f' where lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509';

-- ------------------------------------------------------------
-- 2. linguistic_knowledge : MIGRATION (si le conserve n'en a pas) OU SUPPRESSION
--    des doublons (si le conserve a deja la sienne, jamais de perte de savoir).
-- ------------------------------------------------------------

delete from linguistic_knowledge where lemma_id = '568bf0a3-08ed-4cd0-a984-829315f05c5a'; -- вагон : "вагон"
delete from linguistic_knowledge where lemma_id = '6b92f2ef-5179-41e9-9cf7-f1e868919c59'; -- читать : "читать"
update linguistic_knowledge set lemma_id = '99b45cd6-19ef-4866-8945-9b7461c77323', updated_at = now() where lemma_id = '68c2a23e-891b-4c75-b187-f4454e37e733'; -- анна : migration savoir depuis "Анна" (le conserve n'en avait pas)
delete from linguistic_knowledge where lemma_id = 'e1759615-d365-4a26-8d4e-0fb068327e75'; -- человек : "человек"
delete from linguistic_knowledge where lemma_id = '214abe48-e15f-4d41-a8a2-24f9ceaa3427'; -- дорога : "дорога"
delete from linguistic_knowledge where lemma_id = '0a82c80e-1622-48a7-b933-748e73abd509'; -- идити→идти : "иди́ти"

-- ------------------------------------------------------------
-- 3. SUPPRESSION DES LEMMES DOUBLONS
--    (fait AVANT le renommage ci-dessous : garantit qu'aucun rename ne peut
--    entrer en collision avec une ligne sur le point d'etre supprimee.
--    Si une reference avait ete oubliee plus haut, les FK
--    explanation_cache.lemma_id / user_vocabulary.lemma_id -- sans
--    ON DELETE CASCADE -- bloquent ce DELETE et annulent toute la
--    transaction : aucune suppression partielle possible.)
-- ------------------------------------------------------------

delete from lemmas where id in ('568bf0a3-08ed-4cd0-a984-829315f05c5a', '6b92f2ef-5179-41e9-9cf7-f1e868919c59', '68c2a23e-891b-4c75-b187-f4454e37e733', 'e1759615-d365-4a26-8d4e-0fb068327e75', '214abe48-e15f-4d41-a8a2-24f9ceaa3427', '0a82c80e-1622-48a7-b933-748e73abd509');

-- ------------------------------------------------------------
-- 4. RENOMMAGE DE LA FORME CANONIQUE (accent NFC) DU LEMME CONSERVE
--    Garde generique : n'est genere QUE quand aucune autre ligne du groupe ne
--    porte deja la forme cible (cf. resolveKeepAndDrop dans compute-groups.ts) ;
--    le check ci-dessous re-verifie l'etat live juste avant, au cas ou une ligne
--    hors-groupe occuperait deja cette forme (garde generique demandee).
-- ------------------------------------------------------------

-- здораваться→здороваться : rename vers "здоро́ваться"
do $$
begin
  if exists (select 1 from lemmas where form = 'здоро́ваться' and id <> '15bb79a5-3666-4018-bc30-1b2e4e689c7a') then
    raise exception 'ABANDON : forme cible % deja portee par une autre ligne -- fusion requise, pas de rename (garde generique)', 'здоро́ваться';
  end if;

  update lemmas set form = 'здоро́ваться', updated_at = now() where id = '15bb79a5-3666-4018-bc30-1b2e4e689c7a';
end $$;

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

-- 2. Doublons restants (meme forme sans l'accent tonique U+0301) : doit renvoyer 0 ligne
-- (l'accent cyrillique est une lettre combinante U+0301, sans forme precomposee :
--  NFC et NFD sont donc identiques ici, il suffit de retirer chr(769) puis lower())
select lower(replace(form, chr(769), '')) as normalized, count(*), array_agg(form) as forms
from lemmas
group by 1
having count(*) > 1;

-- 3. Lemmes orphelins / references pendantes : doit renvoyer 0 ligne sur les 4 requetes
select ec.id, ec.lemma_id from explanation_cache ec
left join lemmas l on l.id = ec.lemma_id where l.id is null;

select uv.id, uv.lemma_id from user_vocabulary uv
left join lemmas l on l.id = uv.lemma_id where l.id is null;

select wf.id, wf.lemma_id from word_forms wf
left join lemmas l on l.id = wf.lemma_id where l.id is null;

select lcl.id, lcl.lemma_id from lemma_concept_links lcl
left join lemmas l on l.id = lcl.lemma_id where l.id is null;
