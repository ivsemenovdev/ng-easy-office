-- 009_departments_equipment_dml_for_app.sql
-- DML на equipment_types, departments, equipment для backend (роль ng_app)
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON equipment_types, departments, equipment TO ng_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ng_app;

INSERT INTO schema_migrations (version)
VALUES ('009_departments_equipment_dml_for_app')
ON CONFLICT (version) DO NOTHING;

COMMIT;
