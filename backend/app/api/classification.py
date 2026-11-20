
from pathlib import Path

import joblib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/api/classification",
    tags=["Fault Classification"]
)

ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = (
    ROOT / "ml" / "classification" /
    "random_forest_classifier.joblib"
)

model = joblib.load(MODEL_PATH)


class SensorReading(BaseModel):
    temperature_c: float = Field(ge=-100, le=100, allow_inf_nan=False)
    humidity_pct: float = Field(ge=0, le=100, allow_inf_nan=False)
    pressure_hpa: float = Field(gt=0, le=1200, allow_inf_nan=False)
    wind_speed_ms: float = Field(ge=0, le=150, allow_inf_nan=False)


@router.post("/predict")
def classify_fault(reading: SensorReading):
    try:
        input_data = [[
            reading.temperature_c,
            reading.humidity_pct,
            reading.pressure_hpa,
            reading.wind_speed_ms
        ]]

        predicted_type = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        confidence = float(max(probabilities))

        return {
            "predicted_fault_type": str(predicted_type),
            "confidence": round(confidence, 4),
            "message": (
                "No injected fault pattern identified."
                if predicted_type == "normal"
                else "Possible sensor fault pattern detected. Further inspection is recommended."
            )
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Fault classification failed. Please try again."
        )
