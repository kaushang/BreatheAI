"""
weather_fetcher.py
------------------
Fetches current weather data from the OpenWeatherMap API.
Used as features for the LightGBM correction layer.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

OWM_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OWM_BASE    = "https://api.openweathermap.org/data/2.5/weather"

_cache: dict = {}   # simple in-memory cache keyed by (lat, lng)
_CACHE_TTL  = 3600  # 1 hour

import time


def fetch_weather(lat: float, lng: float) -> dict:
    """
    Return current weather for the given coordinates.

    Returns dict with keys:
        temperature  (°C)
        humidity     (%)
        wind_speed   (m/s)
        pressure     (hPa)
    Falls back to neutral defaults if the API is unavailable.
    """
    if not OWM_API_KEY:
        return _defaults()

    cache_key = (round(lat, 2), round(lng, 2))
    cached = _cache.get(cache_key)
    if cached and (time.time() - cached["ts"]) < _CACHE_TTL:
        return cached["data"]

    try:
        resp = requests.get(
            OWM_BASE,
            params={"lat": lat, "lon": lng, "appid": OWM_API_KEY, "units": "metric"},
            timeout=8,
        )
        resp.raise_for_status()
        j = resp.json()

        data = {
            "temperature": j["main"].get("temp", 25.0),
            "humidity":    j["main"].get("humidity", 60.0),
            "wind_speed":  j["wind"].get("speed", 3.0),
            "pressure":    j["main"].get("pressure", 1013.0),
        }
        _cache[cache_key] = {"data": data, "ts": time.time()}
        return data

    except Exception as exc:
        print(f"[WeatherFetcher] Warning — OWM request failed: {exc}. Using defaults.")
        return _defaults()


def _defaults() -> dict:
    return {"temperature": 25.0, "humidity": 60.0, "wind_speed": 3.0, "pressure": 1013.0}
