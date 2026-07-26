# Больницы и акты диагностики (PostgreSQL)

> **Назначение:** хранение медучреждений (привязка к региону) и актов технического обслуживания / ремонта.  
> **Статус:** миграции `004`–`007`; CRUD больниц, реквизиты и сохранение актов через API.

---

## 1. ER-диаграмма

```mermaid
erDiagram
    geo_regions ||--o{ hospitals : has
    hospitals ||--o| hospital_requisites : has
    hospitals ||--o{ diagnostic_acts : has

    geo_regions {
        int id PK
        text name_ru
    }

    hospitals {
        int id PK
        int region_id FK
        text name
        text address
        boolean is_active
    }

    hospital_requisites {
        int id PK
        int hospital_id FK_UQ
        text legal_address
        text inn
        varchar kpp
    }

    diagnostic_acts {
        int id PK
        int hospital_id FK
        varchar act_number
        date act_date
        text equipment_name
        text_array equipment_condition
        text_array completed_works
        text_array conclusion
    }
```

---

## 2. Таблица `hospitals`

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | `SERIAL PK` | |
| `region_id` | `INT FK → geo_regions` | Субъект РФ |
| `name` | `TEXT NOT NULL` | Наименование |
| `address` | `TEXT` | Адрес |
| `is_active` | `BOOLEAN DEFAULT true` | |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | |

Индексы: `hospitals_region_id_idx`, `hospitals_active_idx`.

Поле `address` — краткий операционный адрес для списка; юридический и почтовый адреса — в `hospital_requisites`.

---

## 3. Таблица `hospital_requisites`

Связь **1:1** с `hospitals` (`hospital_id UNIQUE`, `ON DELETE CASCADE`).

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | `SERIAL PK` | |
| `hospital_id` | `INT FK → hospitals` | Одна запись на больницу |
| `legal_address` | `TEXT` | Юридический адрес |
| `postal_address` | `TEXT` | Почтовый адрес |
| `phone` | `TEXT` | Телефон |
| `inn` | `VARCHAR(12)` | ИНН (10 или 12 цифр) |
| `kpp` | `VARCHAR(9)` | КПП |
| `ogrn` | `VARCHAR(15)` | ОГРН (13 или 15 цифр) |
| `bank_account` | `TEXT` | Казначейский / расчётный счёт |
| `bik` | `VARCHAR(9)` | БИК |
| `bank_name` | `TEXT` | Наименование отделения банка |
| `ktm` | `VARCHAR(20)` | Код территории по КТМ |
| `okpo` | `VARCHAR(14)` | ОКПО |
| `email` | `TEXT` | Email |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | |

---

## 4. Таблица `diagnostic_acts`

Поля соответствуют парсеру DOCX ([diagnostic-import.md](./diagnostic-import.md)).

| Колонка | Тип |
|---------|-----|
| `hospital_id` | `INT FK → hospitals` |
| `act_number` | `VARCHAR(50)` |
| `act_date` | `DATE` |
| `act_title` | `TEXT` |
| `equipment_name`, `equipment_model`, `serial_number` | `TEXT` / `VARCHAR` |
| `customer`, `customer_address`, `work_type`, `basis` | `TEXT` |
| `equipment_condition`, `completed_works`, `conclusion` | `TEXT[]` |
| `created_at`, `updated_at` | `TIMESTAMPTZ` |

Дубликаты актов **разрешены** (unique constraint не используется).

---

## 5. Миграции

| Файл | Содержание |
|------|------------|
| `database/migrations/004_hospitals_and_diagnostic_acts.sql` | DDL таблиц |
| `database/migrations/005_hospitals_acts_dml_for_app.sql` | `GRANT` для `ng_app` |
| `database/migrations/006_hospital_requisites.sql` | DDL `hospital_requisites` |
| `database/migrations/007_hospital_requisites_dml_for_app.sql` | `GRANT` для `ng_app` |

```bash
./database/scripts/migrate.sh
```

---

## 6. API

См. [api-backend.md](./api-backend.md):

- `/api/hospitals` — CRUD
- `/api/hospitals/:id/requisites` — GET / PUT (реквизиты)
- `/api/diagnostic/acts` — POST (сохранение), GET (список по `hospital_id`)

---

## 7. Связанные файлы

| Путь | Роль |
|------|------|
| `backend/src/services/hospitals.service.ts` | CRUD больниц |
| `backend/src/services/hospital-requisites.service.ts` | GET / upsert реквизитов |
| `backend/src/services/diagnostic-acts.service.ts` | Сохранение и чтение актов |
| `backend/src/routes/hospitals.routes.ts` | HTTP-маршруты больниц и реквизитов |
| `backend/src/routes/diagnostic.routes.ts` | parse + acts |
| `src/app/hospitals/hospitals.component.*` | Управление больницами и реквизитами по региону |
| `src/app/core/services/hospital-requisites-api.service.ts` | HTTP-клиент реквизитов |
| `src/app/diagnostic/diagnostic-import.component.*` | Импорт и сохранение |
| `src/app/diagnostic/hospital-acts.component.*` | Просмотр актов по больнице |

---

## 8. История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-06-20 | 0.1 | Таблицы `hospitals`, `diagnostic_acts`; API и UI сохранения/просмотра |
| 2026-06-20 | 0.2 | CRUD больниц на главной `/` (блок `HospitalsComponent` по региону) |
| 2026-07-26 | 0.3 | Исправлено описание UI: отдельного маршрута `/hospitals` нет |
| 2026-07-26 | 0.4 | Таблица `hospital_requisites` (1:1); API и UI редактирования реквизитов |
