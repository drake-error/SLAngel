"""SLAngel — CSV/JSON Import API Routes"""

import csv
import io
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import (
    Application, Document, AuditLog, TimelineEvent,
    ApplicationStatus, VerificationStatus
)
from app.services.sla_engine import update_application_sla
from app.services.prediction import update_application_prediction
from app.services.priority_engine import update_application_priority
from app.services.alert_engine import generate_alerts_for_application
from app.api.applications import _generate_app_number

router = APIRouter(prefix="/api/import", tags=["Import"])


REQUIRED_CSV_COLUMNS = {
    "applicant_name", "service_type", "department"
}


def _import_single_record(record: dict, db: Session) -> tuple:
    """Import a single record. Returns (application, error_message)."""
    try:
        # Validate required fields
        if not record.get("applicant_name"):
            return None, "Missing applicant_name"
        if not record.get("service_type"):
            return None, "Missing service_type"
        if not record.get("department"):
            return None, "Missing department"

        now = datetime.utcnow()
        app_number = _generate_app_number()

        # Parse submission date
        submission_date = now
        if record.get("submission_date"):
            try:
                submission_date = datetime.strptime(record["submission_date"], "%Y-%m-%d")
            except ValueError:
                try:
                    submission_date = datetime.strptime(record["submission_date"], "%d/%m/%Y")
                except ValueError:
                    pass

        sla_days = int(record.get("sla_days", 15))

        application = Application(
            application_number=app_number,
            applicant_name=record["applicant_name"],
            applicant_contact=record.get("applicant_contact", ""),
            service_type=record["service_type"],
            department=record["department"],
            district=record.get("district", ""),
            stage=record.get("stage", "Document Verification"),
            submission_date=submission_date,
            sla_days=sla_days,
            status=record.get("status", ApplicationStatus.SUBMITTED.value),
            verification_status=record.get("verification_status", VerificationStatus.PENDING.value),
            purpose=record.get("purpose", ""),
            aadhaar_status=record.get("aadhaar_status", ""),
            annual_income=record.get("annual_income", ""),
            last_action_date=now,
            created_at=now,
            updated_at=now,
        )
        db.add(application)
        db.flush()

        # Timeline
        timeline = TimelineEvent(
            application_id=application.id,
            title="Application imported via data import",
            date_label=now.strftime("%d %b %Y"),
            created_at=now,
        )
        db.add(timeline)

        # Audit
        audit = AuditLog(
            application_id=application.id,
            action="Application imported",
            new_value=app_number,
            timestamp=now,
        )
        db.add(audit)

        db.flush()

        # Calculate
        update_application_sla(application)
        update_application_prediction(application, db)
        update_application_priority(application)
        generate_alerts_for_application(application, db)

        return application, None

    except Exception as e:
        return None, str(e)


@router.post("/csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Import applications from a CSV file."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    # Validate columns
    if reader.fieldnames:
        missing = REQUIRED_CSV_COLUMNS - set(reader.fieldnames)
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing)}"
            )

    total = 0
    imported = 0
    failed = 0
    errors = []

    for i, row in enumerate(reader, start=1):
        total += 1
        app, error = _import_single_record(row, db)
        if error:
            failed += 1
            errors.append(f"Row {i}: {error}")
        else:
            imported += 1

    db.commit()

    return {
        "total_rows": total,
        "imported": imported,
        "failed": failed,
        "errors": errors[:20],  # Limit error messages
    }


@router.post("/json")
async def import_json(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Import applications from a JSON file."""
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="File must be JSON")

    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    if not isinstance(data, list):
        data = [data]

    total = len(data)
    imported = 0
    failed = 0
    errors = []

    for i, record in enumerate(data, start=1):
        app, error = _import_single_record(record, db)
        if error:
            failed += 1
            errors.append(f"Record {i}: {error}")
        else:
            imported += 1

    db.commit()

    return {
        "total_rows": total,
        "imported": imported,
        "failed": failed,
        "errors": errors[:20],
    }
