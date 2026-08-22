"""SLAngel — Recommendation Engine: Actionable Suggestions for Officers

Generates recommended actions based on:
  Risk Level + Delay Reason + Bottleneck + Deadline → Analyse Condition → Select Suitable Action

Decision Flow:
  High/Critical Risk + Stage Delay       → Escalate
  High Risk + Officer Overload           → Reassign
  Medium Risk + Deadline Approaching     → Add Resources / Prioritise
  Low Risk + Normal Progress             → Continue Monitoring
"""

import json
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.models import (
    Application, Officer, ApplicationStatus, VerificationStatus,
    RiskLevel, SLAStatus, Priority
)


def generate_recommendation(app: Application, db: Optional[Session] = None) -> dict:
    """
    Generate a recommended action for an application based on its current state.

    Returns:
        {
            "action": str,           # Escalate / Reassign / Prioritise / Continue Monitoring
            "severity": str,         # critical / high / medium / low
            "title": str,            # Short action title
            "description": str,      # Detailed explanation
            "reasons": [str],        # Why this action is recommended
            "quick_actions": [str],  # Buttons the officer can click
        }
    """
    risk_level = app.risk_level or RiskLevel.LOW.value
    risk_score = app.risk_score or 0
    days_remaining = app.days_remaining if app.days_remaining is not None else 999
    sla_status = app.sla_status or SLAStatus.SAFE.value
    status = app.status or ApplicationStatus.SUBMITTED.value
    verification_status = app.verification_status or VerificationStatus.PENDING.value

    # Calculate inactivity
    now = datetime.utcnow()
    last_action = app.last_action_date or app.created_at or now
    inactivity_days = (now - last_action).days

    # Check officer workload
    officer_overloaded = False
    if db and app.assigned_officer_id:
        active_count = db.query(Application).filter(
            Application.assigned_officer_id == app.assigned_officer_id,
            Application.status.notin_([
                ApplicationStatus.COMPLETED.value,
                ApplicationStatus.APPROVED.value,
                ApplicationStatus.REJECTED.value,
            ])
        ).count()
        officer_overloaded = active_count >= 20

    # Detect bottlenecks
    stage_delay = inactivity_days >= 3
    docs_pending = verification_status in (
        VerificationStatus.PENDING.value,
        VerificationStatus.NEEDS_CORRECTION.value,
    )
    docs_rejected = verification_status == VerificationStatus.REJECTED.value
    is_breached = sla_status == SLAStatus.BREACHED.value
    is_escalated = status == ApplicationStatus.ESCALATED.value
    is_completed = status in (
        ApplicationStatus.COMPLETED.value,
        ApplicationStatus.APPROVED.value,
        ApplicationStatus.REJECTED.value,
    )

    # ── Decision Logic ──────────────────────────────────────────────────────

    # Completed applications
    if is_completed:
        return {
            "action": "No Action Required",
            "severity": "low",
            "title": "Application Processed",
            "description": "This application has been processed and no further action is needed.",
            "reasons": [f"Application status: {status}"],
            "quick_actions": [],
        }

    # CRITICAL / HIGH risk scenarios
    if risk_level in (RiskLevel.CRITICAL.value, RiskLevel.HIGH.value):

        # SLA already breached → Escalate immediately
        if is_breached:
            return {
                "action": "Escalate",
                "severity": "critical",
                "title": "Immediate Escalation Required",
                "description": (
                    f"SLA deadline has been breached. Application has been pending for "
                    f"{app.days_held or 0} days against a {app.sla_days}-day SLA. "
                    f"Immediate supervisor intervention is required."
                ),
                "reasons": [
                    "SLA deadline has already been breached",
                    f"Risk score: {risk_score:.0f}/100 ({risk_level})",
                    f"Application inactive for {inactivity_days} day(s)",
                ],
                "quick_actions": ["Escalate to Supervisor", "Reassign Officer"],
            }

        # Officer overloaded → Reassign
        if officer_overloaded:
            return {
                "action": "Reassign",
                "severity": "high",
                "title": "Reassign to Available Officer",
                "description": (
                    "The assigned officer has too many active cases. Reassigning to a "
                    "less loaded officer will speed up processing and prevent SLA breach."
                ),
                "reasons": [
                    "Assigned officer has excessive workload",
                    f"Only {days_remaining} day(s) remaining before SLA deadline",
                    f"Risk score: {risk_score:.0f}/100 ({risk_level})",
                ],
                "quick_actions": ["Reassign Officer", "Escalate to Supervisor"],
            }

        # Stage delay (inactivity) → Escalate
        if stage_delay:
            stage_name = app.stage or status
            return {
                "action": "Escalate",
                "severity": "high",
                "title": "Escalate — Stage Processing Delay",
                "description": (
                    f"{stage_name} has exceeded its expected processing time. "
                    f"Application has been inactive for {inactivity_days} days "
                    f"and only {days_remaining} day(s) remain before the SLA deadline."
                ),
                "reasons": [
                    f"Application stuck in '{stage_name}' for {inactivity_days} days",
                    f"Only {days_remaining} day(s) remaining before SLA deadline",
                    f"Risk score: {risk_score:.0f}/100 ({risk_level})",
                ],
                "quick_actions": ["Escalate to Supervisor", "Fast-Track Processing"],
            }

        # Documents issue → Request documents
        if docs_rejected:
            return {
                "action": "Escalate",
                "severity": "high",
                "title": "Document Verification Failed — Escalate",
                "description": (
                    "Document verification has been rejected. The applicant needs to "
                    "resubmit corrected documents urgently to prevent SLA breach."
                ),
                "reasons": [
                    "Document verification rejected",
                    f"Only {days_remaining} day(s) remaining",
                    f"Risk score: {risk_score:.0f}/100 ({risk_level})",
                ],
                "quick_actions": ["Notify Applicant", "Escalate to Supervisor"],
            }

        # Generic high risk → Prioritise
        return {
            "action": "Prioritise",
            "severity": "high",
            "title": "Prioritise for Immediate Processing",
            "description": (
                f"Application has a {risk_level.lower()} risk score of {risk_score:.0f}/100 "
                f"with only {days_remaining} day(s) remaining. Fast-track processing is recommended."
            ),
            "reasons": [
                f"Risk level: {risk_level} ({risk_score:.0f}/100)",
                f"Only {days_remaining} day(s) remaining before SLA deadline",
            ],
            "quick_actions": ["Fast-Track Processing", "Escalate to Supervisor"],
        }

    # MEDIUM risk scenarios
    if risk_level == RiskLevel.MEDIUM.value:

        if days_remaining <= 5:
            return {
                "action": "Prioritise",
                "severity": "medium",
                "title": "Add Resources / Prioritise",
                "description": (
                    f"Application is approaching its SLA deadline with {days_remaining} day(s) "
                    f"remaining. Consider adding resources or fast-tracking to prevent breach."
                ),
                "reasons": [
                    f"SLA deadline approaching: {days_remaining} day(s) remaining",
                    f"Risk score: {risk_score:.0f}/100 (Medium)",
                    "Proactive intervention recommended to prevent escalation",
                ],
                "quick_actions": ["Fast-Track Processing", "Assign Additional Officer"],
            }

        if docs_pending:
            return {
                "action": "Prioritise",
                "severity": "medium",
                "title": "Document Verification Pending",
                "description": (
                    "Documents are awaiting verification. Completing verification "
                    "promptly will reduce risk and keep the application on track."
                ),
                "reasons": [
                    f"Verification status: {verification_status}",
                    f"{days_remaining} day(s) remaining before SLA deadline",
                    f"Risk score: {risk_score:.0f}/100 (Medium)",
                ],
                "quick_actions": ["Start Verification", "Request Documents"],
            }

        if stage_delay:
            return {
                "action": "Prioritise",
                "severity": "medium",
                "title": "Monitor Closely — Inactivity Detected",
                "description": (
                    f"Application has been inactive for {inactivity_days} days. "
                    f"While {days_remaining} days remain, continued inactivity may escalate risk."
                ),
                "reasons": [
                    f"No action for {inactivity_days} days",
                    f"Risk score: {risk_score:.0f}/100 (Medium)",
                ],
                "quick_actions": ["Resume Processing", "Assign Additional Officer"],
            }

        return {
            "action": "Continue Monitoring",
            "severity": "medium",
            "title": "Monitor Progress",
            "description": (
                f"Application has medium risk ({risk_score:.0f}/100) but still has "
                f"{days_remaining} days remaining. Continue monitoring for changes."
            ),
            "reasons": [
                f"Risk score: {risk_score:.0f}/100 (Medium)",
                f"{days_remaining} day(s) remaining — within acceptable range",
            ],
            "quick_actions": ["View Details"],
        }

    # LOW risk — normal processing
    return {
        "action": "Continue Monitoring",
        "severity": "low",
        "title": "Normal Processing — No Intervention Needed",
        "description": (
            "Application is progressing normally within expected timelines. "
            "No immediate action is required."
        ),
        "reasons": [
            f"Risk score: {risk_score:.0f}/100 (Low)",
            f"{days_remaining} day(s) remaining — well within SLA",
            "Application is within normal processing parameters",
        ],
        "quick_actions": ["View Details"],
    }
