# Больницы и акты диагностики (PostgreSQL)

> **Назначение:** хранение медучреждений (привязка к региону) и актов технического обслуживания / ремонта.  
> **Статус:** миграции `004`–`009`; CRUD больниц, реквизиты, отделения, оборудование, виды оборудования и сохранение актов через API.

---

## 1. ER-диаграмма

> Полная ER-диаграмма приложения (включая `geo_countries`): [database-er-diagram.md](./database-er-diagram.md).

```mermaid
erDiagram
    geo_regions ||--o{ hospitals : has
    hospitals ||--o| hospital_requisites : has
    hospitals ||--o{ diagnostic_acts : has
    hospitals ||--o{ departments : has
    departments ||--o{ equipment : has
    equipment_types ||--o{ equipment_models : has
    equipment_models ||--o{ equipment : model

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

    departments {
        int id PK
        int hospital_id FK
        text name
        varchar code
        boolean is_active
    }

    equipment_types {
        int id PK
        text name
        boolean is_active
    }

    equipment_models {
        int id PK
        int equipment_type_id FK
        text manufacturer
        text model
        boolean is_active
    }

    equipment {
        int id PK
        int department_id FK
        int equipment_model_id FK
        varchar serial_number
        varchar inventory_number
        smallint manufacture_year
        boolean is_active
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

## 5. Таблица `equipment_types`

Глобальный справочник видов медицинского оборудования (не привязан к больнице).

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | `SERIAL PK` | |
| `name` | `TEXT NOT NULL UNIQUE` | Название вида (МРТ, УЗИ и т.д.) |
| `is_active` | `BOOLEAN DEFAULT true` | |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | |

---

## 6. Таблица `equipment_models`

Глобальный справочник моделей медтехники (производитель + модель + вид). Не привязан к больнице.

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | `SERIAL PK` | |
| `equipment_type_id` | `INT FK → equipment_types` | Вид оборудования (`ON DELETE RESTRICT`) |
| `manufacturer` | `TEXT NOT NULL` | Производитель |
| `model` | `TEXT NOT NULL` | Модель |
| `is_active` | `BOOLEAN DEFAULT true` | |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | |

Индекс: `equipment_models_equipment_type_id_idx`.  
Уникальность: `UNIQUE (equipment_type_id, manufacturer, model)`.

---

## 7. Таблица `departments`

Отделения (структурные подразделения) больницы.

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | `SERIAL PK` | |
| `hospital_id` | `INT FK → hospitals` | Больница (`ON DELETE CASCADE`) |
| `name` | `TEXT NOT NULL` | Название отделения |
| `code` | `VARCHAR(20)` | Внутренний код (опционально) |
| `is_active` | `BOOLEAN DEFAULT true` | |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | |

Индекс: `departments_hospital_id_idx`.

---

## 8. Таблица `equipment`

Единицы медицинского оборудования, установленные в отделении. Модель выбирается из справочника `equipment_models`; серийный и инвентарный номера задаются для каждой единицы.

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | `SERIAL PK` | |
| `department_id` | `INT FK → departments` | Отделение (`ON DELETE CASCADE`) |
| `equipment_model_id` | `INT FK → equipment_models` | Модель из справочника (`ON DELETE RESTRICT`) |
| `serial_number` | `VARCHAR(50)` | Серийный номер |
| `inventory_number` | `VARCHAR(50)` | Инвентарный номер |
| `manufacture_year` | `SMALLINT` | Год выпуска (1900–2100) |
| `is_active` | `BOOLEAN DEFAULT true` | |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | |

Индексы: `equipment_department_id_idx`, `equipment_equipment_model_id_idx`.

---

## 9. Миграции

| Файл | Содержание |
|------|------------|
| `database/migrations/004_hospitals_and_diagnostic_acts.sql` | DDL таблиц |
| `database/migrations/005_hospitals_acts_dml_for_app.sql` | `GRANT` для `ng_app` |
| `database/migrations/006_hospital_requisites.sql` | DDL `hospital_requisites` |
| `database/migrations/007_hospital_requisites_dml_for_app.sql` | `GRANT` для `ng_app` |
| `database/migrations/008_departments_equipment.sql` | DDL `equipment_types`, `departments`, `equipment` |
| `database/migrations/009_departments_equipment_dml_for_app.sql` | `GRANT` для `ng_app` |
| `database/migrations/010_equipment_models.sql` | DDL `equipment_models`, рефакторинг `equipment` |
| `database/migrations/011_equipment_models_dml_for_app.sql` | `GRANT` для `ng_app` |

```bash
./database/scripts/migrate.sh
```

---

## 10. API

См. [api-backend.md](./api-backend.md):

- `/api/hospitals` — CRUD
- `/api/hospitals/:id/requisites` — GET / PUT (реквизиты)
- `/api/hospitals/:id/departments` — CRUD отделений
- `/api/departments/:departmentId/equipment` — CRUD оборудования (единицы в отделении)
- `/api/equipment-models` — CRUD справочника моделей медтехники
- `/api/equipment-types` — CRUD справочника видов оборудования
- `/api/diagnostic/acts` — POST (сохранение), GET (список по `hospital_id`)

---

## 11. Связанные файлы

| Путь | Роль |
|------|------|
| `backend/src/services/hospitals.service.ts` | CRUD больниц |
| `backend/src/services/hospital-requisites.service.ts` | GET / upsert реквизитов |
| `backend/src/services/departments.service.ts` | CRUD отделений |
| `backend/src/services/equipment.service.ts` | CRUD оборудования |
| `backend/src/services/equipment-models.service.ts` | CRUD моделей медтехники |
| `backend/src/services/equipment-types.service.ts` | CRUD видов оборудования |
| `backend/src/services/diagnostic-acts.service.ts` | Сохранение и чтение актов |
| `backend/src/routes/hospitals.routes.ts` | HTTP-маршруты больниц, реквизитов и отделений |
| `backend/src/routes/departments.routes.ts` | HTTP-маршруты оборудования |
| `backend/src/routes/equipment-models.routes.ts` | HTTP-маршруты моделей медтехники |
| `backend/src/routes/equipment-types.routes.ts` | HTTP-маршруты видов оборудования |
| `backend/src/routes/diagnostic.routes.ts` | parse + acts |
| `src/app/hospitals/hospitals.component.*` | Управление больницами и реквизитами по региону |
| `src/app/hospital-settings/hospital-settings.component.*` | Настройка отделений и оборудования |
| `src/app/equipment-models/equipment-models.component.*` | Справочник моделей медтехники |
| `src/app/equipment-types/equipment-types.component.*` | Справочник видов оборудования |
| `src/app/core/services/hospital-requisites-api.service.ts` | HTTP-клиент реквизитов |
| `src/app/core/services/departments-api.service.ts` | HTTP-клиент отделений |
| `src/app/core/services/equipment-api.service.ts` | HTTP-клиент оборудования |
| `src/app/core/services/equipment-models-api.service.ts` | HTTP-клиент моделей медтехники |
| `src/app/core/services/equipment-types-api.service.ts` | HTTP-клиент видов оборудования |
| `src/app/diagnostic/diagnostic-import.component.*` | Импорт и сохранение |
| `src/app/diagnostic/hospital-acts.component.*` | Просмотр актов по больнице |

---

## 12. История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-06-20 | 0.1 | Таблицы `hospitals`, `diagnostic_acts`; API и UI сохранения/просмотра |
| 2026-06-20 | 0.2 | CRUD больниц на главной `/` (блок `HospitalsComponent` по региону) |
| 2026-07-26 | 0.3 | Исправлено описание UI: отдельного маршрута `/hospitals` нет |
| 2026-07-26 | 0.4 | Таблица `hospital_requisites` (1:1); API и UI редактирования реквизитов |
| 2026-07-26 | 0.5 | Таблицы `equipment_types`, `departments`, `equipment`; API и UI «Настройка больницы» |
| 2026-07-26 | 0.6 | Ссылка на единую ER-диаграмму; UI видов оборудования вынесен в `/equipment-types` |
| 2026-07-27 | 0.7 | Таблица `equipment_models`; `equipment` ссылается на модель; UI `/equipment-models` |
