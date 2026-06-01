# NgEasyOffice

Веб-приложение для офисных задач. Сейчас в репозитории — **фронтенд** (Angular) и **слой данных** (PostgreSQL: справочник регионов, миграции, политика доступа). Бэкенд API пока не подключён.

## Стек

| Слой | Технологии |
|------|------------|
| UI | [Angular](https://angular.dev/) 21, [Taiga UI](https://taiga-ui.dev/) 5 |
| Тесты | [Vitest](https://vitest.dev/) |
| БД | PostgreSQL 18+ (локально) |
| Стили | Less (тема Taiga UI) |

## Требования

- **Node.js** 20+ и **npm** 10+
- **PostgreSQL** (локально), база по умолчанию: `donetsk_test`
- **psql** в `PATH` — для миграций и сидов

## Быстрый старт

### 1. Фронтенд

```bash
npm install
npm start
```

Приложение: [http://localhost:4200/](http://localhost:4200/)

Другие команды:

```bash
npm run build    # production-сборка в dist/
npm test         # unit-тесты (Vitest)
```

### 2. База данных

Создайте базу (если ещё нет):

```bash
createdb donetsk_test
```

Примените миграции и справочник регионов:

```bash
./database/scripts/migrate.sh
psql -d donetsk_test -f database/seeds/002_russia_federal_subjects.sql
```

Переменная `DB` задаёт имя базы:

```bash
DB=donetsk_test ./database/scripts/migrate.sh
```

Проверка:

```bash
psql -d donetsk_test -c "SELECT version FROM schema_migrations ORDER BY version;"
psql -d donetsk_test -c "SELECT COUNT(*) FROM geo_regions;"
# ожидается: 2 миграции, 89 регионов
```

## Структура репозитория

```
ng-easy-office/
├── src/                    # Angular-приложение
├── database/
│   ├── migrations/         # DDL (версионируемые)
│   ├── seeds/              # Начальные данные
│   └── scripts/            # migrate.sh, generate_russia_seed.py
├── docs/ai/                # Спецификации для разработки и AI
├── public/                 # Статические файлы
└── angular.json
```

## База данных

- **Политика:** схема меняется только через файлы в `database/migrations/`; журнал — таблица `schema_migrations`.
- **Роли:** `ng_migrator` (DDL, сиды), `ng_app` (DML; справочники `geo_*` — только чтение).
- **Справочник:** `geo_countries`, `geo_regions` — 89 субъектов РФ + возможность расширения на другие страны.

Подробности:

- [docs/ai/database-policy.md](docs/ai/database-policy.md) — миграции, роли, восстановление БД
- [docs/ai/database-regions.md](docs/ai/database-regions.md) — модель регионов, запросы, сиды

Пересборка SQL-сида регионов:

```bash
python3 database/scripts/generate_russia_seed.py
```

## Документация для AI и команды

Каталог [docs/ai/](docs/ai/) — источник правды для агентов и разработчиков. **Любые изменения схемы, API и доменной логики нужно отражать там** (см. [docs/ai/README.md](docs/ai/README.md)).

## Разработка

### Генерация компонентов

```bash
ng generate component component-name
ng generate --help
```

### Рекомендуемый порядок при изменении БД

1. Прочитать [database-policy.md](docs/ai/database-policy.md)
2. Добавить миграцию `database/migrations/NNN_....sql` и запись в `schema_migrations`
3. Обновить доменный документ в `docs/ai/`
4. Выполнить `./database/scripts/migrate.sh`

### Восстановление «чистой» локальной БД

```bash
dropdb donetsk_test && createdb donetsk_test
./database/scripts/migrate.sh
psql -d donetsk_test -f database/seeds/002_russia_federal_subjects.sql
```

## Лицензия

Проект частный (`private` в `package.json`).
