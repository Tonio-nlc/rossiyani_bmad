-- ============================================================
-- FUSION accents — 10 doublons public.lemmas (Phase B)
-- Comptes attendus = Phase A 2026-08-22 (lecture seule).
-- N'EXÉCUTER QU'APRÈS backup. Ne PAS lancer en automatique.
--
-- Choix : UN fichier, DIX transactions BEGIN/COMMIT distinctes.
-- Pourquoi : une paire qui échoue (compte diverge) n'annule pas
-- les fusions déjà commit ; Mario peut rejouer la suite à la main.
-- Orphelins (интересный, проблема, темно) = DELETE simple + garde 0 deps.
--
-- Ordre rewire : linguistic_knowledge → explanation_cache → user_vocabulary
-- (word_forms / lemma_concept_links : 0 attendu, inclus par prudence).
-- LK sur DROP (болеть, себя) : REWIRE obligatoire, jamais DELETE.
-- ============================================================


-- ------------------------------------------------------------
-- 1/10  бо́леть → боле́ть
-- KEEP ec=1 uv=0 lcl=0 wf=0 lk=0 | DROP ec=1 uv=1 lcl=0 wf=0 lk=1
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_k int; v_uv_k int; v_lcl_k int; v_wf_k int; v_lk_k int;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'боле́ть';
  select id into v_drop from lemmas where form = 'бо́леть';

  if v_keep is null then
    raise exception 'ABANDON болеть : KEEP боле́ть absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP болеть : DROP бо́леть déjà absent';
    return;
  end if;

  select count(*) into v_ec_k  from explanation_cache where lemma_id = v_keep;
  select count(*) into v_uv_k  from user_vocabulary where lemma_id = v_keep;
  select count(*) into v_lcl_k from lemma_concept_links where lemma_id = v_keep;
  select count(*) into v_wf_k  from word_forms where lemma_id = v_keep;
  select count(*) into v_lk_k  from linguistic_knowledge where lemma_id = v_keep;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT болеть KEEP=% DROP=% | K ec=% uv=% lcl=% wf=% lk=% | D ec=% uv=% lcl=% wf=% lk=%',
    v_keep, v_drop, v_ec_k, v_uv_k, v_lcl_k, v_wf_k, v_lk_k,
    v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_k <> 1 or v_uv_k <> 0 or v_lcl_k <> 0 or v_wf_k <> 0 or v_lk_k <> 0
     or v_ec_d <> 1 or v_uv_d <> 1 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 1 then
    raise exception 'ABANDON болеть : comptes ≠ Phase A';
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_drop and b.lemma_id = v_keep
  ) then
    raise exception 'ABANDON болеть : conflit UNIQUE(user_id, lemma_id)';
  end if;

  -- LK sur DROP uniquement → rewire (ne pas supprimer)
  if v_lk_d > 0 then
    if v_lk_k > 0 then
      raise exception 'ABANDON болеть : LK des deux côtés';
    end if;
    update linguistic_knowledge set lemma_id = v_keep where lemma_id = v_drop;
  end if;

  update explanation_cache set lemma_id = v_keep where lemma_id = v_drop;
  update user_vocabulary set lemma_id = v_keep where lemma_id = v_drop;

  update word_forms set lemma_id = v_keep where lemma_id = v_drop;
  update lemma_concept_links set lemma_id = v_keep where lemma_id = v_drop;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_drop::text
  ) then
    raise exception 'ABANDON болеть : texts.content_annotated référence encore le DROP';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'FUSION болеть : бо́леть → боле́ть (keep=%)', v_keep;
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'болеть' order by form;
select count(*) as lk_on_keep from linguistic_knowledge lk
  join lemmas l on l.id = lk.lemma_id where l.form = 'боле́ть';

commit;


