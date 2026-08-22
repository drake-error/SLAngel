"""SLAngel — Alert Engine: Early Warning System"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.models import (
    Application, Alert, AlertType, AlertSeverity,
    ApplicationStatus, SLAStatus, RiskLevel
)


def generate_alerts_for_application(app: Application, db: Session) -> List[Alert]:
    """
    Generate appropriate alerts for an application based on its current state.
    Avoids duplicate active (unresolved) alerts of the same type.
    """
    generated = []

    # ── CRITICAL RISK ──────────────────────────────────────────────────────
    if app.risk_level == RiskLevel.CRITICAL.value:
        alert = _create_alert_if_new(
            db, app,
            alert_type=AlertType.CRITICAL_RISK.value,
            severity=AlertSeverity.CRITICAL.value,
            message=f"CRITICAL: {app.application_number} ({app.service_type}) has critical risk score of {app.risk_score:.0f}. Immediate action required."
        )
        if alert:
            generated.append(alert)

    # ── HIGH RISK ──────────────────────────────────────────────────────────
    elif app.risk_level == RiskLevel.HIGH.value:
        alert = _create_alert_if_new(
            db, app,
            alert_type=AlertType.HIGH_RISK.value,
            severity=AlertSeverity.WARNING.value,
            message=f"HIGH RISK: {app.application_number} ({app.service_type}) has elevated risk score of {app.risk_score:.0f}."
        )
        if alert:
            generated.append(alert)

    # ── DEADLINE APPROACHING ───────────────────────────────────────────────
    if app.days_remaining is not None and 0 < app.days_remaining <= 3:
        if app.status not in (ApplicationStatus.COMPLETED.value, ApplicationStatus.APPROVED.value, ApplicationStatus.REJECTED.value):
            alert = _create_alert_if_new(
                db, app,
                alert_type=AlertType.DEADLINE_APPROACHING.value,
                severity=AlertSeverity.WARNING.value if app.days_remaining > 1 else AlertSeverity.CRITICAL.value,
                message=f"DEADLINE: {app.application_number} has only {app.days_remaining} day(s) remaining before SLA breach."
            )
            if alert:
                generated.append(alert)

    # ── SLA BREACHED ───────────────────────────────────────────────────────
    if app.sla_status == SLAStatus.BREACHED.value:
        if app.status not in (ApplicationStatus.COMPLETED.value, ApplicationStatus.APPROVED.value, ApplicationStatus.REJECTED.value):
            alert = _create_alert_if_new(
                db, app,
                alert_type=AlertType.SLA_BREACHED.value,
                severity=AlertSeverity.CRITICAL.value,
                message=f"SLA BREACHED: {app.application_number} ({app.service_type}) has exceeded its statutory SLA deadline."
            )
            if alert:
                generated.append(alert)

    # ── INACTIVITY ─────────────────────────────────────────────────────────
    now = datetime.utcnow()
    last_action = app.last_action_date or app.created_at or now
    inactivity_days = (now - last_action).days
    if inactivity_days >= 3:
        if app.status not in (ApplicationStatus.COMPLETED.value, ApplicationStatus.APPROVED.value, ApplicationStatus.REJECTED.value):
            alert = _create_alert_if_new(
                db, app,
                alert_type=AlertType.INACTIVITY.value,
                severity=AlertSeverity.WARNING.value,
                message=f"INACTIVE: {app.application_number} has had no action for {inactivity_days} days."
            )
            if alert:
                generated.append(alert)

    # ── VERIFICATION PENDING ───────────────────────────────────────────────
    if app.verification_status in ("PENDING",) and app.days_remaining is not None and app.days_remaining <= 5:
        if app.status not in (ApplicationStatus.COMPLETED.value, ApplicationStatus.APPROVED.value, ApplicationStatus.REJECTED.value):
            alert = _create_alert_if_new(
                db, app,
                alert_type=AlertType.VERIFICATION_PENDING.value,
                severity=AlertSeverity.WARNING.value,
                message=f"VERIFICATION: {app.application_number} requires verification with {app.days_remaining} days remaining."
            )
            if alert:
                generated.append(alert)

    return generated


def _create_alert_if_new(
    db: Session,
    app: Application,
    alert_type: str,
    severity: str,
    message: str,
) -> Optional[Alert]:
    """Create an alert only if no unresolved alert of the same type exists for this application."""
    existing = db.query(Alert).filter(
        Alert.application_id == app.id,
        Alert.type == alert_type,
        Alert.resolved_at.is_(None),
    ).first()

    if existing:
        return None

    alert = Alert(
        application_id=app.id,
        type=alert_type,
        severity=severity,
        message=message,
        is_read=False,
        created_at=datetime.utcnow(),
    )
    db.add(alert)
    return alert


def resolve_alerts_for_application(app: Application, db: Session):
    """Resolve all active alerts for an application when it's completed/approved."""
    if app.status in (ApplicationStatus.COMPLETED.value, ApplicationStatus.APPROVED.value):
        active_alerts = db.query(Alert).filter(
            Alert.application_id == app.id,
            Alert.resolved_at.is_(None),
        ).all()

        for alert in active_alerts:
            alert.resolved_at = datetime.utcnow()


def batch_generate_alerts(applications: list, db: Session) -> int:
    """Generate alerts for a batch of applications. Returns count of new alerts."""
    count = 0
    for app in applications:
        alerts = generate_alerts_for_application(app, db)
        count += len(alerts)
    return count
