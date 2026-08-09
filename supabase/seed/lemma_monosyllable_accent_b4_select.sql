-- ============================================================
-- B4 — ACCENTS SUR MONOSYLLABES — VÉRIFICATION (lecture seule)
-- NE PAS EXÉCUTER d'écriture ici.
--
-- Cibles (formes accentuées signalées) :
--   я́, мы́, на́с, се́мь, де́нь, сто́л, су́п, вхо́д, пи́ть, вста́ть
--
-- AUDIT CLÉS DE JOINTURE (schéma + code) :
--   - lemmas.form est UNIQUE (001_initial_schema) → l'UPDATE de `form`
--     change la clé d'unicité / le lookup resolveOrCreateLemma(.eq("form")).
--   - Toutes les FK métier (word_forms, lemma_concept_links, user_vocabulary,
--     explanation_cache, linguistic_knowledge) joignent sur lemma_id (UUID),
--     PAS sur form. srs_reviews joint via user_vocabulary_id. Un UPDATE form
--     seul ne casse PAS ces FK.
--   - lemma_concept_links : pas d'appariement par form textuelle.
--   - Morphologie curée : apparie via stripStressMarks → accent monosyllabe
--     n'est pas une clé curée.
--   - RISQUE réel : si la forme NUE existe déjà comme autre ligne, un simple
--     UPDATE vers la nue viole UNIQUE(form) → il faut FUSIONNER (voir execute).
--   - Note historique : lemma_residual_dedup_execute_20260728.sql a fusionné
--     volontairement certaines nues VERS l'accentuée (ex. день → де́нь) selon
--     la règle « canonique = accentuée ». B4 inverse ce choix pédagogique
--     pour les monosyllabes.
--
-- ORIGINE DE L'ACCENT (code, pas SQL) :
--   resolveOrCreateLemma stocke canonicalizeLemmaForm(llmPayload.lemma) et
--   privilégie la forme ACCENTUÉE comme canonique (docs/knowledge/
--   lemma-canonicalization.md). Le LLM invente souvent U+0301 sur les
--   monosyllabes → insertion / promotion vers я́, де́нь, etc.
--   Sans garde amont (ne pas accentuer les monosyllabes à l'insertion),
--   un UPDATE SQL seul REVIENDRA au prochain explainWord miss.
-- ============================================================

with targets as (
  select * from (values
    ('я́'), ('мы́'), ('на́с'), ('се́мь'), ('де́нь'),
    ('сто́л'), ('су́п'), ('вхо́д'), ('пи́ть'), ('вста́ть')
  ) as t(accented)
),
rows as (
  select
    t.accented,
    replace(t.accented, chr(769), '') as bare,
    la.id as accented_id,
    la.form as accented_form,
    lb.id as bare_id,
    lb.form as bare_form
  from targets t
  left join lemmas la on la.form = t.accented
  left join lemmas lb on lb.form = replace(t.accented, chr(769), '')
)
select
  accented,
  bare,
  accented_id,
  bare_id,
  case
    when accented_id is null then 'absent'
    when bare_id is null then 'update_safe (pas de collision nue)'
    when bare_id = accented_id then 'same_row'
    else 'MERGE_REQUIRED (nue + accentuée coexistent)'
  end as action_hint,
  (select count(*) from word_forms wf where wf.lemma_id = accented_id) as wf_accented,
  (select count(*) from lemma_concept_links lcl where lcl.lemma_id = accented_id) as lcl_accented,
  (select count(*) from user_vocabulary uv where uv.lemma_id = accented_id) as uv_accented,
  (select count(*) from explanation_cache ec where ec.lemma_id = accented_id) as ec_accented,
  (select count(*) from word_forms wf where wf.lemma_id = bare_id) as wf_bare,
  (select count(*) from explanation_cache ec where ec.lemma_id = bare_id) as ec_bare
from rows
order by bare;

-- Index / contraintes sur lemmas.form
select indexname, indexdef
from pg_indexes
where tablename = 'lemmas'
order by indexname;

select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conrelid = 'lemmas'::regclass
order by conname;
