# Backend API (Node.js)

> **Назначение:** REST CRUD для справочников `geo_countries`, `geo_regions`.  
> **Код:** `backend/` · Express + TypeScript + `pg`  
> **Статус:** v0.1 — базовый CRUD, без аутентификации

---

## 1. Запуск

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

По умолчанию: `http://localhost:3000`, БД `postgresql://localhost:5432/donetsk_test`.

Перед первым запуском:

```bash
./database/scripts/migrate.sh   # включая 003_geo_dml_for_app
```

---

## 2. Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `PORT` | `3000` | HTTP-порт |
| `DATABASE_URL` | `postgresql://localhost:5432/donetsk_test` | PostgreSQL |
| `CORS_ORIGIN` | `http://localhost:4200` | Origin для Angular |

---

## 3. Эндпоинты

Базовый префикс: `/api`.

### Health

| Метод | Путь | Ответ |
|-------|------|--------|
| `GET` | `/health` | `{ "status": "ok", "database": "connected" }` |

### Страны (`geo_countries`)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/countries` | Список (`limit`, `offset`, `is_active`) |
| `GET` | `/countries/:id` | Одна запись |
| `POST` | `/countries` | Создание |
| `PUT` / `PATCH` | `/countries/:id` | Обновление |
| `DELETE` | `/countries/:id` | Удаление |

**Тело POST (пример):**

```json
{
  "iso_alpha2": "KZ",
  "iso_alpha3": "KAZ",
  "name_ru": "Казахстан",
  "name_en": "Kazakhstan",
  "is_active": true
}
```

**Ответ списка:**

```json
{
  "items": [ ... ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

### Регионы (`geo_regions`)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/regions` | Список |
| `GET` | `/regions/:id` | Одна запись |
| `POST` | `/regions` | Создание |
| `PUT` / `PATCH` | `/regions/:id` | Обновление |
| `DELETE` | `/regions/:id` | Удаление |

**Query для списка:** `limit`, `offset`, `country_id`, `country_iso` (например `RU`), `parent_id`, `level`, `is_active`.

### Импорт и акты диагностики

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/diagnostic/parse` | Парсинг `.docx` (multipart, поле `file`) |
| `POST` | `/diagnostic/acts` | Сохранение акта |
| `GET` | `/diagnostic/acts` | Список (`hospital_id`, `limit`, `offset`) |
| `GET` | `/diagnostic/acts/:id` | Один акт |

Спецификация: [diagnostic-import.md](./diagnostic-import.md), схема БД: [database-hospitals-acts.md](./database-hospitals-acts.md).

### Больницы (`hospitals`)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/hospitals` | Список (`region_id`, `is_active`, `limit`, `offset`) |
| `GET` | `/hospitals/:id` | Одна больница |
| `POST` | `/hospitals` | Создание |
| `PUT` / `PATCH` | `/hospitals/:id` | Обновление |
| `DELETE` | `/hospitals/:id` | Удаление |

**Тело POST `/hospitals` (пример):**

```json
{
  "region_id": 1,
  "name": "ГБУЗ «Городская больница № 1»",
  "address": "ул. Примерная, 1",
  "is_active": true
}
```

**Тело POST для `/regions` (пример):**

```json
{
  "country_id": 1,
  "parent_id": null,
  "level": "federal_subject",
  "code": "RU-TEST",
  "name_ru": "Тестовый регион",
  "name_short_ru": "Тест",
  "region_type": "oblast",
  "sort_order": 99,
  "is_active": true
}
```

---

## 4. Ошибки

| HTTP | code | Когда |
|------|------|--------|
| 400 | `VALIDATION_ERROR` | Zod-валидация |
| 400 | `FILE_REQUIRED` | Файл не загружен (diagnostic parse) |
| 400 | `INVALID_DOCX` | Некорректный DOCX |
| 400 | `INVALID_ACT_TEMPLATE` | Документ не соответствует шаблону акта |
| 404 | `NOT_FOUND` | Нет записи |
| 409 | `CONFLICT` | Уникальный ключ (`iso_alpha2`, `country_id`+`code`) |
| 409 | `FK_VIOLATION` | Ссылка на несуществующую страну / дочерние регионы при DELETE |
| 500 | `INTERNAL_ERROR` | Прочие ошибки |

---

## 5. БД и роли

Миграция `003_geo_dml_for_app.sql` выдаёт роли `ng_app` права `INSERT`/`UPDATE`/`DELETE` на `geo_*` для API.

Локально подключение идёт через `DATABASE_URL` (часто пользователь ОС — владелец БД). Для prod — `postgres://ng_app:***@...`.

---

## 6. Правила для AI

1. Новые сущности/API — обновить этот документ и [README.md](../../README.md).
2. Не добавлять DDL в backend; только `database/migrations/`.
3. Валидация входа — `backend/src/validation.ts` (Zod).

---

## 7. Фронтенд

Главная страница Angular загружает `GET /api/regions?country_iso=RU` (компонент `src/app/regions/regions-table.component.ts`).

В dev `ng serve` проксирует `/api` → `http://localhost:3000` (`proxy.conf.json`).

---

## 8. История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-06-01 | 0.1 | Базовый CRUD: countries, regions, health |
| 2026-06-01 | 0.2 | Таблица регионов на главной (Angular) |
| 2026-06-20 | 0.3 | POST `/api/diagnostic/parse` — парсинг акта диагностики из DOCX |
| 2026-06-20 | 0.4 | CRUD `/api/hospitals`, POST/GET `/api/diagnostic/acts` |
