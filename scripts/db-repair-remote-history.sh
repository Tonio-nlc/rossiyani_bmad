#!/usr/bin/env bash
# Répare l'historique des migrations Supabase quand le schéma a été appliqué via SQL Editor.
# À exécuter UNE SEULE FOIS sur un projet existant, avant le premier `supabase db push`.
#
# Usage (projet lié via `supabase link`) :
#   ./scripts/db-repair-remote-history.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LAST_APPLIED="${1:-007}"

versions=()
for i in $(seq -f "%03g" 1 "$LAST_APPLIED"); do
  versions+=("$i")
done

echo "→ Marquage des migrations 001–${LAST_APPLIED} comme appliquées sur le projet lié…"
supabase migration repair --status applied "${versions[@]}"
echo "→ Terminé. Exécutez ensuite : supabase db push --yes"
