-- ============================================================
-- Shift.iq — Initial Schema
-- Run this once against your Supabase project.
-- Supabase provides uuid-ossp by default.
-- ============================================================

-- ─── Enums ───────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('business', 'pro');

CREATE TYPE iraqi_city AS ENUM (
  'Baghdad', 'Erbil', 'Basra', 'Sulaymaniyah',
  'Mosul', 'Kirkuk', 'Najaf', 'Karbala'
);

CREATE TYPE business_type AS ENUM (
  'Restaurant', 'Café', 'Hotel', 'Catering Company', 'Event Venue', 'Other'
);

CREATE TYPE shift_status AS ENUM ('open', 'filled', 'completed', 'cancelled');

CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TYPE shift_type AS ENUM ('one-time', 'recurring', 'temp-to-hire');

-- ─── Users ───────────────────────────────────────────────────
-- id mirrors Supabase Auth user id exactly.

CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL UNIQUE,
  role        user_role NOT NULL,
  city        iraqi_city NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Business Profiles ───────────────────────────────────────

CREATE TABLE business_profiles (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name  TEXT NOT NULL,
  business_type  business_type NOT NULL
);

-- ─── Business Locations ──────────────────────────────────────

CREATE TABLE business_locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_name   TEXT NOT NULL,
  city          iraqi_city NOT NULL,
  address       TEXT NOT NULL,
  branch_phone  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Pro Profiles ────────────────────────────────────────────

CREATE TABLE pro_profiles (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio               TEXT,
  skills            TEXT[] NOT NULL DEFAULT '{}',
  photo_url         TEXT,
  average_rating    NUMERIC(3,2) NOT NULL DEFAULT 0,
  completed_shifts  INTEGER NOT NULL DEFAULT 0
);

-- ─── Shifts ──────────────────────────────────────────────────
-- duration_hours and platform_fee_iqd are computed at creation
-- and never recalculated — historical billing integrity.

CREATE TABLE shifts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id          UUID NOT NULL REFERENCES business_locations(id),
  job_title            TEXT NOT NULL,
  date                 DATE NOT NULL,
  start_time           TIME NOT NULL,
  end_time             TIME NOT NULL,
  duration_hours       NUMERIC(4,2) NOT NULL CHECK (duration_hours > 0),
  workers_needed       SMALLINT NOT NULL CHECK (workers_needed > 0),
  pro_hourly_rate_iqd  INTEGER NOT NULL CHECK (pro_hourly_rate_iqd > 0),
  shift_type           shift_type NOT NULL DEFAULT 'one-time',
  description          TEXT,
  platform_fee_iqd     INTEGER NOT NULL CHECK (platform_fee_iqd > 0),
  status               shift_status NOT NULL DEFAULT 'open',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Applications ────────────────────────────────────────────
-- UNIQUE(shift_id, pro_id) prevents double-apply at DB level.

CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id    UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  pro_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      application_status NOT NULL DEFAULT 'pending',
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shift_id, pro_id)
);

-- ─── Ratings ─────────────────────────────────────────────────
-- UNIQUE(shift_id, rater_id) prevents double-rating.

CREATE TABLE ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id    UUID NOT NULL REFERENCES shifts(id),
  rater_id    UUID NOT NULL REFERENCES users(id),
  rated_id    UUID NOT NULL REFERENCES users(id),
  stars       SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shift_id, rater_id)
);

-- ─── Notifications ───────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────

CREATE INDEX idx_shifts_business_id     ON shifts(business_id);
CREATE INDEX idx_shifts_status          ON shifts(status);
CREATE INDEX idx_shifts_date            ON shifts(date);
CREATE INDEX idx_business_locations_bid ON business_locations(business_id);
CREATE INDEX idx_business_locations_city ON business_locations(city);
CREATE INDEX idx_applications_shift_id  ON applications(shift_id);
CREATE INDEX idx_applications_pro_id    ON applications(pro_id);
CREATE INDEX idx_notifications_user_id  ON notifications(user_id);
-- Partial index — only unread rows, used for bell badge count query
CREATE INDEX idx_notifications_unread   ON notifications(user_id) WHERE is_read = FALSE;

