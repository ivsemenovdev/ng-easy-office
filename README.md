# NgEasyOffice

Веб-приложение для офисных задач: **Angular** (фронтенд), **Node.js** (REST API), **PostgreSQL** (справочники и бизнес-данные).

**Возможности:** субъекты РФ (89 в сиде), больницы по регионам, импорт актов диагностики из Word, просмотр актов по больнице, экспорт регионов в DOCX.

## Стек

| Слой          | Технологии                                                              |
| ------------- | ----------------------------------------------------------------------- |
| UI            | [Angular](https://angular.dev/) 21, [Taiga UI](https://taiga-ui.dev/) 5 |
| API           | Node.js 20+, [Express](https://expressjs.com/), TypeScript, `pg`        |
| Тесты (фронт) | `ng test` (Vitest через `@angular/build:unit-test`)                     |
| БД            | PostgreSQL 18+ (локально)                                               |

## Требования

- **Node.js** 20+ и **npm** 10+
- **PostgreSQL**, база по умолчанию: `donetsk_test`
- **psql** — для миграций и сидов

## Быстрый старт

### 1. База данных

```bash
createdb donetsk_test   # если ещё нет
./database/scripts/migrate.sh   # миграции 001–005
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
curl -o regions.docx http://localhost:3000/api/regions/export
```

Спецификация: [docs/ai/api-backend.md](docs/ai/api-backend.md)

**Контекст для AI:** [docs/ai/project-context.md](docs/ai/project-context.md) — архитектура, карта файлов, quick start.

### 3. Фронтенд

```bash
npm install
npm start
```

UI: [http://localhost:4200/](http://localhost:4200/) — нужен запущенный backend.

| URL                  | Назначение                              |
| -------------------- | --------------------------------------- |
| `/`                  | Регионы РФ и больницы по региону        |
| `/diagnostic-import` | Импорт актов из `.docx`                 |
| `/hospital-acts`     | Список сохранённых актов по больнице    |

Запросы к API проксируются через `proxy.conf.json` (`/api` → `localhost:3000`).

```bash
npm run build
npm test
```

## Структура репозитория

```
ng-easy-office/
├── src/                    # Angular
├── backend/                # Node.js REST API
│   ├── src/
│   └── templates/          # DOCX-шаблоны (экспорт, эталон акта)
├── database/
│   ├── migrations/         # 001–005
│   ├── seeds/
│   └── scripts/
├── docs/ai/                # Спецификации (в т.ч. для AI)
└── angular.json
```

## API (кратко)

| Ресурс              | Базовый путь                 | CRUD / прочее |
| ------------------- | ---------------------------- | ------------- |
| Health              | `GET /api/health`            | —             |
| Страны              | `/api/countries`             | да            |
| Регионы             | `/api/regions`               | да            |
| Экспорт регионов    | `GET /api/regions/export`    | DOCX          |
| Больницы            | `/api/hospitals`             | да            |
| Диагностика         | `/api/diagnostic/parse`, `/api/diagnostic/acts` | parse + сохранение/список |

Фильтры списка регионов: `country_iso`, `country_id`, `level`, `is_active`, `limit`, `offset`.

Подробнее: [docs/ai/diagnostic-import.md](docs/ai/diagnostic-import.md), [docs/ai/database-hospitals-acts.md](docs/ai/database-hospitals-acts.md).

## База данных

- Миграции: `database/migrations/` (`001`–`005`), журнал `schema_migrations`
- Роли: `ng_migrator` (DDL), `ng_app` (DML для API)
- Справочник: 89 субъектов РФ в `geo_regions`; таблицы `hospitals`, `diagnostic_acts`

Документация:

- [docs/ai/database-policy.md](docs/ai/database-policy.md)
- [docs/ai/database-regions.md](docs/ai/database-regions.md)
- [docs/ai/database-hospitals-acts.md](docs/ai/database-hospitals-acts.md)
- [docs/ai/api-backend.md](docs/ai/api-backend.md)

## Документация для AI

Каталог [docs/ai/](docs/ai/) — изменения схемы и API нужно отражать там ([правила](docs/ai/README.md)).

## Лицензия

Проект частный (`private`).
