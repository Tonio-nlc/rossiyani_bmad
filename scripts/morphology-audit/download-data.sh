#!/usr/bin/env bash
# Télécharge les CSV OpenRussian (CC BY-SA 4.0) dans data/
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
DATA="$DIR/data"
BASE="https://raw.githubusercontent.com/Badestrand/russian-dictionary/master"
mkdir -p "$DATA"
for f in nouns.csv verbs.csv adjectives.csv others.csv; do
  echo "→ $f"
  curl -fsSL -o "$DATA/$f" "$BASE/$f"
done
echo "OK — fichiers dans $DATA"
wc -l "$DATA"/*.csv
