# Mini Marketplace (PAP) – skrót projektu

## 1. Co to jest?
Pełny mini-marketplace typu e-commerce:
- katalog produktów z kategoriami i obrazkami,
- koszyk, ulubione, zamówienia,
- panel sprzedawcy oraz panel administratora (role `USER` / `ADMIN`).

## 2. Stos technologiczny
- **Frontend:** React 18 + TypeScript (Vite)
- **Backend:** Node.js + Express + TypeScript
- **DB/ORM:** PostgreSQL + Prisma
- **Auth:** JWT (bcrypt do haseł)
- **Walidacja:** Zod
- **Konteneryzacja:** Docker Compose (frontend, backend, postgres)

## 3. Jak uruchomić (dev/preview)
Wymagania: Docker + Docker Compose v2.
```bash
docker compose up --build
```
Uruchamia:
- API: http://localhost:4000 (health: `/health`)
- Frontend: http://localhost:4173
- Postgres: localhost:5432 (user/hasło/baza: `jsmp/jsmp/jsmp`)
Automatycznie wykonywany jest seed bazy.

## 4. Domyślne konta
- **Admin:** `admin@local.test` / `admin123`
- **User:** `user@local.test` / `user123`

## 5. Główne funkcje (API/UX)
- **Auth i profil:** rejestracja, logowanie, JWT, zmiana profilu.
- **Produkty:** tworzenie/edycja/listy/szczegóły; obrazki i kategorie.
- **Kategorie:** drzewo kategorii (parent/children).
- **Ulubione:** dodawanie/usuwanie, unikalne pary user-product.
- **Koszyk:** dodanie/aktualizacja/usunięcie, ilość 1–99.
- **Zamówienia/checkout:** tworzenie Order + OrderItems (+ stub Payment/Shipment).
- **Admin:** nadawanie roli ADMIN, blokada/odblokowanie użytkownika.

## 6. Bezpieczeństwo i walidacja
- JWT w nagłówku `Authorization: Bearer <token>`, ważność 7 dni.
- Błędy domenowe przez `HttpError`, walidacja payloadów Zod (400 z `issues`).
- Hasła hashowane bcrypt.
- `helmet`, kontrola CORS (lista originów konfigurowalna), limit JSON 1 MB.

## 7. Struktura kodu (skrót)
- `backend/src/app.ts` – konfiguracja Express, middleware, routing, globalny handler błędów.
- `backend/src/auth.ts` – JWT, middleware `authRequired` i `requireRole`.
- `backend/src/validation.ts` – schematy Zod dla endpointów.
- `frontend/src/ui` – layout i strony (Home, Product, Cart, Favorites, Orders, Profile, Sell/MyProducts, Admin, Login/Register).
- `frontend/src/ui/api.ts` – wywołania HTTP z wstrzyknięciem tokenu.

## 8. Testy (API)
- Vitest + Supertest w backendzie (wymagany działający Postgres i `DATABASE_URL`).

## 9. Typowy przebieg demo
1) Health-check `/health`.
2) Logowanie jako user (`user@local.test`).
3) Przegląd katalogu, filtrowanie po kategorii, szczegóły produktu.
4) Dodanie do ulubionych.
5) Dodanie do koszyka, zmiana ilości (1–99), checkout -> nowe zamówienie.
6) Historia zamówień (Orders).
7) Wystawienie nowego produktu (Sell/MyProducts).
8) Logowanie jako admin (`admin@local.test`), zmiana roli/blokada użytkownika.

## 10. Zatrzymanie
```bash
docker compose down
```
