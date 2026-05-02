-- ============================================================
-- Shift.iq — Gap Fixes
-- Adds: preferred_skills + rules_and_regulations on shifts/templates,
--       cancelled_by_worker application status,
--       years_per_role on pro_profiles
-- ============================================================

-- ─── Extend application_status enum ─────────────────────────
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'cancelled_by_worker';

-- ─── Shifts: preferred skills + rules ────────────────────────
ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS preferred_skills    TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rules_and_regulations TEXT;

-- ─── Shift templates: preferred skills + rules ───────────────
ALTER TABLE shift_templates
  ADD COLUMN IF NOT EXISTS preferred_skills    TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rules_and_regulations TEXT;

-- ─── Pro profiles: years of experience per role ──────────────
ALTER TABLE pro_profiles
  ADD COLUMN IF NOT EXISTS years_per_role JSONB NOT NULL DEFAULT '{}';

-- ─── Shift templates: update RLS to allow updates ────────────
CREATE POLICY IF NOT EXISTS "templates_update_own" ON shift_templates
  FOR UPDATE USING (auth.uid() = business_id);