-- ------------------------------------------------------------
-- 2/10  дума́ть → ду́мать
-- KEEP ec=1 uv=0 lcl=0 wf=0 lk=0 | DROP ec=1 uv=0 lcl=0 wf=0 lk=0
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_k int; v_uv_k int; v_lcl_k int; v_wf_k int; v_lk_k int;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'ду́мать';
  select id into v_drop from lemmas where form = 'дума́ть';

  if v_keep is null then
    raise exception 'ABANDON думать : KEEP ду́мать absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP думать : DROP дума́ть déjà absent';
    return;
  end if;

  select count(*) into v_ec_k  from explanation_cache where lemma_id = v_keep;
  select count(*) into v_uv_k  from user_vocabulary where lemma_id = v_keep;
  select count(*) into v_lcl_k from lemma_concept_links where lemma_id = v_keep;
  select count(*) into v_wf_k  from word_forms where lemma_id = v_keep;
  select count(*) into v_lk_k  from linguistic_knowledge where lemma_id = v_keep;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT думать KEEP=% DROP=% | K ec=% uv=% lcl=% wf=% lk=% | D ec=% uv=% lcl=% wf=% lk=%',
    v_keep, v_drop, v_ec_k, v_uv_k, v_lcl_k, v_wf_k, v_lk_k,
    v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_k <> 1 or v_uv_k <> 0 or v_lcl_k <> 0 or v_wf_k <> 0 or v_lk_k <> 0
     or v_ec_d <> 1 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON думать : comptes ≠ Phase A';
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_drop and b.lemma_id = v_keep
  ) then
    raise exception 'ABANDON думать : conflit UNIQUE(user_id, lemma_id)';
  end if;

  if v_lk_d > 0 then
    if v_lk_k > 0 then
      raise exception 'ABANDON думать : LK des deux côtés';
    end if;
    update linguistic_knowledge set lemma_id = v_keep where lemma_id = v_drop;
  end if;

  update explanation_cache set lemma_id = v_keep where lemma_id = v_drop;
  update user_vocabulary set lemma_id = v_keep where lemma_id = v_drop;
  update word_forms set lemma_id = v_keep where lemma_id = v_drop;
  update lemma_concept_links set lemma_id = v_keep where lemma_id = v_drop;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_drop::text
  ) then
    raise exception 'ABANDON думать : texts.content_annotated référence encore le DROP';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'FUSION думать : дума́ть → ду́мать (keep=%)', v_keep;
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'думать' order by form;

commit;


-- ------------------------------------------------------------
-- 3/10  и́дти → идти́
-- KEEP ec=11 uv=0 lcl=0 wf=0 lk=1 | DROP ec=1 uv=0 lcl=0 wf=0 lk=0
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_k int; v_uv_k int; v_lcl_k int; v_wf_k int; v_lk_k int;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'идти́';
  select id into v_drop from lemmas where form = 'и́дти';

  if v_keep is null then
    raise exception 'ABANDON идти : KEEP идти́ absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP идти : DROP и́дти déjà absent';
    return;
  end if;

  select count(*) into v_ec_k  from explanation_cache where lemma_id = v_keep;
  select count(*) into v_uv_k  from user_vocabulary where lemma_id = v_keep;
  select count(*) into v_lcl_k from lemma_concept_links where lemma_id = v_keep;
  select count(*) into v_wf_k  from word_forms where lemma_id = v_keep;
  select count(*) into v_lk_k  from linguistic_knowledge where lemma_id = v_keep;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT идти KEEP=% DROP=% | K ec=% uv=% lcl=% wf=% lk=% | D ec=% uv=% lcl=% wf=% lk=%',
    v_keep, v_drop, v_ec_k, v_uv_k, v_lcl_k, v_wf_k, v_lk_k,
    v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_k <> 11 or v_uv_k <> 0 or v_lcl_k <> 0 or v_wf_k <> 0 or v_lk_k <> 1
     or v_ec_d <> 1 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON идти : comptes ≠ Phase A';
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_drop and b.lemma_id = v_keep
  ) then
    raise exception 'ABANDON идти : conflit UNIQUE(user_id, lemma_id)';
  end if;

  if v_lk_d > 0 then
    if v_lk_k > 0 then
      raise exception 'ABANDON идти : LK des deux côtés';
    end if;
    update linguistic_knowledge set lemma_id = v_keep where lemma_id = v_drop;
  end if;

  update explanation_cache set lemma_id = v_keep where lemma_id = v_drop;
  update user_vocabulary set lemma_id = v_keep where lemma_id = v_drop;
  update word_forms set lemma_id = v_keep where lemma_id = v_drop;
  update lemma_concept_links set lemma_id = v_keep where lemma_id = v_drop;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_drop::text
  ) then
    raise exception 'ABANDON идти : texts.content_annotated référence encore le DROP';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'FUSION идти : и́дти → идти́ (keep=%)', v_keep;
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'идти' order by form;

commit;


-- ------------------------------------------------------------
-- 4/10  и́нтересный → интере́сный  (DROP orphelin)
-- KEEP ec=1 | DROP 0 partout
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'интере́сный';
  select id into v_drop from lemmas where form = 'и́нтересный';

  if v_keep is null then
    raise exception 'ABANDON интересный : KEEP интере́сный absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP интересный : DROP и́нтересный déjà absent';
    return;
  end if;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT интересный (orphelin) DROP=% | ec=% uv=% lcl=% wf=% lk=%',
    v_drop, v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_d <> 0 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON интересный : DROP n''est pas orphelin (deps ≠ 0)';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'DELETE orphelin и́нтересный';
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'интересный' order by form;

