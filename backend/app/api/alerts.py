"""SLAngel — Alerts API Routes"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import Optional

from app.database import get_db
from app.models.models import Alert, Application

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
def list_alerts(
    severity: Optional[str] = None,
    application_id: Optional[str] = None,
    is_read: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List alerts with filtering."""
    query = db.query(Alert).join(
        Application, Alert.application_id == Application.id, isouter=True
    )

    if severity:
        query = query.filter(Alert.severity == severity)

    if application_id:
        query = query.filter(Application.application_number == application_id)

    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)

    total = query.count()
    unread_count = db.query(Alert).filter(Alert.is_read == False).count()

    alerts = query.order_by(desc(Alert.created_at)).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return {
        "alerts": [
            {
                "id": a.id,
                "application_id": a.application_id,
                "application_number": a.application.application_number if a.application else None,
                "type": a.type,
                "severity": a.severity,
                "message": a.message,
                "is_read": a.is_read,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            }
            for a in alerts
        ],
        "total": total,
        "unread_count": unread_count,
    }


@router.get("/unread")
def get_unread_alerts(db: Session = Depends(get_db)):
    """Get all unread alerts."""
    alerts = db.query(Alert).filter(
        Alert.is_read == False,
        Alert.resolved_at.is_(None),
    ).order_by(desc(Alert.created_at)).limit(50).all()

    return {
        "alerts": [
            {
                "id": a.id,
                "application_id": a.application_id,
                "application_number": a.application.application_number if a.application else None,
                "type": a.type,
                "severity": a.severity,
                "message": a.message,
                "is_read": a.is_read,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
        "count": len(alerts),
    }


@router.patch("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as read."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()

    return {"success": True, "message": "Alert marked as read"}


@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Resolve an alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    alert.resolved_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Alert resolved"}
