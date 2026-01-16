# Skrypt obrony projektu – Mini Marketplace (PAP)

Poniżej znajduje się obszerny, gotowy do wygłoszenia skrypt prezentacji i obrony projektu. Możesz go traktować jako „scenariusz wystąpienia”: kolejność punktów, akcenty techniczne, omówienie architektury, przygotowanie demka oraz lista potencjalnych pytań kontrolnych.

---

## 1. Otwarcie i cel produktu
- **Kilka zdań wprowadzających**: „Prezentuję mini-marketplace, który pozwala użytkownikom przeglądać oferty, kupować produkty, a administratorom zarządzać asortymentem i rolami użytkowników.”
- **Problem, który rozwiązujemy**: szybki start z pełnym flow e-commerce (konta, koszyk, płatności – w formie modelu/demo), bez konieczności skomplikowanej konfiguracji.
- **Docelowi odbiorcy**: małe sklepy / sprzedawcy indywidualni, zespoły studenckie uczące się pełnego stacku, osoby uczące się DevOps (bo projekt ma dockerową orkiestrację).
- **Zakres**: frontend w React + TS, backend w Node + TS, PostgreSQL z Prisma, komplet endpointów (auth, produkty, kategorie, koszyk, ulubione, zamówienia, panel admina).

## 2. Makro-architektura i uruchomienie
- **Trzy serwisy w docker-compose** (`docker compose up --build` w katalogu głównym):
  - `backend` na porcie `4000`
  - `frontend` na porcie `4173` (serwowany z Vite)
  - `postgres` na porcie `5432` (użytkownik/hasło/baza: `jsmp/jsmp/jsmp`)
- **Pierwsze uruchomienie**: backend wykonuje migracje/push bazy i seed (konta: `admin@local.test/admin123`, `user@local.test/user123`).
- **Szybkie health-check**: `GET http://localhost:4000/health` powinno zwrócić `{ ok: true }`.
- **CORS**: domyślne źródła `http://localhost:5173` i `http://localhost:4173`, można rozszerzyć przez `CORS_ORIGIN` w `.env`.

## 3. Backend – warstwa aplikacyjna
- **Wejście**: `src/server.ts` uruchamia `createApp()` z `src/app.ts`.
- **Middleware**: `helmet`, `cors`, `express.json` (limit 1 MB), `morgan`. Błędy są obsługiwane centralnie, wspierane przez `HttpError` (`src/errors.ts`) i walidację `Zod` (`src/validation.ts`).
- **Autoryzacja**: JWT w `src/auth.ts` (`signToken`, `authRequired`, `requireRole`). Role pochodzą z Prisma enum `Role` (`USER` / `ADMIN`).
- **Prisma**: konfiguracja w `prisma/schema.prisma`, źródło danych `DATABASE_URL` (PostgreSQL). Klient w `src/prisma.ts` (singleton).
- **Walidacja payloadów**: `registerSchema`, `loginSchema`, `productCreateSchema`, `categorySchema`, `cartUpdateSchema`, `checkoutSchema`, `updateRoleSchema` itd. Każdy endpoint zaciąga odpowiedni schemat.

### 3.1. Główne moduły routingowe (ścieżki /api/*)
- `authRoutes.ts`: rejestracja, logowanie, wydawanie tokenu, hashowanie hasła `bcrypt`.
- `userRoutes.ts`: pobieranie i aktualizacja profilu (np. zmiana `name`), wymaga `authRequired`.
- `productRoutes.ts`: CRUD produktów (tworzenie, edycja, pobieranie list i szczegółów), opcjonalne obrazki (`ProductImage`), filtrowanie po kategorii.
- `categoryRoutes.ts`: drzewo kategorii (model `Category` z relacją parent/children). Tworzenie/aktualizacja z walidacją.
- `favoriteRoutes.ts`: dodawanie/usuwanie ulubionych (`Favorite` z kluczem złożonym).
- `cartRoutes.ts`: dodanie/aktualizacja/usunięcie pozycji (`CartItem`), limit ilości 1-99.
- `orderRoutes.ts`: checkout (`checkoutSchema`), tworzenie zamówienia (`Order` + `OrderItem`), stub płatności i wysyłki (`Payment`, `Shipment`).
- `adminRoutes.ts`: operacje administracyjne (np. nadawanie roli `ADMIN`, dezaktywacja/aktywacja użytkownika). Ochrona `requireRole(Role.ADMIN)`.

