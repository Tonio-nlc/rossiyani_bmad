-- ============================================================
-- HOMOLYPHE LATIN — садитьcя → садиться (c latin U+0063)
-- Surface cache : садится. Cible cyrillique « садиться » déjà en base → fusion.
-- Structure B3 : rapport-avant, garde бо́леть/боле́ть, fusion ou rename.
-- N'EXÉCUTER QU'APRÈS backup. Ne touche PAS бо́леть / боле́ть.
-- ============================================================

begin;

do $$
declare
  v_bad_id uuid;
  v_good_id uuid;
  v_good_form text;
  v_wf int; v_lcl int; v_uv int; v_ec int; v_lk int;
begin
  select id into v_bad_id from lemmas where form = 'садитьcя';

  select id, form into v_good_id, v_good_form from lemmas where form = 'садиться';

  if v_bad_id is null then
    raise notice 'RAPPORT : lemme fautif садитьcя absent — rien à faire.';
    return;
  end if;

  select count(*) into v_wf from word_forms where lemma_id = v_bad_id;
  select count(*) into v_lcl from lemma_concept_links where lemma_id = v_bad_id;
  select count(*) into v_uv from user_vocabulary where lemma_id = v_bad_id;
  select count(*) into v_ec from explanation_cache where lemma_id = v_bad_id;
  select count(*) into v_lk from linguistic_knowledge where lemma_id = v_bad_id;

  raise notice 'RAPPORT-AVANT садитьcя id=% → cible % id=% | wf=% lcl=% uv=% ec=% lk=%',
    v_bad_id, coalesce(v_good_form, 'садиться (rename)'), v_good_id,
    v_wf, v_lcl, v_uv, v_ec, v_lk;
end $$;

do $$
declare v_count integer;
begin
  select count(distinct id) into v_count from lemmas where form in ('бо́леть', 'боле́ть');
  if v_count <> 2 then
    raise exception 'ABANDON : бо́леть/боле́ть doivent rester 2 lignes (% trouvé(s))', v_count;
  end if;
end $$;

do $$
declare
  v_bad_id uuid;
  v_good_id uuid;
  v_good_form text;
begin
  select id into v_bad_id from lemmas where form = 'садитьcя';

  select id, form into v_good_id, v_good_form from lemmas where form = 'садиться';

  if v_bad_id is null then
    raise notice 'SKIP : садитьcя absent.';
    return;
  end if;

  if v_good_id is null then
    update lemmas set form = 'садиться', updated_at = now() where id = v_bad_id;
    raise notice 'CORRECTION : садитьcя renommé en садиться (id=%)', v_bad_id;
    return;
  end if;

  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_bad_id and b.lemma_id = v_good_id
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) садитьcя↔%', v_good_form;
  end if;

  if exists (select 1 from linguistic_knowledge where lemma_id = v_bad_id)
     and not exists (select 1 from linguistic_knowledge where lemma_id = v_good_id) then
    update linguistic_knowledge set lemma_id = v_good_id where lemma_id = v_bad_id;
  else
    delete from linguistic_knowledge where lemma_id = v_bad_id;
  end if;

  update explanation_cache set lemma_id = v_good_id where lemma_id = v_bad_id;

  delete from word_forms d using word_forms k
  where d.lemma_id = v_bad_id and k.lemma_id = v_good_id
    and k.surface = d.surface and k.functional_role = d.functional_role;
  update word_forms set lemma_id = v_good_id where lemma_id = v_bad_id;

  delete from lemma_concept_links d using lemma_concept_links k
  where d.lemma_id = v_bad_id and k.lemma_id = v_good_id and k.concept_id = d.concept_id;
  update lemma_concept_links set lemma_id = v_good_id where lemma_id = v_bad_id;

  delete from user_vocabulary d using user_vocabulary k
  where d.lemma_id = v_bad_id and k.lemma_id = v_good_id and k.user_id = d.user_id;
  update user_vocabulary set lemma_id = v_good_id where lemma_id = v_bad_id;

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_bad_id::text
  ) then
    raise exception 'ABANDON : texts.content_annotated référence encore садитьcя — remap JSONB manuel';
  end if;

  delete from lemmas where id = v_bad_id;
  raise notice 'FUSION : садитьcя → % (keep=%)', v_good_form, v_good_id;
end $$;

select id, form from lemmas where form in ('садитьcя', 'садиться') order by form;

commit;
