-- 005_hospitals_acts_dml_for_app.sql
-- DML на hospitals, diagnostic_acts для backend (роль ng_app)
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

GRANT INSERT, UPDATE, DELETE ON hospitals, diagnostic_acts TO ng_app;

INSERT INTO schema_migrations (version)
VALUES ('005_hospitals_acts_dml_for_app')
ON CONFLICT (version) DO NOTHING;

COMMIT;
