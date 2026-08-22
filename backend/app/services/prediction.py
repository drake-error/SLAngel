"""SLAngel — Hybrid Delay Prediction Service (ML + Rule-Based Fallback)"""

import os
import json
import joblib
import numpy as np
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.models import Application, ApplicationStatus, VerificationStatus
from app.services.risk_engine import calculate_risk
from app.schemas.schemas import RiskPrediction


# ─── ML Model Management ────────────────────────────────────────────────────

_ml_model = None
_model_loaded = False


def load_ml_model():
    """Attempt to load the trained ML model from disk."""
    global _ml_model, _model_loaded
    model_path = os.getenv("MODEL_PATH", "./ml_model/delay_model.pkl")
    if os.path.exists(model_path):
        try:
            _ml_model = joblib.load(model_path)
            _model_loaded = True
            print(f"[SLAngel] ML model loaded from {model_path}")
        except Exception as e:
            print(f"[SLAngel] Failed to load ML model: {e}")
            _ml_model = None
            _model_loaded = False
    else:
        print(f"[SLAngel] No ML model found at {model_path} — using rule-based prediction")
        _model_loaded = False


def is_ml_available() -> bool:
    """Check if ML model is loaded and available."""
    return _model_loaded and _ml_model is not None


# ─── Feature Engineering ────────────────────────────────────────────────────

SERVICE_TYPE_MAP = {
    "Income Certificate": 0,
    "Land Mutation": 1,
    "Caste Certificate": 2,
    "Domicile Certificate": 3,
    "Birth Certificate": 4,
    "Death Certificate": 5,
    "Marriage Certificate": 6,
    "Property Registration": 7,
    "Building Permit": 8,
    "Trade License": 9,
}

STATUS_MAP = {
    "SUBMITTED": 0,
    "UNDER_REVIEW": 1,
    "VERIFICATION_PENDING": 2,
    "VERIFICATION_IN_PROGRESS": 3,
    "DOCUMENTS_REQUIRED": 4,
    "APPROVED": 5,
    "REJECTED": 6,
    "COMPLETED": 7,
    "ESCALATED": 8,
    "DELAYED": 9,
}

VERIFICATION_MAP = {
    "PENDING": 0,
    "IN_PROGRESS": 1,
    "VERIFIED": 2,
    "REJECTED": 3,
    "NEEDS_CORRECTION": 4,
}


def extract_features(app: Application, db: Optional[Session] = None) -> list:
    """
    Extract ML features from an application.
    
    Features:
        [0] sla_days
        [1] days_elapsed (days_held)
        [2] days_remaining
        [3] sla_percentage_used
        [4] status_encoded
        [5] verification_status_encoded
        [6] service_type_encoded
        [7] inactivity_days
        [8] document_count
        [9] unverified_document_count
        [10] officer_workload (active cases)
    """
    now = datetime.utcnow()

    sla_days = app.sla_days or 15
    days_elapsed = app.days_held or 0
    days_remaining = app.days_remaining or 0
    sla_pct = app.sla_percentage_used or 0.0

    status_encoded = STATUS_MAP.get(app.status, 0)
    verif_encoded = VERIFICATION_MAP.get(app.verification_status, 0)
    service_encoded = SERVICE_TYPE_MAP.get(app.service_type, len(SERVICE_TYPE_MAP))

    # Inactivity
    last_action = app.last_action_date or app.created_at or now
    inactivity_days = (now - last_action).days

    # Documents
    doc_count = len(app.documents) if app.documents else 0
    unverified_docs = sum(1 for d in app.documents if not d.verified) if app.documents else 0

    # Officer workload
    officer_workload = 0
    if db and app.assigned_officer_id:
        officer_workload = db.query(Application).filter(
            Application.assigned_officer_id == app.assigned_officer_id,
            Application.status.notin_([
                ApplicationStatus.COMPLETED.value,
                ApplicationStatus.APPROVED.value,
                ApplicationStatus.REJECTED.value,
            ])
        ).count()

    return [
        sla_days,
        days_elapsed,
        days_remaining,
        sla_pct,
        status_encoded,
        verif_encoded,
        service_encoded,
        inactivity_days,
        doc_count,
        unverified_docs,
        officer_workload,
    ]


