-- ============================================
-- Les six cas — leçons 2 à 7
-- ============================================
-- Accents toniques russes en NFC pour compatibilité LessonExampleSentence.
--
-- Idempotence : chaque INSERT utilise ON CONFLICT (path_id, slug) DO NOTHING
-- pour pouvoir relancer le script sans erreur de contrainte unique.
-- La leçon 1 (pourquoi-les-cas) est dans 006_lesson_six_cas_1.sql — pas ici.

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'nominatif',
  'Le nominatif : le cas du sujet',
  2,
  '[
    {
      "type": "paragraph",
      "text": "Le nominatif est le cas de base — celui du dictionnaire, celui qu''on apprend en premier pour chaque mot. C''est aussi le cas du sujet : la personne ou la chose qui fait l''action. Dans Rossiyani, c''est le rôle que tu vois en bleu."
    },
    {
      "type": "example",
      "russian": "Учи́тель объясня́ет уро́к.",
      "translation": "Le professeur explique la leçon.",
      "words": [
        { "text": "Учи́тель", "role": "subject" },
        { "text": "объясня́ет", "role": null },
        { "text": "уро́к", "role": "object" }
      ],
      "note": "« учи́тель » est au nominatif : c''est lui qui explique. C''est la forme que tu trouverais telle quelle dans un dictionnaire — aucune terminaison ajoutée."
    },
    {
      "type": "callout",
      "text": "Repère utile : quand tu cherches un mot russe dans un dictionnaire ou dans le panel Explorer, c''est toujours sa forme au nominatif que tu vois affichée en gras — c''est la forme de référence de tous les autres cas."
    },
    {
      "type": "example",
      "russian": "Больша́я соба́ка бежи́т бы́стро.",
      "translation": "Un grand chien court vite.",
      "words": [
        { "text": "Больша́я", "role": null },
        { "text": "соба́ка", "role": "subject" },
        { "text": "бежи́т", "role": null },
        { "text": "бы́стро", "role": null }
      ],
      "note": "« соба́ка » est le sujet : c''est elle qui court. L''adjectif « больша́я » s''accorde avec elle en genre et en cas — les deux sont au nominatif féminin."
    },
    {
      "type": "paragraph",
      "text": "Le nominatif est ton point de départ. Les cinq cas suivants existent pour exprimer tout ce que le sujet n''exprime pas : ce qu''il fait subir à quelque chose, à qui, où, avec quoi, ou à qui appartient quoi. On commence par le plus fréquent après le nominatif : l''accusatif."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'accusatif',
  'L''accusatif : l''objet direct',
  3,
  '[
    {
      "type": "paragraph",
      "text": "L''accusatif marque ce qui reçoit directement l''action — la chose ou la personne qu''on regarde, qu''on mange, qu''on lit, qu''on aide. C''est le rôle que tu vois en corail dans Rossiyani."
    },
    {
      "type": "example",
      "russian": "Ма́ша чита́ет кни́гу.",
      "translation": "Macha lit un livre.",
      "words": [
        { "text": "Ма́ша", "role": "subject" },
        { "text": "чита́ет", "role": null },
        { "text": "кни́гу", "role": "object" }
      ],
      "note": "« кни́га » (livre, forme du dictionnaire) devient « кни́гу » à l''accusatif : la terminaison -а se transforme en -у. C''est cette terminaison qui indique que le livre est ce qui est lu, pas qui lit."
    },
    {
      "type": "comparison",
      "title": "Nominatif → Accusatif (féminin en -а)",
      "columns": ["Nominatif", "Accusatif", "Sens"],
      "rows": [
        { "label": "кни́га", "values": ["кни́гу", "livre"] },
        { "label": "рабо́та", "values": ["рабо́ту", "travail"] },
        { "label": "маши́на", "values": ["маши́ну", "voiture"] }
      ]
    },
    {
      "type": "callout",
      "text": "Astuce : pour les mots masculins inanimés (comme « стол », table) et les mots neutres, l''accusatif est identique au nominatif — seule la terminaison féminine en -а/-я change visiblement. C''est pour ça que l''accusatif surprend surtout sur les mots féminins."
    },
    {
      "type": "example",
      "russian": "Он лю́бит э́ту де́вушку.",
      "translation": "Il aime cette fille.",
      "words": [
        { "text": "Он", "role": "subject" },
        { "text": "лю́бит", "role": null },
        { "text": "э́ту", "role": null },
        { "text": "де́вушку", "role": "object" }
      ],
      "note": "« де́вушка » devient « де́вушку » — même logique que « кни́гу ». Remarque que « э́ту » (cette) s''accorde aussi à l''accusatif féminin, pas seulement le nom lui-même."
    },
    {
      "type": "paragraph",
      "text": "Le nominatif dit qui agit, l''accusatif dit sur quoi ou sur qui. Le cas suivant, le génitif, sert à exprimer l''appartenance — à qui appartient quelque chose."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'genitif',
  'Le génitif : la possession (et bien plus)',
  4,
  '[
    {
      "type": "paragraph",
      "text": "Le génitif répond d''abord à la question « à qui ? » ou « de quoi ? » — c''est le cas de la possession. C''est le rôle que tu vois en violet dans Rossiyani."
    },
    {
      "type": "example",
      "russian": "Э́то маши́на бра́та.",
      "translation": "C''est la voiture du frère.",
      "words": [
        { "text": "Э́то", "role": null },
        { "text": "маши́на", "role": null },
        { "text": "бра́та", "role": "possession" }
      ],
      "note": "« брат » (frère, nominatif) devient « бра́та » au génitif : c''est la voiture QUI APPARTIENT à lui. En français, on ajoute « du » ; en russe, c''est la terminaison du mot qui porte cette idée."
    },
    {
      "type": "callout",
      "text": "Le génitif ne sert pas qu''à la possession : il apparaît aussi après beaucoup de quantités (« beaucoup de », « un verre de »), après certaines prépositions (« sans », « près de »), et pour nier l''existence de quelque chose. Rossiyani te le signale en violet uniquement quand son rôle est la possession — les autres usages viendront dans des leçons dédiées."
    },
    {
      "type": "example",
      "russian": "Э́то кни́га сестры́.",
      "translation": "C''est le livre de la sœur.",
      "words": [
        { "text": "Э́то", "role": null },
        { "text": "кни́га", "role": null },
        { "text": "сестры́", "role": "possession" }
      ],
      "note": "« сестра́ » devient « сестры́ » : la terminaison -а devient -ы. Chaque genre a sa propre transformation au génitif, mais l''idée reste la même : indiquer à qui appartient la chose dont on parle."
    },
    {
      "type": "paragraph",
      "text": "Après avoir vu qui possède quoi, voyons le cas qui indique à qui une chose est destinée : le datif."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'datif',
  'Le datif : le destinataire',
  5,
  '[
    {
      "type": "paragraph",
      "text": "Le datif marque à qui une chose est donnée, dite, ou destinée. C''est le rôle que tu vois en ambre dans Rossiyani — souvent après des verbes comme « donner », « dire », « écrire », « montrer »."
    },
    {
      "type": "example",
      "russian": "Оте́ц даёт де́ньги сы́ну.",
      "translation": "Le père donne de l''argent à son fils.",
      "words": [
        { "text": "Оте́ц", "role": "subject" },
        { "text": "даёт", "role": null },
        { "text": "де́ньги", "role": "object" },
        { "text": "сы́ну", "role": "recipient" }
      ],
      "note": "« сын » (fils, nominatif) devient « сы́ну » au datif. L''argent (« де́ньги », accusatif) est ce qui est donné ; le fils est celui à qui il est donné — deux rôles différents, deux cas différents, dans la même phrase."
    },
    {
      "type": "callout",
      "text": "Repère utile : si tu peux reformuler la phrase en français avec « à » devant une personne (« à son fils », « à sa mère »), c''est très probablement un datif en russe."
    },
    {
      "type": "example",
      "russian": "Я пишу́ письмо́ подру́ге.",
      "translation": "J''écris une lettre à mon amie.",
      "words": [
        { "text": "Я", "role": "subject" },
        { "text": "пишу́", "role": null },
        { "text": "письмо́", "role": "object" },
        { "text": "подру́ге", "role": "recipient" }
      ],
      "note": "« подру́га » (amie) devient « подру́ге » au datif — c''est elle qui reçoit la lettre. La terminaison -а du nominatif devient -е au datif pour la plupart des mots féminins."
    },
    {
      "type": "paragraph",
      "text": "Nous avons vu qui agit, sur quoi, à qui appartient quoi, et à qui une chose est destinée. Il reste à voir comment on fait quelque chose — avec quel outil ou en compagnie de qui : c''est l''instrumental."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'instrumental',
  'L''instrumental : le moyen et la compagnie',
  6,
  '[
    {
      "type": "paragraph",
      "text": "L''instrumental répond à la question « avec quoi ? » ou « avec qui ? ». Il exprime l''outil utilisé pour faire une action, ou la personne qui accompagne quelqu''un."
    },
    {
      "type": "callout",
      "text": "Ce cas n''a pas encore de couleur dédiée dans Rossiyani — les cinq couleurs actuelles couvrent le sujet, l''objet direct, le lieu, la possession et le destinataire. Les mots à l''instrumental apparaîtront donc sans couleur pour l''instant dans les exemples ci-dessous. C''est volontaire : on préfère ne pas improviser une couleur plutôt que d''en choisir une qui ne serait pas cohérente avec le reste du système."
    },
    {
      "type": "example",
      "russian": "Она́ пи́шет карандашо́м.",
      "translation": "Elle écrit avec un crayon.",
      "words": [
        { "text": "Она́", "role": "subject" },
        { "text": "пи́шет", "role": null },
        { "text": "карандашо́м", "role": null }
      ],
      "note": "« каранда́ш » (crayon, nominatif) devient « карандашо́м » à l''instrumental : c''est l''outil utilisé pour écrire. La terminaison -ом est typique du masculin à ce cas."
    },
    {
      "type": "example",
      "russian": "Он идёт в кино́ с сестро́й.",
      "translation": "Il va au cinéma avec sa sœur.",
      "words": [
        { "text": "Он", "role": "subject" },
        { "text": "идёт", "role": null },
        { "text": "в", "role": null },
        { "text": "кино́", "role": null },
        { "text": "с", "role": null },
        { "text": "сестро́й", "role": null }
      ],
      "note": "« сестра́ » devient « сестро́й » après la préposition « с » (avec) : c''est le sens de compagnie, l''autre grand usage de l''instrumental."
    },
    {
      "type": "paragraph",
      "text": "Un dernier cas nous reste : celui qui indique où l''on se trouve, ou de quoi on parle — le prépositionnel."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'prepositionnel',
  'Le prépositionnel : le lieu et le sujet de conversation',
  7,
  '[
    {
      "type": "paragraph",
      "text": "Le prépositionnel — parfois appelé locatif — s''utilise toujours après une préposition, jamais seul. Il exprime le lieu où l''on se trouve (pas où l''on va, attention) ou le sujet dont on parle. C''est le rôle que tu vois en vert dans Rossiyani quand il indique un lieu."
    },
    {
      "type": "example",
      "russian": "Кни́га лежи́т на столе́.",
      "translation": "Le livre est posé sur la table.",
      "words": [
        { "text": "Кни́га", "role": "subject" },
        { "text": "лежи́т", "role": null },
        { "text": "на", "role": null },
        { "text": "столе́", "role": "place" }
      ],
      "note": "« стол » (table, nominatif) devient « столе́ » après « на » : le livre est déjà posé là, il n''y a pas de mouvement. Compare avec l''accusatif après « на » que tu as vu dans la toute première leçon du parcours Fondations — « идёт на рабо́ту » — où il y avait un mouvement vers un lieu."
    },
    {
      "type": "callout",
      "text": "Le piège classique : la préposition « на » (et « в ») peut demander soit l''accusatif (direction, mouvement vers) soit le prépositionnel (position, lieu où l''on est déjà). La différence ne se voit pas sur la préposition, mais sur la terminaison du mot qui suit."
    },
    {
      "type": "example",
      "russian": "Мы говори́м о фи́льме.",
      "translation": "Nous parlons du film.",
      "words": [
        { "text": "Мы", "role": "subject" },
        { "text": "говори́м", "role": null },
        { "text": "о", "role": null },
        { "text": "фи́льме", "role": "place" }
      ],
      "note": "Ici, le prépositionnel n''indique pas un lieu physique mais un sujet de conversation : « о фи́льме » = « à propos du film ». Rossiyani colore ce rôle en vert par simplification, même si ce n''est pas un lieu au sens strict — les deux usages partagent la même terminaison et la même logique de cas."
    },
    {
      "type": "paragraph",
      "text": "Tu as maintenant vu les six cas du russe et leur logique de fond : chacun répond à une question précise sur le rôle d''un mot dans la phrase. La suite naturelle est de voir comment ces mêmes idées de rôle se retrouvent différemment avec les verbes, à travers la notion d''aspect — perfectif et imperfectif — dans le prochain parcours."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;
