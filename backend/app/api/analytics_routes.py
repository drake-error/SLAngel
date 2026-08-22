"""SLAngel — Analytics API Routes"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.analytics import (
    get_dashboard_summary, get_risk_distribution,
    get_status_distribution, get_department_performance
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("")
def full_analytics(db: Session = Depends(get_db)):
    """Get comprehensive analytics data."""
    summary = get_dashboard_summary(db)
    risk_dist = get_risk_distribution(db)
    status_dist = get_status_distribution(db)
    dept_perf = get_department_performance(db)

    return {
        "summary": summary,
        "risk_distribution": risk_dist,
        "status_distribution": status_dist,
        "department_performance": dept_perf,
    }


@router.get("/sla-compliance")
def sla_compliance(db: Session = Depends(get_db)):
    """Get SLA compliance metrics."""
    summary = get_dashboard_summary(db)
    return {
        "sla_compliance_percentage": summary["sla_compliance_percentage"],
        "sla_breach_rate": summary["sla_breach_rate"],
        "total_completed": summary["completed_applications"],
        "breached": summary["breached"],
    }
