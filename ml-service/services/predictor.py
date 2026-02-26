"""
predictor.py
------------
Load trained models and generate AQI forecasts.
"""

import os
import pickle
import glob

import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def load_latest_model(city: str, model_type: str = "prophet") -> object | None:
    """
    Load the most recently saved model for a given city.

    Args:
        city:       City identifier.
        model_type: One of 'prophet' or 'rf' (random forest).

    Returns:
        The deserialized model object, or None if no model is found.
    """
    pattern = os.path.join(MODELS_DIR, f"{model_type}_{city}_*.pkl")
    files = sorted(glob.glob(pattern))

    if not files:
        return None

    latest_file = files[-1]
    with open(latest_file, "rb") as f:
        return pickle.load(f)


def predict_aqi(city: str, hours: int = 48) -> list[float]:
    """
    Generate hourly AQI predictions using the latest trained model.

    Args:
        city:  City identifier.
        hours: Number of hours to forecast.

    Returns:
        List of predicted AQI values (one per hour).
        Returns an empty list if no model is available.
    """
    model = load_latest_model(city, model_type="prophet")

    if model is None:
        return []

    # Prophet expects a DataFrame with a 'ds' column
    future = model.make_future_dataframe(periods=hours, freq="h")
    forecast = model.predict(future)

    # Return only the forecasted portion
    predicted = forecast["yhat"].tail(hours).tolist()

    # Clamp values to a valid AQI range [0, 500]
    predicted = [max(0, min(500, round(v))) for v in predicted]

    return predicted