# ─── ML Prediction ──────────────────────────────────────────────────────────

def predict_with_ml(app: Application, db: Optional[Session] = None) -> dict:
    """
    Predict delay using the trained ML model.
    
    Returns dict matching RiskPrediction schema.
    """
    features = extract_features(app, db)
    features_array = np.array([features])

    try:
        prediction = _ml_model.predict(features_array)[0]  # 0 or 1
        probabilities = _ml_model.predict_proba(features_array)[0]
        confidence = float(max(probabilities))

        predicted_delay = bool(prediction == 1)

        # Estimate delay days based on SLA consumption
        predicted_delay_days = 0
        if predicted_delay:
            sla_pct = features[3]
            days_remaining = features[2]
            if days_remaining <= 0:
                predicted_delay_days = max(1, abs(days_remaining))
            else:
                predicted_delay_days = max(1, int(days_remaining * 0.6))

        # Get risk score from risk engine for consistency
        risk_result = calculate_risk(app, db)

        # Build reasons combining ML and rule insights
        reasons = risk_result["reasons"]

        return {
            "risk_score": risk_result["risk_score"],
            "risk_level": risk_result["risk_level"],
            "predicted_delay": predicted_delay,
            "predicted_delay_days": predicted_delay_days,
            "confidence": round(confidence, 2),
            "reasons": reasons,
            "prediction_source": "ml_model",
        }
    except Exception as e:
        print(f"[SLAngel] ML prediction failed, falling back: {e}")
        return predict_with_rules(app, db)


# ─── Rule-Based Prediction ──────────────────────────────────────────────────

def predict_with_rules(app: Application, db: Optional[Session] = None) -> dict:
    """
    Rule-based delay prediction as a reliable fallback.
    
    This always works even without a trained ML model.
    """
    risk_result = calculate_risk(app, db)
    risk_score = risk_result["risk_score"]
    reasons = risk_result["reasons"]

    # Determine predicted delay based on risk score
    predicted_delay = risk_score >= 60
    predicted_delay_days = 0

    if predicted_delay:
        if risk_score >= 90:
            predicted_delay_days = max(1, app.sla_days // 3) if app.sla_days else 5
        elif risk_score >= 75:
            predicted_delay_days = max(1, app.sla_days // 5) if app.sla_days else 3
        else:
            predicted_delay_days = max(1, app.sla_days // 7) if app.sla_days else 2

    # Confidence based on how many risk factors are present
    factor_count = len(risk_result.get("factors", []))
    confidence = min(0.95, 0.5 + (factor_count * 0.1))

    return {
        "risk_score": risk_score,
        "risk_level": risk_result["risk_level"],
        "predicted_delay": predicted_delay,
        "predicted_delay_days": predicted_delay_days,
        "confidence": round(confidence, 2),
        "reasons": reasons,
        "prediction_source": "rule_based",
    }


# ─── Main Prediction API ────────────────────────────────────────────────────

def predict_delay(app: Application, db: Optional[Session] = None) -> RiskPrediction:
    """
    Main prediction function — uses ML if available, falls back to rules.
    
    This is the function that should be called by API endpoints.
    """
    if is_ml_available():
        result = predict_with_ml(app, db)
    else:
        result = predict_with_rules(app, db)

    return RiskPrediction(**result)


def update_application_prediction(app: Application, db: Optional[Session] = None) -> Application:
    """Update an application's prediction fields in-place."""
    prediction = predict_delay(app, db)
    app.risk_score = prediction.risk_score
    app.risk_level = prediction.risk_level
    app.predicted_delay = prediction.predicted_delay
    app.predicted_delay_days = prediction.predicted_delay_days
    app.prediction_confidence = prediction.confidence
    app.risk_factors = json.dumps(prediction.reasons)
    return app
