"""
trainer.py
----------
Model training logic for AQI forecasting.
Will support both scikit-learn and Prophet models.
"""

import os
import pickle
from datetime import datetime

import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def train_prophet_model(df: pd.DataFrame, city: str) -> str:
    """
    Train a Prophet model on historical AQI data for a specific city.

    Args:
        df:   DataFrame with columns ['ds', 'y'] where ds is the datetime
              and y is the AQI value.
        city: City identifier used for saving the model.

    Returns:
        Path to the saved model file.
    """
    from prophet import Prophet  # lazy import — heavy dependency

    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=False,
        changepoint_prior_scale=0.05,
    )

    model.fit(df)

    # Save the model
    os.makedirs(MODELS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_path = os.path.join(MODELS_DIR, f"prophet_{city}_{timestamp}.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    return model_path


def train_sklearn_model(df: pd.DataFrame, city: str) -> str:
    """
    Train a scikit-learn model (e.g. RandomForest) on engineered features.

    Args:
        df:   DataFrame with feature columns and a 'aqi' target column.
        city: City identifier used for saving the model.

    Returns:
        Path to the saved model file.
    """
    from sklearn.ensemble import RandomForestRegressor

    feature_cols = [c for c in df.columns if c not in ("aqi", "time", "ds", "y")]
    X = df[feature_cols]
    y = df["aqi"]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Save the model
    os.makedirs(MODELS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_path = os.path.join(MODELS_DIR, f"rf_{city}_{timestamp}.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    return model_path
