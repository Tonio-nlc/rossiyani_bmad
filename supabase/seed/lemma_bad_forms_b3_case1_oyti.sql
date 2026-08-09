-- ============================================================
-- B3 cas 1 — ойти́ → идти́ (troncature ; surface rattachée : идёшь)
-- PAS пойти́ : идёшь est imperfectif de идти́, pas le perfectif пойти́.
-- Exécuter APRÈS backup + après lemma_bad_forms_b3_select.sql.
-- Transaction isolée. Ne touche PAS бо́леть / боле́ть.
-- ============================================================

begin;

-- Rapport-avant (dans la même transaction, avant écriture)
do $$
declare
  v_bad_id uuid;
  v_good_id uuid;
  v_wf int; v_lcl int; v_uv int; v_ec int; v_lk int;
begin
  select id into v_bad_id from lemmas where form = 'ойти́';
  select id into v_good_id from lemmas where form = 'идти́';

  if v_bad_id is null then
    raise notice 'RAPPORT : lemme fautif ойти́ absent — rien à faire.';
    return;
  end if;

  select count(*) into v_wf from word_forms where lemma_id = v_bad_id;
  select count(*) into v_lcl from lemma_concept_links where lemma_id = v_bad_id;
  select count(*) into v_uv from user_vocabulary where lemma_id = v_bad_id;
  select count(*) into v_ec from explanation_cache where lemma_id = v_bad_id;
  select count(*) into v_lk from linguistic_knowledge where lemma_id = v_bad_id;

  raise notice 'RAPPORT-AVANT ойти́ id=% → cible идти́ id=% | wf=% lcl=% uv=% ec=% lk=%',
    v_bad_id, v_good_id, v_wf, v_lcl, v_uv, v_ec, v_lk;
end $$;

-- Garde : бо́леть / боле́ть restent 2 lignes distinctes
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
begin
  select id into v_bad_id from lemmas where form = 'ойти́';
  select id into v_good_id from lemmas where form = 'идти́';

  if v_bad_id is null then
    raise notice 'SKIP : ойти́ absent.';
    return;
  end if;

  if v_good_id is null then
    -- Correction in-place (cible absente)
    update lemmas set form = 'идти́', updated_at = now() where id = v_bad_id;
    raise notice 'CORRECTION : ойти́ renommé en идти́ (id=%)', v_bad_id;
    return;
  end if;

  -- Fusion vers la cible existante
  if exists (
    select 1 from user_vocabulary a
    join user_vocabulary b on a.user_id = b.user_id
    where a.lemma_id = v_bad_id and b.lemma_id = v_good_id
  ) then
    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) ойти́↔идти́';
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
  -- srs_reviews suit via user_vocabulary_id (pas de lemma_id propre)

  if exists (
    select 1 from texts,
      jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
      jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
    where word->>'lemmaId' = v_bad_id::text
  ) then
    raise exception 'ABANDON : texts.content_annotated référence encore ойти́ — remap JSONB manuel requis';
  end if;

  delete from lemmas where id = v_bad_id;
  raise notice 'FUSION : ойти́ → идти́ (keep=%)', v_good_id;
end $$;

-- Vérification post
select id, form from lemmas where form in ('ойти́', 'идти́', 'пойти́') order by form;

commit;
