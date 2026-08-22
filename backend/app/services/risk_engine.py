"""SLAngel — Risk Engine: Transparent, Multi-Factor Risk Scoring"""

import json
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.models import (
    Application, Officer, ApplicationStatus, VerificationStatus,
    RiskLevel, SLAStatus
)


def calculate_risk(application: Application, db: Optional[Session] = None) -> dict:
    """
    Calculate transparent risk score for an application.
    
    Risk Score: 0-100
        0-30   → LOW
        31-60  → MEDIUM
        61-80  → HIGH
        81-100 → CRITICAL
    
    Returns:
        {
            "risk_score": float,
            "risk_level": str,
            "factors": [{"factor": str, "score": float, "description": str}],
            "reasons": [str]
        }
    """
    factors = []
    reasons = []
    total_score = 0.0

    # ── Factor 1: SLA Pressure (max 35 points) ─────────────────────────────
    sla_score = _calculate_sla_pressure(application)
    if sla_score > 0:
        factors.append({
            "factor": "SLA Pressure",
            "score": sla_score,
            "description": f"{application.days_remaining} days remaining of {application.sla_days} day SLA"
        })
        if application.days_remaining <= 1:
            reasons.append(f"Only {application.days_remaining} day(s) remaining until SLA deadline")
        elif application.days_remaining <= 3:
            reasons.append(f"Only {application.days_remaining} days remaining — approaching deadline")
    total_score += sla_score

    # ── Factor 2: Application State (max 20 points) ────────────────────────
    state_score = _calculate_state_risk(application)
    if state_score > 0:
        factors.append({
            "factor": "Application State",
            "score": state_score,
            "description": f"Status: {application.status}, Verification: {application.verification_status}"
        })
        if application.verification_status in (VerificationStatus.PENDING.value, VerificationStatus.IN_PROGRESS.value):
            reasons.append("Verification is still pending")
        if application.status == ApplicationStatus.DOCUMENTS_REQUIRED.value:
            reasons.append("Documents are still required from applicant")
        if application.status == ApplicationStatus.ESCALATED.value:
            reasons.append("Application has been escalated")
    total_score += state_score

    # ── Factor 3: Inactivity (max 20 points) ───────────────────────────────
    inactivity_score, inactivity_days = _calculate_inactivity_risk(application)
    if inactivity_score > 0:
        factors.append({
            "factor": "Inactivity",
            "score": inactivity_score,
            "description": f"No action for {inactivity_days} day(s)"
        })
        if inactivity_days >= 3:
            reasons.append(f"Application has remained inactive for {inactivity_days} days")
    total_score += inactivity_score

    # ── Factor 4: Officer Workload (max 10 points) ─────────────────────────
    workload_score = 0.0
    if db and application.assigned_officer_id:
        workload_score = _calculate_workload_risk(application, db)
        if workload_score > 0:
            factors.append({
                "factor": "Officer Workload",
                "score": workload_score,
                "description": "Assigned officer has high active case count"
            })
            if workload_score >= 7:
                reasons.append("Assigned officer has excessive workload")
    total_score += workload_score

    # ── Factor 5: Document Verification (max 10 points) ────────────────────
    doc_score = _calculate_document_risk(application)
    if doc_score > 0:
        factors.append({
            "factor": "Unverified Documents",
            "score": doc_score,
            "description": "Some documents are not yet verified"
        })
        reasons.append("Some required documents are not yet verified")
    total_score += doc_score

    # ── Factor 6: SLA Breach Status (max 5 points) ─────────────────────────
    if application.sla_status == SLAStatus.BREACHED.value:
        breach_score = 5.0
        total_score += breach_score
        factors.append({
            "factor": "SLA Breached",
            "score": breach_score,
            "description": "Application has already breached its SLA deadline"
        })
        reasons.append("SLA deadline has already been breached")

    # ── Cap and classify ───────────────────────────────────────────────────
    risk_score = min(100.0, max(0.0, total_score))
    risk_level = _classify_risk_level(risk_score)

    if not reasons:
        reasons.append("Application is within normal processing parameters")

    return {
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "factors": factors,
        "reasons": reasons,
    }


