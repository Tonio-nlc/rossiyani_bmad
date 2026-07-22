# Morphology audit — OpenRussian × textes gold

Audit **hors code applicatif**. Aucune migration, aucune table.

## Reproduire

```bash
chmod +x scripts/morphology-audit/download-data.sh
./scripts/morphology-audit/download-data.sh
python3 scripts/morphology-audit/run-audit.py
```

Source CSV : https://github.com/Badestrand/russian-dictionary (CC BY-SA 4.0).

## Livrables

| Fichier | Rôle |
|---------|------|
| `coverage-report.md` | Rapport chiffré + manquants |
| `run-audit.py` | Script d’audit |
| `download-data.sh` | Téléchargement des 4 CSV |
| `data/*.csv` | Dataset local (gitignored) |
