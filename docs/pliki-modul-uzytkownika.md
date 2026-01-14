# Przewodnik po plikach modułu użytkownika, koszyka i zamówień

Dokument tłumaczy krok po kroku, co dzieje się w wymienionych plikach frontendu, backendu oraz testów. Odnośniki do linii odnoszą się do aktualnej wersji repozytorium.

## Frontend (React, `frontend/src/ui`)

### `pages/Login.tsx` – logowanie i sesja
- L1: importuje React, aby móc korzystać z hooków.
- L2: pobiera `useNavigate` i `Link` z React Routera do przekierowań i linków.
- L3: importuje klienta API `Auth` z warstwy komunikacji.
- L5: deklaracja komponentu funkcyjnego `Login`.
- L6: `useNavigate()` – przygotowanie nawigacji po udanym logowaniu.
- L7–8: stan lokalny na email i hasło (z wartościami demo).
- L9–10: stan na komunikat błędu i flagę zajętości.
- L12–24: funkcja `submit` – czyści błąd, ustawia „busy”, wywołuje `Auth.login`, a po sukcesie emituje zdarzenie `auth-changed` i przekierowuje na `/`. W razie błędu zapisuje komunikat, na końcu zdejmuje „busy”.
- L26–49: JSX formularza logowania – nagłówek, komunikat błędu, pola wejściowe, przycisk z tekstem zależnym od stanu oraz link do rejestracji.

### `pages/Register.tsx` – rejestracja
- L1–3: importy React, routera i klienta API `Auth`.
- L5: komponent `Register`.
- L6–11: lokalne stany na nawigację, email, hasło, imię, błąd i zajętość.
- L13–25: `submit` – resetuje błąd, ustawia „busy”, wywołuje `Auth.register`, emituje `auth-changed`, przekierowuje na `/`, zapisuje błąd gdy wystąpi, kończy tryb „busy”.
- L27–50: widok formularza rejestracyjnego z polami email/imię/hasło, przyciskiem z etykietą zależną od stanu i linkiem do logowania.

### `pages/ProfilePage.tsx` – edycja profilu
- L1–3: importy React, `Link` i klientów API `Profile`, `Auth`.
- L5–9: stan na dane użytkownika, edytowane imię, informację o błędzie oraz komunikat sukcesu.
- L11–20: `load` – pobiera dane profilu (`Profile.me()`), uzupełnia stan i imię; w razie błędu zapisuje komunikat.
- L22: `useEffect` – ładuje profil po montażu komponentu.
- L24–35: `save` – czyści komunikaty, wywołuje `Profile.update` z obciętym imieniem, aktualizuje stan oraz `localStorage`, emituje `auth-changed` i pokazuje potwierdzenie; w razie błędu zapisuje komunikat.
- L38–83: JSX strony profilu: nagłówek, powrót, komunikaty, karta z danymi (email, rola, status, data utworzenia), pole do zmiany imienia i przyciski „Zapisz” / „Reset”.

### `pages/CartPage.tsx` – koszyk i checkout
- L1–3: importy React, klienta API `Cart` oraz `Link`.
- L5–12: definicja metod płatności, pomocniczy guard typu i mapowanie etykiet.
- L14–19: stany na pozycje koszyka, komunikat błędu, zajętość i wybraną metodę płatności.
- L20–27: `load` – pobiera pozycje koszyka, zapisuje błąd w razie problemu.
- L29: `useEffect` – ładuje koszyk po montażu.
- L31: obliczenie sumy koszyka.
- L33–45: `checkout` – ustawia „busy”, wywołuje `Cart.checkout` z wybraną metodą, pokazuje alert o fikcyjnej płatności, ponownie ładuje koszyk i emituje `products-changed`; obsługuje błędy i zdejmuje „busy”.
- L47–116: render: nagłówek i link wstecz, komunikat błędu, informacja o pustym koszyku lub lista kart pozycji (z przyciskiem „Usuń”), podsumowanie z selektorem metody płatności i przyciskiem „Kup teraz”.

### `pages/OrdersPage.tsx` – historia zamówień
- L1–3: importy React, klienta API `Orders` i `Link`.
- L5–8: stan na listę zamówień i ewentualny błąd.
- L9–16: `load` – pobiera zamówienia użytkownika, zapisuje błąd w razie problemu.
- L18: `useEffect` – automatyczne pobranie po montażu.
- L20–67: widok: nagłówek z linkiem wstecz, komunikat błędu, informacja o braku zamówień lub lista kart z danymi: ID i data, status + suma, status płatności i dostawy, lista pozycji zamówienia.

### `App.tsx` – główny komponent z routingiem
- L1–4: importy React, routera, warstwy `Auth` i globalnych styli.
- L6–16: import stron używanych w routingu (marketplace, użytkownik, admin).
- L18–77: komponent `Nav` – pasek nawigacji:
  - L19–21: stan aktualnego użytkownika (`Auth.me()`).
  - L22–27: `logout` – czyści dane sesji, emituje `auth-changed`, resetuje stan i przekierowuje na stronę główną.
  - L29–37: efekt nasłuchujący zmian w `localStorage` i zdarzeń `auth-changed`, aby synchronizować pasek.
  - L39–77: JSX nawigacji z linkami zależnymi od zalogowania/roli oraz przyciskiem wylogowania.
- L80–86: strażnicy tras `RequireAuth` i `RequireAdmin` – przekierowują do logowania lub na główną, gdy brakuje uprawnień.
- L88–111: komponent `App` – montuje `Nav` i definiuje trasy Routera dla każdej strony, z ochroną tras wymagających logowania/admina.

### `main.tsx` – punkt wejścia
- L1–3: importy React, ReactDOM i `BrowserRouter`.
- L4: importuje główny komponent `App`.
- L6–12: tworzy korzeń React w elemencie `#root`, owija aplikację w `React.StrictMode` i `BrowserRouter`, renderuje `App`.

