#!/bin/sh
set -eu

echo "Applying database schema..."
npx prisma db push

echo "Seeding database..."
npm run db:seed

echo "Starting API..."
exec npm run start
