/**
 * Services Directory
 *
 * Contains API call logic and service functions, organized by domain:
 * - aqi-service.ts: WAQI API integration for real-time AQI data from Indian CPCB stations
 * - weather-service.ts: OpenWeatherMap API integration for weather data
 * - forecast-service.ts: ML microservice integration for AQI predictions
 * - user-service.ts: Supabase user profile CRUD operations
 * - alert-service.ts: Alert management and email notification triggers via Resend
 * - health-advice-service.ts: Health advisory generation based on AQI + user health conditions
 *
 * Each service encapsulates its own error handling, data transformation,
 * and response typing using the interfaces defined in types/.
 */

export {};
