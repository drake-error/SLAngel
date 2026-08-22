"""SLAngel — Officers API Routes"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Officer, Application, ApplicationStatus, RiskLevel
from app.services.analytics import get_officer_workloads

router = APIRouter(prefix="/api/officers", tags=["Officers"])


@router.get("")
def list_officers(db: Session = Depends(get_db)):
    """List all active officers with their active case counts."""
    officers = db.query(Officer).filter(Officer.active == True).all()

    result = []
    for officer in officers:
        active_cases = db.query(Application).filter(
            Application.assigned_officer_id == officer.id,
            Application.status.notin_([
                ApplicationStatus.COMPLETED.value,
                ApplicationStatus.APPROVED.value,
                ApplicationStatus.REJECTED.value,
            ])
        ).count()

        result.append({
            "id": officer.id,
            "name": officer.name,
            "employee_id": officer.employee_id,
            "department": officer.department,
            "district": officer.district,
            "title": officer.title,
            "context": officer.context,
            "role": officer.role,
            "active": officer.active,
            "activeCases": active_cases,
        })

    return result


@router.get("/workload")
def officer_workload(db: Session = Depends(get_db)):
    """Get detailed workload metrics for all officers."""
    return get_officer_workloads(db)
