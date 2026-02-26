/**
 * OpenWeatherMap API Client
 *
 * Axios-based client for the OpenWeatherMap API.
 * Used to fetch current weather conditions (temperature, humidity, wind speed,
 * visibility) for Indian cities. Weather data is displayed alongside AQI
 * readings to give users a complete environmental picture.
 *
 * API Documentation: https://openweathermap.org/api
 */

import axios from "axios";

const OWM_BASE_URL = "https://api.openweathermap.org/data/2.5";

export const openWeatherClient = axios.create({
  baseURL: OWM_BASE_URL,
  timeout: 10000,
  params: {
    appid: process.env.OPENWEATHER_API_KEY,
    units: "metric", // Use Celsius for Indian context
  },
});

// Response interceptor for error handling
openWeatherClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[OpenWeatherMap API Error]:", error.message);
    throw error;
  }
);
