-- ============================================
-- SEED — Bibliothèque (5 textes A1)
-- Contenu avec accents toniques (U+0301) + traductions phrase par phrase
-- Idempotent : upsert par titre unique
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS texts_title_unique ON texts (title);

INSERT INTO texts (
  title,
  content,
  level,
  collection,
  word_count,
  reading_time_minutes,
  content_annotated
) VALUES
  (
    'В метро',
    'А́нна вхо́дит в ваго́н и садится у окна́. По́езд ме́дленно е́дет. Никто́ гро́мко не говори́т. Мно́гие лю́ди смо́трят в телефо́н или чита́ют кни́гу. На сле́дующей ста́нции в ваго́н вхо́дит пожила́я же́нщина. Молодо́й челове́к сра́зу встаёт и отдаёт ей своё ме́сто. Же́нщина улыба́ется и говори́т: ''Спаси́бо, молодо́й челове́к''. А ты ча́сто чита́ешь в тра́нспорте?',
    'A1',
    'everyday_russian',
    60,
    3,
    '{
      "sentences": [
        {"text": "А́нна вхо́дит в ваго́н и садится у окна́.", "translationFr": "Anna entre dans le wagon et s''assoit près de la fenêtre."},
        {"text": "По́езд ме́дленно е́дет.", "translationFr": "Le train avance lentement."},
        {"text": "Никто́ гро́мко не говори́т.", "translationFr": "Personne ne parle fort."},
        {"text": "Мно́гие лю́ди смо́трят в телефо́н или чита́ют кни́гу.", "translationFr": "Beaucoup de gens regardent leur téléphone ou lisent un livre."},
        {"text": "На сле́дующей ста́нции в ваго́н вхо́дит пожила́я же́нщина.", "translationFr": "À la station suivante, une vieille femme monte dans le wagon."},
        {"text": "Молодо́й челове́к сра́зу встаёт и отдаёт ей своё ме́сто.", "translationFr": "Un jeune homme se lève aussitôt et lui cède sa place."},
        {"text": "Же́нщина улыба́ется и говори́т: Спаси́бо, молодо́й челове́к.", "translationFr": "La femme sourit et dit : Merci, jeune homme."},
        {"text": "А ты ча́сто чита́ешь в тра́нспорте?", "translationFr": "Et toi, tu lis souvent dans les transports ?"}
      ]
    }'::jsonb
  ),
  (
    'По дороге',
    'Са́ша идёт на рабо́ту пешко́м. Сего́дня хоро́шая пого́да. Со́лнце све́тит, не́бо голубо́е. По доро́ге он ви́дит ста́рого дру́га. Они́ здоро́ваются и немно́го разгова́ривают. Пото́м Са́ша продолжа́ет идти́. Он ду́мает о предстоя́щем дне. Рабо́та начина́ется в де́вять часо́в.',
    'A1',
    'everyday_russian',
    48,
    2,
    '{
      "sentences": [
        {"text": "Са́ша идёт на рабо́ту пешко́м.", "translationFr": "Sacha va au travail à pied."},
        {"text": "Сего́дня хоро́шая пого́да.", "translationFr": "Aujourd''hui il fait beau."},
        {"text": "Со́лнце све́тит, не́бо голубо́е.", "translationFr": "Le soleil brille, le ciel est bleu."},
        {"text": "По доро́ге он ви́дит ста́рого дру́га.", "translationFr": "En chemin, il voit un vieil ami."},
        {"text": "Они́ здоро́ваются и немно́го разгова́ривают.", "translationFr": "Ils se saluent et bavardent un peu."},
        {"text": "Пото́м Са́ша продолжа́ет идти́.", "translationFr": "Puis Sacha continue de marcher."},
        {"text": "Он ду́мает о предстоя́щем дне.", "translationFr": "Il pense à la journée qui l''attend."},
        {"text": "Рабо́та начина́ется в де́вять часо́в.", "translationFr": "Le travail commence à neuf heures."}
      ]
    }'::jsonb
  ),
  (
    'Первый кофе',
    'Ка́ждое у́тро Ма́ша де́лает ко́фе. Она́ встаёт в семь часо́в. Снача́ла она́ идёт на ку́хню. Там она́ включа́ет кофема́шину. Пока́ ко́фе гото́вится, она́ смо́трит в окно́. На у́лице ещё темно́. Ко́фе гото́в. Ма́ша берёт ча́шку и садится за сто́л. Э́то её люби́мый моме́нт дня.',
    'A1',
    'everyday_russian',
    84,
    4,
    '{
      "sentences": [
        {"text": "Ка́ждое у́тро Ма́ша де́лает ко́фе.", "translationFr": "Chaque matin, Macha fait du café."},
        {"text": "Она́ встаёт в семь часо́в.", "translationFr": "Elle se lève à sept heures."},
        {"text": "Снача́ла она́ идёт на ку́хню.", "translationFr": "D''abord elle va dans la cuisine."},
        {"text": "Там она́ включа́ет кофема́шину.", "translationFr": "Là-bas elle allume la machine à café."},
        {"text": "Пока́ ко́фе гото́вится, она́ смо́трит в окно́.", "translationFr": "Pendant que le café se prépare, elle regarde par la fenêtre."},
        {"text": "На у́лице ещё темно́.", "translationFr": "Dehors il fait encore nuit."},
        {"text": "Ко́фе гото́в.", "translationFr": "Le café est prêt."},
        {"text": "Ма́ша берёт ча́шку и садится за сто́л.", "translationFr": "Macha prend sa tasse et s''assoit à table."},
        {"text": "Э́то её люби́мый моме́нт дня.", "translationFr": "C''est son moment préféré de la journée."}
      ]
    }'::jsonb
  ),
  (
    'В магазине',
    'Ива́н идёт в магази́н. Ему́ ну́жен хлеб и молоко́. В магази́не мно́го люде́й. Ива́н берёт корзи́ну. Он нахо́дит хлеб на второ́й по́лке. Молоко́ стои́т в холоди́льнике. Ива́н подхо́дит к ка́ссе. Там небольша́я о́чередь. Он пла́тит ка́ртой. Прода́вец говори́т: ''Спаси́бо, прихо́дите ещё''.',
    'A1',
    'everyday_russian',
    72,
    4,
    '{
      "sentences": [
        {"text": "Ива́н идёт в магази́н.", "translationFr": "Ivan va au magasin."},
        {"text": "Ему́ ну́жен хлеб и молоко́.", "translationFr": "Il lui faut du pain et du lait."},
        {"text": "В магази́не мно́го люде́й.", "translationFr": "Il y a beaucoup de monde au magasin."},
        {"text": "Ива́н берёт корзи́ну.", "translationFr": "Ivan prend un panier."},
        {"text": "Он нахо́дит хлеб на второ́й по́лке.", "translationFr": "Il trouve le pain au deuxième rayon."},
        {"text": "Молоко́ стои́т в холоди́льнике.", "translationFr": "Le lait est dans le réfrigérateur."},
        {"text": "Ива́н подхо́дит к ка́ссе.", "translationFr": "Ivan se rend à la caisse."},
        {"text": "Там небольша́я о́чередь.", "translationFr": "Il y a une petite file d''attente."},
        {"text": "Он пла́тит ка́ртой.", "translationFr": "Il paie par carte."},
        {"text": "Прода́вец говори́т: Спаси́бо, прихо́дите ещё.", "translationFr": "Le vendeur dit : Merci, revenez."}
      ]
    }'::jsonb
  ),
  (
    'Дома вечером',
    'Ве́чером Оле́г прихо́дит домо́й. Он уста́л по́сле рабо́ты. Он снима́ет пальто́ и ту́фли. Пото́м он идёт на ку́хню. В холоди́льнике есть суп. Оле́г разогрева́ет суп и садится есть. По телеви́зору идёт фильм. По́сле у́жина Оле́г чита́ет кни́гу. В де́сять часо́в он ложи́тся спать.',
    'A1',
    'everyday_russian',
    66,
    3,
    '{
      "sentences": [
        {"text": "Ве́чером Оле́г прихо́дит домо́й.", "translationFr": "Le soir, Oleg rentre à la maison."},
        {"text": "Он уста́л по́сле рабо́ты.", "translationFr": "Il est fatigué après le travail."},
        {"text": "Он снима́ет пальто́ и ту́фли.", "translationFr": "Il enlève son manteau et ses chaussures."},
        {"text": "Пото́м он идёт на ку́хню.", "translationFr": "Puis il va à la cuisine."},
        {"text": "В холоди́льнике есть суп.", "translationFr": "Il y a de la soupe dans le réfrigérateur."},
        {"text": "Оле́г разогрева́ет суп и садится есть.", "translationFr": "Oleg réchauffe la soupe et s''assoit pour manger."},
        {"text": "По телеви́зору идёт фильм.", "translationFr": "Un film passe à la télévision."},
        {"text": "По́сле у́жина Оле́г чита́ет кни́гу.", "translationFr": "Après le dîner, Oleg lit un livre."},
        {"text": "В де́сять часо́в он ложи́тся спать.", "translationFr": "À dix heures, il se couche."}
      ]
    }'::jsonb
  )
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  content_annotated = EXCLUDED.content_annotated,
  word_count = EXCLUDED.word_count,
  reading_time_minutes = EXCLUDED.reading_time_minutes;