### 3.2. Obsługa błędów i bezpieczeństwo
- **Błędy domenowe**: rzucamy `HttpError` z odpowiednim kodem (400/401/403/404).
- **Walidacja wejścia**: wszystkie dane wejściowe przechodzą przez `Zod`; błędy walidacyjne zwracają 400 z listą `issues`.
- **JWT**: ważność 7 dni, payload `sub` (id użytkownika) + `role`. Nagłówek `Authorization: Bearer ...`.
- **Hashowanie haseł**: `bcrypt` z saltem 10.
- **Helmet + CORS**: domyślne nagłówki bezpieczeństwa + kontrola dozwolonych originów.
- **Ograniczenie rozmiaru JSON**: 1 MB chroni przed oversize payload.

### 3.3. Model danych (Prisma)
- **Użytkownik** (`User`): role, aktywność, audyt.
- **Produkt** (`Product`) i **Obrazki** (`ProductImage`): relacja do kategorii i sprzedawcy.
- **Kategorie** (`Category`): relacja parent/children pozwala budować drzewo.
- **Ulubione** (`Favorite`) i **Koszyk** (`CartItem`): klucze złożone/unikalne zapewniają integralność.
- **Zamówienia** (`Order`, `OrderItem`) + **Płatności** (`Payment`) + **Wysyłki** (`Shipment`): prosta symulacja procesu zakupowego.
- **Adresy** (`Address`) i **Log audytu** (`AuditLog`): możliwość rozszerzenia o zgodność RODO/monitoring.

### 3.4. Testy backendu
- **Framework**: Vitest + Supertest.
- **Zakres**: auth, koszyk+checkout, hierarchia produktów/kategorii, profil+admin.
- **Wymagania**: potrzebny `DATABASE_URL` z działającym PostgreSQL; bez tego testy zwrócą błąd inicjalizacji Prisma (odnotować to, jeśli środowisko CI/CD nie zapewnia DB).

## 4. Frontend – warstwa prezentacji
- **Stack**: React 18 + TypeScript, Vite. Główny entrypoint `frontend/src/main.tsx`, główny layout w `frontend/src/ui/App.tsx`.
- **Routing i strony** (folder `frontend/src/ui/pages`):
  - `Home.tsx`: siatka ofert, pobiera listę produktów.
  - `ProductPage.tsx`: widok szczegółu produktu + obrazki, przycisk „do koszyka” / „ulubione”.
  - `CartPage.tsx`: przegląd koszyka, zmiana ilości, checkout.
  - `FavoritesPage.tsx`: ulubione produkty użytkownika.
  - `OrdersPage.tsx`: historia zamówień po zalogowaniu.
  - `ProfilePage.tsx`: dane użytkownika, zmiana profilu.
  - `SellPage.tsx` i `MyProductsPage.tsx`: wystawianie/zarządzanie produktami sprzedawcy.
  - `AdminPage.tsx`: panel admina – zmiana ról, dezaktywacja/reaktywacja użytkowników.
  - `Login.tsx`, `Register.tsx`: uwierzytelnienie.
- **Warstwa API**: `frontend/src/ui/api.ts` kapsułkuje wywołania HTTP do backendu, wstrzykuje token JWT z localStorage (patrz funkcja `authFetch`), obsługuje statusy 401/403.
- **Styling**: `frontend/src/ui/ui.css` – prosty, responsywny layout. Vite dev server: `npm run dev -- --host --port 5173` (w docker-compose używany build/preview na 4173).
- **Zarządzanie stanem**: proste hooki + `useEffect` do pobrania danych; brak zewnętrznego state managera (świadomy wybór minimalizujący złożoność).

## 5. DevOps i środowiska
- **Docker**: obrazy dla frontend/backend budowane z `Dockerfile` w odpowiednich katalogach. Backend obraz instaluje zależności, generuje Prisma client, startuje `node dist/server.js`.
- **Konfiguracja**:
  - `.env.example` w backendzie – wzór na `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
  - `tsconfig.build.json` – wydzielenie builda produkcyjnego backendu.
- **Logowanie**: `morgan("dev")` w backendzie, konsola w frontendzie (fetch/console).
- **Monitorowanie zdrowia**: endpoint `/health` gotowy do sond K8s/Compose.

## 6. Scenariusz demka (propozycja krok po kroku)
1. **Health-check**: otwórz `http://localhost:4173` (frontend) + pokaż `curl http://localhost:4000/health`.
2. **Rejestracja lub logowanie**: zaloguj się jako `user@local.test / user123`.
3. **Przegląd katalogu**: pokaż filtrowanie po kategorii, kliknij produkt.
4. **Ulubione**: dodaj produkt do ulubionych, pokaż zakładkę „Favorites”.
5. **Koszyk i checkout**:
   - Dodaj produkt do koszyka, zmień ilość (walidacja 1-99).
   - Kliknij „checkout” – pokaż tworzenie zamówienia (w API: `POST /api/orders/checkout`).
