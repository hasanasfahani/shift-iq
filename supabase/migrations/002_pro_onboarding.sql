-- Add first_name / last_name to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name  TEXT;

-- Add onboarding fields to pro_profiles
ALTER TABLE pro_profiles
  ADD COLUMN IF NOT EXISTS days_availability  TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weekly_hours       TEXT,
  ADD COLUMN IF NOT EXISTS work_type          TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shift_preference   TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skills_by_role     JSONB   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step    INTEGER NOT NULL DEFAULT 0;

-- Pro experiences table
CREATE TABLE IF NOT EXISTS pro_experiences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position      TEXT NOT NULL,
  business_name TEXT NOT NULL,
  start_date    TEXT NOT NULL,
  end_date      TEXT,
  is_current    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pro_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pro_experiences_select_own" ON pro_experiences
  FOR SELECT USING (auth.uid() = pro_id);

CREATE POLICY "pro_experiences_insert_own" ON pro_experiences
  FOR INSERT WITH CHECK (auth.uid() = pro_id);

CREATE POLICY "pro_experiences_update_own" ON pro_experiences
  FOR UPDATE USING (auth.uid() = pro_id);

CREATE POLICY "pro_experiences_delete_own" ON pro_experiences
  FOR DELETE USING (auth.uid() = pro_id);

CREATE INDEX IF NOT EXISTS idx_pro_experiences_pro_id ON pro_experiences(pro_id);
