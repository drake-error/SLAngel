"""SLAngel — Test Suite: Risk Engine"""

import sys
import os
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base
from app.models.models import (
    Application, Document, ApplicationStatus, VerificationStatus,
    RiskLevel, SLAStatus
)
from app.services.risk_engine import calculate_risk, _classify_risk_level


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
        "application_number": f"RISK-TEST-{id(kwargs)}",
        "applicant_name": "Risk Test",
        "service_type": "Income Certificate",
        "department": "Revenue",
        "sla_days": 15,
        "days_held": 5,
        "days_remaining": 10,
        "sla_percentage_used": 33.3,
        "sla_status": SLAStatus.SAFE.value,
        "status": ApplicationStatus.SUBMITTED.value,
        "verification_status": VerificationStatus.PENDING.value,
        "risk_score": 0.0,
        "risk_level": RiskLevel.LOW.value,
        "predicted_delay": False,
        "created_at": datetime.utcnow() - timedelta(days=5),
        "last_action_date": datetime.utcnow() - timedelta(days=1),
        "assigned_officer_id": None,
    }
    defaults.update(kwargs)
    app = Application(**defaults)
    db_session.add(app)
    db_session.commit()
    return app


class TestRiskCalculation:
    def test_low_risk_application(self, db_session):
        app = _make_app(
            db_session,
            days_remaining=12,
            sla_days=15,
            status=ApplicationStatus.UNDER_REVIEW.value,
            verification_status=VerificationStatus.VERIFIED.value,
            last_action_date=datetime.utcnow(),
        )
        result = calculate_risk(app)

        assert result["risk_score"] < 31
        assert result["risk_level"] == "LOW"
        assert isinstance(result["reasons"], list)

    def test_high_risk_approaching_deadline(self, db_session):
        app = _make_app(
            db_session,
            days_remaining=1,
            sla_days=15,
            status=ApplicationStatus.ESCALATED.value,
            verification_status=VerificationStatus.PENDING.value,
            last_action_date=datetime.utcnow() - timedelta(days=5),
        )
        result = calculate_risk(app)

        assert result["risk_score"] >= 61
        assert result["risk_level"] in ("HIGH", "CRITICAL")
        assert len(result["reasons"]) > 0

    def test_critical_risk_breached(self, db_session):
        app = _make_app(
            db_session,
            days_remaining=0,
            sla_days=15,
            sla_status=SLAStatus.BREACHED.value,
            status=ApplicationStatus.ESCALATED.value,
            verification_status=VerificationStatus.REJECTED.value,
            last_action_date=datetime.utcnow() - timedelta(days=7),
        )
        db_session.flush()

        doc = Document(application_id=app.id, name="Income Proof", verified=False)
        db_session.add(doc)
        db_session.commit()
        db_session.refresh(app)

        result = calculate_risk(app)

        assert result["risk_score"] >= 81
        assert result["risk_level"] == "CRITICAL"
        assert any("breach" in r.lower() for r in result["reasons"])

    def test_risk_factors_present(self, db_session):
        app = _make_app(
            db_session,
            days_remaining=1,
            sla_days=15,
            status=ApplicationStatus.ESCALATED.value,
            verification_status=VerificationStatus.PENDING.value,
            last_action_date=datetime.utcnow() - timedelta(days=5),
        )
        result = calculate_risk(app)

        assert "factors" in result
        assert len(result["factors"]) > 0
        for factor in result["factors"]:
            assert "factor" in factor
            assert "score" in factor
            assert "description" in factor

    def test_document_risk_factor(self, db_session):
        app = _make_app(db_session, application_number="RISK-DOC-TEST")
        db_session.flush()

        # Add documents to the app
        for i in range(4):
            doc = Document(
                application_id=app.id,
                name=f"Doc {i}",
                verified=(i < 1),  # Only 1 out of 4 verified
            )
            db_session.add(doc)
        db_session.commit()
        db_session.refresh(app)

        result = calculate_risk(app)

        doc_factors = [f for f in result["factors"] if "Document" in f["factor"]]
        assert len(doc_factors) > 0

    def test_inactivity_risk_factor(self, db_session):
        app = _make_app(
            db_session,
            last_action_date=datetime.utcnow() - timedelta(days=7),
            status=ApplicationStatus.UNDER_REVIEW.value,
        )
        result = calculate_risk(app)

        inactivity_factors = [f for f in result["factors"] if "Inactivity" in f["factor"]]
        assert len(inactivity_factors) > 0

    def test_no_risk_for_safe_application(self, db_session):
        app = _make_app(
            db_session,
            days_remaining=14,
            sla_days=15,
            status=ApplicationStatus.UNDER_REVIEW.value,
            verification_status=VerificationStatus.VERIFIED.value,
            last_action_date=datetime.utcnow(),
        )
        result = calculate_risk(app)

        assert result["risk_score"] < 20
        assert result["risk_level"] == "LOW"

    def test_risk_score_capped_at_100(self, db_session):
        app = _make_app(
            db_session,
            application_number="RISK-CAP-TEST",
            days_remaining=0,
            sla_days=15,
            sla_status=SLAStatus.BREACHED.value,
            status=ApplicationStatus.ESCALATED.value,
            verification_status=VerificationStatus.REJECTED.value,
            last_action_date=datetime.utcnow() - timedelta(days=10),
        )
        db_session.flush()

        # Add many unverified docs
        for i in range(10):
            doc = Document(
                application_id=app.id,
                name=f"Doc {i}",
                verified=False,
            )
            db_session.add(doc)
        db_session.commit()
        db_session.refresh(app)

        result = calculate_risk(app)
        assert result["risk_score"] <= 100


class TestRiskClassification:
    def test_low_classification(self):
        assert _classify_risk_level(0) == "LOW"
        assert _classify_risk_level(15) == "LOW"
        assert _classify_risk_level(30) == "LOW"

    def test_medium_classification(self):
        assert _classify_risk_level(31) == "MEDIUM"
        assert _classify_risk_level(45) == "MEDIUM"
        assert _classify_risk_level(60) == "MEDIUM"

    def test_high_classification(self):
        assert _classify_risk_level(61) == "HIGH"
        assert _classify_risk_level(70) == "HIGH"
        assert _classify_risk_level(80) == "HIGH"

    def test_critical_classification(self):
        assert _classify_risk_level(81) == "CRITICAL"
        assert _classify_risk_level(95) == "CRITICAL"
        assert _classify_risk_level(100) == "CRITICAL"
