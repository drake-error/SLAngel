"""SLAngel — Test Suite: SLA Engine"""

import sys
import os
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base
from app.models.models import Application, ApplicationStatus, VerificationStatus, SLAStatus
from app.services.sla_engine import (
    calculate_sla_metrics, update_application_sla,
    batch_update_sla, get_approaching_deadline_apps, get_breached_apps
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


def _make_app(db_session, **kwargs):
    """Helper to create and persist a test application in the DB."""
    defaults = {
        "application_number": f"SLA-TEST-{id(kwargs)}",
        "applicant_name": "SLA Test",
        "service_type": "Income Certificate",
        "department": "Revenue",
        "sla_days": 15,
        "status": ApplicationStatus.SUBMITTED.value,
        "verification_status": VerificationStatus.PENDING.value,
        "submission_date": datetime.utcnow() - timedelta(days=5),
        "created_at": datetime.utcnow() - timedelta(days=5),
    }
    defaults.update(kwargs)
    app = Application(**defaults)
    db_session.add(app)
    db_session.commit()
    return app


class TestSLAMetrics:
    def test_normal_application(self, db_session):
        app = _make_app(
            db_session,
            submission_date=datetime.utcnow() - timedelta(days=5),
            sla_days=15,
        )
        metrics = calculate_sla_metrics(app)

        assert metrics["days_elapsed"] == 5
        assert metrics["days_remaining"] == 10
        assert 30.0 <= metrics["sla_percentage_used"] <= 40.0
        assert metrics["sla_status"] == SLAStatus.SAFE.value

    def test_approaching_deadline(self, db_session):
        app = _make_app(
            db_session,
            submission_date=datetime.utcnow() - timedelta(days=13),
            sla_days=15,
        )
        metrics = calculate_sla_metrics(app)

        assert metrics["days_remaining"] <= 2
        assert metrics["sla_status"] == SLAStatus.URGENT.value

    def test_breached_application(self, db_session):
        app = _make_app(
            db_session,
            submission_date=datetime.utcnow() - timedelta(days=20),
            sla_days=15,
        )
        metrics = calculate_sla_metrics(app)

        assert metrics["days_remaining"] == 0
        assert metrics["sla_status"] == SLAStatus.BREACHED.value
        assert metrics["sla_percentage_used"] == 100.0

    def test_completed_application_within_sla(self, db_session):
        app = _make_app(
            db_session,
            submission_date=datetime.utcnow() - timedelta(days=5),
            sla_days=15,
            status=ApplicationStatus.COMPLETED.value,
        )
        metrics = calculate_sla_metrics(app)

        assert metrics["sla_status"] == SLAStatus.SAFE.value

    def test_watch_status(self, db_session):
        app = _make_app(
            db_session,
            submission_date=datetime.utcnow() - timedelta(days=10),
            sla_days=15,
        )
        metrics = calculate_sla_metrics(app)

        assert metrics["days_remaining"] == 5
        # Depending on verification status, could be WATCH or SAFE
        assert metrics["sla_status"] in (SLAStatus.WATCH.value, SLAStatus.SAFE.value)

    def test_zero_sla_days(self, db_session):
        app = _make_app(db_session, sla_days=0)
        metrics = calculate_sla_metrics(app)

        assert metrics["sla_percentage_used"] == 100.0

    def test_brand_new_application(self, db_session):
        app = _make_app(
            db_session,
            submission_date=datetime.utcnow(),
            sla_days=15,
        )
        metrics = calculate_sla_metrics(app)

        assert metrics["days_elapsed"] == 0
        assert metrics["days_remaining"] >= 14
        assert metrics["sla_status"] == SLAStatus.SAFE.value


class TestUpdateSLA:
    def test_update_application_sla(self, db_session):
        app = _make_app(
            db_session,
            submission_date=datetime.utcnow() - timedelta(days=5),
            sla_days=15,
        )
        updated = update_application_sla(app)

        assert updated.days_held == 5
        assert updated.days_remaining == 10
        assert updated.sla_status == SLAStatus.SAFE.value

    def test_batch_update(self, db_session):
        apps = [
            _make_app(
                db_session,
                application_number=f"BATCH-{i}",
                submission_date=datetime.utcnow() - timedelta(days=i * 5),
                sla_days=15,
            )
            for i in range(4)
        ]
        updated = batch_update_sla(apps)

        assert len(updated) == 4
        assert all(hasattr(a, "sla_status") for a in updated)


class TestDeadlineFilters:
    def test_approaching_deadline_filter(self, db_session):
        apps = []
        for i, remaining in enumerate([1, 2, 3, 5, 10]):
            app = _make_app(
                db_session,
                application_number=f"DEADLINE-{i}",
                sla_days=15,
                status=ApplicationStatus.UNDER_REVIEW.value,
            )
            app.days_remaining = remaining
            apps.append(app)

        approaching = get_approaching_deadline_apps(apps, threshold_days=3)
        assert len(approaching) == 3  # days_remaining: 1, 2, 3

    def test_breached_filter(self, db_session):
        apps = []
        for i, (sla_stat, status) in enumerate([
            (SLAStatus.BREACHED.value, ApplicationStatus.UNDER_REVIEW.value),
            (SLAStatus.BREACHED.value, ApplicationStatus.COMPLETED.value),
            (SLAStatus.SAFE.value, ApplicationStatus.SUBMITTED.value),
            (SLAStatus.BREACHED.value, ApplicationStatus.ESCALATED.value),
        ]):
            app = _make_app(
                db_session,
                application_number=f"BREACH-{i}",
                sla_status=sla_stat,
                status=status,
            )
            apps.append(app)

        breached = get_breached_apps(apps)
        assert len(breached) == 2  # Excludes COMPLETED
