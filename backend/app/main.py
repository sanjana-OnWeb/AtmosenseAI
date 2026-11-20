
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

# API Routers
from app.api.data import router as data_router
from app.api.anomaly import router as anomaly_router
from app.api.classification import router as classification_router
from app.api.explainability import router as explainability_router
from app.api.sensor_health import router as sensor_health_router
from app.api.history import router as history_router
from app.api.alerts import router as alerts_router
from app.models.alert import AlertDB

# Database
from app.core.database import Base, engine

# Database Models
from app.models.sensor_reading import SensorReadingDB


# Initialize FastAPI
app = FastAPI(
    title="Atmosense AI API",
    description="Intelligent Atmospheric Sensor Anomaly Detection System",
    version="1.0.0"
)

# Create database tables
Base.metadata.create_all(bind=engine)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://sanjana-onweb.github.io"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home Endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to Atmosense AI API",
        "status": "running"
    }

# Health Check Endpoint
@app.get("/api/health")
def health_check():
    return {
        "system": "Atmosense AI",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Register API Routers
app.include_router(data_router)
app.include_router(anomaly_router)
app.include_router(classification_router)
app.include_router(explainability_router)
app.include_router(sensor_health_router)
app.include_router(history_router)
app.include_router(alerts_router)

