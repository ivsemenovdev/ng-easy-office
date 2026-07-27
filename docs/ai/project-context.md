# Контекст проекта ng-easy-office

> **Назначение файла:** единая точка входа для AI-агента или разработчика, начинающего работу с репозиторием без истории чата.  
> **Обновлять** при существенных изменениях архитектуры, маршрутов или схемы БД.

---

## 1. Что это за проект

**NgEasyOffice** — внутреннее веб-приложение для офисных задач:

- справочник **субъектов РФ** (89 регионов в PostgreSQL);
- **больницы** по регионам (CRUD);
- **импорт актов диагностики** из Word (.docx) по шаблону ВНИИИМТ;
- **просмотр сохранённых актов** по больнице;
- **экспорт регионов** в Word.

Стек: **Angular 21 + Taiga UI 5** (фронт), **Node.js + Express + TypeScript + pg** (API), **PostgreSQL 18+** (данные).

---

## 2. Быстрый старт (локально)

### Требования

- Node.js 20+, npm 10+
- PostgreSQL, база `donetsk_test`
- `psql` для миграций

### База данных

```bash
createdb donetsk_test   # если ещё нет
./database/scripts/migrate.sh
psql -d donetsk_test -f database/seeds/002_russia_federal_subjects.sql
```

Миграции (по порядку): `001` … `011` в `database/migrations/`.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

- API: http://localhost:3000/api/health
- Env: `PORT`, `DATABASE_URL`, `CORS_ORIGIN` (см. `backend/.env.example`)

### Frontend

```bash
npm install
npm start
```

- UI: http://localhost:4200/
- Прокси `/api` → `localhost:3000` (`proxy.conf.json`)

### Проверка сборки

```bash
npm run build          # Angular → dist/ng-easy-office
cd backend && npm run build   # tsc (отдельных тестов backend нет)
npm test                      # ng test (Vitest через Angular unit-test)
```

---

## 3. Архитектура

```
┌─────────────────┐     /api/*      ┌──────────────────┐     SQL      ┌─────────────┐
│  Angular (4200) │ ──────────────► │ Express (3000)   │ ───────────► │ PostgreSQL  │
│  Taiga UI       │   proxy.conf    │ Zod + pg pool    │   ng_app     │ donetsk_test│
└─────────────────┘                 └──────────────────┘              └─────────────┘
```

| Слой          | Путь                        | Ответственность                        |
| ------------- | --------------------------- | -------------------------------------- |
| UI            | `src/app/`                  | Standalone-компоненты, signals, OnPush |
| API-клиенты   | `src/app/core/services/`    | HTTP к `/api/*`                        |
| Модели UI     | `src/app/core/models/`      | TypeScript-интерфейсы ответов API      |
| REST          | `backend/src/routes/`       | Express-роутеры                        |
| Бизнес-логика | `backend/src/services/`     | SQL через `pg` Pool                    |
| Валидация     | `backend/src/validation.ts` | Zod-схемы                              |
| DDL/DML       | `database/migrations/`      | Только здесь меняется схема            |

---

## 4. Маршруты UI (Angular)

Файл: `src/app/app.routes.ts`

| URL                  | Компонент                   | Назначение                              |
| -------------------- | --------------------------- | --------------------------------------- |
| `/`                  | `RegionsSettingsComponent`  | Таблица регионов + больницы             |
| `/hospital-settings` | `HospitalSettingsComponent` | Отделения и оборудование больницы       |
| `/equipment-types`   | `EquipmentTypesComponent`   | Справочник видов оборудования           |
| `/equipment-models`  | `EquipmentModelsComponent`  | Справочник моделей медтехники           |
| `/diagnostic-import` | `DiagnosticImportComponent` | Загрузка DOCX, предпросмотр, сохранение |
| `/hospital-acts`     | `HospitalActsComponent`     | Список актов по больнице                |

Навигация: `src/app/app.html` (Taiga `TuiRoot`, `router-outlet`).

---

## 5. REST API (кратко)

Полная спецификация: [api-backend.md](./api-backend.md)

| Префикс                      | Основное                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| `GET /api/health`            | `{ status, database }`                                     |
| `/api/countries`             | CRUD стран                                                 |
| `/api/regions`               | CRUD регионов; фильтры `country_iso`, `level`, `is_active` |
| `GET /api/regions/export`    | DOCX со всеми субъектами РФ                                |
| `/api/hospitals`             | CRUD; фильтр `region_id`                                   |
| `POST /api/diagnostic/parse` | multipart `file` → разбор DOCX                             |
| `/api/diagnostic/acts`       | POST сохранение, GET список по `hospital_id`               |

