"""
helpers.py
----------
Shared utility functions for the ML service.
"""

from datetime import datetime, timezone


def get_aqi_category(aqi: int) -> dict:
    """
    Map a numeric AQI value to its category and health advisory.

    Based on the Indian National AQI breakpoints.

    Args:
        aqi: Air Quality Index value (0–500).

    Returns:
        Dictionary with 'category', 'color', and 'health_advisory' keys.
    """
    if aqi <= 50:
        return {
            "category": "Good",
            "color": "#00B050",
            "health_advisory": "Minimal impact on health.",
        }
    elif aqi <= 100:
        return {
            "category": "Satisfactory",
            "color": "#92D050",
            "health_advisory": "Minor breathing discomfort to sensitive people.",
        }
    elif aqi <= 200:
        return {
            "category": "Moderate",
            "color": "#FFFF00",
            "health_advisory": "Breathing discomfort to people with lung/heart disease.",
        }
    elif aqi <= 300:
        return {
            "category": "Poor",
            "color": "#FF9900",
            "health_advisory": "Breathing discomfort on prolonged exposure.",
        }
    elif aqi <= 400:
        return {
            "category": "Very Poor",
            "color": "#FF0000",
            "health_advisory": "Respiratory illness on prolonged exposure.",
        }
    else:
        return {
            "category": "Severe",
            "color": "#990000",
            "health_advisory": "Affects healthy people and seriously impacts those with existing diseases.",
        }


def utc_now_iso() -> str:
    """Return the current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


def clamp(value: float, min_val: float = 0, max_val: float = 500) -> float:
    """Clamp a numeric value between min_val and max_val."""
    return max(min_val, min(max_val, value))
