-- 004_hospitals_and_diagnostic_acts.sql
-- Больницы (привязка к региону) и акты диагностики
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

CREATE TABLE hospitals (
    id          SERIAL PRIMARY KEY,
    region_id   INT NOT NULL REFERENCES geo_regions (id) ON DELETE RESTRICT,
    name        TEXT NOT NULL,
    address     TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX hospitals_region_id_idx ON hospitals (region_id);
CREATE INDEX hospitals_active_idx ON hospitals (is_active) WHERE is_active = TRUE;

CREATE TABLE diagnostic_acts (
    id                  SERIAL PRIMARY KEY,
    hospital_id         INT NOT NULL REFERENCES hospitals (id) ON DELETE RESTRICT,
    act_number          VARCHAR(50),
    act_date            DATE,
    act_title           TEXT,
    equipment_name      TEXT,
    equipment_model     TEXT,
    serial_number       VARCHAR(100),
    customer            TEXT,
    customer_address    TEXT,
    work_type           TEXT,
    basis               TEXT,
    equipment_condition TEXT[] NOT NULL DEFAULT '{}',
    completed_works     TEXT[] NOT NULL DEFAULT '{}',
    conclusion          TEXT[] NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX diagnostic_acts_hospital_id_idx ON diagnostic_acts (hospital_id);

COMMENT ON TABLE hospitals IS 'Медучреждения, привязанные к субъекту РФ (geo_regions)';
COMMENT ON TABLE diagnostic_acts IS 'Акты технического обслуживания / ремонта оборудования';

INSERT INTO schema_migrations (version)
VALUES ('004_hospitals_and_diagnostic_acts')
ON CONFLICT (version) DO NOTHING;

COMMIT;
