-- 007_hospital_requisites_dml_for_app.sql
-- DML на hospital_requisites для backend (роль ng_app)
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

GRANT INSERT, UPDATE, DELETE ON hospital_requisites TO ng_app;

INSERT INTO schema_migrations (version)
VALUES ('007_hospital_requisites_dml_for_app')
ON CONFLICT (version) DO NOTHING;

COMMIT;
