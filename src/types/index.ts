/**
 * TypeScript Interfaces & Types
 *
 * Central type definitions for the BreatheAI application.
 * All interfaces are defined here and imported throughout the codebase
 * to ensure type safety and consistency.
 *
 * Organized by domain:
 * - User & Auth types
 * - AQI data types
 * - Forecast types
 * - Health advisory types
 * - NAQI system types
 * - City data types
 * - Weather types
 * - Alert types
 */

// ─── Geographic Coordinates ──────────────────────────────────────────────────

/** Latitude and longitude pair for geographic positioning. */
export interface Coordinates {
  lat: number;
  lng: number;
}

// ─── Indian City ─────────────────────────────────────────────────────────────

/** Represents an Indian city with its geographic data. Used in city selectors and API queries. */
export interface IndianCity {
  /** City name (e.g., "Delhi", "Mumbai") */
  name: string;
  /** Indian state or union territory */
  state: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
}

// ─── User & Auth ─────────────────────────────────────────────────────────────

/** User profile stored in Supabase. Contains personal info, location, and health preferences. */
export interface UserProfile {
  /** Unique user ID from Supabase Auth (UUID) */
  id: string;
  /** User's email address */
  email: string;
  /** User's full name */
  full_name: string;
  /** Primary city for AQI monitoring */
  city: string;
  /** Specific area/locality within the city (e.g., "Andheri", "Connaught Place") */
  area: string;
  /** Geographic coordinates of the user's location */
  coordinates: Coordinates;
  /** Array of health conditions relevant to air quality sensitivity (e.g., ["asthma", "copd", "heart_disease"]) */
  health_conditions: string[];
  /** AQI threshold value that triggers an alert notification (e.g., 200) */
  aqi_alert_threshold: number;
  /** Timestamp of profile creation */
  created_at?: string;
  /** Timestamp of last profile update */
  updated_at?: string;
}

// ─── AQI Data ────────────────────────────────────────────────────────────────

/** Individual pollutant reading with concentration and sub-index values. */
export interface PollutantReading {
  /** Pollutant name (e.g., "PM2.5", "PM10", "NO2", "SO2", "CO", "O3", "NH3") */
  name: string;
  /** Measured concentration value */
  concentration: number;
  /** Unit of measurement (e.g., "µg/m³", "mg/m³") */
  unit: string;
  /** Calculated AQI sub-index for this pollutant (Indian NAQI formula) */
  sub_index: number;
}

/** Complete AQI reading from a monitoring station. Core data structure for the app. */
export interface AQIReading {
  /** Name of the CPCB monitoring station (e.g., "ITO, Delhi - CPCB") */
  station_name: string;
  /** City where the station is located */
  city: string;
  /** Specific area/locality of the station */
  area: string;
  /** Overall AQI value (maximum of all pollutant sub-indices, per Indian NAQI methodology) */
  aqi: number;
  /** The pollutant with the highest sub-index value, determining the overall AQI */
  dominant_pollutant: string;
  /** Individual pollutant readings with concentrations and sub-indices */
  pollutants: PollutantReading[];
  /** ISO 8601 timestamp of the reading */
  timestamp: string;
  /** Source of the data (e.g., "CPCB", "SPCB", "WAQI") */
  source?: string;
}

// ─── AQI Forecast ────────────────────────────────────────────────────────────

/** Single hourly prediction point in the forecast. */
export interface HourlyPrediction {
  /** ISO 8601 timestamp for the predicted hour */
  timestamp: string;
  /** Predicted AQI value */
  predicted_aqi: number;
  /** Predicted NAQI category (e.g., "Good", "Moderate", "Severe") */
  predicted_category: string;
  /** Predicted dominant pollutant */
  predicted_dominant_pollutant: string;
  /** Confidence score of the prediction (0-100%) */
  confidence: number;
}

