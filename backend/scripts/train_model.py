"""
SLAngel — ML Model Training Pipeline
Generates synthetic training data and trains a RandomForest classifier
to predict application delays.
"""

import os
import sys
import random
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score

# Ensure project root is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ─── Constants ──────────────────────────────────────────────────────────────

SERVICE_TYPES = [
    "Income Certificate", "Land Mutation", "Caste Certificate",
    "Domicile Certificate", "Birth Certificate", "Death Certificate",
    "Marriage Certificate", "Property Registration", "Building Permit",
    "Trade License",
]

SLA_DAYS_MAP = {
    "Income Certificate": 15,
    "Land Mutation": 30,
    "Caste Certificate": 15,
    "Domicile Certificate": 15,
    "Birth Certificate": 7,
    "Death Certificate": 7,
    "Marriage Certificate": 15,
    "Property Registration": 30,
    "Building Permit": 30,
    "Trade License": 21,
}

STATUS_MAP = {
    "SUBMITTED": 0, "UNDER_REVIEW": 1, "VERIFICATION_PENDING": 2,
    "VERIFICATION_IN_PROGRESS": 3, "DOCUMENTS_REQUIRED": 4,
    "APPROVED": 5, "REJECTED": 6, "COMPLETED": 7,
    "ESCALATED": 8, "DELAYED": 9,
}

VERIFICATION_MAP = {
    "PENDING": 0, "IN_PROGRESS": 1, "VERIFIED": 2,
    "REJECTED": 3, "NEEDS_CORRECTION": 4,
}

ACTIVE_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "VERIFICATION_PENDING",
                   "VERIFICATION_IN_PROGRESS", "DOCUMENTS_REQUIRED",
                   "ESCALATED", "DELAYED"]

TERMINAL_STATUSES = ["APPROVED", "REJECTED", "COMPLETED"]


# ─── Synthetic Data Generation ──────────────────────────────────────────────

def generate_synthetic_data(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generate synthetic historical application data for training.

    Features:
        sla_days, days_elapsed, days_remaining, sla_percentage_used,
        status_encoded, verification_status_encoded, service_type_encoded,
        inactivity_days, document_count, unverified_document_count,
        officer_workload

    Target: delayed (0 or 1)
    """
    records = []

    for _ in range(n_samples):
        service_type = random.choice(SERVICE_TYPES)
        sla_days = SLA_DAYS_MAP[service_type]
        service_encoded = SERVICE_TYPES.index(service_type)

        # Simulate application lifecycle
        is_delayed = random.random() < 0.35  # 35% delay rate

        if is_delayed:
            # Delayed applications tend to have consumed more SLA
            days_elapsed = random.randint(int(sla_days * 0.6), int(sla_days * 1.5))
            status = random.choice(["VERIFICATION_PENDING", "DOCUMENTS_REQUIRED",
                                    "ESCALATED", "DELAYED", "UNDER_REVIEW"])
            verification = random.choice(["PENDING", "IN_PROGRESS", "NEEDS_CORRECTION", "REJECTED"])
            inactivity_days = random.randint(2, 10)
            unverified_ratio = random.uniform(0.3, 1.0)
            officer_workload = random.randint(15, 50)
        else:
            # On-track applications
            days_elapsed = random.randint(0, int(sla_days * 0.7))
            status = random.choice(["SUBMITTED", "UNDER_REVIEW", "VERIFICATION_IN_PROGRESS",
                                    "APPROVED", "COMPLETED"])
            verification = random.choice(["VERIFIED", "IN_PROGRESS", "PENDING"])
            inactivity_days = random.randint(0, 3)
            unverified_ratio = random.uniform(0.0, 0.4)
            officer_workload = random.randint(3, 20)

        days_remaining = max(0, sla_days - days_elapsed)
        sla_percentage_used = min(100.0, (days_elapsed / sla_days * 100)) if sla_days > 0 else 100.0
        status_encoded = STATUS_MAP.get(status, 0)
        verification_encoded = VERIFICATION_MAP.get(verification, 0)

        doc_count = random.randint(1, 6)
        unverified_docs = int(doc_count * unverified_ratio)

        records.append({
            "sla_days": sla_days,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "sla_percentage_used": round(sla_percentage_used, 1),
            "status_encoded": status_encoded,
            "verification_status_encoded": verification_encoded,
            "service_type_encoded": service_encoded,
            "inactivity_days": inactivity_days,
            "document_count": doc_count,
            "unverified_document_count": unverified_docs,
            "officer_workload": officer_workload,
            "delayed": int(is_delayed),
        })

    return pd.DataFrame(records)


# ─── Training Pipeline ─────────────────────────────────────────────────────

def train_model(n_samples: int = 2000, output_dir: str = None):
    """
    Train a RandomForest classifier on synthetic application data.

    Saves the trained model to output_dir/delay_model.pkl.
    """
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "..", "ml_model")

    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "delay_model.pkl")

    print(f"[SLAngel ML] Generating {n_samples} synthetic training samples...")
    df = generate_synthetic_data(n_samples)

    feature_columns = [
        "sla_days", "days_elapsed", "days_remaining", "sla_percentage_used",
        "status_encoded", "verification_status_encoded", "service_type_encoded",
        "inactivity_days", "document_count", "unverified_document_count",
        "officer_workload",
    ]

    X = df[feature_columns].values
    y = df["delayed"].values

    print(f"[SLAngel ML] Dataset: {len(X)} samples, {sum(y)} delayed ({sum(y)/len(y)*100:.1f}%)")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"[SLAngel ML] Training set: {len(X_train)} | Test set: {len(X_test)}")

    # Train RandomForest
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )

    print("[SLAngel ML] Training RandomForest classifier...")
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n[SLAngel ML] Test Accuracy: {accuracy:.4f}")
    print("\n[SLAngel ML] Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["On-Track", "Delayed"]))

    # Cross-validation
    cv_scores = cross_val_score(clf, X, y, cv=5, scoring="accuracy")
    print(f"[SLAngel ML] Cross-Validation: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

    # Feature importance
    importances = clf.feature_importances_
    print("\n[SLAngel ML] Feature Importance:")
    for name, imp in sorted(zip(feature_columns, importances), key=lambda x: -x[1]):
        bar = "*" * int(imp * 50)
        print(f"  {name:35s} {imp:.4f} {bar}")

    # Save model
    joblib.dump(clf, model_path)
    print(f"\n[SLAngel ML] Model saved to {model_path}")
    print(f"[SLAngel ML] Model size: {os.path.getsize(model_path) / 1024:.1f} KB")

    return clf


# ─── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train SLAngel delay prediction model")
    parser.add_argument("--samples", type=int, default=2000, help="Number of synthetic training samples")
    parser.add_argument("--output", type=str, default=None, help="Output directory for the model")
    args = parser.parse_args()

    train_model(n_samples=args.samples, output_dir=args.output)
