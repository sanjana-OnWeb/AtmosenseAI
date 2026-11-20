
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone

from app.core.database import Base


class SensorReadingDB(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String, nullable=False, index=True)

    temperature_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    pressure_hpa = Column(Float, nullable=False)
    wind_speed_ms = Column(Float, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
