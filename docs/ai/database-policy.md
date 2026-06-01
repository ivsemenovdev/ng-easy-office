# Политика работы с PostgreSQL

> **Назначение:** защита структуры БД в разработке — схема меняется только осознанно, через версионированные миграции.  
> **Проект:** ng-easy-office · база по умолчанию: `donetsk_test`  
> **Статус:** миграции `001`–`003` — см. `schema_migrations`

---

## 1. Цели

| Цель | Как достигается |
|------|-----------------|
| Структура не меняется «случайно» | DDL только ролью `ng_migrator`, только файлы в `database/migrations/` |
| Одинаковая схема у всех | Журнал `schema_migrations` + скрипт `database/scripts/migrate.sh` |
| Справочники через API | `ng_app` — DML на `geo_*` (миграция `003`; см. [api-backend.md](./api-backend.md)) |
| Изменения прозрачны | Документация в `docs/ai/` + история в конце каждого документа |

---

## 2. Роли

| Роль | Кто использует | Права |
|------|----------------|--------|
| `ng_migrator` | Разработчик при миграциях/сидах, CI deploy | `CREATE`/`ALTER`/`DROP`, полный доступ к таблицам и `schema_migrations` |
| `ng_app` | [Backend API](./api-backend.md) | `SELECT`/`INSERT`/`UPDATE`/`DELETE` на `geo_*` и будущие бизнес-таблицы; **без DDL** |

Роли создаются в `002_schema_migrations_and_roles.sql` как `NOINHERIT` без пароля.

### Локальная работа

```bash
# Миграции — от своего пользователя ОС, если он владелец БД (типично Homebrew PostgreSQL)
psql -d donetsk_test -f database/migrations/002_schema_migrations_and_roles.sql

# Или явно передать роль мигратору (если выдана вашему пользователю):
# psql -d donetsk_test -c "SET ROLE ng_migrator"
```

Для отдельного логина приложения (опционально):

```sql
ALTER ROLE ng_app WITH LOGIN PASSWORD '...';
-- connection string: postgres://ng_app:***@localhost:5432/donetsk_test
```

Пароли **не хранить** в git — только в локальном `.env` (в `.gitignore`).

---

## 3. Миграции

### 3.1 Правила

1. **Запрещено** менять схему вручную в GUI (`ALTER`, `DROP`, новые таблицы без файла миграции).
2. Каждое изменение схемы — новый файл: `database/migrations/NNN_описание.sql` (монотонный номер).
3. В конце миграции — `INSERT INTO schema_migrations (version) VALUES ('NNN_...')`.
4. Обновить `docs/ai/` (доменный документ + при необходимости этот файл).
5. Не редактировать уже применённые миграции в общей ветке; только новая миграция-исправление.

### 3.2 Применение

```bash
# Все неприменённые миграции по порядку
./database/scripts/migrate.sh

# Или вручную одну
psql -d donetsk_test -f database/migrations/003_example.sql
```

Проверка журнала:

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

### 3.3 Сиды vs миграции

| Тип | Папка | Меняет структуру | Кто запускает |
|-----|--------|------------------|---------------|
| Миграция | `database/migrations/` | Да | `ng_migrator` / владелец БД |
| Сид | `database/seeds/` | Нет (только данные) | `ng_migrator` / владелец БД |

Сиды **не подменяют** миграции. Справочник регионов: [database-regions.md](./database-regions.md).

---

## 4. Восстановление стабильной БД

Если локальная база «уехала»:

```bash
dropdb donetsk_test
createdb donetsk_test
./database/scripts/migrate.sh
psql -d donetsk_test -f database/seeds/002_russia_federal_subjects.sql
```

---

## 5. Правила для AI-агентов

1. DDL — **только** новый файл в `database/migrations/`, запись в `schema_migrations`.
2. Не выдавать `ng_app` права `CREATE` или `ALTER` на схему.
3. Новые справочники, которые нельзя менять из UI — `REVOKE INSERT, UPDATE, DELETE ... FROM ng_app`.
4. Любое изменение политики или ролей — обновить этот документ (§7) и [README.md](./README.md).

---

## 6. Связанные файлы

| Путь | Назначение |
|------|------------|
| `database/migrations/002_schema_migrations_and_roles.sql` | Журнал + роли |
| `database/scripts/migrate.sh` | Последовательное применение миграций |
| `docs/ai/database-regions.md` | Домен «регионы» |

---

## 7. История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-06-01 | 1.0 | Политика БД: `schema_migrations`, роли `ng_migrator` / `ng_app`, `migrate.sh` |
| 2026-06-01 | 1.1 | `003_geo_dml_for_app` — DML на `geo_*` для backend |
