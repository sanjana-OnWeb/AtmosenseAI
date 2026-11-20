
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.sensor_reading import SensorReadingDB

router = APIRouter(
    prefix="/api/history",
    tags=["Reading History"]
)


class ReadingInput(BaseModel):
    station_id: str
    temperature_c: float
    humidity_pct: float
    pressure_hpa: float
    wind_speed_ms: float


@router.post("/readings")
def save_reading(
    reading: ReadingInput,
    db: Session = Depends(get_db)
):
    record = SensorReadingDB(**reading.model_dump())

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message": "Sensor reading saved successfully",
        "reading_id": record.id,
        "station_id": record.station_id
    }


@router.get("/readings")
def get_readings(
    station_id: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 1000"
        )

    query = db.query(SensorReadingDB)

    if station_id:
        query = query.filter(
            SensorReadingDB.station_id == station_id
        )

    records = (
        query.order_by(SensorReadingDB.id.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": item.id,
            "station_id": item.station_id,
            "temperature_c": item.temperature_c,
            "humidity_pct": item.humidity_pct,
            "pressure_hpa": item.pressure_hpa,
            "wind_speed_ms": item.wind_speed_ms,
            "created_at": item.created_at.isoformat()
        }
        for item in records
    ]
