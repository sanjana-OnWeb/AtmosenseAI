
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.anomaly_service import predict_anomaly

router = APIRouter(
    prefix="/api/anomaly",
    tags=["AI Anomaly Detection"]
)


class SensorReading(BaseModel):
    temperature_c: float = Field(ge=-100, le=100, allow_inf_nan=False)
    humidity_pct: float = Field(ge=0, le=100, allow_inf_nan=False)
    pressure_hpa: float = Field(gt=0, le=1200, allow_inf_nan=False)
    wind_speed_ms: float = Field(ge=0, le=150, allow_inf_nan=False)


@router.post("/predict")
def detect_anomaly(reading: SensorReading):
    try:
        return predict_anomaly(reading.model_dump())

    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Trained anomaly detection model not found."
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Anomaly prediction failed. Please try again."
        )