Ошибки: JSON `{ error, code? }`, коды `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, …

---

## 6. База данных

| Документ                                                   | Содержание                                                |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| [database-er-diagram.md](./database-er-diagram.md)         | **Единая ER-диаграмма** всей схемы (9 бизнес-таблиц)    |
| [database-policy.md](./database-policy.md)                 | Роли `ng_migrator` / `ng_app`, журнал `schema_migrations` |
| [database-regions.md](./database-regions.md)               | `geo_countries`, `geo_regions`                            |
| [database-hospitals-acts.md](./database-hospitals-acts.md) | `hospitals`, `diagnostic_acts`, оборудование              |
| [diagnostic-import.md](./diagnostic-import.md)             | Формат DOCX, парсер                                       |

Ключевые таблицы:

- `geo_countries`, `geo_regions` — справочник географии (89 субъектов РФ в сиде);
- `hospitals`, `hospital_requisites`, `departments` — медучреждения и структура;
- `equipment_types`, `equipment_models`, `equipment` — виды, модели и единицы оборудования;
- `diagnostic_acts` — акт привязан к `hospital_id`, массивы текстовых полей (JSON/array в PG).

**Правило:** DDL только в `database/migrations/`, не в backend-коде.

---

## 7. Карта исходников

### Frontend (`src/`)

```
src/app/
├── app.ts, app.html, app.routes.ts, app.config.ts   # корень, роутинг, провайдеры
├── core/
│   ├── models/          # geo, hospital, diagnostic-act
│   └── services/        # *-api.service.ts → /api/*
├── regions/
│   ├── regions-settings.component.*   # главная: загрузка данных
│   ├── regions-table.component.*      # аккордеон + Taiga Table
│   └── regions-export.component.*     # кнопка DOCX
├── hospitals/
│   └── hospitals.component.*          # CRUD больниц
├── hospital-settings/
│   └── hospital-settings.component.*  # отделения и оборудование
├── equipment-types/
│   └── equipment-types.component.*    # справочник видов оборудования
├── equipment-models/
│   └── equipment-models.component.*   # справочник моделей медтехники
└── diagnostic/
    ├── diagnostic-import.component.*  # parse + save
    └── hospital-acts.component.*      # список актов
```

Паттерны UI:

- `inject()` + `signal()` + `ChangeDetectionStrategy.OnPush`;
- API через `@Injectable({ providedIn: 'root' })` сервисы;
- стили — component-scoped CSS, переменные Taiga (`--tui-*`).

### Backend (`backend/src/`)

```
backend/src/
├── index.ts              # listen + graceful shutdown
├── app.ts                # createApp(): middleware + роуты
├── config.ts             # PORT, DATABASE_URL, CORS_ORIGIN
├── validation.ts         # Zod
├── db/pool.ts            # pg Pool
├── routes/               # *.routes.ts
├── services/             # SQL-логика
├── middleware/           # async-handler, error-handler
├── utils/                # ru-date, docx-table-parser
└── templates/            # *.docx для docxtemplater
```

DOCX:

- экспорт регионов — `docxtemplater` + шаблон `templates/regions-export.docx`;
- импорт акта — `pizzip` + парсер таблиц `utils/docx-table-parser.ts`.

---

## 8. Соглашения разработки

### Документация

Любое изменение схемы, API или домена **обязательно** отражать в `docs/ai/` ([README.md](./README.md)).

### TypeScript

- Frontend: strict Angular (`strictTemplates`, standalone components);
- Backend: `noUnusedLocals`, `noUnusedParameters`, ESM (`"type": "module"`).

### Коммиты / PR

- Сообщения на русском или английском — как в истории git;
- не коммитить `.env`, секреты.

### Стили и импорты

- Не оставлять неиспользуемые импорты Taiga-модулей в `imports: []` компонента;
- CSS-классы только те, что есть в шаблоне компонента.

---

## 9. Типичные задачи

| Задача             | Куда смотреть                                                      |
| ------------------ | ------------------------------------------------------------------ |
| Новое поле региона | миграция → `regions.service.ts` → `geo.model.ts` → таблица UI      |
| Новый экран        | `app.routes.ts` + компонент + при необходимости `*-api.service.ts` |
| Новый эндпоинт     | `routes/` + `services/` + `validation.ts` + `api-backend.md`       |
| Парсинг DOCX       | `diagnostic-import.service.ts`, `docx-table-parser.ts`             |
| Права БД для API   | миграция `*_dml_for_app.sql`, `database-policy.md`                 |

---

## 10. Известные ограничения

- Нет аутентификации (v0.1 API).
- Angular bundle ~583 kB (предупреждение budget 500 kB).
- `RegionsSettingsComponent` использует `delay(1000)` при загрузке — искусственная задержка для отображения loader.
- Backend-тестов нет; фронт — минимальный `app.spec.ts`.

---

## 11. Связанные файлы в корне

| Файл                          | Назначение                   |
| ----------------------------- | ---------------------------- |
| `README.md`                   | Человекочитаемый quick start |
| `angular.json`                | Конфиг Angular, proxy        |
| `proxy.conf.json`             | Dev-прокси `/api`            |
| `database/scripts/migrate.sh` | Применение миграций          |
| `.prettierrc`                 | Форматирование               |

---

## 12. История изменений

| Дата       | Изменение                                                                              |
| ---------- | -------------------------------------------------------------------------------------- |
| 2026-06-21 | Создан `project-context.md`; JSDoc в core-модулях; очистка неиспользуемых импортов/CSS |
| 2026-07-26 | Синхронизация документации с README и `api-backend.md`; уточнена команда сборки backend |
| 2026-07-26 | Добавлена ссылка на `database-er-diagram.md`; маршруты `/hospital-settings`, `/equipment-types`; миграции `001`–`009` |

<!-- Для нового чата достаточно приложить этот файл (или написать: «прочитай docs/ai/project-context.md»). Ссылка добавлена в README.md и docs/ai/README.md. -->