def _calculate_sla_pressure(app: Application) -> float:
    """SLA pressure: higher score as deadline approaches. Max 35 points."""
    sla_days = app.sla_days or 15
    days_remaining = app.days_remaining if app.days_remaining is not None else sla_days

    if days_remaining <= 0:
        return 35.0  # Breached

    remaining_pct = days_remaining / sla_days if sla_days > 0 else 0

    if remaining_pct <= 0.1:
        return 32.0
    elif remaining_pct <= 0.2:
        return 28.0
    elif remaining_pct <= 0.3:
        return 22.0
    elif remaining_pct <= 0.4:
        return 15.0
    elif remaining_pct <= 0.5:
        return 10.0
    elif remaining_pct <= 0.7:
        return 5.0
    else:
        return 0.0


def _calculate_state_risk(app: Application) -> float:
    """Risk from application state. Max 20 points."""
    score = 0.0

    # Verification status
    if app.verification_status == VerificationStatus.PENDING.value:
        score += 10.0
    elif app.verification_status == VerificationStatus.IN_PROGRESS.value:
        score += 5.0
    elif app.verification_status == VerificationStatus.REJECTED.value:
        score += 8.0
    elif app.verification_status == VerificationStatus.NEEDS_CORRECTION.value:
        score += 7.0

    # Application status
    if app.status == ApplicationStatus.DOCUMENTS_REQUIRED.value:
        score += 8.0
    elif app.status == ApplicationStatus.ESCALATED.value:
        score += 10.0
    elif app.status == ApplicationStatus.DELAYED.value:
        score += 6.0

    return min(20.0, score)


def _calculate_inactivity_risk(app: Application) -> tuple:
    """Risk from inactivity. Max 20 points. Returns (score, inactivity_days)."""
    now = datetime.utcnow()
    last_action = app.last_action_date or app.created_at or now
    inactivity_days = (now - last_action).days

    if inactivity_days >= 7:
        return 20.0, inactivity_days
    elif inactivity_days >= 5:
        return 15.0, inactivity_days
    elif inactivity_days >= 3:
        return 10.0, inactivity_days
    elif inactivity_days >= 2:
        return 5.0, inactivity_days
    else:
        return 0.0, inactivity_days


def _calculate_workload_risk(app: Application, db: Session) -> float:
    """Risk from officer workload. Max 10 points."""
    if not app.assigned_officer_id:
        return 5.0  # Unassigned is risky

    active_count = db.query(Application).filter(
        Application.assigned_officer_id == app.assigned_officer_id,
        Application.status.notin_([
            ApplicationStatus.COMPLETED.value,
            ApplicationStatus.APPROVED.value,
            ApplicationStatus.REJECTED.value,
        ])
    ).count()

    if active_count >= 40:
        return 10.0
    elif active_count >= 25:
        return 7.0
    elif active_count >= 15:
        return 4.0
    else:
        return 0.0


def _calculate_document_risk(app: Application) -> float:
    """Risk from unverified documents. Max 10 points."""
    if not app.documents:
        return 0.0

    total_docs = len(app.documents)
    unverified = sum(1 for d in app.documents if not d.verified)

    if total_docs == 0:
        return 0.0

    unverified_ratio = unverified / total_docs
    if unverified_ratio >= 0.5:
        return 10.0
    elif unverified_ratio > 0:
        return 5.0
    return 0.0


def _classify_risk_level(score: float) -> str:
    """Classify risk score into a level."""
    if score >= 81:
        return RiskLevel.CRITICAL.value
    elif score >= 61:
        return RiskLevel.HIGH.value
    elif score >= 31:
        return RiskLevel.MEDIUM.value
    else:
        return RiskLevel.LOW.value


def update_application_risk(app: Application, db: Optional[Session] = None) -> Application:
    """Update an application's risk fields in-place."""
    result = calculate_risk(app, db)
    app.risk_score = result["risk_score"]
    app.risk_level = result["risk_level"]
    app.risk_factors = json.dumps(result["reasons"])
    return app
