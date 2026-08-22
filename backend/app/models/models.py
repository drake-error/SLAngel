"""SLAngel — SQLAlchemy Database Models"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


# ─── Enums ───────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    OFFICER = "OFFICER"
    SUPERVISOR = "SUPERVISOR"


class ApplicationStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"
    VERIFICATION_IN_PROGRESS = "VERIFICATION_IN_PROGRESS"
    DOCUMENTS_REQUIRED = "DOCUMENTS_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    ESCALATED = "ESCALATED"
    DELAYED = "DELAYED"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    NEEDS_CORRECTION = "NEEDS_CORRECTION"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Priority(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"


class SLAStatus(str, enum.Enum):
    SAFE = "SAFE"
    WATCH = "WATCH"
    URGENT = "URGENT"
    BREACHED = "BREACHED"


class AlertType(str, enum.Enum):
    HIGH_RISK = "HIGH_RISK"
    CRITICAL_RISK = "CRITICAL_RISK"
    DEADLINE_APPROACHING = "DEADLINE_APPROACHING"
    SLA_BREACHED = "SLA_BREACHED"
    INACTIVITY = "INACTIVITY"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"


class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


# ─── User Model ──────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.OFFICER.value, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    officer = relationship("Officer", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")


# ─── Officer Model ───────────────────────────────────────────────────────────

class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    name = Column(String(255), nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(255), nullable=False)
    district = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    context = Column(String(255), nullable=True)
    role = Column(String(20), default=UserRole.OFFICER.value, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="officer")
    applications = relationship("Application", back_populates="officer")
    verifications = relationship("Verification", back_populates="officer")


# ─── Application Model ──────────────────────────────────────────────────────

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_number = Column(String(50), unique=True, index=True, nullable=False)
    applicant_name = Column(String(255), nullable=False)
    applicant_contact = Column(String(100), nullable=True)
    service_type = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=False, index=True)
    district = Column(String(255), nullable=True)
    stage = Column(String(255), nullable=True)
    submission_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    expected_completion_date = Column(DateTime, nullable=True)
    sla_days = Column(Integer, nullable=False, default=15)
    days_held = Column(Integer, default=0)
    days_remaining = Column(Integer, default=0)
    sla_percentage_used = Column(Float, default=0.0)
    sla_status = Column(String(20), default=SLAStatus.SAFE.value)
    status = Column(String(30), default=ApplicationStatus.SUBMITTED.value, index=True)
    verification_status = Column(String(30), default=VerificationStatus.PENDING.value)
    assigned_officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True, index=True)
    priority = Column(String(20), default=Priority.NORMAL.value, index=True)
    risk_score = Column(Float, default=0.0, index=True)
    risk_level = Column(String(20), default=RiskLevel.LOW.value, index=True)
    predicted_delay = Column(Boolean, default=False)
    predicted_delay_days = Column(Integer, default=0)
    prediction_confidence = Column(Float, default=0.0)
    risk_factors = Column(Text, nullable=True)  # JSON string of risk factor reasons
    purpose = Column(Text, nullable=True)
    aadhaar_status = Column(String(100), nullable=True)
    annual_income = Column(String(100), nullable=True)
    last_action_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    officer = relationship("Officer", back_populates="applications")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    verifications = relationship("Verification", back_populates="application", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="application", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="application", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="application", cascade="all, delete-orphan",
                                   order_by="TimelineEvent.created_at")

    __table_args__ = (
        Index("ix_app_risk_status", "risk_level", "status"),
        Index("ix_app_dept_status", "department", "status"),
    )


# ─── Document Model ─────────────────────────────────────────────────────────

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    name = Column(String(500), nullable=False)
    verified = Column(Boolean, default=False)
    size = Column(String(50), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="documents")


# ─── Timeline Event Model ───────────────────────────────────────────────────

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    title = Column(Text, nullable=False)
    date_label = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="timeline_events")


# ─── Verification Model ─────────────────────────────────────────────────────

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, index=True)
    officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    status = Column(String(30), default=VerificationStatus.PENDING.value)
    remarks = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="verifications")
    officer = relationship("Officer", back_populates="verifications")


# ─── Audit Log Model ────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    application = relationship("Application", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")


# ─── Alert Model ────────────────────────────────────────────────────────────

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False, index=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="alerts")
