"""
forecast.py (router)
---------------------
GET /forecast
    city  (str)   — city name
    lat   (float) — latitude
    lng   (float) — longitude
    hours (int)   — 1–48, default 48

Returns a full ensemble AQI forecast using the SARIMA + LightGBM pipeline.
"""

import time
from functools import lru_cache
from fastapi import APIRouter, Query
from services.data_fetcher import fetch_aqi_history
from services.weather_fetcher import fetch_weather
from services.ensemble_predictor import generate_forecast

router = APIRouter()

# Simple TTL cache: (rounded_lat, rounded_lng) → (timestamp, result)
_forecast_cache: dict = {}
_FORECAST_TTL = 300  # 5 minutes


@router.get("/", response_model=dict)
async def get_forecast(
    city: str  = Query(..., description="City name, e.g. Delhi"),
    lat:  float = Query(..., description="Latitude"),
    lng:  float = Query(..., description="Longitude"),
    hours: int  = Query(48, ge=1, le=48, description="Hours to forecast (max 48)"),
):
    """
    Return an hourly AQI ensemble forecast for the given location.

    The response is cached for 5 minutes per (lat, lng) pair to
    reduce upstream API load.
    """
    cache_key = (round(lat, 2), round(lng, 2), hours)
    cached = _forecast_cache.get(cache_key)
    if cached and (time.time() - cached["ts"]) < _FORECAST_TTL:
        result = cached["data"]
        result["cached"] = True
        return result

    # 1. Fetch current AQI (anchor value for SARIMA mean-reversion)
    aqi_data = fetch_aqi_history(city, lat, lng)
    current_aqi = float(aqi_data.get("aqi") or 150)

    # 2. Fetch current weather (features for LightGBM correction)
    weather = fetch_weather(lat, lng)

    # 3. Run ensemble
    forecast_slots = generate_forecast(current_aqi, weather, hours)

    result = {
        "city":        city,
        "lat":         lat,
        "lng":         lng,
        "hours":       hours,
        "current_aqi": int(current_aqi),
        "weather":     weather,
        "forecast":    forecast_slots,
        "model":       "ensemble-v1 (SARIMA-diurnal + LightGBM-weather)",
        "cached":      False,
    }

    _forecast_cache[cache_key] = {"data": result, "ts": time.time()}
    return result
