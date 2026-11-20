from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.alert import AlertDB

router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts & Notifications"]
)


class AlertCreate(BaseModel):
    station_id: str = Field(min_length=1)
    alert_type: str
    severity: str
    message: str


@router.post("/")
def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db)
):
    if alert.severity.lower() not in ["critical", "warning", "info"]:
        raise HTTPException(
            status_code=400,
            detail="Severity must be Critical, Warning, or Info."
        )

    new_alert = AlertDB(
        station_id=alert.station_id,
        alert_type=alert.alert_type,
        severity=alert.severity.capitalize(),
        message=alert.message,
        status="Active"
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return {
        "message": "Alert created successfully.",
        "alert": {
            "id": new_alert.id,
            "station_id": new_alert.station_id,
            "alert_type": new_alert.alert_type,
            "severity": new_alert.severity,
            "message": new_alert.message,
            "status": new_alert.status,
            "created_at": new_alert.created_at
        }
    }


@router.get("/")
def get_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(AlertDB)
        .order_by(AlertDB.created_at.desc())
        .all()
    )

    return [
        {
            "id": alert.id,
            "station_id": alert.station_id,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "message": alert.message,
            "status": alert.status,
            "created_at": alert.created_at
        }
        for alert in alerts
    ]


@router.patch("/{alert_id}/dismiss")
def dismiss_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = db.query(AlertDB).filter(
        AlertDB.id == alert_id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found."
        )

    alert.status = "Dismissed"
    db.commit()
    db.refresh(alert)

    return {
        "message": "Alert dismissed successfully.",
        "alert_id": alert.id,
        "status": alert.status
    }