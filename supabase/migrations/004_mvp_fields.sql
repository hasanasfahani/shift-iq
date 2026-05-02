-- ============================================================
-- Shift.iq — MVP Fields
-- Adds new columns for shift requirements, venue details,
-- business ratings, and application confirmations.
-- ============================================================

-- ─── Extend application_status enum ─────────────────────────
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'withdrawn';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'no_show';

-- ─── Shifts: requirement fields ──────────────────────────────
ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS what_to_expect     TEXT,
  ADD COLUMN IF NOT EXISTS clothing_rules     TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_skills    TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms      TEXT,
  ADD COLUMN IF NOT EXISTS special_badge      TEXT;

-- ─── Business locations: geolocation + photos ────────────────
ALTER TABLE business_locations
  ADD COLUMN IF NOT EXISTS lat                  NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS lng                  NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS photos               TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS arrival_instructions TEXT;

-- ─── Business profiles: description + ratings + verification ─
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS description    TEXT,
  ADD COLUMN IF NOT EXISTS photos         TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_ratings  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified    BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── Applications: pre-apply confirmations ───────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS confirmed_clothing             BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmed_cancellation_policy  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expires_at                     TIMESTAMPTZ;

-- ─── Pro profiles: worker status for suspensions ─────────────
ALTER TABLE pro_profiles
  ADD COLUMN IF NOT EXISTS worker_status TEXT NOT NULL DEFAULT 'active';

-- ─── Trigger: recalculate business average_rating ────────────
CREATE OR REPLACE FUNCTION update_business_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE business_profiles
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(stars)::NUMERIC, 2), 0)
      FROM ratings r
      JOIN users u ON u.id = r.rated_id AND u.role = 'business'
      WHERE r.rated_id = NEW.rated_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM ratings r
      JOIN users u ON u.id = r.rated_id AND u.role = 'business'
      WHERE r.rated_id = NEW.rated_id
    )
  WHERE user_id = NEW.rated_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_business_rating
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_business_average_rating();

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shifts_special_badge ON shifts(special_badge) WHERE special_badge IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shifts_date_status   ON shifts(date, status);
