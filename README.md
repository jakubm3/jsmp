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

## Uruchomienie jednym poleceniem (Docker Compose)

Wymagania: Docker + Docker Compose.

1. (Opcjonalnie) skopiuj pliki środowiskowe i dostosuj:  
   `cp backend/.env.example backend/.env`  
   `cp frontend/.env.example frontend/.env`
2. Uruchom całość:  
   ```bash
   docker compose up --build
   ```

Frontend: `http://localhost:4173`  
Backend API: `http://localhost:4000`  
Baza: `localhost:5432` (user: `jsmp`, hasło: `jsmp`, db: `jsmp`)

## Konta seed
- Admin: `admin@local.test` / `admin123`
- User:  `user@local.test`  / `user123`

## Założenia i pokryte wymagania
- Pełny moduł użytkownika: rejestracja/logowanie, profil z edycją nazwy.
- Oferty: pełny CRUD z obrazkami, powiązanie z kategoriami, wyszukiwanie, filtrowanie i sortowanie.
- Kategorie: hierarchia (parentId) + CRUD z poziomu panelu admina.
- Ulubione, koszyk, checkout oraz historia zamówień w UI.
- Panel admina: użytkownicy (role/aktywacja), oferty (aktywacja), kategorie, podgląd zamówień.
- Baza danych (Prisma/PostgreSQL): 12 tabel domenowych (`User`, `Category`, `Product`, `ProductImage`, `Favorite`, `CartItem`, `Order`, `OrderItem`, `Address`, `Payment`, `Shipment`, `AuditLog`).
- Testy backendu (Vitest + Supertest) obejmują auth, koszyk/checkout, profil, role i kategorie.
- CI/CD: GitHub Actions uruchamia push DB/schema + seed, testy backendu i build frontendu.
