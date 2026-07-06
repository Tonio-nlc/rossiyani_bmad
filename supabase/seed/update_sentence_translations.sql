-- Sentence-level French translations for Reader "voir la traduction"
-- Run after seed_texts.sql and accent updates

UPDATE texts SET content_annotated = '{
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
}'::jsonb WHERE title = 'По дороге';

UPDATE texts SET content_annotated = '{
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
}'::jsonb WHERE title = 'В метро';

UPDATE texts SET content_annotated = '{
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
}'::jsonb WHERE title = 'Первый кофе';
