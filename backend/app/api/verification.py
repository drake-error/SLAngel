"""SLAngel — Verification API Routes"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional

from app.database import get_db
from app.models.models import (
    Application, Verification, AuditLog, TimelineEvent, User,
    VerificationStatus, ApplicationStatus
)
from app.schemas.schemas import VerificationCreate
from app.services.sla_engine import update_application_sla
from app.services.prediction import update_application_prediction
from app.services.priority_engine import update_application_priority
from app.services.alert_engine import generate_alerts_for_application
from app.auth.auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Verification"])


@router.post("/{application_id}/verification")
def process_verification(
    application_id: str,
    data: VerificationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Process a verification action on an application."""
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
    user_name = current_user.full_name if current_user else "System"

    # Determine officer ID
    officer_id = None
    if current_user and current_user.officer:
        officer_id = current_user.officer.id

    action = data.action.lower()

    if action == "start":
        app.verification_status = VerificationStatus.IN_PROGRESS.value
        app.status = ApplicationStatus.VERIFICATION_IN_PROGRESS.value
        app.stage = "Document Verification"
        title = f"Verification started by {user_name}"

    elif action == "complete":
        app.verification_status = VerificationStatus.VERIFIED.value
        app.stage = "Approval"
        title = f"Verification completed by {user_name}"

    elif action == "reject":
        app.verification_status = VerificationStatus.REJECTED.value
        app.status = ApplicationStatus.DOCUMENTS_REQUIRED.value
        app.stage = "Documents Required"
        title = f"Verification rejected by {user_name}"

    elif action == "needs_correction":
        app.verification_status = VerificationStatus.NEEDS_CORRECTION.value
        app.status = ApplicationStatus.DOCUMENTS_REQUIRED.value
        app.stage = "Correction Required"
        title = f"Correction requested by {user_name}"

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action: {data.action}. Use: start, complete, reject, needs_correction"
        )

    if data.remarks:
        title += f": {data.remarks}"

    # Create verification record
    verification = Verification(
        application_id=app.id,
        officer_id=officer_id,
        status=app.verification_status,
        remarks=data.remarks,
        verified_at=now if action == "complete" else None,
        created_at=now,
    )
    db.add(verification)

    # Update application
    app.last_action_date = now
    app.updated_at = now

    # Audit log
    audit = AuditLog(
        application_id=app.id,
        user_id=current_user.id if current_user else None,
        action=f"Verification {action}",
        new_value=app.verification_status,
        remarks=data.remarks,
        timestamp=now,
    )
    db.add(audit)

    # Timeline event
    timeline = TimelineEvent(
        application_id=app.id,
        title=title,
        date_label=now.strftime("%d %b %Y"),
        created_at=now,
    )
    db.add(timeline)

    # Recalculate
    update_application_sla(app)
    update_application_prediction(app, db)
    update_application_priority(app)
    generate_alerts_for_application(app, db)

    db.commit()
    db.refresh(app)
    db.refresh(verification)

    return {
        "success": True,
        "message": f"Verification {action} successful",
        "verification": {
            "id": verification.id,
            "application_id": app.application_number,
            "status": verification.status,
            "remarks": verification.remarks,
            "verified_at": verification.verified_at.isoformat() if verification.verified_at else None,
        }
    }
