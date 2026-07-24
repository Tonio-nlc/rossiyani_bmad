-- ============================================
-- Seed Concept Graph — généré depuis le registry TypeScript
-- NE PAS éditer à la main : relancer
--   npm run concept-graph:generate-seed
--
-- Prérequis : migration 019_linguistic_concept_graph.sql déjà exécutée.
-- Idempotent / rejouable : ON CONFLICT + INSERT … SELECT … WHERE EXISTS.
-- Aucune suppression de données.
-- À coller dans le SQL Editor Supabase (après 019).
-- Généré le 2026-07-24T13:24:12.804Z
-- ============================================

-- Concepts seed : 11
-- Relations émises : 12 / 13
-- Relations ignorées (extrémité absente) : 1
-- Concepts manquants référencés : 1

-- Upsert des concepts seed (statut a-valider = relecture professeur)
-- validation_status / validated existants sont préservés (relecture professeur).

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'verb-present-conjugation',
  'verb-present-conjugation',
  'Conjugaison du présent',
  'Verb Conjugation',
  'A1',
  'Le russe modifie la terminaison du verbe pour indiquer qui agit maintenant.',
  '{"coreIdea":"La terminaison du verbe répond à la question : qui fait l''action, maintenant ?","whyItExists":"Contrairement au français, le russe intègre souvent le pronom dans la forme verbale : la terminaison dit qui agit, maintenant.","mentalModel":"Pense à une grille : lignes = personnes (я, ты, он…), colonne = présent. Chaque case a sa terminaison.","visualModel":{"type":"diagram","nodes":["infinitif","я …","ты …","он …"],"caption":"Du lemme à la forme conjuguée — la terminaison porte la personne"},"canonicalExplanation":{"understand":["En russe, la terminaison du verbe dit qui fait l''action, maintenant.","Ce n''est jamais une terminaison au hasard : la phrase exige une personne précise, et la forme du verbe la marque."],"scheme":["infinitif","я …","ты …","он …"],"contrasts":[{"fromForm":"infinitif","toForm":"forme conjuguée","question":"Pourquoi ?","explanation":"L''infinitif nomme l''action. La forme conjuguée ajoute qui agit, au présent."}],"miniTable":{"title":"Présent — logique","rows":[{"label":"я","form":"…"},{"label":"ты","form":"…"},{"label":"он/она","form":"…"}]},"retentionPoints":["Terminaison du présent = qui agit, maintenant.","La démonstration se lit toujours sur le verbe consulté, pas sur un autre verbe."],"family":["читать","говорить","болеть","делать"]},"teachingScenario":{"principle":"En russe, la terminaison du verbe dit qui fait l''action, maintenant.","fact":"En russe, la terminaison du verbe dit qui fait l''action, maintenant.","intuition":"Contrairement au français, le russe intègre souvent le pronom dans la terminaison : une seule forme suffit à dire qui agit.","contrast":[{"fromForm":"ты чита́ешь","toForm":"он чита́ет","explanation":"Même présent, seule la personne change."}],"visual":{"nodes":["я чита́ю (-ю)","ты чита́ешь (-ешь)","он чита́ет (-ет)"],"layout":"vertical","caption":"Illustration — présent (1re conjugaison)"},"commonMistake":"Ne confonds pas чита́ешь (présent, 2e pers.) et чита́л (passé).","reuse":["Ты де́лаешь, ты говори́шь, ты пи́шешь — même logique de personne au présent."],"memoryAnchor":"Terminaison du présent = qui agit, maintenant.","illustration":{"label":"conjugaison au présent","fact":"La terminaison -ешь marque la 2e personne du singulier au présent (exemple : чита́ть).","contrast":[{"fromForm":"ты чита́ешь","toForm":"он чита́ет","explanation":"Même présent, seule la personne change."}],"visual":{"nodes":["я чита́ю (-ю)","ты чита́ешь (-ешь)","он чита́ет (-ет)"],"layout":"vertical","caption":"Présent — trois personnes, trois terminaisons"},"commonMistake":"Ne confonds pas чита́ешь (présent, 2e pers.) et чита́л (passé).","reuse":["Ты де́лаешь, ты говори́шь, ты пи́шешь — même terminaison -ешь, même logique."],"memoryAnchor":"-ешь = 2e personne du singulier, présent."}},"commonMistakes":["Oublier que le pronom est souvent omis — la terminaison suffit.","Appliquer le paradigme d''un autre verbe (ex. читать) au verbe consulté.","Confondre présent et futur perfectif."],"relatedConcepts":["verb-imperfective-aspect","verb-perfective-aspect","aspect-pairs"],"relatedLemmas":["читать","делать","говорить","писать"],"examples":["Ты читаешь книгу.","Он читает газету."],"progression":{"beginner":"Une seule idée : la terminaison dit qui agit, maintenant.","intermediate":"Comparer les personnes sur le verbe consulté (pas sur un autre verbe).","advanced":"Repérer conjugaison 1 vs 2 et les paradigmes défectifs (болеть « avoir mal », случиться)."},"teacherNotes":"RC-025 : une explication canonique = le principe. La démonstration (terminaison, paradigme) se compose depuis le lemme + la forme rencontrée."}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'verb-imperfective-aspect',
  'verb-imperfective-aspect',
  'Aspect imperfectif',
  'Verbal Aspect',
  'A2',
  'L''imperfectif décrit un processus, une habitude ou une action en cours.',
  '{"coreIdea":"L''imperfectif montre l''action comme un processus, pas comme un résultat.","whyItExists":"Le russe distingue « comment l''action se déroule » (processus) de « si elle est terminée » (résultat).","mentalModel":"Une flèche continue : читать ————————> (lecture en cours)","visualModel":{"type":"timeline","nodes":["читать","────────────>"],"caption":"Processus en cours"},"canonicalExplanation":{"understand":["читать ne dit pas qu''un livre est fini : il décrit la lecture comme activité — en cours, répétée ou habituelle.","C''est l''aspect imperfectif : le russe regarde l''action de l''intérieur, comme un film, pas comme une photo finale."],"scheme":["читать","я читаю","он читает"],"contrasts":[{"fromForm":"читать","toForm":"прочитать","question":"Qu''est-ce qui change ?","explanation":"прочитать place un point final : le livre est lu jusqu''au bout. читать ne promet pas ce résultat."}],"miniTable":null,"retentionPoints":["читать = lecture en cours ou habituelle.","Pour un livre terminé, le russe choisira souvent прочитать.","L''imperfectif est la forme « par défaut » du dictionnaire."],"family":["читать","прочитать","дочитать"]},"teachingScenario":{"intuition":"Avant de nommer l''imperfectif : le russe peut suivre une action comme un film — sans fixer le résultat.","fact":"чита́ть est à l''aspect imperfectif : il décrit un processus ou une habitude, pas un résultat fini.","contrast":[{"fromForm":"чита́ть","toForm":"прочита́ть","explanation":"Même action « lire » : imperfectif = processus ; perfectif = résultat atteint."}],"commonMistake":"Ne traduis pas imperfectif par « imparfait » français — чита́ть n''est pas un temps, c''est un aspect.","reuse":["де́лать / сде́лать, писа́ть / написа́ть — même logique."],"memoryAnchor":"чита́ть = aspect imperfectif : processus, pas résultat fini."},"commonMistakes":["Traduire imperfectif = « imparfait » français — ce sont deux systèmes différents."],"relatedConcepts":["verb-perfective-aspect","aspect-pairs"],"relatedLemmas":["читать","делать","ходить","говорить"],"examples":["Я читаю каждый день.","Он читает сейчас."],"progression":{"beginner":"Imperfectif = processus, pas résultat.","intermediate":"Comparer avec le perfectif sur la même action."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'verb-perfective-aspect',
  'verb-perfective-aspect',
  'Aspect perfectif',
  'Verbal Aspect',
  'A2',
  'Le perfectif voit l''action comme terminée ou aboutie à un résultat.',
  '{"coreIdea":"Le perfectif place un point final sur l''action.","whyItExists":"Le russe utilise le perfectif quand le locuteur veut montrer que l''action a un aboutissement clair.","mentalModel":"Un point final : прочитать • (livre terminé)","visualModel":{"type":"comparison","nodes":["читать","прочитать •"],"caption":"Processus vs résultat"},"canonicalExplanation":{"understand":["прочитать ne décrit pas une lecture en cours : il dit que la lecture est menée à son terme.","Le préfixe про- renforce l''idée d''achèvement. Le perfectif transforme le regard : de « en train de » vers « c''est fait »."],"scheme":["читать","прочитать"],"contrasts":[{"fromForm":"читать","toForm":"прочитать","question":"Qu''est-ce qui change ?","explanation":"читать = processus. прочитать = résultat atteint. Même action, deux regards différents."},{"fromForm":"прочитать","toForm":"читать","question":"Pourquoi revenir à l''imperfectif ?","explanation":"Pour décrire une habitude ou une action en cours, le russe repasse à l''imperfectif."}],"miniTable":null,"retentionPoints":["прочитать = lire jusqu''au bout.","Le perfectif ne se conjugue pas au présent (sauf emplois très limités).","Un préfixe perfectif change souvent le regard sur l''action."],"family":["читать","прочитать","перечитать","дочитать"]},"teachingScenario":{"hook":"Pourquoi le russe choisit parfois un autre verbe pour une action terminée ?","question":"Pourquoi прочита́ть et pas чита́ть ?","intuition":"Le russe peut photographier une action : pas le déroulement, le résultat. Le perfectif, c''est ce regard final.","fact":"прочита́ть est à l''aspect perfectif : l''action est vue comme terminée, résultat atteint.","contrast":[{"fromForm":"чита́ть","toForm":"прочита́ть","explanation":"Même action « lire » : imperfectif = en cours ; perfectif = livre lu jusqu''au bout."}],"visual":{"nodes":["чита́ть","прочита́ть"],"layout":"comparison","caption":"Paire aspectuelle : processus vs résultat"},"commonMistake":"Ne confonds pas чита́ть (processus, imperfectif) et прочита́ть (résultat, perfectif).","reuse":["сде́лать, написа́ть — même logique de résultat."],"memoryAnchor":"прочита́ть = aspect perfectif : l''action est terminée."},"commonMistakes":["Utiliser le perfectif pour une action habituelle.","Chercher un temps français équivalent — l''aspect est un système à part."],"relatedConcepts":["verb-imperfective-aspect","aspect-pairs","verb-movement-prefixes"],"relatedLemmas":["прочитать","сделать","понять","пойти"],"examples":["Я прочитал книгу.","Она уже прочитала."],"progression":{"beginner":"Perfectif = action terminée ou résultat.","intermediate":"Paire aspectuelle : читать / прочитать."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'aspect-pairs',
  'aspect-pairs',
  'Paires aspectuelles',
  'Aspect Pairs',
  'A2',
  'La plupart des verbes russes existent en deux aspects : imperfectif et perfectif.',
  '{"coreIdea":"Un verbe imperfectif a souvent un partenaire perfectif formé par préfixe ou suffixe.","whyItExists":"Le russe organise le vocabulaire verbal par paires : même action, deux regards (processus / résultat).","mentalModel":"читать ↔ прочитать — deux faces d''une même action.","visualModel":{"type":"comparison","nodes":["читать","↔","прочитать"]},"canonicalExplanation":{"understand":["читать et прочитать ne sont pas deux verbes aléatoires : ils forment une paire aspectuelle.","Apprendre une paire, c''est apprendre deux façons de regarder la même action — en cours ou terminée."],"scheme":["делать","сделать"],"contrasts":[{"fromForm":"делать","toForm":"сделать","question":"Qu''est-ce qui change ?","explanation":"делать = faire (processus). сделать = faire jusqu''au bout (résultat)."}],"miniTable":null,"retentionPoints":["Apprendre les paires, pas les verbes isolés.","Le perfectif est souvent formé avec un préfixe (с-, про-, по-)."],"family":["читать","прочитать","делать","сделать","писать","написать"]},"teachingScenario":{"intuition":"En russe, beaucoup de verbes voyagent à deux : un pour le processus, un pour le résultat.","fact":"чита́ть (aspect imperfectif) et прочита́ть (aspect perfectif) forment une paire : même action, deux aspects.","contrast":[{"fromForm":"де́лать","toForm":"сде́лать","explanation":"Paire aspectuelle : imperfectif (processus) vs perfectif (résultat)."}],"commonMistake":"N''apprends pas прочита́ть sans чита́ть — c''est une paire.","reuse":["писа́ть / написа́ть, говори́ть / сказа́ть — même type de paires."],"memoryAnchor":"Une paire aspectuelle = imperfectif + perfectif pour la même action (чита́ть / прочита́ть)."},"commonMistakes":["Apprendre прочитать sans connaître читать."],"relatedConcepts":["verb-imperfective-aspect","verb-perfective-aspect"],"relatedLemmas":["читать","делать","писать"],"examples":["Я делаю / Я сделал."],"progression":{"beginner":"Deux formes, une action.","intermediate":"Former des paires par préfixe."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'verb-movement-prefixes',
  'verb-movement-prefixes',
  'Préfixes des verbes de mouvement',
  'Prefixes',
  'B1',
  'Les préfixes ajoutent une direction ou un aboutissement au déplacement.',
  '{"coreIdea":"по-, у-, при-, вы- modifient le sens du verbe de base.","whyItExists":"Le russe encode la direction du mouvement dans le verbe lui-même, pas dans une préposition séparée.","mentalModel":"идти → поехать (départ vers un lieu) / уйти (s''éloigner)","visualModel":{"type":"tree","nodes":["идти","пойти","уйти","прийти"]},"canonicalExplanation":{"understand":["поехать ne remplace pas ехать au hasard : le préfixe по- ajoute l''idée d''un départ vers un but.","Chaque préfixe est un morceau de sens réutilisable : по- (départ), у- (éloignement), при- (arrivée)."],"scheme":["ехать","поехать","уехать","приехать"],"contrasts":[{"fromForm":"ехать","toForm":"поехать","question":"Qu''est-ce qui change ?","explanation":"ехать = se déplacer (processus). поехать = partir / se mettre en route vers un lieu."},{"fromForm":"поехать","toForm":"уехать","question":"Qu''est-ce qui change ?","explanation":"у- ajoute l''éloignement : quitter un lieu pour un autre."}],"miniTable":null,"retentionPoints":["по- = départ vers un but.","у- = s''éloigner, quitter.","при- = arriver."],"family":["ехать","поехать","уехать","приехать"]},"teachingScenario":{"intuition":"En russe, la direction du déplacement vit souvent dans un préfixe collé au verbe.","fact":"Le préfixe по- dans пое́хать ajoute l''idée d''un départ (aspect et direction), par rapport à е́хать.","contrast":[{"fromForm":"е́хать","toForm":"пое́хать","explanation":"Même mode (véhicule) : sans préfixe vs départ (по-)."}],"visual":{"nodes":["е́хать","пое́хать","уе́хать","прие́хать"],"layout":"vertical","caption":"Préfixes de déplacement : base → по- / у- / при-"},"commonMistake":"Ne confonds pas пое́хать (véhicule) et пойти́ (à pied) — le préfixe по- s''attache à la bonne base.","reuse":["прийти́, уйти́, выйти́ — mêmes préfixes, base à pied."],"memoryAnchor":"по- dans пое́хать = départ ; le préfixe porte la direction."},"commonMistakes":["Confondre поехать (partir en véhicule) et пойти (partir à pied)."],"relatedConcepts":["verbs-of-motion","verb-perfective-aspect"],"relatedLemmas":["ехать","идти","поехать","пойти"],"examples":["Мы поехали в Москву.","Он уехал."],"progression":{"beginner":"Un préfixe = une direction.","intermediate":"Paires multidirectionnel / unidirectionnel."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'verbs-of-motion',
  'verbs-of-motion',
  'Verbes de mouvement',
  'Verb Motion',
  'B1',
  'Le russe distingue déplacement à pied, en véhicule, aller simple et aller-retour.',
  '{"coreIdea":"идти/ходить (à pied) vs ехать/ездить (en véhicule) ; unidirectionnel vs multidirectionnel.","whyItExists":"Le mode et la direction du déplacement sont grammaticaux en russe, pas seulement lexicaux.","mentalModel":"идти → (aller) vs ходить ⇄⇄⇄ (aller-retour, habitude)","visualModel":{"type":"comparison","nodes":["идти →","ходить ⇄⇄⇄"]},"canonicalExplanation":{"understand":["идти décrit un déplacement à pied dans une direction précise. ходить décrit des allers-retours ou l''habitude de se déplacer à pied.","De même, ехать = trajet en véhicule vers un but ; ездить = déplacements répétés ou allers-retours en véhicule."],"scheme":["идти","ходить","ехать","ездить"],"contrasts":[{"fromForm":"идти","toForm":"ходить","question":"Qu''est-ce qui change ?","explanation":"идти = une direction, un trajet. ходить = aller-retour ou habitude."},{"fromForm":"ехать","toForm":"ездить","question":"Qu''est-ce qui change ?","explanation":"ехать = un trajet en véhicule. ездить = déplacements répétés."}],"miniTable":{"title":"Mouvement","rows":[{"label":"À pied (aller)","form":"идти"},{"label":"À pied (retour)","form":"ходить"},{"label":"Véhicule (aller)","form":"ехать"},{"label":"Véhicule (retour)","form":"ездить"}]},"retentionPoints":["идти/ехать = trajet unidirectionnel.","ходить/ездить = aller-retour ou habitude.","Le mode (pied vs véhicule) est obligatoire."],"family":["идти","пойти","ходить","ехать","поехать","ездить"]},"teachingScenario":{"intuition":"En russe, « aller » n''est jamais neutre : pied ou véhicule, trajet simple ou allers-retours.","fact":"идти́ = un trajet à pied (une direction) ; ходи́ть = allers-retours ou habitude à pied.","contrast":[{"fromForm":"идти́","toForm":"ходи́ть","explanation":"Même mode (à pied) : un trajet vs allers-retours / habitude."}],"visual":{"nodes":["идти́","ходи́ть","е́хать","е́здить"],"layout":"comparison","caption":"Pied : идти́ / ходи́ть — véhicule : е́хать / е́здить"},"commonMistake":"N''utilise pas идти́ pour un trajet en voiture — prends е́хать.","reuse":["Я иду́ — le mode (à pied) reste explicite dans le verbe."],"memoryAnchor":"идти́ = un trajet à pied ; ходи́ть = allers-retours ou habitude."},"commonMistakes":["Utiliser идти pour un trajet en voiture."],"relatedConcepts":["verb-movement-prefixes","verb-perfective-aspect"],"relatedLemmas":["идти","ехать","ходить","ездить"],"examples":["Я иду домой.","Мы ездим на работу каждый день."],"progression":{"beginner":"Pied vs véhicule.","intermediate":"Unidirectionnel vs multidirectionnel."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'reflexive-possessive',
  'reflexive-possessive',
  'Possessif réfléchi',
  'Possessive Pronouns',
  'A2',
  'свой renvoie au possesseur du groupe nominal, pas au locuteur.',
  '{"coreIdea":"свой = « le sien / la sienne » par rapport au sujet de la phrase.","whyItExists":"Le russe évite l''ambiguïté : свой indique que la possession renvoie au sujet, pas à un autre participant.","mentalModel":"мой (à moi, le locuteur) → свой (à celui dont on parle)","visualModel":{"type":"comparison","nodes":["мой","свой"]},"canonicalExplanation":{"understand":["свой ne signifie pas « mon » au sens du locuteur : il renvoie au possesseur déjà présent dans la phrase.","Si le sujet possède quelque chose, le russe préfère свой à мой/твой/его pour éviter toute confusion."],"scheme":["мой","свой"],"contrasts":[{"fromForm":"мой","toForm":"свой","question":"Qu''est-ce qui change ?","explanation":"мой = à moi (le locuteur). свой = au possesseur dont on parle déjà dans la phrase."}],"miniTable":null,"retentionPoints":["свой renvoie au sujet de la proposition.","À éviter : *он любит его книгу quand il s''agit de sa propre livre.","свой s''accorde en genre, nombre et cas."],"family":["мой","свой","своя","своё","свои"]},"teachingScenario":{"intuition":"свой ne dit pas « à moi » : il dit « au possesseur dont on parle déjà dans la phrase ».","fact":"свой = possessif du sujet de la phrase ; мой = possessif du locuteur (1re personne).","contrast":[{"fromForm":"мой","toForm":"свой","explanation":"мой = à moi (locuteur). свой = au possesseur déjà nommé dans la phrase."}],"visual":{"nodes":["мой","свой"],"layout":"comparison","caption":"Possession : locuteur vs possesseur de la phrase"},"commonMistake":"Ne traduis pas свой par « mon » systématiquement — regarde qui possède dans la phrase.","reuse":["Он лю́бит свою́ рабо́ту — свой suit le sujet он."],"memoryAnchor":"свой = au possesseur de la phrase ; мой = à moi (locuteur)."},"commonMistakes":["Traduire свой par « mon » systématiquement.","Oublier l''accord de свой."],"relatedConcepts":["adjective-agreement"],"relatedLemmas":["свой","своя","своё"],"examples":["Он любит свою работу.","Она взяла свою сумку."],"progression":{"beginner":"свой = possession du sujet.","intermediate":"Accord et cas de свой."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'noun-declension',
  'noun-declension',
  'Déclinaison',
  'Case System',
  'A1',
  'Les noms russes changent de terminaison selon leur rôle dans la phrase.',
  '{"coreIdea":"Chaque cas répond à une fonction : sujet, objet, lieu, moyen…","whyItExists":"Le russe marque le rôle grammatical sur le nom lui-même, pas seulement par l''ordre des mots.","mentalModel":"Nom → changement de terminaison selon la fonction","visualModel":{"type":"table","nodes":["Nom.","Acc.","Dat.","Gen."]},"canonicalExplanation":{"understand":["Quand un nom change de forme, ce n''est pas arbitraire : la terminaison indique son rôle dans la phrase.","Le nominatif est la forme du dictionnaire. Les autres cas montrent comment le nom se relie aux autres mots."],"scheme":["стол","стола","столу","столом"],"contrasts":[{"fromForm":"стол","toForm":"стола","question":"Qu''est-ce qui change ?","explanation":"стол = sujet ou complément de base. стола = génitif — souvent « de la table » ou absence."}],"miniTable":{"title":"Cas","rows":[{"label":"Nom.","form":"стол"},{"label":"Acc.","form":"стол"},{"label":"Dat.","form":"столу"},{"label":"Gen.","form":"стола"}]},"retentionPoints":["La forme du dictionnaire = nominatif.","Chaque cas a une fonction précise dans la phrase.","Le genre influence les terminaisons."],"family":["стол","стола","столу"]},"teachingScenario":{"intuition":"En russe, la terminaison du nom montre son rôle dans la phrase — sujet, objet, lieu…","fact":"кни́гу est à l''accusatif : objet direct — ce n''est pas la forme du dictionnaire (кни́га, nominatif).","contrast":[{"fromForm":"кни́га","toForm":"кни́гу","explanation":"Nominatif (sujet / citation) vs accusatif (objet direct)."}],"visual":{"nodes":["кни́га (nominatif)","кни́гу (accusatif)","кни́ги (génitif)"],"layout":"vertical","caption":"Même nom, cas différents = rôles différents"},"commonMistake":"N''apprends pas les cas comme une liste : кни́гу existe parce que le nom est objet direct.","reuse":["кни́га / кни́гу / кни́ги — chaque forme = un rôle."],"memoryAnchor":"кни́гу = accusatif (objet direct) ; кни́га = nominatif."},"commonMistakes":["Apprendre les cas comme une liste sans fonction."],"relatedConcepts":["noun-gender","noun-animacy","preposition-government"],"relatedLemmas":["стол","книга","город"],"examples":["На столе книга.","Я вижу стол."],"progression":{"beginner":"Un cas = une fonction.","intermediate":"Mini-paradigmes par thème."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'noun-gender',
  'noun-gender',
  'Genre des noms',
  'Gender',
  'A1',
  'Chaque nom russe est masculin, féminin ou neutre.',
  '{"coreIdea":"Le genre détermine les terminaisons et l''accord.","whyItExists":"Le genre est la grille sur laquelle s''accrochent déclinaison et adjectifs.","mentalModel":"Nom → genre → terminaisons possibles","visualModel":{"type":"tree","nodes":["Nom","m.","f.","n."]},"canonicalExplanation":{"understand":["Le genre n''est pas optionnel : il conditionne toutes les formes que tu rencontreras autour de ce nom."],"scheme":["стол (m.)","книга (f.)","окно (n.)"],"contrasts":[],"miniTable":null,"retentionPoints":["Terminaison -а/-я souvent féminin.","Neutre en -о/-е."],"family":["стол","книга","окно"]},"teachingScenario":{"fact":"Chaque nom russe a un genre (masculin, féminin, neutre) : кни́га est féminin — d''où но́вая, pas но́вый.","contrast":[{"fromForm":"но́вый стол","toForm":"но́вая кни́га","explanation":"Même adjectif : le genre du nom change, l''accord suit."}],"visual":{"nodes":["стол (m.)","кни́га (f.)","окно́ (n.)"],"layout":"vertical","caption":"Trois genres = trois familles d''accord"},"commonMistake":"Vérifie le genre avant l''accord : кни́га → но́вая.","reuse":["но́вый дом, но́вая кварти́ра, но́вое окно́."],"memoryAnchor":"Genre du nom (кни́га = féminin) → forme de l''adjectif (но́вая)."},"commonMistakes":["Deviner le genre sans vérifier l''accord."],"relatedConcepts":["noun-declension","adjective-agreement"],"relatedLemmas":["стол","книга","окно"],"examples":["Новый стол. Новая книга."],"progression":{"beginner":"Trois genres, trois grilles."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'adjective-agreement',
  'adjective-agreement',
  'Accord de l''adjectif',
  'Agreement',
  'A2',
  'L''adjectif s''accorde en genre, nombre et cas avec le nom.',
  '{"coreIdea":"L''adjectif copie les traits du nom qu''il décrit.","whyItExists":"Le russe lie visuellement l''adjectif et le nom par des terminaisons communes.","mentalModel":"Nom (féminin singulier) → adjectif (féminin singulier)","visualModel":{"type":"diagram","nodes":["книга","новая книга"]},"canonicalExplanation":{"understand":["новая s''accorde avec книга (féminin singulier). Ce n''est pas une variante libre : l''adjectif reflète le nom."],"scheme":["новый","новая","новое","новые"],"contrasts":[{"fromForm":"новый стол","toForm":"новая книга","question":"Qu''est-ce qui change ?","explanation":"Le genre du nom change, l''adjectif suit."}],"miniTable":{"title":"Accord","rows":[{"label":"m.","form":"новый"},{"label":"f.","form":"новая"},{"label":"n.","form":"новое"}]},"retentionPoints":["L''adjectif suit le nom, pas l''inverse."],"family":["новый","новая","новое"]},"teachingScenario":{"intuition":"L''adjectif copie le genre, le nombre et le cas du nom — pas de forme libre.","fact":"но́вая s''accorde avec кни́га : féminin singulier — c''est l''accord de l''adjectif.","contrast":[{"fromForm":"но́вый стол","toForm":"но́вая кни́га","explanation":"Seul le genre du nom change : l''adjectif suit (accord)."}],"visual":{"nodes":["но́вый стол","но́вая кни́га","но́вое окно́"],"layout":"vertical","caption":"Même adjectif, trois genres"},"commonMistake":"N''oublie pas le pluriel : но́вые кни́ги — l''accord continue.","reuse":["хоро́ший день, хоро́шая пого́да, хоро́шее настрое́ние — même règle."],"memoryAnchor":"Adjectif = accord avec le nom : но́вая suit кни́га (féminin)."},"commonMistakes":["Oublier l''accord au pluriel."],"relatedConcepts":["noun-gender","noun-declension"],"relatedLemmas":["новый","хороший","русский"],"examples":["Новая книга. Новый стол."],"progression":{"beginner":"Adjectif = copie du nom."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

