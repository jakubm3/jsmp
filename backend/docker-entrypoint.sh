#!/bin/bash
set -eu

MAX_RETRIES=${DB_RETRIES:-10}
RETRY_DELAY=${DB_RETRY_DELAY:-2}

echo "Applying database schema..."
attempt=1
until npx prisma db push; do
  if [ "$attempt" -ge "$MAX_RETRIES" ]; then
    echo "Database not ready after ${MAX_RETRIES} attempts" >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  echo "Database not ready yet, retrying in ${RETRY_DELAY}s..."
  sleep "$RETRY_DELAY"
done

if [ ! -f /app/.seeded ]; then
  echo "Seeding database..."
  npm run db:seed
  touch /app/.seeded
else
  echo "Seed already applied, skipping."
fi

echo "Starting API..."
exec npm run start
