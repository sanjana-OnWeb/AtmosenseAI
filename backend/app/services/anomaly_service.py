
import joblib
import pandas as pd

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    ROOT / "ml" / "anomaly_detection"
    / "isolation_forest_model.joblib"
)

FEATURES = [
    "temperature_c",
    "humidity_pct",
    "pressure_hpa",
    "wind_speed_ms"
]


def predict_anomaly(readings: dict):
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Trained anomaly model not found.")

    model = joblib.load(MODEL_PATH)

    input_data = pd.DataFrame(
        [[readings[feature] for feature in FEATURES]],
        columns=FEATURES
    )

    prediction = model.predict(input_data)[0]
    decision_score = model.decision_function(input_data)[0]

    is_anomaly = prediction == -1

    return {
        "status": "possible_sensor_anomaly" if is_anomaly else "normal",
        "is_anomaly": bool(is_anomaly),
        "anomaly_score": round(float(-decision_score), 4),
        "message": (
            "This reading has unusual sensor patterns. "
            "Further inspection is recommended."
            if is_anomaly
            else "No unusual pattern detected."
        )
    }
