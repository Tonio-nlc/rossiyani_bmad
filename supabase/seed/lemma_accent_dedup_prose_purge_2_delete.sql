-- ============================================================
-- PURGE PROSE — DELETE transactionnel (après fusion + SELECT §1)
-- Compte attendu : 6
-- Détache d'abord user_vocabulary.explanation_cache_id (sinon FK).
-- Attendu détaché UV : 1 (боли́т / У врача).
-- Les lignes seront régénérées par le prefill.
-- ============================================================

begin;

do $$
declare
  v_expected integer := 6;
  v_actual integer;
  v_referenced integer;
  v_detached integer;
begin
  create temporary table accent_prose_purge_ids on commit drop as
  select ec.id
  from explanation_cache ec
  where left(trim(ec.explanation_fr), 1) = '{'
    and ec.explanation_fr::jsonb->>'lemmaStressed' in (
      'бо́леть',
      'дума́ть',
      'и́дти',
      'и́нтересный',
      'моло́дой',
      'моло́ко',
      'про́блема',
      'се́бя',
      'спраши́вать',
      'те́мно'
    );

  select count(*) into v_actual from accent_prose_purge_ids;

  raise notice 'PURGE PROSE : % ligne(s) (attendu %)', v_actual, v_expected;

  if v_actual <> v_expected then
    raise exception 'ABANDON purge prose : count % ≠ attendu % — relancer le SELECT',
      v_actual, v_expected;
  end if;

  select count(*) into v_referenced
  from user_vocabulary uv
  where uv.explanation_cache_id in (select id from accent_prose_purge_ids);

  raise notice 'PURGE PROSE : % UV à détacher (attendu 1)', v_referenced;

  if v_referenced <> 1 then
    raise exception 'ABANDON purge prose : UV référencées % ≠ 1', v_referenced;
  end if;

  update user_vocabulary
  set explanation_cache_id = null
  where explanation_cache_id in (select id from accent_prose_purge_ids);

  get diagnostics v_detached = row_count;
  raise notice 'PURGE PROSE : % UV détachée(s)', v_detached;

  delete from explanation_cache
  where id in (select id from accent_prose_purge_ids);

  raise notice 'PURGE PROSE : DELETE ok';
end $$;

-- Post : 0 restant
select count(*) as remaining_bad_lemma_stressed
from explanation_cache ec
where left(trim(ec.explanation_fr), 1) = '{'
  and ec.explanation_fr::jsonb->>'lemmaStressed' in (
    'бо́леть', 'дума́ть', 'и́дти', 'и́нтересный', 'моло́дой',
    'моло́ко', 'про́блема', 'се́бя', 'спраши́вать', 'те́мно'
  );

-- UV Mario conserve le lemme боле́ть, sans cache jusqu'au prefill
select uv.id, uv.lemma_id, l.form, uv.explanation_cache_id, uv.saved_at
from user_vocabulary uv
join lemmas l on l.id = uv.lemma_id
where replace(l.form, chr(769), '') = 'болеть';

commit;
