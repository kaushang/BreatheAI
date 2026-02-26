/**
 * Custom React Hooks Directory
 *
 * Contains reusable custom hooks for the BreatheAI application:
 * - useAQI: Fetches and manages current AQI data for a city/station
 * - useForecast: Fetches AQI forecast predictions
 * - useWeather: Fetches current weather data from OpenWeatherMap
 * - useUserProfile: Manages user profile state from Supabase
 * - useAlerts: Manages AQI alert subscriptions and history
 * - useDebounce: Debounces input values (e.g., city search)
 * - useLocalStorage: Persists state to localStorage
 * - useMediaQuery: Responsive breakpoint detection
 */

export { useAQI } from "./useAQI";
