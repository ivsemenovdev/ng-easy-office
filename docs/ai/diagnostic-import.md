# Импорт акта диагностики (DOCX)

> **Назначение:** загрузка, парсинг и сохранение акта технического обслуживания / ремонта (шаблон ФГБУ «ВНИИИМТ»).  
> **Шаблон:** `backend/templates/diagnostic-act.docx`  
> **Статус:** v0.2 — парсинг, сохранение в БД, просмотр по больнице

---

## 1. Поток данных

1. Пользователь выбирает `.docx` на странице `/diagnostic-import`.
2. `POST /api/diagnostic/parse` — парсинг через **pizzip**.
3. Пользователь выбирает регион и больницу, нажимает **«Добавить в БД»**.
4. `POST /api/diagnostic/acts` — запись в `diagnostic_acts`.
5. Просмотр сохранённых актов — страница `/hospital-acts`.

Схема БД: [database-hospitals-acts.md](./database-hospitals-acts.md).

---

## 2. API

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/diagnostic/parse` | Парсинг `.docx` (multipart, поле `file`) |
| `POST` | `/api/diagnostic/acts` | Сохранение распарсенного акта |
| `GET` | `/api/diagnostic/acts?hospital_id=` | Список актов больницы |
| `GET` | `/api/diagnostic/acts/:id` | Детали акта |

**Пример ответа parse:**

```json
{
  "data": {
    "actNumber": "2",
    "actDate": "24.10.2025",
    "actTitle": "технического обслуживания / ремонта",
    "equipmentName": null,
    "equipmentCondition": [],
    "completedWorks": [],
    "conclusion": []
  }
}
```

**Тело POST `/api/diagnostic/acts`:**

```json
{
  "hospital_id": 1,
  "act_number": "2",
  "act_date": "24.10.2025",
  "equipment_name": "Аппарат ИВЛ",
  "equipment_condition": ["Исправен"],
  "completed_works": [],
  "conclusion": []
}
```

---

## 3. Поля шаблона

### Заголовок акта (абзацы)

| Ключ API | Источник |
|----------|----------|
| `actNumber` | «АКТ № …» |
| `actTitle` | «технического обслуживания / ремонта» |
| `actDate` | Дата после заголовка (например `24.10.2025`) |

### Основная таблица (метка → значение)

| Ключ API | Метка в DOCX |
|----------|--------------|
| `equipmentName` | Наименование оборудования: |
| `equipmentModel` | Модель оборудования: |
| `serialNumber` | Заводской номер: |
| `customer` | Заказчик: |
| `customerAddress` | Адрес заказчика: |
| `workType` | Тип работ: |
| `basis` | Основание: |

### Многострочные секции

| Ключ API | Метка в DOCX |
|----------|--------------|
| `equipmentCondition` | Состояние оборудования, выявленные дефекты: |
| `completedWorks` | Перечень выполненных работ: |
| `conclusion` | Заключение: |

---

## 4. Связанные файлы

| Путь | Роль |
|------|------|
| `backend/templates/diagnostic-act.docx` | Эталон шаблона |
| `backend/src/utils/docx-table-parser.ts` | Утилиты разбора OOXML |
| `backend/src/services/diagnostic-import.service.ts` | Парсинг DOCX |
| `backend/src/services/diagnostic-acts.service.ts` | Сохранение и чтение актов |
| `backend/src/routes/diagnostic.routes.ts` | HTTP-маршруты parse + acts |
| `src/app/diagnostic/diagnostic-import.component.*` | Импорт и сохранение |
| `src/app/diagnostic/hospital-acts.component.*` | Просмотр актов |
| `src/app/core/services/diagnostic-api.service.ts` | HTTP-клиент |

---

## 5. История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-06-20 | 0.1 | POST `/api/diagnostic/parse`, страница `/diagnostic-import` |
| 2026-06-20 | 0.2 | Сохранение актов в БД, страница `/hospital-acts` |