-- ─── Trigger: recalculate pro average_rating ─────────────────

CREATE OR REPLACE FUNCTION update_pro_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pro_profiles
  SET average_rating = (
    SELECT COALESCE(ROUND(AVG(stars)::NUMERIC, 2), 0)
    FROM ratings r
    JOIN users u ON u.id = r.rated_id AND u.role = 'pro'
    WHERE r.rated_id = NEW.rated_id
  )
  WHERE user_id = NEW.rated_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pro_rating
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_pro_average_rating();

-- ─── Trigger: increment completed_shifts on pro ──────────────

CREATE OR REPLACE FUNCTION increment_completed_shifts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE pro_profiles pp
    SET completed_shifts = completed_shifts + 1
    FROM applications a
    WHERE a.shift_id = NEW.id
      AND a.pro_id = pp.user_id
      AND a.status = 'accepted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_completed_shifts
AFTER UPDATE ON shifts
FOR EACH ROW
EXECUTE FUNCTION increment_completed_shifts();

-- ─── Row Level Security ──────────────────────────────────────

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;

-- users: read own row; no direct updates (go through API with service role)
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- business_profiles
CREATE POLICY "business_profiles_select_own" ON business_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "business_profiles_insert_own" ON business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "business_profiles_update_own" ON business_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- business_locations: owner full access; authenticated users can read (for shift display)
CREATE POLICY "locations_select_authenticated" ON business_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "locations_insert_own" ON business_locations
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "locations_update_own" ON business_locations
  FOR UPDATE USING (auth.uid() = business_id);

CREATE POLICY "locations_delete_own" ON business_locations
  FOR DELETE USING (auth.uid() = business_id);

-- pro_profiles: all authenticated users can read (needed for applicant cards)
CREATE POLICY "pro_profiles_select_authenticated" ON pro_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pro_profiles_insert_own" ON pro_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pro_profiles_update_own" ON pro_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- SECURITY DEFINER breaks the RLS cycle:
--   users policy → applications + shifts → applications policy → shifts (cycle!)
CREATE OR REPLACE FUNCTION public.pro_has_applied_to_shift(p_shift_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM applications
    WHERE shift_id = p_shift_id AND pro_id = auth.uid()
  );
$$;

-- shifts: business CRUD own; pros read open shifts or shifts they applied to
CREATE POLICY "shifts_select_business_own" ON shifts
  FOR SELECT USING (
    auth.uid() = business_id
    OR status = 'open'
    OR pro_has_applied_to_shift(id)
  );

CREATE POLICY "shifts_insert_own" ON shifts
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "shifts_update_own" ON shifts
  FOR UPDATE USING (auth.uid() = business_id);

CREATE POLICY "shifts_delete_own" ON shifts
  FOR DELETE USING (auth.uid() = business_id);

-- applications: pros manage own; businesses read applications for their shifts
CREATE POLICY "applications_select_pro_own" ON applications
  FOR SELECT USING (
    auth.uid() = pro_id
    OR EXISTS (
      SELECT 1 FROM shifts s WHERE s.id = shift_id AND s.business_id = auth.uid()
    )
  );

CREATE POLICY "applications_insert_pro" ON applications
  FOR INSERT WITH CHECK (auth.uid() = pro_id);

-- Business updates application status (accept/decline) via service role in API routes
-- Pros cannot update their own applications after submitting

-- ratings: authenticated users can read; parties to a shift can insert
CREATE POLICY "ratings_select_authenticated" ON ratings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ratings_insert_party" ON ratings
  FOR INSERT WITH CHECK (
    auth.uid() = rater_id
    AND EXISTS (
      SELECT 1 FROM shifts s
      WHERE s.id = shift_id AND s.status = 'completed'
      AND (
        s.business_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM applications a
          WHERE a.shift_id = shift_id AND a.pro_id = auth.uid() AND a.status = 'accepted'
        )
      )
    )
  );

-- notifications: users read/update own only
-- Inserts are done by service role in API routes — no INSERT policy for anon/authenticated
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
