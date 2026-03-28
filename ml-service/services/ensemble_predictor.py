"""
ensemble_predictor.py
----------------------
Hybrid AQI prediction engine combining:

1. SARIMA-style diurnal baseline — models the characteristic daily AQI
   cycle (low at pre-dawn, peaks at morning/evening rush hours). Seeded
   from the latest real WAQI reading to ensure forecasts are anchored to
   ground truth rather than drifting.

2. LightGBM weather-feature correction layer — uses current OpenWeatherMap
   data (temperature, humidity, wind speed, pressure) and hour-of-day
   features to apply a physically-motivated correction to the baseline.
   In this implementation the "model" is an expert-knowledge feature
   function that mirrors what a trained LightGBM would learn from data.
   Once enough Firestore aqi_history data accumulates (≥2 weeks), this
   can be replaced with a trained LightGBM .pkl artifact.

3. Ensemble combiner — weighted average (0.6 SARIMA, 0.4 LightGBM) with
   confidence scores derived from the agreement between the two models.

Output contract (per hour slot):
    {
        "hour": int,            # 0–47
        "timestamp": str,       # ISO-8601
        "aqi": int,             # 0–500
        "category": str,        # NAQI category label
        "color": str,           # hex color for the category
        "confidence": float,    # 0.0–1.0
        "dominant_pollutant": str
    }
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import List, Dict, Any

# ─── NAQI Category Mapping ────────────────────────────────────────────────────

_IST = ZoneInfo("Asia/Kolkata")

NAQI_CATEGORIES = [
    (0,   50,  "Good",       "#00C853"),
    (51,  100, "Satisfactory","#64DD17"),
    (101, 200, "Moderate",   "#FF9800"),
    (201, 300, "Poor",       "#F44336"),
    (301, 400, "Very Poor",  "#9C27B0"),
    (401, 500, "Severe",     "#4E342E"),
]

DOMINANT_POLLUTANTS_BY_HOUR = [
    "PM2.5", "PM2.5", "PM2.5", "PM2.5", "PM2.5", "PM2.5",  # 0‑5 AM
    "PM10",  "PM10",  "PM2.5", "PM2.5", "PM2.5", "PM2.5",  # 6‑11 AM
    "O3",    "O3",    "O3",    "O3",    "PM2.5", "NO2",     # 12‑17
    "NO2",   "PM2.5", "PM2.5", "PM2.5", "PM2.5", "PM2.5",  # 18‑23
]


def _naqi_category(aqi: int) -> tuple[str, str]:
    for lo, hi, label, color in NAQI_CATEGORIES:
        if lo <= aqi <= hi:
            return label, color
    return "Severe", "#4E342E"


# ─── 1. SARIMA Diurnal Baseline ───────────────────────────────────────────────

# Normalised daily AQI pattern (sum ≈ 24, values represent multipliers around 1.0).
# Pattern: worst in morning rush (7–10 AM) and evening (6–9 PM), best at dawn.
_DIURNAL_PATTERN = [
    0.82, 0.79, 0.77, 0.75, 0.76, 0.80,   # 0 – 5  (pre-dawn low)
    0.90, 1.05, 1.15, 1.12, 1.08, 1.02,   # 6 – 11 (morning rush)
    0.98, 0.96, 0.97, 0.99, 1.03, 1.08,   # 12 – 17
    1.12, 1.15, 1.10, 1.05, 0.96, 0.88,   # 18 – 23 (evening rush → cool)
]


def _sarima_baseline(current_aqi: float, start_hour: int, hours: int) -> List[float]:
    """
    Generate a SARIMA-style diurnal AQI baseline anchored to current_aqi.

    The baseline shifts gradually toward the climatological mean (150) over
    48 h to prevent unrealistic drift, mimicking SARIMA mean-reversion.
    """
    CLIM_MEAN = 150.0
    REVERSION_RATE = 0.04  # per hour — converges toward mean slowly

    values: List[float] = []
    for h in range(hours):
        abs_hour = (start_hour + h) % 24
        pattern_mult = _DIURNAL_PATTERN[abs_hour]

        # Exponential smoothing toward climatological mean
        weight = math.exp(-REVERSION_RATE * h)
        anchored = current_aqi * weight + CLIM_MEAN * (1 - weight)

        values.append(anchored * pattern_mult)

    return values


# ─── 2. LightGBM Weather-Feature Correction ───────────────────────────────────

def _lgbm_correction(
    weather: Dict[str, Any],
    baseline_values: List[float],
    start_hour: int,
) -> List[float]:
    """
    Apply a feature-based correction to the SARIMA baseline using weather data.

    Physics-informed feature functions:
      - High humidity →  PM2.5 accumulates (positive correction)
      - High wind speed → dispersion (negative correction)
      - High temperature midday → O3 formation (positive in afternoon)
      - Low pressure → poor ventilation (positive correction)
    """
    temp    = weather.get("temperature", 25.0)      # °C
    humidity= weather.get("humidity", 60.0)          # %
    wind    = weather.get("wind_speed", 3.0)         # m/s
    pressure= weather.get("pressure", 1013.0)        # hPa

    corrected: List[float] = []
    for h, base in enumerate(baseline_values):
        abs_hour = (start_hour + h) % 24

        # Humidity penalty (stagnant, damp air traps particles)
        hum_factor = 1.0 + 0.002 * max(0, humidity - 50)

        # Wind benefit (dispersion)
        wind_factor = 1.0 - 0.025 * min(wind, 10.0)

        # Temperature: high afternoon temp → more ozone
        ozone_hour = 12 <= abs_hour <= 16
        temp_factor = 1.0 + (0.003 * max(0, temp - 30) if ozone_hour else 0)

        # Pressure: low pressure → worse mixing
        pressure_factor = 1.0 + 0.0015 * max(0, 1013 - pressure)

        correction = base * hum_factor * wind_factor * temp_factor * pressure_factor
        corrected.append(correction)

    return corrected


# ─── 3. Ensemble Combiner ─────────────────────────────────────────────────────

SARIMA_WEIGHT  = 0.60
LGBM_WEIGHT    = 0.40


def _confidence(sarima_val: float, lgbm_val: float) -> float:
    """
    Confidence = 1 − normalised disagreement between models.
    Models that agree closely yield confidence close to 1.0.
    """
    mean = (sarima_val + lgbm_val) / 2.0
    if mean == 0:
        return 0.5
    disagreement = abs(sarima_val - lgbm_val) / mean
    return round(max(0.50, min(1.0, 1.0 - disagreement)), 2)


# ─── Public entry point ───────────────────────────────────────────────────────

def generate_forecast(
    current_aqi: float,
    weather: Dict[str, Any],
    hours: int = 48,
) -> List[Dict[str, Any]]:
    """
    Generate an hourly AQI forecast using the SARIMA+LightGBM ensemble.

    Args:
        current_aqi:  Latest observed AQI value (anchor for mean-reversion).
        weather:      Dict with keys: temperature, humidity, wind_speed, pressure.
        hours:        Number of hours to forecast (max 48).

    Returns:
        List of hourly forecast dicts (see module docstring for schema).
    """
    now_ist = datetime.now(_IST)
    start_hour = now_ist.hour

    # 1. SARIMA baseline
    sarima_vals = _sarima_baseline(current_aqi, start_hour, hours)

    # 2. LightGBM corrections
    lgbm_vals = _lgbm_correction(weather, sarima_vals, start_hour)

    # 3. Ensemble
    result: List[Dict[str, Any]] = []
    for h in range(hours):
        raw = SARIMA_WEIGHT * sarima_vals[h] + LGBM_WEIGHT * lgbm_vals[h]
        aqi_val = int(round(max(0, min(500, raw))))

        abs_hour = (start_hour + h) % 24
        ts = now_ist + timedelta(hours=h)
        category, color = _naqi_category(aqi_val)
        conf = _confidence(sarima_vals[h], lgbm_vals[h])

        result.append({
            "hour": h,
            "timestamp": ts.isoformat(),
            "aqi": aqi_val,
            "category": category,
            "color": color,
            "confidence": conf,
            "dominant_pollutant": DOMINANT_POLLUTANTS_BY_HOUR[abs_hour],
        })

    return result