commit;


-- ------------------------------------------------------------
-- 5/10  моло́дой → молодо́й
-- KEEP ec=1 uv=0 lcl=0 wf=0 lk=1 | DROP ec=1 uv=0 lcl=0 wf=0 lk=0
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_k int; v_uv_k int; v_lcl_k int; v_wf_k int; v_lk_k int;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'молодо́й';
  select id into v_drop from lemmas where form = 'моло́дой';

  if v_keep is null then
    raise exception 'ABANDON молодой : KEEP молодо́й absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP молодой : DROP моло́дой déjà absent';
    return;
  end if;

  select count(*) into v_ec_k  from explanation_cache where lemma_id = v_keep;
  select count(*) into v_uv_k  from user_vocabulary where lemma_id = v_keep;
  select count(*) into v_lcl_k from lemma_concept_links where lemma_id = v_keep;
  select count(*) into v_wf_k  from word_forms where lemma_id = v_keep;
  select count(*) into v_lk_k  from linguistic_knowledge where lemma_id = v_keep;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT молодой KEEP=% DROP=% | K ec=% uv=% lcl=% wf=% lk=% | D ec=% uv=% lcl=% wf=% lk=%',
    v_keep, v_drop, v_ec_k, v_uv_k, v_lcl_k, v_wf_k, v_lk_k,
    v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_k <> 1 or v_uv_k <> 0 or v_lcl_k <> 0 or v_wf_k <> 0 or v_lk_k <> 1
     or v_ec_d <> 1 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON молодой : comptes ≠ Phase A';
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_drop and b.lemma_id = v_keep
  ) then
    raise exception 'ABANDON молодой : conflit UNIQUE(user_id, lemma_id)';
  end if;

  if v_lk_d > 0 then
    if v_lk_k > 0 then
      raise exception 'ABANDON молодой : LK des deux côtés';
    end if;
    update linguistic_knowledge set lemma_id = v_keep where lemma_id = v_drop;
  end if;

  update explanation_cache set lemma_id = v_keep where lemma_id = v_drop;
  update user_vocabulary set lemma_id = v_keep where lemma_id = v_drop;
  update word_forms set lemma_id = v_keep where lemma_id = v_drop;
  update lemma_concept_links set lemma_id = v_keep where lemma_id = v_drop;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_drop::text
  ) then
    raise exception 'ABANDON молодой : texts.content_annotated référence encore le DROP';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'FUSION молодой : моло́дой → молодо́й (keep=%)', v_keep;
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'молодой' order by form;

commit;


-- ------------------------------------------------------------
-- 6/10  моло́ко → молоко́
-- KEEP ec=4 uv=0 lcl=0 wf=0 lk=1 | DROP ec=1 uv=0 lcl=0 wf=0 lk=0
-- Note : EC DROP a lemmaStressed=молоко́ (correct) → pas de purge prose.
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_k int; v_uv_k int; v_lcl_k int; v_wf_k int; v_lk_k int;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'молоко́';
  select id into v_drop from lemmas where form = 'моло́ко';

  if v_keep is null then
    raise exception 'ABANDON молоко : KEEP молоко́ absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP молоко : DROP моло́ко déjà absent';
    return;
  end if;

  select count(*) into v_ec_k  from explanation_cache where lemma_id = v_keep;
  select count(*) into v_uv_k  from user_vocabulary where lemma_id = v_keep;
  select count(*) into v_lcl_k from lemma_concept_links where lemma_id = v_keep;
  select count(*) into v_wf_k  from word_forms where lemma_id = v_keep;
  select count(*) into v_lk_k  from linguistic_knowledge where lemma_id = v_keep;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT молоко KEEP=% DROP=% | K ec=% uv=% lcl=% wf=% lk=% | D ec=% uv=% lcl=% wf=% lk=%',
    v_keep, v_drop, v_ec_k, v_uv_k, v_lcl_k, v_wf_k, v_lk_k,
    v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_k <> 4 or v_uv_k <> 0 or v_lcl_k <> 0 or v_wf_k <> 0 or v_lk_k <> 1
     or v_ec_d <> 1 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON молоко : comptes ≠ Phase A';
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_drop and b.lemma_id = v_keep
  ) then
    raise exception 'ABANDON молоко : conflit UNIQUE(user_id, lemma_id)';
  end if;

  if v_lk_d > 0 then
    if v_lk_k > 0 then
      raise exception 'ABANDON молоко : LK des deux côtés';
    end if;
    update linguistic_knowledge set lemma_id = v_keep where lemma_id = v_drop;
  end if;

  update explanation_cache set lemma_id = v_keep where lemma_id = v_drop;
  update user_vocabulary set lemma_id = v_keep where lemma_id = v_drop;
  update word_forms set lemma_id = v_keep where lemma_id = v_drop;
  update lemma_concept_links set lemma_id = v_keep where lemma_id = v_drop;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_drop::text
  ) then
    raise exception 'ABANDON молоко : texts.content_annotated référence encore le DROP';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'FUSION молоко : моло́ко → молоко́ (keep=%)', v_keep;
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'молоко' order by form;

