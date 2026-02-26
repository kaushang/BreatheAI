from fastapi import APIRouter, Query
from typing import List

router = APIRouter()


@router.get("/", response_model=dict)
async def get_forecast(
    city: str = Query(..., description="City name, e.g. Delhi"),
    lat: float = Query(..., description="Latitude of the location"),
    lng: float = Query(..., description="Longitude of the location"),
    hours: int = Query(48, ge=1, le=168, description="Number of hours to forecast"),
):
    """
    Return hourly AQI forecast for a given city/location.
    Currently returns mock (hardcoded) data — will be replaced with
    real ML predictions once the model is trained.
    """

    # Mock AQI values cycling through a realistic pattern
    mock_pattern = [
        152, 148, 145, 140, 137, 132, 128, 125,  # early morning (improving)
        130, 138, 150, 162, 170, 175, 178, 180,  # morning rush → afternoon
        176, 172, 168, 160, 155, 150, 148, 145,  # evening cooldown
        142, 140, 138, 135, 133, 130, 128, 126,  # night (improving)
        130, 135, 142, 155, 165, 172, 178, 182,  # next-day morning rush
        180, 175, 170, 165, 158, 152, 148, 145,  # next-day afternoon/evening
    ]

    # Trim or repeat the pattern to match the requested hours
    forecast_values = (mock_pattern * ((hours // len(mock_pattern)) + 1))[:hours]

    return {
        "city": city,
        "lat": lat,
        "lng": lng,
        "hours": hours,
        "forecast": forecast_values,
    }
