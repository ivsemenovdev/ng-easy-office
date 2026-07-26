# Backend API (Node.js)

> **Назначение:** REST API: география (`geo_*`), больницы, импорт/хранение актов диагностики, экспорт регионов в DOCX.  
> **Код:** `backend/` · Express + TypeScript + `pg`  
> **Статус:** v0.5 — CRUD + DOCX, без аутентификации

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
./database/scripts/migrate.sh   # 001–005 (DML для ng_app: 003, 005)
psql -d donetsk_test -f database/seeds/002_russia_federal_subjects.sql
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

### Экспорт регионов

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/regions/export` | DOCX со всеми активными субъектами РФ (`Content-Disposition: attachment`) |

Реализация: `docxtemplater`, шаблон `backend/templates/regions-export.docx`. На фронте — `RegionsApiService.downloadDocx()`.

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

#### Реквизиты больницы (`hospital_requisites`, 1:1)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/hospitals/:id/requisites` | Реквизиты; `404`, если запись не создана |
| `PUT` | `/hospitals/:id/requisites` | Upsert (создание или обновление) |

**Тело PUT `/hospitals/:id/requisites` (пример):**

```json
{
  "legal_address": "г. Донецк, ул. Примерная, 1",
  "postal_address": "283050, г. Донецк, а/я 100",
  "phone": "+7 (856) 123-45-67",
  "inn": "9300000000",
  "kpp": "930001001",
  "ogrn": "1029300000000",
  "bank_account": "40102810000000000001",
  "bik": "044525000",
  "bank_name": "Отделение N8600",
  "ktm": null,
  "okpo": "12345678",
  "email": "info@example.org"
}
```

Все поля необязательны; пустые строки нормализуются в `null`. Формат `inn`/`kpp`/`ogrn`/`bik` проверяется Zod (длина и только цифры).

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

| Миграция | Права `ng_app` |
|----------|----------------|
| `003_geo_dml_for_app.sql` | `INSERT`/`UPDATE`/`DELETE` на `geo_countries`, `geo_regions` |
| `005_hospitals_acts_dml_for_app.sql` | `INSERT`/`UPDATE`/`DELETE` на `hospitals`, `diagnostic_acts` |
| `007_hospital_requisites_dml_for_app.sql` | `INSERT`/`UPDATE`/`DELETE` на `hospital_requisites` |

Локально подключение идёт через `DATABASE_URL` (часто пользователь ОС — владелец БД). Для prod — `postgres://ng_app:***@...`.

---

## 6. Правила для AI

1. Новые сущности/API — обновить этот документ и [README.md](../../README.md).
2. Не добавлять DDL в backend; только `database/migrations/`.
3. Валидация входа — `backend/src/validation.ts` (Zod).

---

## 7. Фронтенд

Главная страница (`RegionsSettingsComponent`) загружает `GET /api/regions?country_iso=RU` и передаёт данные в `regions-table.component.ts`; экспорт DOCX — `regions-export.component.ts`. Блок `HospitalsComponent` — CRUD больниц и редактирование реквизитов (`GET`/`PUT /api/hospitals/:id/requisites`).

В dev `ng serve` проксирует `/api` → `http://localhost:3000` (`proxy.conf.json`).

---

## 8. История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-06-01 | 0.1 | Базовый CRUD: countries, regions, health |
| 2026-06-01 | 0.2 | Таблица регионов на главной (Angular) |
| 2026-06-20 | 0.3 | POST `/api/diagnostic/parse` — парсинг акта диагностики из DOCX |
| 2026-06-20 | 0.4 | CRUD `/api/hospitals`, POST/GET `/api/diagnostic/acts` |
| 2026-07-26 | 0.5 | Документирован `GET /api/regions/export`; уточнены миграции и фронтенд |
| 2026-07-26 | 0.6 | GET/PUT `/api/hospitals/:id/requisites`; UI редактирования в `HospitalsComponent` |