INSERT INTO linguistic_concepts (
  id, slug, title, category, difficulty, summary,
  payload, validation_status, validated, updated_at
) VALUES (
  'preposition-government',
  'preposition-government',
  'Régence des prépositions',
  'Prepositions',
  'A2',
  'Chaque préposition impose un cas précis au nom qui suit.',
  '{"coreIdea":"в + accusatif (direction) vs в + prépositionnel (lieu).","whyItExists":"Le cas après une préposition n''est pas libre — c''est une convention fixe à mémoriser par préposition.","mentalModel":"Préposition → cas obligatoire","visualModel":{"type":"diagram","nodes":["в","→ Acc.","в","→ Prép."]},"canonicalExplanation":{"understand":["в Москву (accusatif) = direction. в Москве (prépositionnel) = lieu. La préposition в ne change pas, le cas oui."],"scheme":["в + Acc.","в + Prép.","на + Acc.","на + Prép."],"contrasts":[{"fromForm":"в Москву","toForm":"в Москве","question":"Qu''est-ce qui change ?","explanation":"Direction (accusatif) vs lieu (prépositionnel)."}],"miniTable":null,"retentionPoints":["Chaque préposition a son cas.","в/на + Acc. = direction."],"family":["в","на","к","у"]},"teachingScenario":{"intuition":"Chaque préposition russe impose un cas — ce n''est pas un choix libre.","fact":"Après в : l''accusatif marque куда́ (в Москву́) ; le prépositionnel marque где (в Москве́).","contrast":[{"fromForm":"в Москву́","toForm":"в Москве́","explanation":"Même préposition в : accusatif (куда́) vs prépositionnel (где)."}],"visual":{"nodes":["в Москву́ (accusatif)","в Москве́ (prépositionnel)"],"layout":"comparison","caption":"в + cas : куда́ vs где"},"commonMistake":"Ne mélange pas в Москву́ (куда́, accusatif) et в Москве́ (где, prépositionnel).","reuse":["Я е́ду в Москву́ / Я в Москве́ — même opposition partout."],"memoryAnchor":"в + accusatif = куда́ ; в + prépositionnel = где."},"commonMistakes":["Mélanger direction et lieu."],"relatedConcepts":["noun-declension"],"relatedLemmas":["в","на","к"],"examples":["Я еду в Москву.","Я в Москве."],"progression":{"beginner":"Préposition + cas fixe."},"teacherNotes":null}'::jsonb,
  'a-valider',
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  validation_status = COALESCE(linguistic_concepts.validation_status, EXCLUDED.validation_status),
  validated = linguistic_concepts.validated,
  updated_at = now();

-- Relations concept ↔ concept (teaching path)
-- Uniquement si les deux extrémités existent déjà en base.

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'verb-imperfective-aspect',
  'verb-present-conjugation',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-present-conjugation'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'verb-perfective-aspect',
  'verb-imperfective-aspect',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-perfective-aspect'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'aspect-pairs',
  'verb-imperfective-aspect',
  'extends'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'aspect-pairs'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'aspect-pairs',
  'verb-perfective-aspect',
  'extends'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'aspect-pairs'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-perfective-aspect'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'verb-movement-prefixes',
  'verb-perfective-aspect',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-movement-prefixes'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-perfective-aspect'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'verbs-of-motion',
  'verb-movement-prefixes',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verbs-of-motion'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-movement-prefixes'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'verbs-of-motion',
  'verb-imperfective-aspect',
  'related'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verbs-of-motion'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'noun-declension',
  'noun-gender',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-declension'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-gender'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'adjective-agreement',
  'noun-gender',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'adjective-agreement'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-gender'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'adjective-agreement',
  'noun-declension',
  'related'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'adjective-agreement'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-declension'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'reflexive-possessive',
  'adjective-agreement',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'reflexive-possessive'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'adjective-agreement'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

INSERT INTO concept_relations (from_concept_id, to_concept_id, relation)
SELECT
  'preposition-government',
  'noun-declension',
  'prerequisite'
WHERE EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'preposition-government'
)
AND EXISTS (
  SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-declension'
)
ON CONFLICT (from_concept_id, to_concept_id, relation) DO NOTHING;

