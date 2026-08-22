"""SLAngel — Priority Engine: Application Priority Assignment"""

from app.models.models import Application, Priority, RiskLevel, SLAStatus, ApplicationStatus


def calculate_priority(app: Application) -> str:
    """
    Calculate application priority based on multiple factors.
    
    Priority levels: LOW, NORMAL, HIGH, URGENT, CRITICAL
    """
    score = 0

    # Factor 1: Risk score contribution (0-40 points)
    risk_score = app.risk_score or 0
    if risk_score >= 81:
        score += 40
    elif risk_score >= 61:
        score += 30
    elif risk_score >= 31:
        score += 15
    else:
        score += 5

    # Factor 2: Deadline proximity (0-30 points)
    days_remaining = app.days_remaining if app.days_remaining is not None else 999
    if days_remaining <= 0:
        score += 30  # Breached
    elif days_remaining <= 1:
        score += 25
    elif days_remaining <= 3:
        score += 20
    elif days_remaining <= 5:
        score += 10
    else:
        score += 0

    # Factor 3: SLA status (0-15 points)
    if app.sla_status == SLAStatus.BREACHED.value:
        score += 15
    elif app.sla_status == SLAStatus.URGENT.value:
        score += 10
    elif app.sla_status == SLAStatus.WATCH.value:
        score += 5

    # Factor 4: Application status (0-15 points)
    if app.status == ApplicationStatus.ESCALATED.value:
        score += 15
    elif app.status == ApplicationStatus.DELAYED.value:
        score += 10
    elif app.status == ApplicationStatus.DOCUMENTS_REQUIRED.value:
        score += 5

    # Classify priority
    if score >= 80:
        return Priority.CRITICAL.value
    elif score >= 60:
        return Priority.URGENT.value
    elif score >= 40:
        return Priority.HIGH.value
    elif score >= 20:
        return Priority.NORMAL.value
    else:
        return Priority.LOW.value


def update_application_priority(app: Application) -> Application:
    """Update an application's priority in-place."""
    app.priority = calculate_priority(app)
    return app
