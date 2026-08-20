-- ============================================================
-- PURGE CIBLÉE §1 — SELECT DE REPÉRAGE (1 ligne / id, multi-motifs OK)
-- Lecture seule. Motifs = colonnes bool + all_motifs.
-- ============================================================

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
  -- Formes obliques curées (génitif/acc/… syncrétiques inclus) — pour у+pronom
  -- et pour la glose « nominatif FR » haute précision.
  select unnest(array[
    'меня','тебя','него','неё','нее','нас','вас','них','себя',
    'его','её','ее','мной','тобой','им','ей','ими','ними','ней'
  ]) as form
),
base as (
  select
    ec.id,
    ec.surface_word,
    ec.functional_role,
    ec.function_color,
    ec.sentence_example,
    ec.explanation_fr,
    ec.lemma_id,
    l.form as lemma_form,
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
  left join lemmas l on l.id = ec.lemma_id
),
flagged as (
  select
    b.*,
    coalesce(b.payload->>'translation', '') as translation,

    -- A1 у + pronom (surface = forme oblique, token précédent = у)
    (b.surface_key in (select form from pronoun_oblique)
      and b.sentence_bare ~ ('(^|[^а-яё])у[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_u_pronoun,

    -- A2 после + surface
    (b.sentence_bare ~ ('(^|[^а-яё])после[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_posle,

    -- A3 из + surface
    (b.sentence_bare ~ ('(^|[^а-яё])из[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_iz,

    -- A4 без + surface
    (b.sentence_bare ~ ('(^|[^а-яё])без[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_bez,

    -- A5 numéral curé + surface
    (exists (
      select 1 from numerals n
      where b.sentence_bare ~
        ('(^|[^а-яё])' || n.num || '[[:space:]]+' || b.surface_key || '([^а-яё]|$)')
    )) as m_gen_numeral,

    -- A6 до свидания (surface свидания)
    (b.surface_key = 'свидания'
      and b.sentence_bare ~ '(^|[^а-яё])до[[:space:]]+свидания([^а-яё]|$)')
      as m_gen_do_svidaniya,

    -- C то́же (et variantes accent / casse / ponctuation déjà normalisées en surface_key)
    (b.surface_key = 'тоже') as m_tozhe,

    -- B glose lemme — HAUTE PRÉCISION seulement (pas un détecteur général)
    -- B1 pronom oblique glosé comme nominatif FR (je/tu/il/elle/nous/vous/ils/elles/on/soi)
    (b.surface_key in (select form from pronoun_oblique)
      and coalesce(b.payload->>'translation', '')
          ~* '(^|[^[:alpha:]])(je|tu|il|elle|nous|vous|ils|elles|on|soi)([^[:alpha:]]|$)')
      as m_gloss_pronoun_nominative_fr,

    -- B2 часов glosé au singulier « heure » sans « heures »
    (b.surface_key = 'часов'
      and coalesce(b.payload->>'translation', '') ~* '(^|[^[:alpha:]])heure([^[:alpha:]]|$)'
      and coalesce(b.payload->>'translation', '') !~* 'heures')
      as m_gloss_chasov_singular
  from base b
),
with_motifs as (
  select
    f.*,
    array_remove(array[
      case when m_gen_u_pronoun then 'gen_u_pronoun' end,
      case when m_gen_posle then 'gen_posle' end,
      case when m_gen_iz then 'gen_iz' end,
      case when m_gen_bez then 'gen_bez' end,
      case when m_gen_numeral then 'gen_numeral' end,
      case when m_gen_do_svidaniya then 'gen_do_svidaniya' end,
      case when m_tozhe then 'tozhe' end,
      case when m_gloss_pronoun_nominative_fr then 'gloss_pronoun_nominative_fr' end,
      case when m_gloss_chasov_singular then 'gloss_chasov_singular' end
    ], null) as motifs
  from flagged f
)
select
  id,
  surface_word,
  functional_role,
  function_color,
  motifs[1] as motif,
  motifs as all_motifs,
  cardinality(motifs) as motif_count,
  case when cardinality(motifs) > 1 then 'MULTI' else 'single' end as multi_flag,
  lemma_form,
  left(translation, 60) as translation_preview,
  left(sentence_example, 80) as sentence_preview
from with_motifs
where cardinality(motifs) > 0
order by motif, surface_word, id;
