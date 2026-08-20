-- ============================================================
-- PURGE CIBLÉE §3 — DELETE TRANSACTIONNEL
-- PRÉALABLE : backup manuel + §2 exécuté. Coller total_dedup dans v_expected.
-- Seuil : max(3, ceil(5% × expected)). Filet absolu : ≤ 120 (périmètre restreint).
-- Détache d'abord user_vocabulary.explanation_cache_id (sinon FK).
-- ============================================================

begin;

do $$
declare
  v_expected integer := 27;  -- <<< COLLER total_dedup du §2
  v_tolerance integer;
  v_actual integer;
  v_referenced integer;
  v_detached integer;
begin
  if v_expected is null then
    raise exception 'ABANDON : renseigner v_expected avec total_dedup du §2';
  end if;

  v_tolerance := greatest(3, ceiling(v_expected::numeric * 0.05)::integer);

  create temporary table curated_fact_gloss_purge_ids on commit drop as
  with
  numerals as (
    select unnest(array[
      'два','две','три','четыре','пять','шесть','семь','восемь','девять','десять',
      'одиннадцать','двенадцать','двадцать','тридцать','сорок',
      'пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто',
      'сто','двести','триста','четыреста','пятьсот','тысяча',
      'много','мало','несколько','сколько'
    ]) as num
  ),
  pronoun_oblique as (
    select unnest(array[
      'меня','тебя','него','неё','нее','нас','вас','них','себя',
      'его','её','ее','мной','тобой','им','ей','ими','ними','ней'
    ]) as form
  ),
  base as (
    select
      ec.id,
      regexp_replace(
        replace(lower(trim(ec.surface_word)), chr(769), ''),
        '[^а-яё\-]+', '', 'g'
      ) as surface_key,
      replace(lower(ec.sentence_example), chr(769), '') as sentence_bare,
      case
        when left(trim(ec.explanation_fr), 1) = '{'
          then ec.explanation_fr::jsonb
        else null
      end as payload
    from explanation_cache ec
  ),
  flagged as (
    select
      b.id,
      (b.surface_key in (select form from pronoun_oblique)
        and b.sentence_bare ~ ('(^|[^а-яё])у[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
        as m_gen_u_pronoun,
      (b.sentence_bare ~ ('(^|[^а-яё])после[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
        as m_gen_posle,
      (b.sentence_bare ~ ('(^|[^а-яё])из[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
        as m_gen_iz,
      (b.sentence_bare ~ ('(^|[^а-яё])без[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
        as m_gen_bez,
      (exists (
        select 1 from numerals n
        where b.sentence_bare ~
          ('(^|[^а-яё])' || n.num || '[[:space:]]+' || b.surface_key || '([^а-яё]|$)')
      )) as m_gen_numeral,
      (b.surface_key = 'свидания'
        and b.sentence_bare ~ '(^|[^а-яё])до[[:space:]]+свидания([^а-яё]|$)')
        as m_gen_do_svidaniya,
      (b.surface_key = 'тоже') as m_tozhe,
      (b.surface_key in (select form from pronoun_oblique)
        and coalesce(b.payload->>'translation', '')
            ~* '(^|[^[:alpha:]])(je|tu|il|elle|nous|vous|ils|elles|on|soi)([^[:alpha:]]|$)')
        as m_gloss_pronoun_nominative_fr,
      (b.surface_key = 'часов'
        and coalesce(b.payload->>'translation', '') ~* '(^|[^[:alpha:]])heure([^[:alpha:]]|$)'
        and coalesce(b.payload->>'translation', '') !~* 'heures')
        as m_gloss_chasov_singular
    from base b
  )
  select distinct id
  from flagged
  where m_gen_u_pronoun
     or m_gen_posle
     or m_gen_iz
     or m_gen_bez
     or m_gen_numeral
     or m_gen_do_svidaniya
     or m_tozhe
     or m_gloss_pronoun_nominative_fr
     or m_gloss_chasov_singular;

  select count(*) into v_actual from curated_fact_gloss_purge_ids;

  if v_actual > 120 then
    raise exception
      'ABANDON : actual=% > filet absolu 120 (périmètre restreint attendu)',
      v_actual;
  end if;

  if abs(v_actual - v_expected) > v_tolerance then
    raise exception
      'ABANDON : actual=% hors tolérance de expected=% (±%)',
      v_actual, v_expected, v_tolerance;
  end if;

  select count(*) into v_referenced
  from user_vocabulary uv
  where uv.explanation_cache_id in (select id from curated_fact_gloss_purge_ids);

  update user_vocabulary
  set explanation_cache_id = null
  where explanation_cache_id in (select id from curated_fact_gloss_purge_ids);

  get diagnostics v_detached = row_count;

  delete from explanation_cache
  where id in (select id from curated_fact_gloss_purge_ids);

  raise notice
    'OK purge ciblée : deleted=% (expected=% ±%), uv_detached=% (refs avant=%))',
    v_actual, v_expected, v_tolerance, v_detached, v_referenced;
end $$;

-- Vérifier le NOTICE puis :
--   commit;   -- si OK
--   rollback; -- si doute
