# NgEasyOffice

Веб-приложение для офисных задач: **Angular** (фронтенд), **Node.js** (REST API), **PostgreSQL** (справочник регионов и др.).

## Стек

| Слой | Технологии |
|------|------------|
| UI | [Angular](https://angular.dev/) 21, [Taiga UI](https://taiga-ui.dev/) 5 |
| API | Node.js 20+, [Express](https://expressjs.com/), TypeScript, `pg` |
| Тесты (фронт) | [Vitest](https://vitest.dev/) |
| БД | PostgreSQL 18+ (локально) |

## Требования

- **Node.js** 20+ и **npm** 10+
- **PostgreSQL**, база по умолчанию: `donetsk_test`
- **psql** — для миграций и сидов

## Быстрый старт

### 1. База данных

```bash
createdb donetsk_test   # если ещё нет
./database/scripts/migrate.sh
psql -d donetsk_test -f database/seeds/002_russia_federal_subjects.sql
```

### 2. Backend API

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: [http://localhost:3000/api/health](http://localhost:3000/api/health)

Примеры:

```bash
curl http://localhost:3000/api/countries
curl 'http://localhost:3000/api/regions?country_iso=RU&limit=5'
```

Спецификация: [docs/ai/api-backend.md](docs/ai/api-backend.md)

### 3. Фронтенд

```bash
npm install
npm start
```

UI: [http://localhost:4200/](http://localhost:4200/)

```bash
npm run build
npm test
```

## Структура репозитория

```
ng-easy-office/
├── src/                    # Angular
├── backend/                # Node.js REST API
│   └── src/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── scripts/
├── docs/ai/                # Спецификации (в т.ч. для AI)
└── angular.json
```

## API (кратко)

| Ресурс | Базовый путь | CRUD |
|--------|--------------|------|
| Health | `GET /api/health` | — |
| Страны | `/api/countries` | да |
| Регионы | `/api/regions` | да |

Фильтры списка регионов: `country_iso`, `country_id`, `level`, `is_active`, `limit`, `offset`.

## База данных

- Миграции: `database/migrations/`, журнал `schema_migrations`
- Роли: `ng_migrator` (DDL), `ng_app` (API / DML)
- Справочник: 89 субъектов РФ в `geo_regions`

Документация:

- [docs/ai/database-policy.md](docs/ai/database-policy.md)
- [docs/ai/database-regions.md](docs/ai/database-regions.md)
- [docs/ai/api-backend.md](docs/ai/api-backend.md)

## Документация для AI

Каталог [docs/ai/](docs/ai/) — изменения схемы и API нужно отражать там ([правила](docs/ai/README.md)).

## Лицензия

Проект частный (`private`).
