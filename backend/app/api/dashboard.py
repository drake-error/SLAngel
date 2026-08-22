"""SLAngel — Dashboard API Routes"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.database import get_db
from app.models.models import Application, ApplicationStatus, RiskLevel
from app.services.analytics import (
    get_dashboard_summary, get_risk_distribution,
    get_status_distribution, get_department_performance
)
from app.api.applications import _to_response

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    """Get aggregated dashboard statistics."""
    return get_dashboard_summary(db)


@router.get("/risk-distribution")
def risk_distribution(db: Session = Depends(get_db)):
    """Get application count by risk level."""
    return get_risk_distribution(db)


@router.get("/status-distribution")
def status_distribution(db: Session = Depends(get_db)):
    """Get application count by status."""
    return get_status_distribution(db)


@router.get("/department-performance")
def department_performance(db: Session = Depends(get_db)):
    """Get performance metrics by department."""
    return get_department_performance(db)


@router.get("/recent-applications")
def recent_applications(db: Session = Depends(get_db)):
    """Get 10 most recent applications."""
    apps = db.query(Application).options(
        joinedload(Application.officer),
        joinedload(Application.documents),
        joinedload(Application.timeline_events),
    ).order_by(desc(Application.created_at)).limit(10).all()

    seen = set()
    unique_apps = []
    for app in apps:
        if app.id not in seen:
            seen.add(app.id)
            unique_apps.append(app)

    return [_to_response(app) for app in unique_apps]


@router.get("/urgent-applications")
def urgent_applications(db: Session = Depends(get_db)):
    """Get applications requiring urgent attention (high/critical risk, not completed)."""
    apps = db.query(Application).options(
        joinedload(Application.officer),
        joinedload(Application.documents),
        joinedload(Application.timeline_events),
    ).filter(
        Application.risk_level.in_([RiskLevel.HIGH.value, RiskLevel.CRITICAL.value]),
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).order_by(desc(Application.risk_score)).limit(20).all()

    seen = set()
    unique_apps = []
    for app in apps:
        if app.id not in seen:
            seen.add(app.id)
            unique_apps.append(app)

    return [_to_response(app) for app in unique_apps]