### `api.ts` – warstwa komunikacji z backendem
- L1: ustawia adres API z env lub `http://localhost:4000`.
- L3–9: typ `User` opisujący użytkownika.
- L11–13: funkcja `token` – odczytuje token JWT z `localStorage`.
- L15–27: ogólny helper `api` – buduje nagłówki (JSON + Authorization), wykonuje `fetch`, rzuca błąd z komunikatem API, zwraca JSON (lub `null` przy 204).
- L29–59: obiekt `Auth` – logowanie, rejestracja (zapis tokenu i użytkownika w `localStorage`, emisja `auth-changed`), wylogowanie i odczyt użytkownika z `localStorage`.
- L61–105: `Products` – listowanie, pobieranie, własne oferty, tworzenie/aktualizacja/usuwanie produktów z odpowiednimi ścieżkami i metodami.
- L107–120: `Categories` – CRUD kategorii.
- L122–127: `Favorites` – lista i przełączanie ulubionych.
- L129–140: `Cart` – pobranie koszyka, dodawanie/usuwanie pozycji oraz checkout z metodą płatności.
- L142–144: `Orders` – pobranie zamówień użytkownika.
- L146–151: `Profile` – pobranie i aktualizacja profilu.
- L153–172: `Admin` – operacje administracyjne (użytkownicy, role, produkty, zamówienia).

### `ui.css` – globalne style
- L1–13: zmienne CSS (kolory, promienie, cienie) definiujące motyw.
- L15–31: reset pudełkowy, wysokość, font, tło gradientowe, podstawowe style linków.
- L32–49: kontener o stałej szerokości, karty i układ flex/grid (row, wrap, space, grow), kolor „muted”.
- L52–74: stylizacja przycisków i wariantów (`Primary`, `Danger`).
- L75–86: styl „badge”.
- L87–98: pola formularzy (`input`, `select`, `textarea`) oraz placeholdery.
- L99–106: siatki produktów i responsywność kontenera.
- L107–149: pasek nawigacji (`.nav`, `.navInner`, `.brand`, `.navLink`).
- L151–153: typografia nagłówków.
- L154–162: toolbar z responsywnym ułożeniem przycisków/filtrów.
- L163–171: bloki powiadomień (`notice`, `noticeErr`, `noticeOk`).
- L172–191: karty produktów, obrazy, tytuły, ceny i ułożenie klucz-wartość.
- L193–212: tabela z obramowaniem, tłem i hoverem dla wierszy.

### `index.html` (frontend)
- L1: deklaracja dokumentu HTML5.
- L2: ustawienie języka na polski.
- L3–6: meta charset/viewport i tytuł aplikacji.
- L8–11: element `#root` dla Reacta i skrypt startowy Vite (`/src/main.tsx`).

## Backend (`backend/src`)

### `auth.ts` – logika JWT i middleware
- L1–4: importy bibliotek JWT, bcrypt, typów Express oraz typu roli z Prisma.
- L5–6: konfiguracja (`config`) i pomocnicze błędy (`unauthorized`, `forbidden`).
- L8: typ JWT użytkownika (`sub` i `role`).
- L10–14: funkcje generujące token, hashujące hasło i weryfikujące hasło.
- L16–22: middleware `authRequired` – sprawdza nagłówek Bearer, weryfikuje JWT, zapisuje użytkownika w `req`, w razie problemu rzuca błąd 401.
- L23–30: middleware `requireRole` – wpuszcza tylko użytkowników o wskazanej roli, inaczej 401/403.
- L31–35: helper `getUserId` – zwraca `sub` z JWT lub zgłasza 401, jeśli brak użytkownika.

### `validation.ts` – walidacja Zod
- L1–2: importy Zod i typu roli.
- L3: `registerSchema` – email, hasło min. 6, opcjonalne imię.
- L4: `loginSchema` – email + hasło (min. 1 znak).
- L5: `updateProfileSchema` – opcjonalne imię min. 1 znak.
- L6–12: `productCreateSchema` – tytuł/opis, cena >0, opcjonalna kategoria, lista URL-i obrazków.
- L13: `productUpdateSchema` – wersja częściowa (partial) schematu tworzenia.
- L14: `categorySchema` – nazwa + opcjonalny parent.
- L15: `cartUpdateSchema` – produkt, ilość 1–99.
- L16: `cartRemoveSchema` – tylko `productId`.
- L17: `checkoutSchema` – metoda płatności (CARD/BLIK/TRANSFER) z domyślną „CARD”.
- L18: `updateRoleSchema` – zmiana roli użytkownika na wartość z enumu Prisma.

## Testy (`backend/test`)

### `auth.test.ts` – testy logowania
- L1–4: importy Vitest, Supertest, aplikacji i klienta Prisma.
- L6: inicjalizacja aplikacji `createApp()`.
- L8–10: blok `describe`; `beforeAll` upewnia się, że Prisma jest połączona; `afterAll` rozłącza.
- L12–18: test rejestracji i logowania – tworzy unikalny email, sprawdza statusy 200 dla rejestracji i logowania.

### `cart-order.test.ts` – koszyk i zamówienie
- L1–4: importy testów, Supertestu, aplikacji i Prisma.
- L6: aplikacja testowa.
- L9–16: zmienne na token i produkt, `beforeAll` loguje użytkownika demo, pobiera pierwszy produkt z bazy.
- L18: `afterAll` zamyka Prisma.
- L20–34: scenariusz dodania do koszyka i checkoutu BLIK – sprawdza statusy 200, obecność pozycji, dane płatności (metoda, status, kwota) oraz utworzenie wysyłki powiązanej z zamówieniem.
