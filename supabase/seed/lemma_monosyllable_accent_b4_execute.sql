-- ============================================================
-- B4 — ACCENTS SUR MONOSYLLABES — EXÉCUTION
-- Exécuter APRÈS backup + après lemma_monosyllable_accent_b4_select.sql.
-- Transaction UNIQUE. Pour chaque monosyllabe accentué :
--   - si forme nue absente → UPDATE form (retire U+0301)
--   - si forme nue présente (autre id) → FUSION vers la nue
-- Ne touche PAS бо́леть / боле́ть.
--
-- RAPPEL AMONT : sans correctif dans resolveOrCreateLemma / LLM, l'accent
-- peut revenir à la prochaine création de lemme.
-- ============================================================

begin;

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
  r record;
  v_accented_id uuid;
  v_bare_id uuid;
  v_bare text;
  v_wf int; v_lcl int; v_uv int; v_ec int;
begin
  for r in
    select * from (values
      ('я́'), ('мы́'), ('на́с'), ('се́мь'), ('де́нь'),
      ('сто́л'), ('су́п'), ('вхо́д'), ('пи́ть'), ('вста́ть')
    ) as t(accented)
  loop
    v_bare := replace(r.accented, chr(769), '');
    select id into v_accented_id from lemmas where form = r.accented;
    select id into v_bare_id from lemmas where form = v_bare;

    if v_accented_id is null then
      raise notice 'SKIP % : ligne accentuée absente', r.accented;
      continue;
    end if;

    select count(*) into v_wf from word_forms where lemma_id = v_accented_id;
    select count(*) into v_lcl from lemma_concept_links where lemma_id = v_accented_id;
    select count(*) into v_uv from user_vocabulary where lemma_id = v_accented_id;
    select count(*) into v_ec from explanation_cache where lemma_id = v_accented_id;
    raise notice 'RAPPORT-AVANT % id=% bare=% bare_id=% | wf=% lcl=% uv=% ec=%',
      r.accented, v_accented_id, v_bare, v_bare_id, v_wf, v_lcl, v_uv, v_ec;

    if v_bare_id is null then
      update lemmas set form = v_bare, updated_at = now() where id = v_accented_id;
      raise notice 'UPDATE % → % (id=%)', r.accented, v_bare, v_accented_id;
      continue;
    end if;

    if v_bare_id = v_accented_id then
      raise notice 'SKIP % : déjà la forme attendue', r.accented;
      continue;
    end if;

    -- Fusion accentuée → nue (cible = bare_id)
    if exists (
      select 1 from user_vocabulary a
      join user_vocabulary b on a.user_id = b.user_id
      where a.lemma_id = v_accented_id and b.lemma_id = v_bare_id
    ) then
      raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et %',
        r.accented, v_bare;
    end if;

    if exists (select 1 from linguistic_knowledge where lemma_id = v_accented_id)
       and not exists (select 1 from linguistic_knowledge where lemma_id = v_bare_id) then
      update linguistic_knowledge set lemma_id = v_bare_id where lemma_id = v_accented_id;
    else
      delete from linguistic_knowledge where lemma_id = v_accented_id;
    end if;

    update explanation_cache set lemma_id = v_bare_id where lemma_id = v_accented_id;

    delete from word_forms d using word_forms k
    where d.lemma_id = v_accented_id and k.lemma_id = v_bare_id
      and k.surface = d.surface and k.functional_role = d.functional_role;
    update word_forms set lemma_id = v_bare_id where lemma_id = v_accented_id;

    delete from lemma_concept_links d using lemma_concept_links k
    where d.lemma_id = v_accented_id and k.lemma_id = v_bare_id
      and k.concept_id = d.concept_id;
    update lemma_concept_links set lemma_id = v_bare_id where lemma_id = v_accented_id;

    delete from user_vocabulary d using user_vocabulary k
    where d.lemma_id = v_accented_id and k.lemma_id = v_bare_id
      and k.user_id = d.user_id;
    update user_vocabulary set lemma_id = v_bare_id where lemma_id = v_accented_id;
    -- srs_reviews suit via user_vocabulary_id (pas de lemma_id propre)

    if exists (
      select 1 from texts,
        jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,
        jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word
      where word->>'lemmaId' = v_accented_id::text
    ) then
      raise exception 'ABANDON : texts.content_annotated référence encore % — remap JSONB manuel',
        r.accented;
    end if;

    delete from lemmas where id = v_accented_id;
    raise notice 'FUSION % → % (keep=%)', r.accented, v_bare, v_bare_id;
  end loop;
end $$;

-- Vérification post : plus aucune des 10 formes accentuées
select id, form
from lemmas
where form in (
  'я́', 'мы́', 'на́с', 'се́мь', 'де́нь',
  'сто́л', 'су́п', 'вхо́д', 'пи́ть', 'вста́ть'
)
order by form;

select id, form
from lemmas
where form in (
  'я', 'мы', 'нас', 'семь', 'день',
  'стол', 'суп', 'вход', 'пить', 'встать'
)
order by form;

commit;
