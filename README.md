# Mini Marketplace (PAP) — full-stack reference implementation

Zawiera:
- **backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL, JWT, role-based access (USER/ADMIN)
- **frontend**: React + Vite + TypeScript, podstawowe widoki (lista ofert, szczegóły, koszyk, ulubione, panel user, panel admin)
- **testy**: backend (Vitest + Supertest)
- **CI**: GitHub Actions (lint/test/build)

> UI jest celowo proste (możecie podmienić na Waszą makietę). Funkcjonalność jest kompletna: auth, oferty, kategorie, ulubione, koszyk, checkout, zamówienia, admin.

## Szybki start (lokalnie)

### 1) Backend
```bash
cd backend
cp .env.example .env
# ustaw DATABASE_URL (Postgres)
npm i
npm run db:push
npm run db:seed
npm run dev
```

Backend: `http://localhost:4000`

### 2) Frontend
```bash
cd ../frontend
cp .env.example .env
npm i
npm run dev
```

Frontend: `http://localhost:5173`

## Konta seed
- Admin: `admin@local.test` / `admin123`
- User:  `user@local.test`  / `user123`