6. **Historia zamówień**: otwórz `OrdersPage.tsx`, pokaż nowy rekord.
7. **Sprzedaż**: na `SellPage.tsx` wystaw nowy produkt (tytuł, opis, cena, kategoria, URL obrazka).
8. **Admin**: wyloguj i zaloguj się jako `admin@local.test / admin123`, pokaż `AdminPage.tsx` – zmiana roli użytkownika lub blokada konta.
9. **API podgląd** (opcjonalnie): `curl -H "Authorization: Bearer <token>" http://localhost:4000/api/products`.

## 7. Elementy jakości i bezpieczeństwa do podkreślenia
- Walidacja wejścia Zod + spójne kody błędów.
- JWT z rolami, middleware `authRequired` i `requireRole`.
- Hashowanie haseł `bcrypt`, brak plain text w bazie.
- `helmet` i ograniczenie payloadu JSON.
- Relacje i unikalności w schemacie Prisma (zapobiega duplikatom ulubionych/koszyka).
- Dane seed: pozwalają natychmiast zademonstrować pełny flow.
- Testy E2E API (Vitest + Supertest) – wymagają działającej bazy; podkreśl, że to intencjonalna weryfikacja integracyjna.

## 8. Potencjalne pytania kontrolne (i krótkie odpowiedzi)
- **Dlaczego PostgreSQL + Prisma?** Relacyjna spójność, migracje, wygodny typowany klient TS.
- **Jak chronimy endpointy admina?** Middleware `authRequired` + `requireRole(Role.ADMIN)`, token JWT z rolą w payloadzie.
- **Jak obsługujemy błędy walidacji?** Zod -> 400 z `issues`; reszta to `HttpError` lub 500 z logiem w konsoli.
- **Czy płatności są realne?** Nie, to model/stub – zapis `Payment` i `Shipment` symuluje proces; łatwo wpiąć bramkę w przyszłości.
- **Czy są testy?** Tak, integracyjne na API (Vitest). Wymagają `DATABASE_URL` i działającego Postgresa.
- **Co z CORS?** Lista originów w `CORS_ORIGIN`; domyślnie `5173` i `4173`.
- **Jak dodać nową kolumnę/feature?** Aktualizacja `prisma/schema.prisma`, `npx prisma db push`, ewentualnie dostosowanie walidacji i endpointów.

## 9. Plan dalszego rozwoju (krótko)
- Wpięcie realnej bramki płatności (np. Stripe) i webhooks.
- Upload obrazków do CDN/S3 zamiast URL wprowadzanych ręcznie.
- Dodanie paginacji i sortowania na listach produktów/zamówień.
- Rozszerzenie audytu (kto i kiedy zmienił rolę, dodał produkt).
- Testy e2e frontend (Playwright/Cypress) – obecnie skupiamy się na API.

## 10. Checklist „przed wejściem na obronę”
- `docker compose up --build` w katalogu głównym – upewnij się, że porty 4000/4173/5432 są wolne.
- Zweryfikuj `.env` backendu (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`).
- Opcjonalnie uruchom `npm run build` w backendzie i `npm run build` w frontendzie, aby mieć pewność, że typy i bundling przechodzą.
- Przygotuj token użytkownika (login -> przechwyć w devtools lub użyj w `api.ts`), by szybko pokazywać endpointy `curl`.
- Sprawdź, czy seed utworzył konta (`admin@local.test`, `user@local.test`).
- Jeśli środowisko testowe ma bazę, uruchom `npm test` w backendzie; bez bazy testy zgłoszą brak `DATABASE_URL` – miej to w notatkach, żeby wyjaśnić.

---

### Skrót końcowy do wypowiedzenia
„Projekt to kompletny mini-marketplace: React + TypeScript na froncie, Node + Express + Prisma + PostgreSQL na backendzie, wszystko uruchamiane jednym `docker compose up --build`. Mamy uwierzytelnianie JWT, role admin/user, zarządzanie produktami, kategoriami, koszykiem, ulubionymi i zamówieniami, a także panel admina do kontroli użytkowników. Walidacja danych jest na Zod, błędy obsługujemy centralnie, hasła są hashowane w bcrypt, a dane startowe pozwalają od razu przeprowadzić demo end-to-end. Testy integracyjne API (Vitest + Supertest) weryfikują krytyczne ścieżki, wymagają jedynie dostępnej bazy. W dalszym kroku można podpiąć realne płatności i CDN dla obrazków. Dzięki docker-compose całość jest powtarzalna i łatwa do uruchomienia.”
