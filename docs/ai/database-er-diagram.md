# ER-диаграмма приложения (PostgreSQL)

> **Назначение:** единая логическая ER-диаграмма всей бизнес-схемы **ng-easy-office**.  
> **Статус:** актуальна для миграций `001`–`011` в `database/migrations/`.

Детальные описания колонок, API и UI — в доменных документах:

- [database-regions.md](./database-regions.md) — география
- [database-hospitals-acts.md](./database-hospitals-acts.md) — больницы, оборудование, акты

---

## 1. Полная ER-диаграмма

```mermaid
erDiagram
    geo_countries ||--o{ geo_regions : has
    geo_regions ||--o{ geo_regions : parent
    geo_regions ||--o{ hospitals : has
    hospitals ||--o| hospital_requisites : has
    hospitals ||--o{ diagnostic_acts : has
    hospitals ||--o{ departments : has
    departments ||--o{ equipment : has
    equipment_types ||--o{ equipment_models : has
    equipment_models ||--o{ equipment : model

    geo_countries {
        smallint id PK
        char iso_alpha2 UK
        text name_ru
        boolean is_active
    }

    geo_regions {
        int id PK
        smallint country_id FK
        int parent_id FK
        enum level
        varchar code
        text name_ru
        boolean is_active
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
        text name UK
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
        boolean is_active
    }

    diagnostic_acts {
        int id PK
        int hospital_id FK
        varchar act_number
        date act_date
        text equipment_name
        text_array conclusion
    }
```

---

## 2. Группы сущностей

| Группа       | Таблицы                                           | Доменный документ                                      |
| ------------ | ------------------------------------------------- | ------------------------------------------------------ |
| География    | `geo_countries`, `geo_regions`                    | [database-regions.md](./database-regions.md)           |
| Больницы     | `hospitals`, `hospital_requisites`, `departments` | [database-hospitals-acts.md](./database-hospitals-acts.md) |
| Оборудование | `equipment_types`, `equipment_models`, `equipment` | [database-hospitals-acts.md](./database-hospitals-acts.md) |
| Акты         | `diagnostic_acts`                                 | [database-hospitals-acts.md](./database-hospitals-acts.md) |

**Служебная таблица** (не на диаграмме): `schema_migrations` — журнал применённых миграций ([database-policy.md](./database-policy.md), миграция `002`).

---

## 3. Связи и ON DELETE

| FK                         | Кардинальность | ON DELETE  | Миграция |
| -------------------------- | -------------- | ---------- | -------- |
| `geo_regions.country_id` → `geo_countries` | N:1 | RESTRICT | `001` |
| `geo_regions.parent_id` → `geo_regions`    | N:1 (nullable) | RESTRICT | `001` |
| `hospitals.region_id` → `geo_regions`      | N:1 | RESTRICT | `004` |
| `hospital_requisites.hospital_id` → `hospitals` | 1:1 | CASCADE | `006` |
| `diagnostic_acts.hospital_id` → `hospitals`   | N:1 | RESTRICT | `004` |
| `departments.hospital_id` → `hospitals`       | N:1 | CASCADE | `008` |
| `equipment.department_id` → `departments`     | N:1 | CASCADE | `008` |
| `equipment.equipment_model_id` → `equipment_models` | N:1 | RESTRICT | `010` |
| `equipment_models.equipment_type_id` → `equipment_types` | N:1 | RESTRICT | `010` |

---

## 4. Важные особенности модели

### Глобальные справочники оборудования

`equipment_types` — виды (МРТ, УЗИ). `equipment_models` — производитель + модель + вид. Оба не привязаны к больнице. Единицы в отделении (`equipment`) ссылаются на модель через `equipment_model_id`; серийный и инвентарный номера задаются для каждой установленной единицы.

### Акты и оборудование не связаны FK

`diagnostic_acts` хранит данные об оборудовании **денормализованно** (`equipment_name`, `equipment_model`, `serial_number` и др.). FK на таблицу `equipment` нет: акты импортируются из DOCX и могут описывать оборудование, которое ещё не заведено в справочнике отделения.

### Иерархия регионов

`geo_regions.parent_id` — самоссылка для будущей иерархии (страна → субъект → район). Сейчас в сиде — 89 субъектов РФ верхнего уровня.

---

## 5. История изменений

| Дата       | Версия | Изменение                                      |
| ---------- | ------ | ---------------------------------------------- |
| 2026-07-26 | 0.1    | Создана единая ER-диаграмма приложения (9 таблиц) |
| 2026-07-27 | 0.2    | Добавлена `equipment_models`; `equipment` ссылается на модель |
