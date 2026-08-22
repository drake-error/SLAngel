"""SLAngel — Citizen Communication Engine

Generates clear, citizen-facing status updates based on:
  Application Status + Processing Result + Delay Information
  → Convert to Simple Language → Generate Citizen Update

Message Scenarios:
  Normal Processing    → "Your application is currently being processed..."
  Delay Detected       → "Your application is taking longer than expected..."
  Application Prioritised → "Your application has been prioritised..."
  Completed            → "Your application has been successfully processed..."
"""

from datetime import datetime
from typing import Optional

from app.models.models import (
    Application, ApplicationStatus, VerificationStatus,
    RiskLevel, SLAStatus, Priority
)


def generate_citizen_message(app: Application) -> dict:
    """
    Generate a citizen-facing status update for an application.

    Returns:
        {
            "status_label": str,        # Simple status label
            "message": str,             # Main citizen message
            "detail": str,              # Additional detail
            "next_steps": str,          # What the citizen should do/expect
            "urgency": str,             # normal / attention / urgent / completed
            "estimated_completion": str, # When they can expect completion
            "last_updated": str,        # Human-readable last update time
        }
    """
    status = app.status or ApplicationStatus.SUBMITTED.value
    risk_level = app.risk_level or RiskLevel.LOW.value
    days_remaining = app.days_remaining if app.days_remaining is not None else 0
    sla_days = app.sla_days or 15
    days_held = app.days_held or 0
    sla_status = app.sla_status or SLAStatus.SAFE.value
    priority = app.priority or Priority.NORMAL.value
    verification_status = app.verification_status or VerificationStatus.PENDING.value
    service_type = app.service_type or "your application"

    # Last updated
    last_updated = "Recently"
    if app.last_action_date:
        delta = (datetime.utcnow() - app.last_action_date).days
        if delta == 0:
            last_updated = "Today"
        elif delta == 1:
            last_updated = "Yesterday"
        else:
            last_updated = f"{delta} days ago"

    # Estimated completion
    if days_remaining > 0:
        estimated_completion = f"Within {days_remaining} working day(s)"
    elif days_remaining == 0 and status not in (
        ApplicationStatus.COMPLETED.value,
        ApplicationStatus.APPROVED.value,
        ApplicationStatus.REJECTED.value,
    ):
        estimated_completion = "As soon as possible — our team is prioritising this"
    else:
        estimated_completion = "Processing complete"

    # ── Completed / Approved ────────────────────────────────────────────────
    if status == ApplicationStatus.COMPLETED.value:
        return {
            "status_label": "Completed",
            "message": (
                f"Your {service_type} application has been successfully processed. "
                f"Please check the next steps below."
            ),
            "detail": (
                f"Your application was processed in {days_held} day(s), "
                f"within the statutory {sla_days}-day timeline."
            ),
            "next_steps": (
                "Please visit your nearest government office or check your registered "
                "email/SMS for the issued certificate or document. If you have not received "
                "it within 2 working days, please contact the helpdesk."
            ),
            "urgency": "completed",
            "estimated_completion": "Processing complete",
            "last_updated": last_updated,
        }

    if status == ApplicationStatus.APPROVED.value:
        return {
            "status_label": "Approved",
            "message": (
                f"Great news! Your {service_type} application has been approved. "
                f"The final document is being prepared for issuance."
            ),
            "detail": (
                f"Your application was reviewed and approved after {days_held} day(s) of processing."
            ),
            "next_steps": (
                "Your certificate/document will be issued shortly. You will receive a "
                "notification via SMS and email once it is ready for collection or download."
            ),
            "urgency": "completed",
            "estimated_completion": "Within 1-2 working days",
            "last_updated": last_updated,
        }

    if status == ApplicationStatus.REJECTED.value:
        return {
            "status_label": "Action Required",
            "message": (
                f"Your {service_type} application could not be approved in its current form. "
                f"Please review the feedback and resubmit."
            ),
            "detail": (
                "The reviewing officer has provided specific feedback on what needs to be "
                "corrected. Please address all points before resubmitting."
            ),
            "next_steps": (
                "Review the rejection remarks, correct the identified issues, and resubmit "
                "your application through the citizen portal. If you need assistance, please "
                "contact the helpdesk."
            ),
            "urgency": "attention",
            "estimated_completion": "Depends on resubmission",
            "last_updated": last_updated,
        }

    # ── Prioritised / Expedited ─────────────────────────────────────────────
    if status == ApplicationStatus.ESCALATED.value or priority in (
        Priority.CRITICAL.value, Priority.URGENT.value
    ):
        return {
            "status_label": "Prioritised",
            "message": (
                f"Your {service_type} application has been prioritised for faster processing. "
                f"Our team is actively working on it."
            ),
            "detail": (
                f"Your application has been fast-tracked and is receiving priority attention. "
                f"It has been in processing for {days_held} day(s)."
            ),
            "next_steps": (
                "No action is required from your end. You will receive an update via SMS "
                "and email once the processing is complete. Expected completion: "
                f"{estimated_completion}."
            ),
            "urgency": "attention",
            "estimated_completion": estimated_completion,
            "last_updated": last_updated,
        }

    # ── Documents Required ──────────────────────────────────────────────────
    if status == ApplicationStatus.DOCUMENTS_REQUIRED.value or verification_status in (
        VerificationStatus.NEEDS_CORRECTION.value,
        VerificationStatus.REJECTED.value,
    ):
        return {
            "status_label": "Documents Required",
            "message": (
                f"Your {service_type} application requires additional documents or corrections. "
                f"Please submit the required documents at the earliest."
            ),
            "detail": (
                "Our verification team has reviewed your submission and identified "
                "missing or incorrect documents. Prompt submission will help avoid delays."
            ),
            "next_steps": (
                "Please check your registered email or SMS for specific document requirements. "
                "Submit the documents through the citizen portal or visit the nearest "
                "government office. Delay in submission may affect your SLA timeline."
            ),
            "urgency": "urgent",
            "estimated_completion": estimated_completion,
            "last_updated": last_updated,
        }

    # ── Delay Detected ──────────────────────────────────────────────────────
    if sla_status in (SLAStatus.BREACHED.value, SLAStatus.URGENT.value) or risk_level in (
        RiskLevel.HIGH.value, RiskLevel.CRITICAL.value
    ):
        return {
            "status_label": "Processing — Delayed",
            "message": (
                f"Your {service_type} application is taking longer than expected. "
                f"Our team is working to complete it as soon as possible."
            ),
            "detail": (
                f"Your application has been in processing for {days_held} day(s) against "
                f"a standard timeline of {sla_days} days. We understand this may cause "
                f"inconvenience and are prioritising your case."
            ),
            "next_steps": (
                "No action is required from your end at this time. Our team has been "
                "notified and is actively working on your application. You will receive "
                "an update as soon as there is progress."
            ),
            "urgency": "urgent",
            "estimated_completion": estimated_completion,
            "last_updated": last_updated,
        }

    # ── Normal Processing ───────────────────────────────────────────────────
    stage_label = app.stage or "processing"
    return {
        "status_label": "In Progress",
        "message": (
            f"Your {service_type} application is currently being processed and is "
            f"progressing within the expected timeline."
        ),
        "detail": (
            f"Your application is currently in the '{stage_label}' stage. "
            f"It has been {days_held} day(s) since submission, with "
            f"{days_remaining} day(s) remaining in the standard {sla_days}-day timeline."
        ),
        "next_steps": (
            "No action is required from your end. You will be notified via SMS and email "
            "when your application moves to the next stage or is completed."
        ),
        "urgency": "normal",
        "estimated_completion": estimated_completion,
        "last_updated": last_updated,
    }
