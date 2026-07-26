-- 006_hospital_requisites.sql
-- Реквизиты больниц (1:1 с hospitals)
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

CREATE TABLE hospital_requisites (
    id              SERIAL PRIMARY KEY,
    hospital_id     INT NOT NULL UNIQUE REFERENCES hospitals (id) ON DELETE CASCADE,
    legal_address   TEXT,
    postal_address  TEXT,
    phone           TEXT,
    inn             VARCHAR(12),
    kpp             VARCHAR(9),
    ogrn            VARCHAR(15),
    bank_account    TEXT,
    bik             VARCHAR(9),
    bank_name       TEXT,
    ktm             VARCHAR(20),
    okpo            VARCHAR(14),
    email           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE hospital_requisites IS 'Юридические и банковские реквизиты медучреждения (1:1 с hospitals)';

INSERT INTO schema_migrations (version)
VALUES ('006_hospital_requisites')
ON CONFLICT (version) DO NOTHING;

COMMIT;
