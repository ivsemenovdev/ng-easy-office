-- 003_geo_dml_for_app.sql
-- DML на справочниках geo_* для backend (роль ng_app)
-- Спецификация: docs/ai/api-backend.md

BEGIN;

GRANT INSERT, UPDATE, DELETE ON geo_countries, geo_regions TO ng_app;

INSERT INTO schema_migrations (version)
VALUES ('003_geo_dml_for_app')
ON CONFLICT (version) DO NOTHING;

COMMIT;
