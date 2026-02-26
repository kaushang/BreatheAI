import os
import requests
from dotenv import load_dotenv

load_dotenv()

WAQI_API_KEY = os.getenv("WAQI_API_KEY", "YOUR_TOKEN")


def fetch_aqi_history(city: str, lat: float, lng: float) -> dict:
    """
    Fetch current AQI and pollutant data from the WAQI API for a given
    geo-location.

    Args:
        city: City name (used for logging / context).
        lat:  Latitude of the location.
        lng:  Longitude of the location.

    Returns:
        A dictionary containing:
            - aqi (int): Overall Air Quality Index value.
            - dominant_pollutant (str): The dominant pollutant (e.g. "pm25").
            - pollutants (dict): Individual pollutant readings.
            - city_name (str): Station / city name returned by the API.
            - time (str): Timestamp of the reading.
        On failure an dict with an "error" key is returned.
    """

    url = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={WAQI_API_KEY}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        if data.get("status") != "ok":
            return {
                "error": f"WAQI API returned status: {data.get('status')}",
                "message": data.get("data", "Unknown error"),
            }

        feed = data["data"]

        # Extract individual pollutant values from iaqi
        iaqi = feed.get("iaqi", {})
        pollutants = {
            key: value.get("v") for key, value in iaqi.items()
        }

        return {
            "aqi": feed.get("aqi"),
            "dominant_pollutant": feed.get("dominentpol"),  # WAQI typo is intentional
            "pollutants": pollutants,
            "city_name": feed.get("city", {}).get("name", city),
            "time": feed.get("time", {}).get("iso", ""),
        }

    except requests.exceptions.Timeout:
        return {"error": "Request to WAQI API timed out"}
    except requests.exceptions.ConnectionError:
        return {"error": "Failed to connect to WAQI API"}
    except requests.exceptions.HTTPError as exc:
        return {"error": f"HTTP error from WAQI API: {exc}"}
    except Exception as exc:
        return {"error": f"Unexpected error fetching AQI data: {exc}"}
