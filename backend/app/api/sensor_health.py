
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/api/sensor-health",
    tags=["Sensor Health"]
)

LIMITS = {
    "temperature_c": (-50, 60),
    "humidity_pct": (0, 100),
    "pressure_hpa": (870, 1085),
    "wind_speed_ms": (0, 75)
}


class SensorReading(BaseModel):
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    pressure_hpa: Optional[float] = None
    wind_speed_ms: Optional[float] = None


class HealthRequest(BaseModel):
    station_id: str
    readings: list[SensorReading]


@router.post("/assess")
def assess_sensor_health(request: HealthRequest):

    results = {}

    for feature, (lower, upper) in LIMITS.items():
        values = [
            getattr(reading, feature)
            for reading in request.readings
        ]

        total = len(values)

        if total == 0:
            continue

        missing = sum(value is None for value in values)

        valid = [
            value for value in values
            if value is not None
        ]

        out_of_range = sum(
            value < lower or value > upper
            for value in valid
        )

        frozen_count = 0
        longest_run = 0
        current_run = 0
        previous = object()

        for value in valid:
            if value == previous:
                current_run += 1
            else:
                current_run = 1

            longest_run = max(longest_run, current_run)
            previous = value

        is_frozen = longest_run >= 5

        missing_rate = missing / total
        abnormal_rate = out_of_range / total

        score = 100 - (
            missing_rate * 30 +
            abnormal_rate * 40 +
            (20 if is_frozen else 0)
        )

        score = round(max(0, score), 2)

        results[feature] = {
            "health_score": score,
            "missing_readings": missing,
            "out_of_range_readings": out_of_range,
            "longest_repeated_sequence": longest_run,
            "possible_frozen_sensor": is_frozen,
            "status": (
                "needs_inspection" if score < 70
                else "warning" if score < 90
                else "healthy"
            )
        }

    overall_score = (
        round(
            sum(item["health_score"] for item in results.values())
            / len(results), 2
        )
        if results else 0
    )

    return {
        "station_id": request.station_id,
        "overall_health_score": overall_score,
        "overall_status": (
            "needs_inspection" if overall_score < 70
            else "warning" if overall_score < 90
            else "healthy"
        ),
        "sensor_health": results,
        "message": "Health assessment based on supplied readings. Inspection may be required."
    }
