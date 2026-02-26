/**
 * WAQI API Client
 *
 * Axios-based client for the World Air Quality Index (WAQI) API.
 * Used to fetch real-time AQI data from Indian CPCB (Central Pollution
 * Control Board) monitoring stations. Supports fetching by city name,
 * station ID, and geographic coordinates.
 *
 * API Documentation: https://aqicn.org/json-api/doc/
 */

import axios from "axios";

const WAQI_BASE_URL = "https://api.waqi.info";

export const waqiClient = axios.create({
  baseURL: WAQI_BASE_URL,
  timeout: 10000,
  params: {
    token: process.env.WAQI_API_KEY,
  },
});

// Request interceptor for logging and error handling
waqiClient.interceptors.response.use(
  (response) => {
    if (response.data?.status === "error") {
      throw new Error(response.data.data || "WAQI API returned an error");
    }
    return response;
  },
  (error) => {
    console.error("[WAQI API Error]:", error.message);
    throw error;
  }
);
