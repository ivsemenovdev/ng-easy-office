-- 010_equipment_models.sql
-- Глобальный справочник моделей медтехники и рефакторинг equipment
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

CREATE TABLE equipment_models (
    id                  SERIAL PRIMARY KEY,
    equipment_type_id   INT NOT NULL REFERENCES equipment_types (id) ON DELETE RESTRICT,
    manufacturer        TEXT NOT NULL,
    model               TEXT NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (equipment_type_id, manufacturer, model)
);

COMMENT ON TABLE equipment_models IS 'Глобальный справочник моделей медтехники (производитель + модель + вид)';

CREATE INDEX equipment_models_equipment_type_id_idx ON equipment_models (equipment_type_id);

-- Рефакторинг equipment: данные manufacturer/model переезжают в equipment_models
TRUNCATE equipment;

ALTER TABLE equipment DROP COLUMN IF EXISTS equipment_type_id;
ALTER TABLE equipment DROP COLUMN IF EXISTS name;
ALTER TABLE equipment DROP COLUMN IF EXISTS manufacturer;
ALTER TABLE equipment DROP COLUMN IF EXISTS model;

DROP INDEX IF EXISTS equipment_equipment_type_id_idx;

ALTER TABLE equipment
    ADD COLUMN equipment_model_id INT NOT NULL REFERENCES equipment_models (id) ON DELETE RESTRICT;

CREATE INDEX equipment_equipment_model_id_idx ON equipment (equipment_model_id);

INSERT INTO schema_migrations (version)
VALUES ('010_equipment_models')
ON CONFLICT (version) DO NOTHING;

COMMIT;
