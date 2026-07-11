# Lessons — Pipeline éditorial Rossiyani

Ce dossier définit **comment produire une leçon**, pas le contenu des leçons elles-mêmes.

| Document | Rôle |
|----------|------|
| [PIPELINE.md](./PIPELINE.md) | Modèle pédagogique, règles éditoriales, workflow de production |
| [CONTENT_BLOCKS.md](./CONTENT_BLOCKS.md) | Référence technique des blocs JSON |
| [CHECKLIST.md](./CHECKLIST.md) | Validation avant publication |
| [templates/lesson.template.json](./templates/lesson.template.json) | Template JSON réutilisable |
| [templates/lesson.template.sql](./templates/lesson.template.sql) | Template migration SQL |

Les champs `_section` dans le template JSON sont **des aides éditoriales** — les supprimer avant de transposer en migration SQL.

**Hors scope** : pas d'IA pour rédiger le contenu. Les leçons sont rédigées par un humain, stockées en base via migrations SQL.
