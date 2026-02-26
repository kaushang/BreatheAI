/**
 * Indian Cities Database
 *
 * A comprehensive list of 50 major Indian cities with their name, state,
 * and approximate geographic coordinates (latitude & longitude).
 * This data is used for:
 * - City selection dropdowns across the app
 * - Fetching AQI data from the nearest CPCB monitoring station
 * - Fetching weather data from OpenWeatherMap
 * - Map-based visualizations
 *
 * Includes all major metros, state capitals, and key tier-2 cities
 * that have CPCB air quality monitoring stations.
 */

import { IndianCity } from "@/types";

export const INDIAN_CITIES: IndianCity[] = [
  // ─── Metro cities ──────────────────────────────────────────────
  {
    name: "Delhi",
    state: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    name: "Kolkata",
    state: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    name: "Ahmedabad",
    state: "Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    name: "Pune",
    state: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
  },

  // ─── North India ───────────────────────────────────────────────
  {
    name: "Jaipur",
    state: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
  },
  {
    name: "Lucknow",
    state: "Uttar Pradesh",
    latitude: 26.8467,
    longitude: 80.9462,
  },
  {
    name: "Kanpur",
    state: "Uttar Pradesh",
    latitude: 26.4499,
    longitude: 80.3319,
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    latitude: 25.3176,
    longitude: 82.9739,
  },
  {
    name: "Agra",
    state: "Uttar Pradesh",
    latitude: 27.1767,
    longitude: 78.0081,
  },
  {
    name: "Chandigarh",
    state: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
  },
  {
    name: "Amritsar",
    state: "Punjab",
    latitude: 31.634,
    longitude: 74.8723,
  },
  {
    name: "Ludhiana",
    state: "Punjab",
    latitude: 30.901,
    longitude: 75.8573,
  },
  {
    name: "Dehradun",
    state: "Uttarakhand",
    latitude: 30.3165,
    longitude: 78.0322,
  },
  {
    name: "Noida",
    state: "Uttar Pradesh",
    latitude: 28.5355,
    longitude: 77.391,
  },
  {
    name: "Gurgaon",
    state: "Haryana",
    latitude: 28.4595,
    longitude: 77.0266,
  },
  {
    name: "Faridabad",
    state: "Haryana",
    latitude: 28.4089,
    longitude: 77.3178,
  },
  {
    name: "Ghaziabad",
    state: "Uttar Pradesh",
    latitude: 28.6692,
    longitude: 77.4538,
  },
  {
    name: "Prayagraj",
    state: "Uttar Pradesh",
    latitude: 25.4358,
    longitude: 81.8463,
  },
  {
    name: "Meerut",
    state: "Uttar Pradesh",
    latitude: 28.9845,
    longitude: 77.7064,
  },

  // ─── West India ────────────────────────────────────────────────
  {
    name: "Surat",
    state: "Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
  },
  {
    name: "Vadodara",
    state: "Gujarat",
    latitude: 22.3072,
    longitude: 73.1812,
  },
  {
    name: "Rajkot",
    state: "Gujarat",
    latitude: 22.3039,
    longitude: 70.8022,
  },
  {
    name: "Nagpur",
    state: "Maharashtra",
    latitude: 21.1458,
    longitude: 79.0882,
  },
  {
    name: "Nashik",
    state: "Maharashtra",
    latitude: 19.9975,
    longitude: 73.7898,
  },
  {
    name: "Thane",
    state: "Maharashtra",
    latitude: 19.2183,
    longitude: 72.9781,
  },
  {
    name: "Navi Mumbai",
    state: "Maharashtra",
    latitude: 19.033,
    longitude: 73.0297,
  },

  // ─── South India ───────────────────────────────────────────────
  {
    name: "Kochi",
    state: "Kerala",
    latitude: 9.9312,
    longitude: 76.2673,
  },
  {
    name: "Thiruvananthapuram",
    state: "Kerala",
    latitude: 8.5241,
    longitude: 76.9366,
  },
  {
    name: "Coimbatore",
    state: "Tamil Nadu",
    latitude: 11.0168,
    longitude: 76.9558,
  },
  {
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.6868,
    longitude: 83.2185,
  },
  {
    name: "Vijayawada",
    state: "Andhra Pradesh",
    latitude: 16.5062,
    longitude: 80.648,
  },
  {
    name: "Mysuru",
    state: "Karnataka",
    latitude: 12.2958,
    longitude: 76.6394,
  },
  {
    name: "Mangaluru",
    state: "Karnataka",
    latitude: 12.9141,
    longitude: 74.856,
  },
  {
    name: "Madurai",
    state: "Tamil Nadu",
    latitude: 9.9252,
    longitude: 78.1198,
  },

  // ─── East India ────────────────────────────────────────────────
  {
    name: "Patna",
    state: "Bihar",
    latitude: 25.6093,
    longitude: 85.1376,
  },
  {
    name: "Bhubaneswar",
    state: "Odisha",
    latitude: 20.2961,
    longitude: 85.8245,
  },
  {
    name: "Ranchi",
    state: "Jharkhand",
    latitude: 23.3441,
    longitude: 85.3096,
  },
  {
    name: "Guwahati",
    state: "Assam",
    latitude: 26.1445,
    longitude: 91.7362,
  },
  {
    name: "Raipur",
    state: "Chhattisgarh",
    latitude: 21.2514,
    longitude: 81.6296,
  },

  // ─── Central India ─────────────────────────────────────────────
  {
    name: "Bhopal",
    state: "Madhya Pradesh",
    latitude: 23.2599,
    longitude: 77.4126,
  },
  {
    name: "Indore",
    state: "Madhya Pradesh",
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    name: "Jabalpur",
    state: "Madhya Pradesh",
    latitude: 23.1815,
    longitude: 79.9864,
  },

  // ─── Other major cities ────────────────────────────────────────
  {
    name: "Jodhpur",
    state: "Rajasthan",
    latitude: 26.2389,
    longitude: 73.0243,
  },
  {
    name: "Udaipur",
    state: "Rajasthan",
    latitude: 24.5854,
    longitude: 73.7125,
  },
  {
    name: "Jammu",
    state: "Jammu & Kashmir",
    latitude: 32.7266,
    longitude: 74.857,
  },
  {
    name: "Shimla",
    state: "Himachal Pradesh",
    latitude: 31.1048,
    longitude: 77.1734,
  },
];

/**
 * Get a list of unique states from the cities database.
 * Useful for state-based filtering dropdowns.
 */
export const INDIAN_STATES: string[] = Array.from(
  new Set(INDIAN_CITIES.map((city) => city.state))
).sort();

/**
 * Find a city by name (case-insensitive).
 */
export function findCityByName(name: string): IndianCity | undefined {
  return INDIAN_CITIES.find(
    (city) => city.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all cities in a given state.
 */
export function getCitiesByState(state: string): IndianCity[] {
  return INDIAN_CITIES.filter(
    (city) => city.state.toLowerCase() === state.toLowerCase()
  );
}
