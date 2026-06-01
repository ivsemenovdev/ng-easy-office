-- 001_geo_regions.sql
-- Справочник стран и регионов для ng-easy-office / donetsk_test
-- Спецификация: docs/ai/database-regions.md

BEGIN;

CREATE TABLE geo_countries (
    id          SMALLSERIAL PRIMARY KEY,
    iso_alpha2  CHAR(2) NOT NULL UNIQUE,
    iso_alpha3  CHAR(3) UNIQUE,
    name_ru     TEXT NOT NULL,
    name_en     TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TYPE geo_region_level AS ENUM (
    'country',
    'federal_subject',
    'administrative'
);

CREATE TABLE geo_regions (
    id              SERIAL PRIMARY KEY,
    country_id      SMALLINT NOT NULL REFERENCES geo_countries (id),
    parent_id       INT REFERENCES geo_regions (id) ON DELETE RESTRICT,
    level           geo_region_level NOT NULL,
    code            VARCHAR(20) NOT NULL,
    okato           VARCHAR(11),
    name_ru         TEXT NOT NULL,
    name_short_ru   TEXT,
    name_en         TEXT,
    region_type     VARCHAR(50),
    sort_order      INT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT geo_regions_country_code_uq UNIQUE (country_id, code),
    CONSTRAINT geo_regions_no_self_parent CHECK (
        parent_id IS NULL OR parent_id <> id
    )
);

CREATE INDEX geo_regions_country_id_idx ON geo_regions (country_id);
CREATE INDEX geo_regions_parent_id_idx ON geo_regions (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX geo_regions_level_idx ON geo_regions (level);
CREATE INDEX geo_regions_active_idx ON geo_regions (is_active) WHERE is_active = TRUE;

COMMENT ON TABLE geo_countries IS 'Справочник стран';
COMMENT ON TABLE geo_regions IS 'Иерархический справочник регионов (субъекты РФ и др.)';
COMMENT ON COLUMN geo_regions.code IS 'ISO 3166-2 для РФ (RU-XXX) или внутренний код для других стран';

COMMIT;
