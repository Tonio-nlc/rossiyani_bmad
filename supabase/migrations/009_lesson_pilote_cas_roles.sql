-- ============================================
-- Les six cas — leçon pilote 1
-- ============================================
-- Source : docs/lessons/content/pilote-01-les-cas-changent-le-role.json
-- Pipeline : docs/lessons/PIPELINE.md
-- Accents toniques en NFC (U+0301) — adaptation technique uniquement.
-- Idempotence : ON CONFLICT (path_id, slug) DO NOTHING

INSERT INTO lessons (path_id, slug, title, order_index, content_blocks)
SELECT
  lp.id,
  'les-cas-changent-le-role',
  'Les cas ne changent pas les mots. Ils changent leur rôle.',
  0,
  '[
    {
      "type": "paragraph",
      "text": "Pourquoi le mot школа devient-il parfois школе, школу ou школой ?"
    },
    {
      "type": "paragraph",
      "text": "Est-ce que ce sont plusieurs mots ?"
    },
    {
      "type": "paragraph",
      "text": "Ou est-ce le même mot qui joue plusieurs rôles ?"
    },
    {
      "type": "paragraph",
      "text": "Imagine une pièce de théâtre."
    },
    {
      "type": "paragraph",
      "text": "Il y a un acteur."
    },
    {
      "type": "paragraph",
      "text": "Cet acteur peut être :"
    },
    {
      "type": "paragraph",
      "text": "le héros"
    },
    {
      "type": "paragraph",
      "text": "le médecin"
    },
    {
      "type": "paragraph",
      "text": "le professeur"
    },
    {
      "type": "paragraph",
      "text": "le voisin"
    },
    {
      "type": "paragraph",
      "text": "L''acteur ne change pas."
    },
    {
      "type": "paragraph",
      "text": "Seul son rôle change."
    },
    {
      "type": "paragraph",
      "text": "En russe, c''est exactement la même chose."
    },
    {
      "type": "paragraph",
      "text": "Le mot reste le même."
    },
    {
      "type": "paragraph",
      "text": "Sa terminaison change parce que son rôle dans la phrase change."
    },
    {
      "type": "example",
      "russian": "Шко́ла большая.",
      "translation": "L''école est grande.",
      "words": [
        { "text": "Шко́ла", "role": "subject" }
      ],
      "note": "Ici, школа est ce dont on parle."
    },
    {
      "type": "example",
      "russian": "Я иду в шко́лу.",
      "translation": "Je vais à l''école.",
      "words": [
        { "text": "Я", "role": "subject" },
        { "text": "иду", "role": null },
        { "text": "в", "role": null },
        { "text": "шко́лу", "role": "place" }
      ],
      "note": "Ici, школу est la destination."
    },
    {
      "type": "example",
      "russian": "Я учусь в шко́ле.",
      "translation": "J''étudie à l''école.",
      "words": [
        { "text": "Я", "role": "subject" },
        { "text": "учусь", "role": null },
        { "text": "в", "role": null },
        { "text": "шко́ле", "role": "place" }
      ],
      "note": "Ici, школе indique le lieu."
    },
    {
      "type": "paragraph",
      "text": "Les trois phrases parlent de la même école."
    },
    {
      "type": "paragraph",
      "text": "Ce qui change n''est pas l''école."
    },
    {
      "type": "paragraph",
      "text": "C''est sa fonction."
    },
    {
      "type": "paragraph",
      "text": "En français, on ajoute souvent des petits mots :"
    },
    {
      "type": "paragraph",
      "text": "à"
    },
    {
      "type": "paragraph",
      "text": "de"
    },
    {
      "type": "paragraph",
      "text": "avec"
    },
    {
      "type": "paragraph",
      "text": "dans"
    },
    {
      "type": "paragraph",
      "text": "pour"
    },
    {
      "type": "paragraph",
      "text": "Le russe fait souvent l''inverse."
    },
    {
      "type": "paragraph",
      "text": "Au lieu d''ajouter un mot, il modifie la fin du nom."
    },
    {
      "type": "paragraph",
      "text": "La terminaison devient un indice qui indique le rôle du mot dans la phrase."
    },
    {
      "type": "paragraph",
      "text": "Ce n''est donc pas une exception grammaticale."
    },
    {
      "type": "paragraph",
      "text": "C''est une manière plus compacte d''exprimer les relations entre les mots."
    },
    {
      "type": "schema",
      "svgContent": "<svg viewBox=\"0 0 480 280\" xmlns=\"http://www.w3.org/2000/svg\"><text x=\"240\" y=\"28\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"#0E0E0E\">ÉCOLE</text><rect x=\"190\" y=\"44\" width=\"100\" height=\"36\" rx=\"8\" fill=\"#EEF0FF\" stroke=\"#4F46E5\" stroke-width=\"1.5\"/><text x=\"240\" y=\"67\" text-anchor=\"middle\" font-size=\"15\" fill=\"#0E0E0E\" font-family=\"serif\">школа</text><line x1=\"240\" y1=\"80\" x2=\"240\" y2=\"108\" stroke=\"#4F46E5\" stroke-width=\"1.5\"/><line x1=\"80\" y1=\"108\" x2=\"400\" y2=\"108\" stroke=\"#4F46E5\" stroke-width=\"1.5\"/><line x1=\"80\" y1=\"108\" x2=\"80\" y2=\"132\" stroke=\"#4F46E5\" stroke-width=\"1.5\"/><line x1=\"240\" y1=\"108\" x2=\"240\" y2=\"132\" stroke=\"#4F46E5\" stroke-width=\"1.5\"/><line x1=\"400\" y1=\"108\" x2=\"400\" y2=\"132\" stroke=\"#4F46E5\" stroke-width=\"1.5\"/><text x=\"80\" y=\"152\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"#5A5A5A\">Sujet</text><text x=\"240\" y=\"152\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"#5A5A5A\">Destination</text><text x=\"400\" y=\"152\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"#5A5A5A\">Lieu</text><rect x=\"30\" y=\"164\" width=\"100\" height=\"36\" rx=\"8\" fill=\"#FFFFFF\" stroke=\"#E8E4DC\" stroke-width=\"1.5\"/><text x=\"80\" y=\"187\" text-anchor=\"middle\" font-size=\"15\" fill=\"#3B82F6\" font-family=\"serif\">школа</text><rect x=\"190\" y=\"164\" width=\"100\" height=\"36\" rx=\"8\" fill=\"#FFFFFF\" stroke=\"#E8E4DC\" stroke-width=\"1.5\"/><text x=\"240\" y=\"187\" text-anchor=\"middle\" font-size=\"15\" fill=\"#22C55E\" font-family=\"serif\">школу</text><rect x=\"350\" y=\"164\" width=\"100\" height=\"36\" rx=\"8\" fill=\"#FFFFFF\" stroke=\"#E8E4DC\" stroke-width=\"1.5\"/><text x=\"400\" y=\"187\" text-anchor=\"middle\" font-size=\"15\" fill=\"#22C55E\" font-family=\"serif\">школе</text></svg>",
      "caption": "Le mot reste le même. La terminaison indique simplement son rôle."
    },
    {
      "type": "takeaways",
      "items": [
        "Les cas ne créent pas de nouveaux mots.",
        "Ils changent la fonction d''un mot dans la phrase.",
        "Une terminaison est un indice de rôle.",
        "Comprendre le rôle est plus important que mémoriser le nom du cas.",
        "Dans Rossiyani, on cherche toujours le pourquoi avant le nom de la règle."
      ]
    }
  ]'::jsonb
FROM lesson_paths lp
WHERE lp.slug = 'les-six-cas'
ON CONFLICT (path_id, slug) DO NOTHING;
