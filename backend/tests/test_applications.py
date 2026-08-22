"""SLAngel — Test Suite: Application CRUD & Workflow"""

import sys
import os
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base
from app.models.models import (
    Application, User, Officer, Document, Alert,
    ApplicationStatus, VerificationStatus, RiskLevel, SLAStatus, Priority
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


@pytest.fixture
def sample_officer(db_session):
    """Create a test officer."""
    officer = Officer(
        name="Test Officer",
        employee_id="TEST001",
        department="Revenue",
        district="Chennai",
        role="OFFICER",
        active=True,
    )
    db_session.add(officer)
    db_session.commit()
    return officer


@pytest.fixture
def sample_application(db_session, sample_officer):
    """Create a test application."""
    app = Application(
        application_number="APP-TEST-001",
        applicant_name="Test Applicant",
        applicant_contact="9876543210",
        service_type="Income Certificate",
        department="Revenue",
        district="Chennai",
        sla_days=15,
        days_held=5,
        days_remaining=10,
        status=ApplicationStatus.SUBMITTED.value,
        verification_status=VerificationStatus.PENDING.value,
        assigned_officer_id=sample_officer.id,
        priority=Priority.NORMAL.value,
        risk_score=0.0,
        risk_level=RiskLevel.LOW.value,
        submission_date=datetime.utcnow() - timedelta(days=5),
        created_at=datetime.utcnow() - timedelta(days=5),
        last_action_date=datetime.utcnow() - timedelta(days=1),
    )
    db_session.add(app)
    db_session.commit()
    return app


class TestApplicationCreation:
    def test_create_application(self, db_session, sample_officer):
        app = Application(
            application_number="APP-CREATE-001",
            applicant_name="John Doe",
            service_type="Land Mutation",
            department="Revenue",
            sla_days=30,
            status=ApplicationStatus.SUBMITTED.value,
            assigned_officer_id=sample_officer.id,
        )
        db_session.add(app)
        db_session.commit()

        fetched = db_session.query(Application).filter_by(
            application_number="APP-CREATE-001"
        ).first()
        assert fetched is not None
        assert fetched.applicant_name == "John Doe"
        assert fetched.sla_days == 30
        assert fetched.status == "SUBMITTED"

    def test_application_number_unique(self, db_session, sample_officer):
        app1 = Application(
            application_number="APP-UNIQUE-001",
            applicant_name="User A",
            service_type="Income Certificate",
            department="Revenue",
            sla_days=15,
        )
        app2 = Application(
            application_number="APP-UNIQUE-001",
            applicant_name="User B",
            service_type="Land Mutation",
            department="Revenue",
            sla_days=30,
        )
        db_session.add(app1)
        db_session.commit()
        db_session.add(app2)

        with pytest.raises(Exception):
            db_session.commit()
        db_session.rollback()

    def test_application_defaults(self, db_session):
        app = Application(
            application_number="APP-DEFAULT-001",
            applicant_name="Default Test",
            service_type="Birth Certificate",
            department="Health",
        )
        db_session.add(app)
        db_session.commit()

        assert app.status == ApplicationStatus.SUBMITTED.value
        assert app.verification_status == VerificationStatus.PENDING.value
        assert app.risk_level == RiskLevel.LOW.value
        assert app.priority == Priority.NORMAL.value
        assert app.sla_days == 15

    def test_application_with_documents(self, db_session):
        app = Application(
            application_number="APP-DOCS-001",
            applicant_name="Doc Test",
            service_type="Income Certificate",
            department="Revenue",
        )
        db_session.add(app)
        db_session.flush()

        doc1 = Document(application_id=app.id, name="Aadhaar Card", verified=True, size="2MB")
        doc2 = Document(application_id=app.id, name="Income Proof", verified=False, size="1MB")
        db_session.add_all([doc1, doc2])
        db_session.commit()

        assert len(app.documents) == 2
        assert app.documents[0].name == "Aadhaar Card"
        assert app.documents[0].verified is True
        assert app.documents[1].verified is False


class TestApplicationStatusTransitions:
    def test_submit_to_review(self, sample_application, db_session):
        sample_application.status = ApplicationStatus.UNDER_REVIEW.value
        db_session.commit()
        assert sample_application.status == "UNDER_REVIEW"

    def test_review_to_verification(self, sample_application, db_session):
        sample_application.status = ApplicationStatus.VERIFICATION_PENDING.value
        sample_application.verification_status = VerificationStatus.IN_PROGRESS.value
        db_session.commit()
        assert sample_application.status == "VERIFICATION_PENDING"
        assert sample_application.verification_status == "IN_PROGRESS"

    def test_approve_application(self, sample_application, db_session):
        sample_application.status = ApplicationStatus.APPROVED.value
        sample_application.verification_status = VerificationStatus.VERIFIED.value
        db_session.commit()
        assert sample_application.status == "APPROVED"

    def test_reject_application(self, sample_application, db_session):
        sample_application.status = ApplicationStatus.REJECTED.value
        sample_application.verification_status = VerificationStatus.REJECTED.value
        db_session.commit()
        assert sample_application.status == "REJECTED"


class TestApplicationQueries:
    def test_filter_by_risk_level(self, db_session, sample_officer):
        for i, risk in enumerate(["LOW", "MEDIUM", "HIGH", "CRITICAL"]):
            app = Application(
                application_number=f"APP-RISK-{i}",
                applicant_name=f"Risk {risk}",
                service_type="Income Certificate",
                department="Revenue",
                risk_level=risk,
            )
            db_session.add(app)
        db_session.commit()

        high_risk = db_session.query(Application).filter(
            Application.risk_level.in_(["HIGH", "CRITICAL"])
        ).all()
        assert len(high_risk) == 2

    def test_filter_active_applications(self, db_session):
        statuses = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "COMPLETED", "REJECTED"]
        for i, status in enumerate(statuses):
            app = Application(
                application_number=f"APP-STATUS-{i}",
                applicant_name=f"Status {status}",
                service_type="Income Certificate",
                department="Revenue",
                status=status,
            )
            db_session.add(app)
        db_session.commit()

        active = db_session.query(Application).filter(
            Application.status.notin_(["COMPLETED", "APPROVED", "REJECTED"])
        ).all()
        assert len(active) == 2  # SUBMITTED, UNDER_REVIEW

    def test_filter_by_department(self, db_session):
        for i, dept in enumerate(["Revenue", "Revenue", "Health", "Education"]):
            app = Application(
                application_number=f"APP-DEPT-{dept}-{i}",
                applicant_name="Dept Test",
                service_type="Income Certificate",
                department=dept,
            )
            db_session.add(app)
        db_session.commit()

        revenue = db_session.query(Application).filter(
            Application.department == "Revenue"
        ).all()
        assert len(revenue) == 2
