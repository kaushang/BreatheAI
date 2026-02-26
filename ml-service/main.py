from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import forecast

# Load environment variables
load_dotenv()

app = FastAPI(
    title="BreatheAI ML Service",
    description="AQI forecasting microservice for BreatheAI",
    version="1.0.0",
)

# CORS — allow the Next.js frontend on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ML service running"}
