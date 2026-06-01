#!/usr/bin/env bash
# Применяет SQL-миграции из database/migrations/ в алфавитном порядке.
# Пропускает уже записанные в schema_migrations (если таблица существует).
#
# Использование:
#   ./database/scripts/migrate.sh
#   DB=donetsk_test ./database/scripts/migrate.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DB="${DB:-donetsk_test}"
MIGRATIONS_DIR="$ROOT/database/migrations"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found" >&2
  exit 1
fi

journal_exists() {
  psql -d "$DB" -tAc \
    "SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'schema_migrations'" \
    | grep -q 1
}

legacy_schema_without_journal() {
  journal_exists && return 1
  psql -d "$DB" -tAc \
    "SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'geo_countries'" \
    | grep -q 1
}

is_applied() {
  local version="$1"
  journal_exists || return 1
  psql -d "$DB" -tAc \
    "SELECT 1 FROM schema_migrations WHERE version = '$version'" \
    | grep -q 1
}

if legacy_schema_without_journal; then
  echo "legacy DB: applying 002_schema_migrations_and_roles only (001 already present)"
  psql -d "$DB" -v ON_ERROR_STOP=1 -f "$MIGRATIONS_DIR/002_schema_migrations_and_roles.sql"
  echo "done ($DB)"
  exit 0
fi

for file in "$MIGRATIONS_DIR"/*.sql; do
  [[ -f "$file" ]] || continue
  version="$(basename "$file" .sql)"
  if is_applied "$version"; then
    echo "skip  $version"
    continue
  fi
  echo "apply $version"
  psql -d "$DB" -v ON_ERROR_STOP=1 -f "$file"
done

echo "done ($DB)"
