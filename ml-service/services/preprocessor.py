"""
preprocessor.py
---------------
Data cleaning and feature engineering utilities for AQI data.
Will be implemented once the data pipeline is in place.
"""

import pandas as pd
import numpy as np


def clean_aqi_data(raw_data: list[dict]) -> pd.DataFrame:
    """
    Clean and validate raw AQI data points.

    Args:
        raw_data: List of dictionaries with AQI readings.

    Returns:
        A cleaned pandas DataFrame ready for feature engineering.
    """
    df = pd.DataFrame(raw_data)

    # Drop rows with missing AQI values
    df = df.dropna(subset=["aqi"])

    # Ensure AQI is numeric and within a valid range (0–500)
    df["aqi"] = pd.to_numeric(df["aqi"], errors="coerce")
    df = df[(df["aqi"] >= 0) & (df["aqi"] <= 500)]

    df = df.reset_index(drop=True)
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add time-based and rolling-window features to the DataFrame.

    Args:
        df: Cleaned AQI DataFrame with a datetime column named 'time'.

    Returns:
        DataFrame with additional feature columns.
    """
    if "time" in df.columns:
        df["time"] = pd.to_datetime(df["time"], errors="coerce")
        df["hour"] = df["time"].dt.hour
        df["day_of_week"] = df["time"].dt.dayofweek
        df["month"] = df["time"].dt.month

    # Rolling statistics (if enough data)
    if len(df) >= 6:
        df["aqi_rolling_mean_6h"] = df["aqi"].rolling(window=6, min_periods=1).mean()
        df["aqi_rolling_std_6h"] = df["aqi"].rolling(window=6, min_periods=1).std()

    return df
