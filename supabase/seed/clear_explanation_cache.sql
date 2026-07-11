-- Script de maintenance DEV uniquement — ne fait pas partie de la reconstruction migrations.
-- Vider le cache pour forcer régénération avec nouveau prompt
-- Conserve user_vocabulary et srs_reviews (données utilisateur)

UPDATE user_vocabulary SET explanation_cache_id = NULL;

TRUNCATE TABLE explanation_cache;

-- Reset aussi les lemmas pour repartir propre
-- (les word_forms seront recréés à la demande)
DELETE FROM word_forms;
DELETE FROM lemmas;

-- Note : DELETE FROM lemmas échouera si user_vocabulary référence des lemma_id.
-- Dans ce cas, supprimer uniquement les lemmas orphelins :
-- DELETE FROM lemmas WHERE id NOT IN (SELECT DISTINCT lemma_id FROM user_vocabulary);