commit;


-- ------------------------------------------------------------
-- 7/10  про́блема → пробле́ма  (DROP orphelin)
-- KEEP ec=1 | DROP 0 partout
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'пробле́ма';
  select id into v_drop from lemmas where form = 'про́блема';

  if v_keep is null then
    raise exception 'ABANDON проблема : KEEP пробле́ма absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP проблема : DROP про́блема déjà absent';
    return;
  end if;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT проблема (orphelin) DROP=% | ec=% uv=% lcl=% wf=% lk=%',
    v_drop, v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_d <> 0 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON проблема : DROP n''est pas orphelin (deps ≠ 0)';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'DELETE orphelin про́блема';
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'проблема' order by form;

commit;


-- ------------------------------------------------------------
-- 8/10  се́бя → себя́
-- KEEP ec=1 uv=0 lcl=0 wf=0 lk=0 | DROP ec=1 uv=0 lcl=0 wf=0 lk=1
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_k int; v_uv_k int; v_lcl_k int; v_wf_k int; v_lk_k int;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'себя́';
  select id into v_drop from lemmas where form = 'се́бя';

  if v_keep is null then
    raise exception 'ABANDON себя : KEEP себя́ absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP себя : DROP се́бя déjà absent';
    return;
  end if;

  select count(*) into v_ec_k  from explanation_cache where lemma_id = v_keep;
  select count(*) into v_uv_k  from user_vocabulary where lemma_id = v_keep;
  select count(*) into v_lcl_k from lemma_concept_links where lemma_id = v_keep;
  select count(*) into v_wf_k  from word_forms where lemma_id = v_keep;
  select count(*) into v_lk_k  from linguistic_knowledge where lemma_id = v_keep;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT себя KEEP=% DROP=% | K ec=% uv=% lcl=% wf=% lk=% | D ec=% uv=% lcl=% wf=% lk=%',
    v_keep, v_drop, v_ec_k, v_uv_k, v_lcl_k, v_wf_k, v_lk_k,
    v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_k <> 1 or v_uv_k <> 0 or v_lcl_k <> 0 or v_wf_k <> 0 or v_lk_k <> 0
     or v_ec_d <> 1 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 1 then
    raise exception 'ABANDON себя : comptes ≠ Phase A';
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_drop and b.lemma_id = v_keep
  ) then
    raise exception 'ABANDON себя : conflit UNIQUE(user_id, lemma_id)';
  end if;

  -- LK sur DROP uniquement → rewire (ne pas supprimer)
  if v_lk_d > 0 then
    if v_lk_k > 0 then
      raise exception 'ABANDON себя : LK des deux côtés';
    end if;
    update linguistic_knowledge set lemma_id = v_keep where lemma_id = v_drop;
  end if;

  update explanation_cache set lemma_id = v_keep where lemma_id = v_drop;
  update user_vocabulary set lemma_id = v_keep where lemma_id = v_drop;
  update word_forms set lemma_id = v_keep where lemma_id = v_drop;
  update lemma_concept_links set lemma_id = v_keep where lemma_id = v_drop;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_drop::text
  ) then
    raise exception 'ABANDON себя : texts.content_annotated référence encore le DROP';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'FUSION себя : се́бя → себя́ (keep=%)', v_keep;
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'себя' order by form;
select count(*) as lk_on_keep from linguistic_knowledge lk
  join lemmas l on l.id = lk.lemma_id where l.form = 'себя́';

commit;


