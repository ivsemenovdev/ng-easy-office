# Документация для AI-агентов

Каталог предназначен для машиночитаемых спецификаций и контекста проекта **ng-easy-office**.

## Файлы

| Документ | Описание |
|----------|----------|
| [database-regions.md](./database-regions.md) | Схема PostgreSQL: страны и регионы (`geo_countries`, `geo_regions`), DDL, сиды, запросы |

```bash
# Применить сиды субъектов РФ (после миграции 001)
psql -d donetsk_test -f database/seeds/002_russia_federal_subjects.sql
```

## Проект

- **Фронтенд:** Angular 21, Taiga UI — корень репозитория `src/`.
- **БД (локально):** PostgreSQL, база `donetsk_test`.
- **SQL-миграции:** `database/migrations/`.

При работе с БД сначала читать соответствующий документ в `docs/ai/`, затем применять миграции из `database/migrations/`.
