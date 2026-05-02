-- ============================================================
-- Shift.iq — Full Reset
-- Run this FIRST to wipe everything, then run migrations 001–005
-- ============================================================

-- Drop tables (order matters — children before parents)
DROP TABLE IF EXISTS notifications        CASCADE;
DROP TABLE IF EXISTS ratings              CASCADE;
DROP TABLE IF EXISTS applications         CASCADE;
DROP TABLE IF EXISTS shift_templates      CASCADE;
DROP TABLE IF EXISTS shifts               CASCADE;
DROP TABLE IF EXISTS pro_experiences      CASCADE;
DROP TABLE IF EXISTS business_locations   CASCADE;
DROP TABLE IF EXISTS pro_profiles         CASCADE;
DROP TABLE IF EXISTS business_profiles    CASCADE;
DROP TABLE IF EXISTS users                CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS shift_status       CASCADE;
DROP TYPE IF EXISTS shift_type         CASCADE;
DROP TYPE IF EXISTS business_type      CASCADE;
DROP TYPE IF EXISTS iraqi_city         CASCADE;
DROP TYPE IF EXISTS user_role          CASCADE;

-- Drop auth users (cascades to everything)
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- Confirm clean
SELECT 'Reset complete — ready to run migrations' AS status;
