-- ============================================
-- Fondations du russe — leçons 2 et 3
-- ============================================
-- Idempotence : ON CONFLICT (path_id, slug) DO NOTHING sur chaque INSERT.

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'accents-toniques',
  'Les accents toniques : la clé de la prononciation',
  2,
  '[
    {
      "type": "paragraph",
      "text": "En russe, une seule syllabe de chaque mot est prononcée plus fort et plus longtemps que les autres — c''est l''accent tonique. Ce n''est pas un détail : il change complètement le son du mot, et parfois même son sens."
    },
    {
      "type": "example",
      "russian": "За́мок стои́т на холме́.",
      "translation": "Le château se trouve sur la colline.",
      "words": [
        { "text": "За́мок", "role": null },
        { "text": "стои́т", "role": "subject" },
        { "text": "на", "role": null },
        { "text": "холме́", "role": "place" }
      ],
      "note": "« за́мок » avec l''accent sur la première syllabe veut dire « château ». Si l''accent tombait sur la deuxième syllabe (замо́к), ce serait un tout autre mot : « serrure »."
    },
    {
      "type": "callout",
      "text": "L''accent ne se voit pas à l''écrit dans les textes russes courants — c''est pour ça que Rossiyani te le montre partout, pour que tu prennes le bon réflexe dès le début."
    },
    {
      "type": "paragraph",
      "text": "Il n''y a pas de règle fixe pour deviner où tombe l''accent : il faut l''apprendre mot par mot, en contexte, comme tu le fais ici en lisant des phrases réelles."
    },
    {
      "type": "example",
      "russian": "Она́ пи́шет письмо́ ма́ме.",
      "translation": "Elle écrit une lettre à sa maman.",
      "words": [
        { "text": "Она́", "role": "subject" },
        { "text": "пи́шет", "role": null },
        { "text": "письмо́", "role": null },
        { "text": "ма́ме", "role": "recipient" }
      ],
      "note": "Remarque que l''accent peut tomber sur des syllabes différentes selon les mots — « она́ » sur la fin, « пи́шет » sur le début. C''est cette variation qui donne au russe son rythme caractéristique."
    },
    {
      "type": "paragraph",
      "text": "Maintenant que tu sais repérer l''accent, la prochaine étape est de comprendre comment reconnaître le genre d''un mot russe — une autre clé pour anticiper ses terminaisons."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'fondations-du-russe'
ON CONFLICT (path_id, slug) DO NOTHING;

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'genre-des-mots',
  'Comment reconnaître le genre d''un mot au premier coup d''œil',
  3,
  '[
    {
      "type": "paragraph",
      "text": "Chaque nom russe a un genre — masculin, féminin ou neutre. Ce genre influence les terminaisons du mot lui-même, mais aussi celles des adjectifs et des verbes au passé qui l''accompagnent. Bonne nouvelle : dans la plupart des cas, tu peux le deviner rien qu''en regardant la fin du mot au dictionnaire."
    },
    {
      "type": "comparison",
      "title": "Repérer le genre à la terminaison",
      "columns": ["Terminaison", "Genre", "Exemple"],
      "rows": [
        { "label": "Consonne", "values": ["Masculin", "стол (table)"] },
        { "label": "-а / -я", "values": ["Féminin", "рабо́та (travail)"] },
        { "label": "-о / -е", "values": ["Neutre", "окно́ (fenêtre)"] }
      ]
    },
    {
      "type": "example",
      "russian": "Ста́рый друг помога́ет ей.",
      "translation": "Un vieil ami l''aide.",
      "words": [
        { "text": "Ста́рый", "role": null },
        { "text": "друг", "role": "subject" },
        { "text": "помога́ет", "role": null },
        { "text": "ей", "role": "recipient" }
      ],
      "note": "« друг » se termine par une consonne : c''est un mot masculin. C''est pour ça que l''adjectif « ста́рый » prend lui aussi une terminaison masculine."
    },
    {
      "type": "callout",
      "text": "Le genre n''est pas une case administrative à mémoriser à part — c''est ce qui explique pourquoi les mots autour s''accordent comme ils le font. Une fois que tu le vois, les terminaisons cessent de paraître aléatoires."
    },
    {
      "type": "example",
      "russian": "Больша́я река́ течёт ме́дленно.",
      "translation": "Une grande rivière coule lentement.",
      "words": [
        { "text": "Больша́я", "role": null },
        { "text": "река́", "role": "subject" },
        { "text": "течёт", "role": null },
        { "text": "ме́дленно", "role": null }
      ],
      "note": "« река́ » se termine en -а : féminin. L''adjectif « больша́я » s''accorde en conséquence avec sa propre terminaison féminine."
    },
    {
      "type": "paragraph",
      "text": "Terminaisons, accents, genre : ces trois briques posent les bases de tout ce que tu liras dans Rossiyani. La suite du parcours ira plus loin avec les six cas, qui expliquent pourquoi une même racine peut prendre tant de formes différentes."
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'fondations-du-russe'
ON CONFLICT (path_id, slug) DO NOTHING;
