"""SLAngel — Pydantic Schemas for Request/Response Validation"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: str = Field(default="OFFICER")


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Officer Schemas ─────────────────────────────────────────────────────────

class OfficerResponse(BaseModel):
    id: int
    name: str
    employee_id: str
    department: str
    district: Optional[str] = None
    title: Optional[str] = None
    context: Optional[str] = None
    role: str
    active: bool
    activeCases: Optional[int] = 0

    class Config:
        from_attributes = True


class OfficerWorkload(BaseModel):
    officer: OfficerResponse
    total_assigned: int = 0
    pending: int = 0
    high_risk: int = 0
    critical: int = 0
    completed: int = 0
    average_processing_time: float = 0.0


# ─── Document Schemas ────────────────────────────────────────────────────────

class DocumentCreate(BaseModel):
    name: str
    verified: bool = False
    size: Optional[str] = None


class DocumentResponse(BaseModel):
    id: int
    name: str
    verified: bool
    size: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Timeline Schemas ────────────────────────────────────────────────────────

class TimelineEventResponse(BaseModel):
    id: int
    title: str
    date: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Application Schemas ────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    applicant_name: str = Field(..., min_length=2, max_length=255)
    applicant_contact: Optional[str] = None
    service_type: str = Field(..., min_length=2)
    department: str = Field(..., min_length=2)
    district: Optional[str] = None
    sla_days: int = Field(default=15, ge=1, le=365)
    submission_date: Optional[datetime] = None
    purpose: Optional[str] = None
    aadhaar_status: Optional[str] = None
    annual_income: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    documents: Optional[List[DocumentCreate]] = []


class ApplicationUpdate(BaseModel):
    applicant_name: Optional[str] = None
    applicant_contact: Optional[str] = None
    service_type: Optional[str] = None
    department: Optional[str] = None
    district: Optional[str] = None
    stage: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    purpose: Optional[str] = None
    aadhaar_status: Optional[str] = None
    annual_income: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str  # application_number
    application_number: Optional[str] = None
    applicantName: str
    applicant_contact: Optional[str] = None
    service: str
    department: str
    district: Optional[str] = None
    stage: Optional[str] = None
    submission_date: Optional[datetime] = None
    expected_completion_date: Optional[datetime] = None
    statutorySLA: int
    daysHeld: int
    daysRemaining: int
    sla_percentage_used: Optional[float] = 0.0
    sla_status: Optional[str] = None
    status: str
    riskLevel: str
    risk_score: Optional[float] = 0.0
    predicted_delay: Optional[bool] = False
    predicted_delay_days: Optional[int] = 0
    prediction_confidence: Optional[float] = 0.0
    risk_factors: Optional[List[str]] = []
    priority: Optional[str] = "NORMAL"
    verification_status: Optional[str] = None
    assignedOfficer: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    officerRole: Optional[str] = None
    phone: Optional[str] = None
    aadhaarStatus: Optional[str] = None
    annualIncome: Optional[str] = None
    purpose: Optional[str] = None
    documents: Optional[List[DocumentResponse]] = []
    timeline: Optional[List[TimelineEventResponse]] = []
    last_action_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    applications: List[ApplicationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─── Verification Schemas ───────────────────────────────────────────────────

class VerificationCreate(BaseModel):
    action: str = Field(..., description="start, complete, reject, needs_correction")
    remarks: Optional[str] = None


class VerificationResponse(BaseModel):
    id: int
    application_id: int
    officer_id: Optional[int] = None
    status: str
    remarks: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Alert Schemas ───────────────────────────────────────────────────────────

class AlertResponse(BaseModel):
    id: int
    application_id: Optional[int] = None
    application_number: Optional[str] = None
    type: str
    severity: str
    message: str
    is_read: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int
    unread_count: int


# ─── Audit Log Schemas ──────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: int
    application_id: Optional[int] = None
    user_id: Optional[int] = None
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    remarks: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ──────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_applications: int = 0
    pending_applications: int = 0
    completed_applications: int = 0
    verification_pending: int = 0
    high_risk: int = 0
    critical_risk: int = 0
    approaching_deadline: int = 0
    breached: int = 0
    sla_breach_rate: float = 0.0
    avg_processing_time: float = 0.0
    sla_compliance_percentage: float = 0.0


class RiskDistribution(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0
    critical: int = 0


class StatusDistribution(BaseModel):
    status: str
    count: int


class DepartmentPerformance(BaseModel):
    department: str
    total: int = 0
    completed: int = 0
    pending: int = 0
    high_risk: int = 0
    avg_processing_time: float = 0.0
    sla_compliance: float = 0.0


# ─── Risk Prediction Schema ─────────────────────────────────────────────────

class RiskPrediction(BaseModel):
    risk_score: float
    risk_level: str
    predicted_delay: bool
    predicted_delay_days: int
    confidence: float
    reasons: List[str]
    prediction_source: str = "rule_based"  # or "ml_model"


# ─── Import Schemas ─────────────────────────────────────────────────────────

class ImportResult(BaseModel):
    total_rows: int = 0
    imported: int = 0
    failed: int = 0
    errors: List[str] = []


# ─── API Response Wrapper ───────────────────────────────────────────────────

class APIResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[dict] = None


class APIError(BaseModel):
    success: bool = False
    error: str
    code: str