-- ------------------------------------------------------------
-- 9/10  спраши́вать → спра́шивать
-- KEEP ec=1 uv=0 lcl=0 wf=0 lk=0 | DROP ec=1 uv=0 lcl=0 wf=0 lk=0
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_k int; v_uv_k int; v_lcl_k int; v_wf_k int; v_lk_k int;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'спра́шивать';
  select id into v_drop from lemmas where form = 'спраши́вать';

  if v_keep is null then
    raise exception 'ABANDON спрашивать : KEEP спра́шивать absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP спрашивать : DROP спраши́вать déjà absent';
    return;
  end if;

  select count(*) into v_ec_k  from explanation_cache where lemma_id = v_keep;
  select count(*) into v_uv_k  from user_vocabulary where lemma_id = v_keep;
  select count(*) into v_lcl_k from lemma_concept_links where lemma_id = v_keep;
  select count(*) into v_wf_k  from word_forms where lemma_id = v_keep;
  select count(*) into v_lk_k  from linguistic_knowledge where lemma_id = v_keep;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT спрашивать KEEP=% DROP=% | K ec=% uv=% lcl=% wf=% lk=% | D ec=% uv=% lcl=% wf=% lk=%',
    v_keep, v_drop, v_ec_k, v_uv_k, v_lcl_k, v_wf_k, v_lk_k,
    v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_k <> 1 or v_uv_k <> 0 or v_lcl_k <> 0 or v_wf_k <> 0 or v_lk_k <> 0
     or v_ec_d <> 1 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON спрашивать : comptes ≠ Phase A';
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_drop and b.lemma_id = v_keep
  ) then
    raise exception 'ABANDON спрашивать : conflit UNIQUE(user_id, lemma_id)';
  end if;

  if v_lk_d > 0 then
    if v_lk_k > 0 then
      raise exception 'ABANDON спрашивать : LK des deux côtés';
    end if;
    update linguistic_knowledge set lemma_id = v_keep where lemma_id = v_drop;
  end if;

  update explanation_cache set lemma_id = v_keep where lemma_id = v_drop;
  update user_vocabulary set lemma_id = v_keep where lemma_id = v_drop;
  update word_forms set lemma_id = v_keep where lemma_id = v_drop;
  update lemma_concept_links set lemma_id = v_keep where lemma_id = v_drop;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_drop::text
  ) then
    raise exception 'ABANDON спрашивать : texts.content_annotated référence encore le DROP';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'FUSION спрашивать : спраши́вать → спра́шивать (keep=%)', v_keep;
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'спрашивать' order by form;

commit;


-- ------------------------------------------------------------
-- 10/10  те́мно → темно́  (DROP orphelin)
-- KEEP ec=1 | DROP 0 partout
-- ------------------------------------------------------------
begin;

do $$
declare
  v_keep uuid;
  v_drop uuid;
  v_ec_d int; v_uv_d int; v_lcl_d int; v_wf_d int; v_lk_d int;
begin
  select id into v_keep from lemmas where form = 'темно́';
  select id into v_drop from lemmas where form = 'те́мно';

  if v_keep is null then
    raise exception 'ABANDON темно : KEEP темно́ absent';
  end if;
  if v_drop is null then
    raise notice 'SKIP темно : DROP те́мно déjà absent';
    return;
  end if;

  select count(*) into v_ec_d  from explanation_cache where lemma_id = v_drop;
  select count(*) into v_uv_d  from user_vocabulary where lemma_id = v_drop;
  select count(*) into v_lcl_d from lemma_concept_links where lemma_id = v_drop;
  select count(*) into v_wf_d  from word_forms where lemma_id = v_drop;
  select count(*) into v_lk_d  from linguistic_knowledge where lemma_id = v_drop;

  raise notice 'RAPPORT-AVANT темно (orphelin) DROP=% | ec=% uv=% lcl=% wf=% lk=%',
    v_drop, v_ec_d, v_uv_d, v_lcl_d, v_wf_d, v_lk_d;

  if v_ec_d <> 0 or v_uv_d <> 0 or v_lcl_d <> 0 or v_wf_d <> 0 or v_lk_d <> 0 then
    raise exception 'ABANDON темно : DROP n''est pas orphelin (deps ≠ 0)';
  end if;

  delete from lemmas where id = v_drop;
  raise notice 'DELETE orphelin те́мно';
end $$;

select id, form from lemmas where replace(form, chr(769), '') = 'темно' order by form;

commit;


-- ============================================================
-- Vérification globale post-fusion (lecture seule, hors tx)
-- Attendu : 0 bare avec ≥ 2 accents distincts parmi les 10.
-- ============================================================
select
  replace(form, chr(769), '') as bare,
  array_agg(form order by form) as forms,
  count(*) as n
from lemmas
where replace(form, chr(769), '') in (
  'болеть', 'думать', 'идти', 'интересный', 'молодой',
  'молоко', 'проблема', 'себя', 'спрашивать', 'темно'
)
group by 1
having count(*) <> 1
order by 1;
