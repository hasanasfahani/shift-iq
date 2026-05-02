-- ============================================================
-- Shift.iq — Age Gate, Shift Templates, Reminder Tracking
-- ============================================================

-- ─── Users: date of birth for 18+ age gate ───────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- ─── Applications: reminder tracking ─────────────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- ─── Shift Templates ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shift_templates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  location_id          UUID REFERENCES business_locations(id) ON DELETE SET NULL,
  job_title            TEXT NOT NULL,
  workers_needed       SMALLINT NOT NULL DEFAULT 1,
  pro_hourly_rate_iqd  INTEGER NOT NULL,
  shift_type           shift_type NOT NULL DEFAULT 'one-time',
  description          TEXT,
  what_to_expect       TEXT,
  clothing_rules       TEXT[] NOT NULL DEFAULT '{}',
  required_skills      TEXT[] NOT NULL DEFAULT '{}',
  cancellation_policy  TEXT,
  payment_terms        TEXT,
  special_badge        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_templates_business ON shift_templates(business_id);

-- ─── RLS for shift_templates ─────────────────────────────────
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select_own" ON shift_templates
  FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "templates_insert_own" ON shift_templates
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "templates_delete_own" ON shift_templates
  FOR DELETE USING (auth.uid() = business_id);