-- Liaison lemme ↔ concept (relatedLemmas du seed)
-- weight = secondary : illustration, pas le phénomène primaire du lemme
-- Insert seulement si le lemme ET le concept existent.

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-present-conjugation', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'читать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-present-conjugation'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-present-conjugation', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'делать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-present-conjugation'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-present-conjugation', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'говорить'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-present-conjugation'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-present-conjugation', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'писать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-present-conjugation'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-imperfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'читать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-imperfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'делать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-imperfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'ходить'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-imperfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'говорить'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-imperfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-perfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'прочитать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-perfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-perfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'сделать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-perfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-perfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'понять'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-perfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-perfective-aspect', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'пойти'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-perfective-aspect'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'aspect-pairs', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'читать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'aspect-pairs'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'aspect-pairs', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'делать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'aspect-pairs'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'aspect-pairs', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'писать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'aspect-pairs'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-movement-prefixes', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'ехать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-movement-prefixes'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-movement-prefixes', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'идти'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-movement-prefixes'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-movement-prefixes', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'поехать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-movement-prefixes'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verb-movement-prefixes', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'пойти'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verb-movement-prefixes'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verbs-of-motion', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'идти'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verbs-of-motion'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verbs-of-motion', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'ехать'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verbs-of-motion'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verbs-of-motion', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'ходить'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verbs-of-motion'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'verbs-of-motion', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'ездить'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'verbs-of-motion'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'reflexive-possessive', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'свой'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'reflexive-possessive'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'reflexive-possessive', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'своя'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'reflexive-possessive'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'reflexive-possessive', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'своё'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'reflexive-possessive'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'noun-declension', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'стол'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-declension'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'noun-declension', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'книга'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-declension'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'noun-declension', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'город'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-declension'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'noun-gender', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'стол'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-gender'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'noun-gender', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'книга'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-gender'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'noun-gender', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'окно'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'noun-gender'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'adjective-agreement', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'новый'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'adjective-agreement'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'adjective-agreement', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'хороший'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'adjective-agreement'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'adjective-agreement', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'русский'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'adjective-agreement'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'preposition-government', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'в'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'preposition-government'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'preposition-government', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'на'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'preposition-government'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

INSERT INTO lemma_concept_links (lemma_id, concept_id, weight, signal)
SELECT l.id, 'preposition-government', 'secondary', 'seed:relatedLemmas'
FROM lemmas l
WHERE l.form = 'к'
  AND EXISTS (
    SELECT 1 FROM linguistic_concepts c WHERE c.id = 'preposition-government'
  )
ON CONFLICT (lemma_id, concept_id) DO NOTHING;

-- ============================================
-- Relations ignorées (extrémité absente du seed 11)
-- Feuille de route : docs/knowledge/missing-concepts.md
-- ============================================
-- SKIP: noun-animacy --[extends]--> noun-declension  (from manquant=noun-animacy)

-- Concepts référencés dans relatedConcepts mais absents du seed :
-- REF: noun-declension → relatedConcepts[noun-animacy] (concept non seedé)

-- Fin du seed Concept Graph
