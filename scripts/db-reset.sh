#!/usr/bin/env bash
# Rossiyani — reconstruction complète de la base depuis les migrations
#
# Usage local (Docker requis) :
#   ./scripts/db-reset.sh local
#
# Usage distant (projet Supabase lié via `supabase link`) :
#   ./scripts/db-reset.sh remote
#
# Vérification seule (liste migrations + comptages attendus) :
#   ./scripts/db-reset.sh verify
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MIGRATION_COUNT=8
EXPECTED_TABLES=(
  word_families lemmas word_forms grammar_patterns explanation_cache
  texts user_profiles user_progress user_vocabulary srs_reviews
  linguistic_knowledge review_history
  lesson_paths lessons user_lesson_progress
)

log() { printf '→ %s\n' "$*"; }

verify_migrations() {
  log "Migrations locales (supabase/migrations/)"
  ls -1 supabase/migrations/*.sql | sort
  local count
  count="$(ls -1 supabase/migrations/*.sql | wc -l | tr -d ' ')"
  if [[ "$count" -lt "$MIGRATION_COUNT" ]]; then
    echo "Erreur : $count migrations trouvées, $MIGRATION_COUNT attendues minimum." >&2
    exit 1
  fi
}

reset_local() {
  verify_migrations
  log "Démarrage Supabase local (si nécessaire)…"
  supabase start
  log "Reset : drop schéma public + réapplication migrations 001–008"
  supabase db reset
  log "Vérification post-reset…"
  verify_counts_local
}

verify_counts_local() {
  local db_url="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  psql "$db_url" -v ON_ERROR_STOP=1 -c "
    SELECT 'texts' AS entity, count(*)::int AS n FROM texts
    UNION ALL SELECT 'lesson_paths', count(*)::int FROM lesson_paths
    UNION ALL SELECT 'lessons', count(*)::int FROM lessons;
  "
}

reset_remote() {
  verify_migrations
  if ! supabase projects list >/dev/null 2>&1; then
    echo "Erreur : connectez-vous avec 'supabase login' et liez le projet avec 'supabase link'." >&2
    exit 1
  fi
  log "Application des migrations manquantes sur le projet lié…"
  supabase db push
  log "Terminé. Pour une base vierge cloud, créez un nouveau projet Supabase puis exécutez 'supabase db push'."
}

verify_remote() {
  if [[ ! -f .env.local ]]; then
    echo "Erreur : .env.local introuvable pour verify distant." >&2
    exit 1
  fi
  node "$ROOT/scripts/verify-db-state.mjs"
}

case "${1:-}" in
  local)
    reset_local
    ;;
  remote)
    reset_remote
    ;;
  verify)
    verify_migrations
    if command -v psql >/dev/null && supabase status >/dev/null 2>&1; then
      verify_counts_local || true
    fi
    if [[ -f .env.local ]]; then
      verify_remote || true
    fi
    ;;
  *)
    echo "Usage: $0 {local|remote|verify}" >&2
    exit 1
    ;;
esac
