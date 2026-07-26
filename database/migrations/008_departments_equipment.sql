-- 008_departments_equipment.sql
-- Отделения, виды оборудования и единицы оборудования
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

CREATE TABLE equipment_types (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE equipment_types IS 'Глобальный справочник видов медицинского оборудования';

CREATE TABLE departments (
    id          SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES hospitals (id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    code        VARCHAR(20),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE departments IS 'Структурные подразделения (отделения) больницы';

CREATE INDEX departments_hospital_id_idx ON departments (hospital_id);

CREATE TABLE equipment (
    id                  SERIAL PRIMARY KEY,
    department_id       INT NOT NULL REFERENCES departments (id) ON DELETE CASCADE,
    equipment_type_id   INT NOT NULL REFERENCES equipment_types (id) ON DELETE RESTRICT,
    name                TEXT NOT NULL,
    manufacturer        TEXT,
    model               TEXT,
    serial_number       VARCHAR(50),
    inventory_number    VARCHAR(50),
    manufacture_year    SMALLINT CHECK (manufacture_year IS NULL OR (manufacture_year >= 1900 AND manufacture_year <= 2100)),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE equipment IS 'Единицы медицинского оборудования, принадлежащие отделению';

CREATE INDEX equipment_department_id_idx ON equipment (department_id);
CREATE INDEX equipment_equipment_type_id_idx ON equipment (equipment_type_id);

INSERT INTO schema_migrations (version)
VALUES ('008_departments_equipment')
ON CONFLICT (version) DO NOTHING;

COMMIT;
