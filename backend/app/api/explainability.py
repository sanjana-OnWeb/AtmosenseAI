
from pathlib import Path
import pandas as pd
import shap
import joblib

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/explainability",
    tags=["Explainable AI"]
)

ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = ROOT / "ml/classification/random_forest_classifier.joblib"
DATA_PATH = ROOT / "ml/datasets/atmospheric_sensor_data.csv"

model = joblib.load(MODEL_PATH)

features = [
    "temperature_c",
    "humidity_pct",
    "pressure_hpa",
    "wind_speed_ms"
]

background = pd.read_csv(DATA_PATH)[features].sample(
    n=100, random_state=42
)

explainer = shap.TreeExplainer(model)


class SensorReading(BaseModel):
    temperature_c: float
    humidity_pct: float
    pressure_hpa: float
    wind_speed_ms: float


@router.post("/explain")
def explain_prediction(reading: SensorReading):
    data = pd.DataFrame([{
        "temperature_c": reading.temperature_c,
        "humidity_pct": reading.humidity_pct,
        "pressure_hpa": reading.pressure_hpa,
        "wind_speed_ms": reading.wind_speed_ms
    }])

    prediction = model.predict(data)[0]
    probabilities = model.predict_proba(data)[0]

    values = explainer.shap_values(data)

    if isinstance(values, list):
        class_index = list(model.classes_).index(prediction)
        contributions = values[class_index][0]
    elif values.ndim == 3:
        class_index = list(model.classes_).index(prediction)
        contributions = values[0, :, class_index]
    else:
        contributions = values[0]

    explanation = {
        feature: round(float(value), 5)
        for feature, value in zip(features, contributions)
    }

    return {
        "predicted_fault_type": str(prediction),
        "confidence": round(float(max(probabilities)), 4),
        "feature_contributions": explanation,
        "most_influential_feature": max(
            explanation, key=lambda key: abs(explanation[key])
        )
    }
