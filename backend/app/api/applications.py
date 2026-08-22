"""SLAngel — Applications API Routes"""

import json
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from typing import Optional

from app.database import get_db
from app.models.models import (
    Application, Document, Officer, AuditLog, TimelineEvent, User,
    ApplicationStatus, VerificationStatus, RiskLevel
)
from app.schemas.schemas import (
    ApplicationCreate, ApplicationUpdate, StatusUpdate,
    ApplicationResponse, ApplicationListResponse
)
from app.services.sla_engine import update_application_sla
from app.services.prediction import predict_delay, update_application_prediction
from app.services.priority_engine import update_application_priority
from app.services.alert_engine import generate_alerts_for_application, resolve_alerts_for_application
from app.auth.auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def _generate_app_number() -> str:
    """Generate a unique application number."""
    short_id = uuid.uuid4().hex[:4].upper()
    return f"REV-26-{short_id}"


def _to_response(app: Application) -> dict:
    """Convert an Application ORM object to a response dict matching frontend expectations."""
    risk_factors = []
    if app.risk_factors:
        try:
            risk_factors = json.loads(app.risk_factors)
        except (json.JSONDecodeError, TypeError):
            risk_factors = []

    officer_name = None
    officer_role = None
    if app.officer:
        officer_name = app.officer.name
        officer_role = app.officer.title or app.officer.context or app.officer.role

    timeline = []
    if app.timeline_events:
        for event in app.timeline_events:
            timeline.append({
                "id": event.id,
                "title": event.title,
                "date": event.date_label or event.created_at.strftime("%d %b %Y") if event.created_at else "",
            })

    documents = []
    if app.documents:
        for doc in app.documents:
            documents.append({
                "id": doc.id,
                "name": doc.name,
                "verified": doc.verified,
                "size": doc.size,
            })

    # Map status for frontend compatibility
    frontend_status = app.status
    if app.status in (ApplicationStatus.SUBMITTED.value, ApplicationStatus.UNDER_REVIEW.value,
                      ApplicationStatus.VERIFICATION_PENDING.value, ApplicationStatus.VERIFICATION_IN_PROGRESS.value,
                      ApplicationStatus.DOCUMENTS_REQUIRED.value):
        frontend_status = "Pending Action"
    elif app.status == ApplicationStatus.APPROVED.value:
        frontend_status = "Approved"
    elif app.status == ApplicationStatus.COMPLETED.value:
        frontend_status = "Completed"
    elif app.status == ApplicationStatus.REJECTED.value:
        frontend_status = "Rejected"
    elif app.status == ApplicationStatus.ESCALATED.value:
        frontend_status = "Expedited"

    # Map risk level for frontend
    frontend_risk = app.risk_level
    if app.risk_level == RiskLevel.CRITICAL.value:
        frontend_risk = "Critical"
    elif app.risk_level == RiskLevel.HIGH.value:
        frontend_risk = "High"
    elif app.risk_level == RiskLevel.MEDIUM.value:
        frontend_risk = "Medium"
    elif app.risk_level == RiskLevel.LOW.value:
        frontend_risk = "Low"

    return {
        "id": app.application_number,
        "application_number": app.application_number,
        "applicantName": app.applicant_name,
        "applicant_contact": app.applicant_contact,
        "service": app.service_type,
        "department": app.department,
        "district": app.district,
        "stage": app.stage or app.status,
        "submission_date": app.submission_date.isoformat() if app.submission_date else None,
        "expected_completion_date": app.expected_completion_date.isoformat() if app.expected_completion_date else None,
        "statutorySLA": app.sla_days,
        "daysHeld": app.days_held or 0,
        "daysRemaining": app.days_remaining if app.days_remaining is not None else 0,
        "sla_percentage_used": app.sla_percentage_used or 0.0,
        "sla_status": app.sla_status,
        "status": frontend_status,
        "riskLevel": frontend_risk,
        "risk_score": app.risk_score or 0.0,
        "predicted_delay": app.predicted_delay or False,
        "predicted_delay_days": app.predicted_delay_days or 0,
        "prediction_confidence": app.prediction_confidence or 0.0,
        "risk_factors": risk_factors,
        "priority": app.priority or "NORMAL",
        "verification_status": app.verification_status,
        "assignedOfficer": officer_name,
        "assigned_officer_id": app.assigned_officer_id,
        "officerRole": officer_role,
        "phone": app.applicant_contact,
        "aadhaarStatus": app.aadhaar_status,
        "annualIncome": app.annual_income,
        "purpose": app.purpose,
        "documents": documents,
        "timeline": timeline,
        "last_action_date": app.last_action_date.isoformat() if app.last_action_date else None,
        "created_at": app.created_at.isoformat() if app.created_at else None,
        "updated_at": app.updated_at.isoformat() if app.updated_at else None,
    }


