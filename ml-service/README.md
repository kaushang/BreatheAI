# BreatheAI — ML Service

Python FastAPI microservice for AQI forecasting.

## Prerequisites

- Python 3.11+
- pip

## Quick Start

### 1. Create a virtual environment

```bash
cd ml-service
python -m venv venv
```

### 2. Activate the virtual environment

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy the `.env` file and fill in your API key:

```
WAQI_API_KEY=<your-waqi-api-token>
PORT=8000
```

Get a free WAQI API token at: https://aqicn.org/data-platform/token/

### 5. Run the server

```bash
uvicorn main:app --reload
```

The service will start at **http://localhost:8000**.

## Endpoints

| Method | Path                                                | Description                                               |
| ------ | --------------------------------------------------- | --------------------------------------------------------- |
| `GET`  | `/`                                                 | Health check — returns `{"status": "ML service running"}` |
| `GET`  | `/forecast?city=Delhi&lat=28.61&lng=77.20&hours=48` | Returns hourly AQI forecast (mock data for now)           |

## Project Structure

```
ml-service/
├── main.py                  # FastAPI app entry point
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── README.md
├── data/                    # Raw / processed data (gitignored)
├── models/                  # Trained model files (gitignored)
├── routers/
│   └── forecast.py          # Forecast API routes
├── services/
│   ├── data_fetcher.py      # WAQI API integration
│   ├── preprocessor.py      # Data cleaning & feature engineering
│   ├── trainer.py           # Model training (Prophet + sklearn)
│   └── predictor.py         # Load models & generate forecasts
└── utils/
    └── helpers.py           # Shared utilities (AQI categories, etc.)
```
