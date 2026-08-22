"""SLAngel — SLA Engine: Deadline Tracking & SLA Status Calculation"""

from datetime import datetime, timedelta
from app.models.models import Application, SLAStatus, ApplicationStatus


def calculate_sla_metrics(application: Application) -> dict:
    """
    Calculate all SLA metrics for an application.
    
    Returns dict with:
        days_elapsed, days_remaining, sla_percentage_used,
        expected_completion_date, sla_status
    """
    now = datetime.utcnow()
    submission = application.submission_date or application.created_at or now

    # Calculate days elapsed since submission
    days_elapsed = max(0, (now - submission).days)

    # Calculate expected completion date
    sla_days = application.sla_days or 15
    expected_completion = submission + timedelta(days=sla_days)

    # Calculate days remaining
    days_remaining = max(0, (expected_completion - now).days)

    # If application is completed/approved, freeze remaining at completion
    if application.status in (
        ApplicationStatus.COMPLETED.value,
        ApplicationStatus.APPROVED.value,
        ApplicationStatus.REJECTED.value,
    ):
        days_remaining = max(0, days_remaining)

    # Calculate percentage of SLA consumed
    sla_percentage_used = (days_elapsed / sla_days * 100) if sla_days > 0 else 100.0
    sla_percentage_used = min(sla_percentage_used, 100.0)

    # Determine SLA status
    sla_status = _determine_sla_status(
        application, days_remaining, sla_days, sla_percentage_used
    )

    return {
        "days_elapsed": days_elapsed,
        "days_held": days_elapsed,
        "days_remaining": days_remaining,
        "sla_percentage_used": round(sla_percentage_used, 1),
        "expected_completion_date": expected_completion,
        "sla_status": sla_status,
    }


def _determine_sla_status(
    application: Application,
    days_remaining: int,
    sla_days: int,
    sla_percentage_used: float,
) -> str:
    """
    Determine the SLA status based on multiple factors.

    SAFE: >40% SLA time remaining
    WATCH: 20-40% remaining
    URGENT: <20% remaining
    BREACHED: Deadline passed & not completed
    """
    # Check if already completed
    completed_statuses = (
        ApplicationStatus.COMPLETED.value,
        ApplicationStatus.APPROVED.value,
        ApplicationStatus.REJECTED.value,
    )
    if application.status in completed_statuses:
        # Check if it was completed within SLA
        if days_remaining >= 0:
            return SLAStatus.SAFE.value
        return SLAStatus.BREACHED.value

    # Check for breach
    if days_remaining <= 0:
        return SLAStatus.BREACHED.value

    # Calculate remaining percentage
    remaining_pct = (days_remaining / sla_days * 100) if sla_days > 0 else 0

    # Factor in application state for more aggressive classification
    has_pending_verification = application.verification_status in ("PENDING", "IN_PROGRESS")
    has_pending_documents = application.status == ApplicationStatus.DOCUMENTS_REQUIRED.value

    # Adjust thresholds based on application state
    urgent_threshold = 25 if has_pending_verification or has_pending_documents else 20
    watch_threshold = 45 if has_pending_verification else 40

    if remaining_pct < urgent_threshold:
        return SLAStatus.URGENT.value
    elif remaining_pct < watch_threshold:
        return SLAStatus.WATCH.value
    else:
        return SLAStatus.SAFE.value


def update_application_sla(application: Application) -> Application:
    """Update an application's SLA fields in-place and return it."""
    metrics = calculate_sla_metrics(application)
    application.days_held = metrics["days_held"]
    application.days_remaining = metrics["days_remaining"]
    application.sla_percentage_used = metrics["sla_percentage_used"]
    application.expected_completion_date = metrics["expected_completion_date"]
    application.sla_status = metrics["sla_status"]
    return application


def batch_update_sla(applications: list) -> list:
    """Update SLA metrics for a batch of applications."""
    for app in applications:
        update_application_sla(app)
    return applications


def get_approaching_deadline_apps(applications: list, threshold_days: int = 3) -> list:
    """Filter applications approaching their deadline within threshold_days."""
    approaching = []
    for app in applications:
        if app.status not in (
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ):
            if 0 < app.days_remaining <= threshold_days:
                approaching.append(app)
    return approaching


def get_breached_apps(applications: list) -> list:
    """Filter applications that have breached their SLA."""
    return [
        app for app in applications
        if app.sla_status == SLAStatus.BREACHED.value
        and app.status not in (
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        )
    ]
