# Mini Marketplace (PAP)

Krótki opis aplikacji:

Aplikacja typu **mini marketplace** umożliwiająca przeglądanie ofert, logowanie użytkowników oraz korzystanie z panelu administratora.

* Frontend: **React + TypeScript**
* Backend: **Node.js + TypeScript**
* Baza danych: **PostgreSQL (Prisma ORM)**

---

## Uruchomienie aplikacji (Linux, one-liner)

### Wymagania

* Linux
* Docker
* Docker Compose (v2)

### Instalacja i start

Po sklonowaniu repozytorium wykonaj **jedno polecenie** w katalogu głównym projektu:

```bash
docker compose up --build
```

Polecenie:

* uruchamia backend
* uruchamia frontend
* uruchamia bazę danych PostgreSQL
* automatycznie wykonuje inicjalizację bazy i dane początkowe

---

## Dostępne usługi i porty

| Usługa                   | Adres                                          |
| ------------------------ | ---------------------------------------------- |
| Frontend                 | [http://localhost:4173](http://localhost:4173) |
| Backend API              | [http://localhost:4000](http://localhost:4000) |
| Baza danych (PostgreSQL) | localhost:5432                                 |

Dane bazy danych:

* użytkownik: `jsmp`
* hasło: `jsmp`
* nazwa bazy: `jsmp`

---

## Domyślne konta (seed)

Po pierwszym uruchomieniu dostępne są konta testowe:

### Administrator

* email: `admin@local.test`
* hasło: `admin123`

### Użytkownik

* email: `user@local.test`
* hasło: `user123`

---

## Zatrzymanie aplikacji

Aby zatrzymać wszystkie kontenery:

```bash
docker compose down
```

---

## Skrypt obrony projektu

Pełny scenariusz prezentacji (architektura, demo, Q&A) jest opisany w pliku [`PROJECT_DEFENSE_SCRIPT_PL.md`](PROJECT_DEFENSE_SCRIPT_PL.md).