/** 48-hour AQI forecast for a specific city/area. Data sourced from the ML microservice. */
export interface AQIForecast {
  /** City for which the forecast is generated */
  city: string;
  /** Specific area/locality within the city */
  area: string;
  /** Array of hourly AQI predictions for the next 48 hours */
  hourly_predictions: HourlyPrediction[];
  /** ISO 8601 timestamp when the forecast was generated */
  generated_at: string;
  /** Model version used for the prediction */
  model_version?: string;
}

// ─── Health Advisory ─────────────────────────────────────────────────────────

/** Personalized health advice based on current AQI and user's health profile. */
export interface HealthAdvice {
  /** Current AQI category (e.g., "Good", "Moderate", "Severe") */
  aqi_category: string;
  /** General health advisory message for the public */
  message: string;
  /** Personalized message based on user's health conditions */
  personalized_message: string;
  /** List of activities that are safe given the current air quality */
  safe_activities: string[];
  /** List of activities to avoid given the current air quality */
  unsafe_activities: string[];
  /** Specific precautions to take (e.g., "Wear N95 mask", "Use air purifier") */
  precautions?: string[];
}

// ─── NAQI System Types ───────────────────────────────────────────────────────

/** Defines an AQI category with its range, color, and health guidance. */
export interface NAQICategory {
  /** Category name (e.g., "Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe") */
  category: string;
  /** AQI value range for this category */
  range: {
    min: number;
    max: number;
  };
  /** Official CPCB color hex code for this category */
  colorHex: string;
  /** Human-readable color name */
  colorName: string;
  /** Health impact description for this AQI category */
  healthMessage: string;
  /** General guidance/recommendation for the public */
  generalGuidance: string;
}

/** A single breakpoint range mapping AQI values to pollutant concentrations. */
export interface BreakpointRange {
  aqiLow: number;
  aqiHigh: number;
  concentrationLow: number;
  concentrationHigh: number;
}

/** Complete breakpoint definition for a single pollutant. */
export interface NAQIPollutantBreakpoint {
  /** Pollutant name (e.g., "PM2.5") */
  pollutant: string;
  /** Unit of concentration measurement */
  unit: string;
  /** Time period over which concentration is averaged */
  averagingPeriod: string;
  /** Array of 6 breakpoint ranges (one per AQI category) */
  breakpoints: BreakpointRange[];
}

// ─── Weather Data ────────────────────────────────────────────────────────────

/** Current weather conditions from OpenWeatherMap. Displayed alongside AQI data. */
export interface WeatherData {
  /** City name */
  city: string;
  /** Temperature in Celsius */
  temperature: number;
  /** Feels-like temperature in Celsius */
  feels_like: number;
  /** Relative humidity percentage */
  humidity: number;
  /** Wind speed in m/s */
  wind_speed: number;
  /** Wind direction in degrees */
  wind_direction: number;
  /** Visibility in meters */
  visibility: number;
  /** Weather condition description (e.g., "Clear sky", "Haze") */
  description: string;
  /** Weather icon code from OpenWeatherMap */
  icon: string;
  /** ISO 8601 timestamp */
  timestamp: string;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

/** AQI alert configuration and history record. */
export interface AQIAlert {
  /** Unique alert ID (UUID) */
  id: string;
  /** User ID who this alert belongs to */
  user_id: string;
  /** City being monitored */
  city: string;
  /** Area being monitored */
  area: string;
  /** AQI threshold that triggered the alert */
  threshold: number;
  /** Current AQI value when the alert was triggered */
  current_aqi: number;
  /** NAQI category at the time of alert */
  category: string;
  /** Whether the alert notification has been sent */
  is_sent: boolean;
  /** Notification channel ("email" | "in_app" | "both") */
  notification_type: "email" | "in_app" | "both";
  /** ISO 8601 timestamp when the alert was created */
  created_at: string;
  /** ISO 8601 timestamp when the alert was acknowledged/dismissed */
  acknowledged_at?: string;
}
