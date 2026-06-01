-- 002_schema_migrations_and_roles.sql
-- Учёт миграций, роли ng_migrator / ng_app, ограничение прав на справочники geo_*
-- Спецификация: docs/ai/database-policy.md

BEGIN;

-- ---------------------------------------------------------------------------
-- Журнал применённых миграций
-- ---------------------------------------------------------------------------
CREATE TABLE schema_migrations (
    version     VARCHAR(100) PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE schema_migrations IS 'Журнал применённых SQL-миграций из database/migrations/';

INSERT INTO schema_migrations (version)
VALUES ('001_geo_regions')
ON CONFLICT (version) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Роли (без пароля; LOGIN включается локально при необходимости)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ng_migrator') THEN
        CREATE ROLE ng_migrator NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ng_app') THEN
        CREATE ROLE ng_app NOINHERIT;
    END IF;
END
$$;

COMMENT ON ROLE ng_migrator IS 'DDL и сиды; миграции database/migrations/';
COMMENT ON ROLE ng_app IS 'Приложение: DML без DDL; справочники geo_* — только SELECT';

-- Мигратор: полные права на схему public и объекты
DO $$
DECLARE
    db text := current_database();
BEGIN
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO ng_migrator', db);
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO ng_app', db);
END
$$;

GRANT USAGE, CREATE ON SCHEMA public TO ng_migrator;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ng_migrator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ng_migrator;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO ng_migrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO ng_migrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO ng_migrator;

-- Приложение: DML на таблицы, без CREATE в схеме
GRANT USAGE ON SCHEMA public TO ng_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ng_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ng_app;

ALTER DEFAULT PRIVILEGES FOR ROLE ng_migrator IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ng_app;

ALTER DEFAULT PRIVILEGES FOR ROLE ng_migrator IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO ng_app;

-- Справочники регионов: только чтение для приложения
REVOKE INSERT, UPDATE, DELETE ON geo_countries, geo_regions FROM ng_app;
REVOKE INSERT, UPDATE, DELETE ON geo_countries, geo_regions FROM PUBLIC;

-- Журнал миграций: чтение приложению, запись — мигратору
REVOKE ALL ON schema_migrations FROM PUBLIC;
GRANT SELECT ON schema_migrations TO ng_app;
GRANT ALL ON schema_migrations TO ng_migrator;

INSERT INTO schema_migrations (version)
VALUES ('002_schema_migrations_and_roles')
ON CONFLICT (version) DO NOTHING;

COMMIT;