def _recalculate_app(app: Application, db: Session):
    """Recalculate SLA, risk, prediction, priority, and generate alerts."""
    update_application_sla(app)
    update_application_prediction(app, db)
    update_application_priority(app)
    generate_alerts_for_application(app, db)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_application(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Create a new application."""
    app_number = _generate_app_number()

    # Ensure unique
    while db.query(Application).filter(Application.application_number == app_number).first():
        app_number = _generate_app_number()

    now = datetime.utcnow()

    application = Application(
        application_number=app_number,
        applicant_name=app_data.applicant_name,
        applicant_contact=app_data.applicant_contact,
        service_type=app_data.service_type,
        department=app_data.department,
        district=app_data.district,
        stage="Document Verification",
        submission_date=now,
        sla_days=app_data.sla_days,
        status=ApplicationStatus.SUBMITTED.value,
        verification_status=VerificationStatus.PENDING.value,
        assigned_officer_id=app_data.assigned_officer_id,
        purpose=app_data.purpose,
        aadhaar_status=app_data.aadhaar_status,
        annual_income=app_data.annual_income,
        last_action_date=now,
        created_at=now,
        updated_at=now,
    )
    db.add(application)
    db.flush()

    # Add documents
    if app_data.documents:
        for doc_data in app_data.documents:
            doc = Document(
                application_id=application.id,
                name=doc_data.name,
                verified=doc_data.verified,
                size=doc_data.size,
            )
            db.add(doc)

    # Initial timeline event
    timeline = TimelineEvent(
        application_id=application.id,
        title="Application submitted via citizen portal",
        date_label=now.strftime("%d %b %Y"),
        created_at=now,
    )
    db.add(timeline)

    # Audit log
    audit = AuditLog(
        application_id=application.id,
        user_id=current_user.id if current_user else None,
        action="Application created",
        new_value=app_number,
        remarks=f"New {app_data.service_type} application created",
        timestamp=now,
    )
    db.add(audit)

    db.flush()

    # Calculate SLA, risk, prediction, priority
    _recalculate_app(application, db)

    db.commit()
    db.refresh(application)

    return _to_response(application)


@router.get("")
def list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    department: Optional[str] = None,
    officer_id: Optional[int] = None,
    risk: Optional[str] = None,
    priority: Optional[str] = None,
    sla_status: Optional[str] = None,
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="asc or desc"),
    db: Session = Depends(get_db),
):
    """List applications with filtering, search, pagination, and sorting."""
    query = db.query(Application).options(
        joinedload(Application.officer),
        joinedload(Application.documents),
        joinedload(Application.timeline_events),
    )

    # Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Application.application_number.ilike(search_term),
                Application.applicant_name.ilike(search_term),
                Application.service_type.ilike(search_term),
                Application.stage.ilike(search_term),
                Application.department.ilike(search_term),
            )
        )

    # Filters
    if status:
        # Map frontend status to backend status
        status_map = {
            "Pending Action": [
                ApplicationStatus.SUBMITTED.value,
                ApplicationStatus.UNDER_REVIEW.value,
                ApplicationStatus.VERIFICATION_PENDING.value,
                ApplicationStatus.VERIFICATION_IN_PROGRESS.value,
                ApplicationStatus.DOCUMENTS_REQUIRED.value,
            ],
            "Approved": [ApplicationStatus.APPROVED.value],
            "Completed": [ApplicationStatus.COMPLETED.value],
            "Rejected": [ApplicationStatus.REJECTED.value],
            "Expedited": [ApplicationStatus.ESCALATED.value],
        }
        backend_statuses = status_map.get(status, [status])
        query = query.filter(Application.status.in_(backend_statuses))

    if department and department != "All":
        query = query.filter(Application.department == department)

    if officer_id:
        query = query.filter(Application.assigned_officer_id == officer_id)

    if risk and risk != "All":
        risk_map = {"Critical": "CRITICAL", "High": "HIGH", "Medium": "MEDIUM", "Low": "LOW"}
        backend_risk = risk_map.get(risk, risk)
        query = query.filter(Application.risk_level == backend_risk)

    if priority:
        query = query.filter(Application.priority == priority)

    if sla_status:
        query = query.filter(Application.sla_status == sla_status)

    # Total count
    total = query.count()

    # Sorting
    sort_column = getattr(Application, sort_by, Application.created_at)
    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Pagination
    offset = (page - 1) * page_size
    applications = query.offset(offset).limit(page_size).all()

    # Make unique (joinedload can cause duplicates)
    seen = set()
    unique_apps = []
    for app in applications:
        if app.id not in seen:
            seen.add(app.id)
            unique_apps.append(app)

    total_pages = max(1, (total + page_size - 1) // page_size)

    return {
        "applications": [_to_response(app) for app in unique_apps],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{application_id}")
def get_application(application_id: str, db: Session = Depends(get_db)):
    """Get full application details by application number or ID."""
    app = db.query(Application).options(
        joinedload(Application.officer),
        joinedload(Application.documents),
        joinedload(Application.timeline_events),
        joinedload(Application.alerts),
        joinedload(Application.audit_logs),
    ).filter(
        or_(
            Application.application_number == application_id,
            Application.id == int(application_id) if application_id.isdigit() else False,
        )
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    response = _to_response(app)

    # Add prediction details
    prediction = predict_delay(app, db)
    response["prediction"] = {
        "risk_score": prediction.risk_score,
        "risk_level": prediction.risk_level,
        "predicted_delay": prediction.predicted_delay,
        "predicted_delay_days": prediction.predicted_delay_days,
        "confidence": prediction.confidence,
        "reasons": prediction.reasons,
        "prediction_source": prediction.prediction_source,
    }

    # Add alerts
    response["alerts"] = [
        {
            "id": a.id,
            "type": a.type,
            "severity": a.severity,
            "message": a.message,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in (app.alerts or [])
        if a.resolved_at is None
    ]

    # Add audit history
    response["history"] = [
        {
            "id": log.id,
            "action": log.action,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "remarks": log.remarks,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in sorted(app.audit_logs or [], key=lambda x: x.timestamp or datetime.min, reverse=True)
    ]

    return response


@router.put("/{application_id}")
def update_application(
    application_id: str,
    update_data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Update an application's fields."""
    app = db.query(Application).options(
        joinedload(Application.officer),
        joinedload(Application.documents),
    ).filter(
        or_(
            Application.application_number == application_id,
            Application.id == int(application_id) if application_id.isdigit() else False,
        )
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.utcnow()
    changes = []

    # Update fields
    for field, value in update_data.model_dump(exclude_unset=True).items():
        if value is not None:
            old_val = getattr(app, field, None)
            setattr(app, field, value)
            changes.append(f"{field}: {old_val} → {value}")

    if changes:
        app.last_action_date = now
        app.updated_at = now

        # Audit log
        audit = AuditLog(
            application_id=app.id,
            user_id=current_user.id if current_user else None,
            action="Application updated",
            old_value="; ".join(changes),
            remarks="Fields updated",
            timestamp=now,
        )
        db.add(audit)

        # Timeline event
        timeline = TimelineEvent(
            application_id=app.id,
            title=f"Application details updated",
            date_label=now.strftime("%d %b %Y"),
            created_at=now,
        )
        db.add(timeline)

        # Recalculate
        _recalculate_app(app, db)

    db.commit()
    db.refresh(app)

    return _to_response(app)


@router.patch("/{application_id}/status")
def update_application_status(
    application_id: str,
    status_data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Update application status with audit trail."""
    app = db.query(Application).options(
        joinedload(Application.officer),
        joinedload(Application.documents),
        joinedload(Application.timeline_events),
    ).filter(
        or_(
            Application.application_number == application_id,
            Application.id == int(application_id) if application_id.isdigit() else False,
        )
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.utcnow()
    old_status = app.status

    # Map frontend status values to backend if needed
    new_status = status_data.status
    status_map_reverse = {
        "Approved": ApplicationStatus.APPROVED.value,
        "Completed": ApplicationStatus.COMPLETED.value,
        "Rejected": ApplicationStatus.REJECTED.value,
        "Expedited": ApplicationStatus.ESCALATED.value,
        "Pending Action": ApplicationStatus.UNDER_REVIEW.value,
        "Under Review": ApplicationStatus.UNDER_REVIEW.value,
    }
    backend_status = status_map_reverse.get(new_status, new_status)
    app.status = backend_status

    app.last_action_date = now
    app.updated_at = now

    # Update stage based on status
    stage_map = {
        ApplicationStatus.SUBMITTED.value: "Submission",
        ApplicationStatus.UNDER_REVIEW.value: "Under Review",
        ApplicationStatus.VERIFICATION_PENDING.value: "Verification Pending",
        ApplicationStatus.VERIFICATION_IN_PROGRESS.value: "Document Verification",
        ApplicationStatus.DOCUMENTS_REQUIRED.value: "Documents Required",
        ApplicationStatus.APPROVED.value: "Approved",
        ApplicationStatus.REJECTED.value: "Rejected",
        ApplicationStatus.COMPLETED.value: "Completed",
        ApplicationStatus.ESCALATED.value: "Expedited",
        ApplicationStatus.DELAYED.value: "Delayed",
    }
    app.stage = stage_map.get(backend_status, app.stage)

    # If approved/completed, update verification
    if backend_status in (ApplicationStatus.APPROVED.value, ApplicationStatus.COMPLETED.value):
        app.verification_status = VerificationStatus.VERIFIED.value
        resolve_alerts_for_application(app, db)

    # Audit log
    user_name = current_user.full_name if current_user else "System"
    audit = AuditLog(
        application_id=app.id,
        user_id=current_user.id if current_user else None,
        action="Status changed",
        old_value=old_status,
        new_value=backend_status,
        remarks=status_data.remarks or f"Status updated by {user_name}",
        timestamp=now,
    )
    db.add(audit)

    # Timeline event
    remarks_text = f": {status_data.remarks}" if status_data.remarks else ""
    timeline = TimelineEvent(
        application_id=app.id,
        title=f"Status changed to {new_status} by {user_name}{remarks_text}",
        date_label=now.strftime("%d %b %Y"),
        created_at=now,
    )
    db.add(timeline)

    # Recalculate everything
    _recalculate_app(app, db)

    db.commit()
    db.refresh(app)

    return _to_response(app)


@router.get("/{application_id}/history")
def get_application_history(application_id: str, db: Session = Depends(get_db)):
    """Get audit trail for an application."""
    app = db.query(Application).filter(
        or_(
            Application.application_number == application_id,
            Application.id == int(application_id) if application_id.isdigit() else False,
        )
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    logs = db.query(AuditLog).filter(
        AuditLog.application_id == app.id
    ).order_by(desc(AuditLog.timestamp)).all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "remarks": log.remarks,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]


@router.get("/{application_id}/prediction")
def get_application_prediction(application_id: str, db: Session = Depends(get_db)):
    """Get delay prediction for an application."""
    app = db.query(Application).options(
        joinedload(Application.documents),
    ).filter(
        or_(
            Application.application_number == application_id,
            Application.id == int(application_id) if application_id.isdigit() else False,
        )
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    prediction = predict_delay(app, db)
    return prediction.model_dump()
