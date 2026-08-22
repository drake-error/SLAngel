"""SLAngel — Test Suite: Alert Engine"""

import sys
import os
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base
from app.models.models import (
    Application, Alert, AlertType, AlertSeverity,
    ApplicationStatus, VerificationStatus, RiskLevel, SLAStatus, Priority
)
from app.services.alert_engine import (
    generate_alerts_for_application, resolve_alerts_for_application,
    batch_generate_alerts
)


@pytest.fixture
def db_session():
    """Create a fresh in-memory database for each test."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def _create_app(db_session, **kwargs):
    """Helper to create and persist a test application."""
    defaults = {
        "application_number": f"ALERT-{id(kwargs)}",
        "applicant_name": "Alert Test",
        "service_type": "Income Certificate",
        "department": "Revenue",
        "sla_days": 15,
        "days_held": 5,
        "days_remaining": 10,
        "sla_percentage_used": 33.3,
        "sla_status": SLAStatus.SAFE.value,
        "status": ApplicationStatus.SUBMITTED.value,
        "verification_status": VerificationStatus.PENDING.value,
        "risk_score": 20.0,
        "risk_level": RiskLevel.LOW.value,
        "priority": Priority.NORMAL.value,
        "predicted_delay": False,
        "submission_date": datetime.utcnow() - timedelta(days=5),
        "created_at": datetime.utcnow() - timedelta(days=5),
        "last_action_date": datetime.utcnow(),
    }
    defaults.update(kwargs)
    app = Application(**defaults)
    db_session.add(app)
    db_session.commit()
    return app


class TestAlertGeneration:
    def test_critical_risk_alert(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-CRIT-001",
            risk_level=RiskLevel.CRITICAL.value,
            risk_score=90.0,
        )
        alerts = generate_alerts_for_application(app, db_session)
        db_session.commit()

        critical_alerts = [a for a in alerts if a.type == AlertType.CRITICAL_RISK.value]
        assert len(critical_alerts) >= 1
        assert critical_alerts[0].severity == AlertSeverity.CRITICAL.value

    def test_high_risk_alert(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-HIGH-001",
            risk_level=RiskLevel.HIGH.value,
            risk_score=70.0,
        )
        alerts = generate_alerts_for_application(app, db_session)
        db_session.commit()

        high_alerts = [a for a in alerts if a.type == AlertType.HIGH_RISK.value]
        assert len(high_alerts) >= 1

    def test_deadline_approaching_alert(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-DEADLINE-001",
            days_remaining=2,
            status=ApplicationStatus.UNDER_REVIEW.value,
        )
        alerts = generate_alerts_for_application(app, db_session)
        db_session.commit()

        deadline_alerts = [a for a in alerts if a.type == AlertType.DEADLINE_APPROACHING.value]
        assert len(deadline_alerts) >= 1

    def test_sla_breach_alert(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-BREACH-001",
            sla_status=SLAStatus.BREACHED.value,
            days_remaining=0,
            status=ApplicationStatus.DELAYED.value,
        )
        alerts = generate_alerts_for_application(app, db_session)
        db_session.commit()

        breach_alerts = [a for a in alerts if a.type == AlertType.SLA_BREACHED.value]
        assert len(breach_alerts) >= 1

    def test_inactivity_alert(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-INACTIVE-001",
            last_action_date=datetime.utcnow() - timedelta(days=5),
            status=ApplicationStatus.UNDER_REVIEW.value,
        )
        alerts = generate_alerts_for_application(app, db_session)
        db_session.commit()

        inactivity_alerts = [a for a in alerts if a.type == AlertType.INACTIVITY.value]
        assert len(inactivity_alerts) >= 1

    def test_no_duplicate_alerts(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-NODUP-001",
            risk_level=RiskLevel.CRITICAL.value,
            risk_score=90.0,
        )

        # Generate twice
        alerts1 = generate_alerts_for_application(app, db_session)
        db_session.commit()
        alerts2 = generate_alerts_for_application(app, db_session)
        db_session.commit()

        # Second call should not create duplicates
        total = db_session.query(Alert).filter(
            Alert.application_id == app.id,
            Alert.type == AlertType.CRITICAL_RISK.value,
        ).count()
        assert total == 1

    def test_no_alerts_for_safe_application(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-SAFE-001",
            risk_level=RiskLevel.LOW.value,
            risk_score=10.0,
            days_remaining=12,
            sla_status=SLAStatus.SAFE.value,
            verification_status=VerificationStatus.VERIFIED.value,
            last_action_date=datetime.utcnow(),
        )
        alerts = generate_alerts_for_application(app, db_session)
        db_session.commit()

        assert len(alerts) == 0


class TestAlertResolution:
    def test_resolve_on_completion(self, db_session):
        app = _create_app(
            db_session,
            application_number="ALERT-RESOLVE-001",
            risk_level=RiskLevel.CRITICAL.value,
            risk_score=90.0,
        )

        # Generate alerts
        generate_alerts_for_application(app, db_session)
        db_session.commit()

        # Complete the application
        app.status = ApplicationStatus.COMPLETED.value
        resolve_alerts_for_application(app, db_session)
        db_session.commit()

        # All alerts should be resolved
        active = db_session.query(Alert).filter(
            Alert.application_id == app.id,
            Alert.resolved_at.is_(None),
        ).count()
        assert active == 0


class TestBatchAlerts:
    def test_batch_generate(self, db_session):
        apps = []
        for i in range(3):
            app = _create_app(
                db_session,
                application_number=f"ALERT-BATCH-{i}",
                risk_level=RiskLevel.HIGH.value,
                risk_score=70.0,
            )
            apps.append(app)

        count = batch_generate_alerts(apps, db_session)
        db_session.commit()

        assert count >= 3  # At least one alert per high-risk app
