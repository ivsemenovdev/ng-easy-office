-- 011_equipment_models_dml_for_app.sql
-- DML на equipment_models для backend (роль ng_app)
-- Спецификация: docs/ai/database-hospitals-acts.md

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON equipment_models TO ng_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ng_app;

INSERT INTO schema_migrations (version)
VALUES ('011_equipment_models_dml_for_app')
ON CONFLICT (version) DO NOTHING;

COMMIT;
