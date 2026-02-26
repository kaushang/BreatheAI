-- ============================================================================
-- BreatheAI — Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Creates the foundational tables:
--   1. profiles        — User profiles with location & health preferences
--   2. aqi_history     — Historical AQI readings from monitoring stations
--   3. alerts_log      — Log of AQI alert notifications sent to users
--
-- Follows Indian NAQI (National Air Quality Index) standards.
-- ============================================================================

-- ─── Enable Required Extensions ─────────────────────────────────────────────

-- uuid-ossp is used to auto-generate UUIDs for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════
-- Stores user profile information including location preferences and
-- health conditions relevant to air quality sensitivity.
-- The `id` column references Supabase Auth (auth.users) so each profile
-- is tied to an authenticated user.

CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL UNIQUE,
  city                TEXT NOT NULL,
  area                TEXT NOT NULL DEFAULT '',
  lat                 DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng                 DOUBLE PRECISION NOT NULL DEFAULT 0,
  health_conditions   TEXT[] NOT NULL DEFAULT '{}',
  aqi_alert_threshold INTEGER NOT NULL DEFAULT 150,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for city-based queries (e.g., fetching all users in a city for alerts)
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles (city);

-- Index for alert threshold lookups (e.g., finding users who need to be alerted)
CREATE INDEX IF NOT EXISTS idx_profiles_alert_threshold ON profiles (aqi_alert_threshold);

COMMENT ON TABLE  profiles IS 'User profiles with location and health preferences for AQI monitoring.';
COMMENT ON COLUMN profiles.id IS 'References auth.users — each profile is tied to a Supabase Auth user.';
COMMENT ON COLUMN profiles.health_conditions IS 'Array of health conditions (e.g., asthma, copd, heart_disease) affecting air quality sensitivity.';
COMMENT ON COLUMN profiles.aqi_alert_threshold IS 'AQI value at which the user receives an alert notification. Default 150 (Poor category in Indian NAQI).';


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. AQI_HISTORY
-- ═══════════════════════════════════════════════════════════════════════════════
-- Stores historical AQI readings fetched from CPCB/WAQI monitoring stations.
-- Each row is a single snapshot from one station at a given time.
-- Pollutant columns store concentrations in µg/m³ (CO in mg/m³).

CREATE TABLE IF NOT EXISTS aqi_history (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city                TEXT NOT NULL,
  area                TEXT NOT NULL DEFAULT '',
  station_name        TEXT NOT NULL,
  aqi                 INTEGER NOT NULL,
  dominant_pollutant  TEXT NOT NULL DEFAULT '',
  pm25                DOUBLE PRECISION,
  pm10                DOUBLE PRECISION,
  no2                 DOUBLE PRECISION,
  so2                 DOUBLE PRECISION,
  co                  DOUBLE PRECISION,
  o3                  DOUBLE PRECISION,
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index for city + time queries (dashboard lookups, historical charts)
CREATE INDEX IF NOT EXISTS idx_aqi_history_city_fetched ON aqi_history (city, fetched_at DESC);

-- Index for station-level time-series queries
CREATE INDEX IF NOT EXISTS idx_aqi_history_station_fetched ON aqi_history (station_name, fetched_at DESC);

COMMENT ON TABLE  aqi_history IS 'Historical AQI readings from Indian CPCB/WAQI monitoring stations.';
COMMENT ON COLUMN aqi_history.aqi IS 'Overall AQI value calculated using the Indian NAQI methodology.';
COMMENT ON COLUMN aqi_history.dominant_pollutant IS 'Pollutant with the highest sub-index value determining the overall AQI.';
COMMENT ON COLUMN aqi_history.pm25 IS 'PM2.5 concentration in µg/m³ (24-hour average).';
COMMENT ON COLUMN aqi_history.pm10 IS 'PM10 concentration in µg/m³ (24-hour average).';
COMMENT ON COLUMN aqi_history.no2 IS 'NO₂ concentration in µg/m³ (24-hour average).';
COMMENT ON COLUMN aqi_history.so2 IS 'SO₂ concentration in µg/m³ (24-hour average).';
COMMENT ON COLUMN aqi_history.co IS 'CO concentration in mg/m³ (8-hour average).';
COMMENT ON COLUMN aqi_history.o3 IS 'O₃ concentration in µg/m³ (8-hour average).';
COMMENT ON COLUMN aqi_history.fetched_at IS 'Timestamp when this reading was fetched from the external API.';


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. ALERTS_LOG
-- ═══════════════════════════════════════════════════════════════════════════════
-- Logs every AQI alert notification sent to a user.
-- Used for audit trails, preventing duplicate alerts, and analytics.

CREATE TABLE IF NOT EXISTS alerts_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  aqi_at_alert        INTEGER NOT NULL,
  city                TEXT NOT NULL,
  area                TEXT NOT NULL DEFAULT '',
  sent_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user-level alert history (e.g., "show me my past alerts")
CREATE INDEX IF NOT EXISTS idx_alerts_log_user ON alerts_log (user_id, sent_at DESC);

-- Index for city-level alert analytics
CREATE INDEX IF NOT EXISTS idx_alerts_log_city ON alerts_log (city, sent_at DESC);

COMMENT ON TABLE  alerts_log IS 'Log of AQI alert notifications sent to users.';
COMMENT ON COLUMN alerts_log.user_id IS 'References the user profile that received the alert.';
COMMENT ON COLUMN alerts_log.aqi_at_alert IS 'AQI value at the time the alert was triggered.';
COMMENT ON COLUMN alerts_log.sent_at IS 'Timestamp when the alert notification was sent.';


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Enable RLS on all tables. Supabase requires RLS for secure access.
-- Policies are intentionally restrictive — users can only access their own data.

-- ─── Profiles RLS ────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on sign-up)
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── AQI History RLS ─────────────────────────────────────────────────────────
ALTER TABLE aqi_history ENABLE ROW LEVEL SECURITY;

-- AQI history data is public-readable (anyone can view air quality data)
CREATE POLICY "AQI history is publicly readable"
  ON aqi_history FOR SELECT
  USING (true);

-- Only the service role (server-side) can insert AQI data
CREATE POLICY "Service role can insert AQI data"
  ON aqi_history FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ─── Alerts Log RLS ─────────────────────────────────────────────────────────
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view own alerts"
  ON alerts_log FOR SELECT
  USING (auth.uid() = user_id);

-- Only the service role (server-side) can create alert logs
CREATE POLICY "Service role can insert alerts"
  ON alerts_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
