"""SLAngel — Analytics Service: Dashboard & Reporting Statistics"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    Application, Officer, Alert, ApplicationStatus,
    RiskLevel, SLAStatus
)


def get_dashboard_summary(db: Session) -> dict:
    """Generate dashboard summary statistics from real data."""
    total = db.query(Application).count()

    completed = db.query(Application).filter(
        Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ])
    ).count()

    pending = db.query(Application).filter(
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).count()

    verification_pending = db.query(Application).filter(
        Application.verification_status.in_(["PENDING", "IN_PROGRESS"]),
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).count()

    high_risk = db.query(Application).filter(
        Application.risk_level == RiskLevel.HIGH.value,
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).count()

    critical_risk = db.query(Application).filter(
        Application.risk_level == RiskLevel.CRITICAL.value,
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).count()

    approaching = db.query(Application).filter(
        Application.days_remaining <= 3,
        Application.days_remaining > 0,
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).count()

    breached = db.query(Application).filter(
        Application.sla_status == SLAStatus.BREACHED.value,
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).count()

    # SLA compliance percentage
    total_completed = db.query(Application).filter(
        Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ])
    ).count()

    completed_within_sla = db.query(Application).filter(
        Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ]),
        Application.sla_status != SLAStatus.BREACHED.value,
    ).count()

    sla_compliance = (completed_within_sla / total_completed * 100) if total_completed > 0 else 100.0
    sla_breach_rate = 100.0 - sla_compliance if total_completed > 0 else 0.0

    # Average processing time (for completed applications)
    completed_apps = db.query(Application).filter(
        Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ])
    ).all()

    avg_processing = 0.0
    if completed_apps:
        total_days = sum(app.days_held or 0 for app in completed_apps)
        avg_processing = total_days / len(completed_apps)

    return {
        "total_applications": total,
        "pending_applications": pending,
        "completed_applications": completed,
        "verification_pending": verification_pending,
        "high_risk": high_risk,
        "critical_risk": critical_risk,
        "approaching_deadline": approaching,
        "breached": breached,
        "sla_breach_rate": round(sla_breach_rate, 1),
        "avg_processing_time": round(avg_processing, 1),
        "sla_compliance_percentage": round(sla_compliance, 1),
    }


def get_risk_distribution(db: Session) -> dict:
    """Get count of applications by risk level."""
    active_filter = Application.status.notin_([
        ApplicationStatus.COMPLETED.value,
        ApplicationStatus.APPROVED.value,
        ApplicationStatus.REJECTED.value,
    ])

    return {
        "low": db.query(Application).filter(Application.risk_level == RiskLevel.LOW.value, active_filter).count(),
        "medium": db.query(Application).filter(Application.risk_level == RiskLevel.MEDIUM.value, active_filter).count(),
        "high": db.query(Application).filter(Application.risk_level == RiskLevel.HIGH.value, active_filter).count(),
        "critical": db.query(Application).filter(Application.risk_level == RiskLevel.CRITICAL.value, active_filter).count(),
    }


def get_status_distribution(db: Session) -> list:
    """Get count of applications by status."""
    results = db.query(
        Application.status, func.count(Application.id)
    ).group_by(Application.status).all()

    return [{"status": status, "count": count} for status, count in results]


def get_department_performance(db: Session) -> list:
    """Get performance metrics by department."""
    departments = db.query(Application.department).distinct().all()
    performance = []

    for (dept,) in departments:
        dept_apps = db.query(Application).filter(Application.department == dept)

        total = dept_apps.count()
        completed = dept_apps.filter(Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ])).count()
        pending_q = dept_apps.filter(Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ]))
        pending = pending_q.count()
        high_risk = pending_q.filter(
            Application.risk_level.in_([RiskLevel.HIGH.value, RiskLevel.CRITICAL.value])
        ).count()

        # Average processing time
        completed_apps = dept_apps.filter(Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ])).all()
        avg_time = 0.0
        if completed_apps:
            avg_time = sum(a.days_held or 0 for a in completed_apps) / len(completed_apps)

        # SLA compliance
        completed_within_sla = dept_apps.filter(
            Application.status.in_([
                ApplicationStatus.COMPLETED.value,
                ApplicationStatus.APPROVED.value,
            ]),
            Application.sla_status != SLAStatus.BREACHED.value,
        ).count()
        sla_compliance = (completed_within_sla / completed * 100) if completed > 0 else 100.0

        performance.append({
            "department": dept,
            "total": total,
            "completed": completed,
            "pending": pending,
            "high_risk": high_risk,
            "avg_processing_time": round(avg_time, 1),
            "sla_compliance": round(sla_compliance, 1),
        })

    return performance


def get_officer_workloads(db: Session) -> list:
    """Get workload metrics for all active officers."""
    officers = db.query(Officer).filter(Officer.active == True).all()
    workloads = []

    for officer in officers:
        officer_apps = db.query(Application).filter(
            Application.assigned_officer_id == officer.id
        )

        total_assigned = officer_apps.count()
        pending = officer_apps.filter(Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])).count()
        high_risk = officer_apps.filter(
            Application.risk_level == RiskLevel.HIGH.value,
            Application.status.notin_([
                ApplicationStatus.COMPLETED.value,
                ApplicationStatus.APPROVED.value,
                ApplicationStatus.REJECTED.value,
            ])
        ).count()
        critical = officer_apps.filter(
            Application.risk_level == RiskLevel.CRITICAL.value,
            Application.status.notin_([
                ApplicationStatus.COMPLETED.value,
                ApplicationStatus.APPROVED.value,
                ApplicationStatus.REJECTED.value,
            ])
        ).count()
        completed = officer_apps.filter(Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ])).count()

        completed_apps = officer_apps.filter(Application.status.in_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
        ])).all()
        avg_time = 0.0
        if completed_apps:
            avg_time = sum(a.days_held or 0 for a in completed_apps) / len(completed_apps)

        workloads.append({
            "officer": {
                "id": officer.id,
                "name": officer.name,
                "employee_id": officer.employee_id,
                "department": officer.department,
                "district": officer.district,
                "title": officer.title,
                "context": officer.context,
                "role": officer.role,
                "active": officer.active,
                "activeCases": pending,
            },
            "total_assigned": total_assigned,
            "pending": pending,
            "high_risk": high_risk,
            "critical": critical,
            "completed": completed,
            "average_processing_time": round(avg_time, 1),
        })

    return workloads
