"""
SLAngel — Seed Script: Populate database with realistic demo data.

Run: python -m scripts.seed
"""

import sys
import os

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from app.database import engine, SessionLocal, Base
from app.models.models import (
    User, Officer, Application, Document, TimelineEvent,
    AuditLog, Alert, ApplicationStatus, VerificationStatus,
    RiskLevel, SLAStatus, AlertType, AlertSeverity
)
from app.auth.auth import hash_password
from app.services.sla_engine import update_application_sla
from app.services.prediction import update_application_prediction
from app.services.priority_engine import update_application_priority
from app.services.alert_engine import generate_alerts_for_application


def seed():
    """Seed the database with realistic demo data."""
    print("[SLAngel Seed] Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).first():
            print("[SLAngel Seed] Database already contains data. Clearing...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        now = datetime.utcnow()

        # ── Create Users ────────────────────────────────────────────────────
        print("[SLAngel Seed] Creating users...")
        users = [
            User(username="rahul.sharma", email="rahul@gov.in", hashed_password=hash_password("admin123"),
                 full_name="Rahul Sharma", role="SUPERVISOR"),
            User(username="ananya.rao", email="ananya@gov.in", hashed_password=hash_password("officer123"),
                 full_name="Ananya Rao", role="OFFICER"),
            User(username="vikram.singh", email="vikram@gov.in", hashed_password=hash_password("officer123"),
                 full_name="Vikram Singh", role="OFFICER"),
            User(username="priya.mehta", email="priya@gov.in", hashed_password=hash_password("admin123"),
                 full_name="Priya Mehta", role="ADMIN"),
            User(username="meera.sen", email="meera@gov.in", hashed_password=hash_password("officer123"),
                 full_name="Meera Sen", role="OFFICER"),
        ]
        for u in users:
            db.add(u)
        db.flush()

        # ── Create Officers ─────────────────────────────────────────────────
        print("[SLAngel Seed] Creating officers...")
        officers = [
            Officer(user_id=users[0].id, name="Rahul Sharma", employee_id="EMP-0001",
                    department="Revenue & Land Records", district="All Districts (Supervisory)",
                    title="Senior Revenue Officer (Tahsildar)", context="Officer Context", role="SUPERVISOR"),
            Officer(user_id=users[1].id, name="Ananya Rao", employee_id="EMP-0002",
                    department="Revenue & Land Records", district="North District",
                    title="Verification Officer", context="Desk Context", role="OFFICER"),
            Officer(user_id=users[2].id, name="Vikram Singh", employee_id="EMP-0003",
                    department="Revenue & Land Records", district="North & East District",
                    title="Field Inspector (Patwari)", context="Field Inspection", role="OFFICER"),
            Officer(user_id=users[3].id, name="Priya Mehta", employee_id="EMP-0004",
                    department="Administration", district="State Headquarters",
                    title="District Collector (DM)", context="Apex Executive", role="ADMIN"),
            Officer(user_id=users[4].id, name="Meera Sen", employee_id="EMP-0005",
                    department="Social Justice & Welfare", district="West & Central District",
                    title="Verification Assistant", context="Intake Desk", role="OFFICER"),
        ]
        for o in officers:
            db.add(o)
        db.flush()

        # ── Create Applications ──────────────────────────────────────────────
        print("[SLAngel Seed] Creating applications...")

        applications_data = [
            # ── CRITICAL RISK: 1 day remaining, pending verification ─────────
            {
                "number": "REV-24-1092",
                "name": "Rameshwar Patil",
                "contact": "+91 98450 12891",
                "service": "Income Certificate",
                "dept": "Revenue & Land Records",
                "district": "North District",
                "stage": "Document Verification",
                "submitted": now - timedelta(days=14),
                "sla": 15,
                "status": ApplicationStatus.VERIFICATION_IN_PROGRESS.value,
                "verif": VerificationStatus.IN_PROGRESS.value,
                "officer_idx": 1,
                "purpose": "Higher Education Scholarship Scheme (Post-Matric)",
                "aadhaar": "DigiLocker Verified",
                "income": "₹ 1,80,000",
                "docs": [
                    ("Income_Declaration_Affidavit_2026.pdf", True, "1.2 MB"),
                    ("Salary_Slip_Employer_Attested.pdf", False, "840 KB"),
                    ("Ration_Card_Family_Sheet.pdf", True, "2.4 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=14), "Application submitted via citizen portal"),
                    (now - timedelta(days=11), "Assigned to North District Tahsil Desk"),
                    (now - timedelta(days=4), "Document verification initiated by Ananya Rao"),
                    (now - timedelta(hours=2), "SLA AI Alert: 24 Hours to statutory breach deadline"),
                ],
            },
            # ── HIGH RISK: 3 days remaining, field verification pending ──────
            {
                "number": "REV-24-1105",
                "name": "Kavita Sundaram",
                "contact": "+91 97112 88402",
                "service": "Land Mutation",
                "dept": "Revenue & Land Records",
                "district": "North District",
                "stage": "Field Verification",
                "submitted": now - timedelta(days=27),
                "sla": 30,
                "status": ApplicationStatus.VERIFICATION_PENDING.value,
                "verif": VerificationStatus.PENDING.value,
                "officer_idx": 2,
                "purpose": "Agricultural Land Title Transfer (Survey No. 44/2)",
                "aadhaar": "Biometric Authenticated",
                "income": "N/A (Land Deed)",
                "docs": [
                    ("Registered_Sale_Deed_7_12_Extract.pdf", True, "3.6 MB"),
                    ("No_Encumbrance_Certificate.pdf", True, "1.8 MB"),
                    ("Field_Boundary_Survey_Map.dwg.pdf", False, "4.1 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=27), "Application received for Mutation"),
                    (now - timedelta(days=23), "Notice published for 15-day public objections"),
                    (now - timedelta(days=8), "No objections received, sent for Field Inspection"),
                    (now - timedelta(days=1), "Patwari spot verification report pending submission"),
                ],
            },
            # ── HIGH RISK: 2 days remaining, pending approval ────────────────
            {
                "number": "REV-24-1150",
                "name": "Suresh Kumar Gupta",
                "contact": "+91 99014 55193",
                "service": "Caste Certificate",
                "dept": "Social Justice & Welfare",
                "district": "Central District",
                "stage": "Approval",
                "submitted": now - timedelta(days=8),
                "sla": 10,
                "status": ApplicationStatus.VERIFICATION_IN_PROGRESS.value,
                "verif": VerificationStatus.IN_PROGRESS.value,
                "officer_idx": 0,
                "purpose": "State Civil Services Examination Reservation",
                "aadhaar": "DigiLocker Verified",
                "income": "₹ 3,20,000",
                "docs": [
                    ("Father_Caste_Certificate_1984_Record.pdf", True, "2.1 MB"),
                    ("School_Leaving_Certificate_Pedigree.pdf", True, "1.5 MB"),
                    ("Panchayat_Verification_Resolution.pdf", True, "1.1 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=8), "Application filed online"),
                    (now - timedelta(days=6), "Field inspection completed & recommended"),
                    (now - timedelta(days=2), "Pending final Tahsildar digital signature"),
                ],
            },
            # ── MEDIUM RISK: 5 days remaining ───────────────────────────────
            {
                "number": "REV-24-1201",
                "name": "Aman Deep Singh",
                "contact": "+91 98110 33419",
                "service": "Domicile Certificate",
                "dept": "Revenue & Land Records",
                "district": "West District",
                "stage": "Document Verification",
                "submitted": now - timedelta(days=5),
                "sla": 10,
                "status": ApplicationStatus.UNDER_REVIEW.value,
                "verif": VerificationStatus.PENDING.value,
                "officer_idx": 4,
                "purpose": "University State Quota Seat Admission",
                "aadhaar": "DigiLocker Verified",
                "income": "N/A",
                "docs": [
                    ("10_Years_Residence_Proof_Electricity_Bills.pdf", True, "4.8 MB"),
                    ("Voter_ID_Both_Parents.pdf", True, "1.9 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=5), "Application submitted"),
                    (now - timedelta(days=3), "Document verification desk assigned"),
                ],
            },
            # ── BREACHED SLA: Deadline passed ────────────────────────────────
            {
                "number": "REV-24-0987",
                "name": "Lakshmi Devi Nair",
                "contact": "+91 94481 77620",
                "service": "Income Certificate",
                "dept": "Revenue & Land Records",
                "district": "East District",
                "stage": "Document Verification",
                "submitted": now - timedelta(days=20),
                "sla": 15,
                "status": ApplicationStatus.VERIFICATION_PENDING.value,
                "verif": VerificationStatus.PENDING.value,
                "officer_idx": 1,
                "purpose": "Below Poverty Line (BPL) Ration Card Application",
                "aadhaar": "Pending Verification",
                "income": "₹ 90,000",
                "docs": [
                    ("Self_Declaration_Income.pdf", False, "1.1 MB"),
                    ("Gram_Panchayat_Certificate.pdf", False, "800 KB"),
                ],
                "timeline": [
                    (now - timedelta(days=20), "Application submitted"),
                    (now - timedelta(days=17), "Assigned to verification desk"),
                    (now - timedelta(days=5), "SLA AI Alert: Deadline breached"),
                ],
            },
            # ── LOW RISK: Plenty of time ─────────────────────────────────────
            {
                "number": "REV-24-1220",
                "name": "Arjun Krishnamurthy",
                "contact": "+91 99876 44210",
                "service": "Birth Certificate",
                "dept": "Revenue & Land Records",
                "district": "South District",
                "stage": "Under Review",
                "submitted": now - timedelta(days=2),
                "sla": 21,
                "status": ApplicationStatus.SUBMITTED.value,
                "verif": VerificationStatus.PENDING.value,
                "officer_idx": 4,
                "purpose": "Passport Application (Minor)",
                "aadhaar": "DigiLocker Verified",
                "income": "N/A",
                "docs": [
                    ("Hospital_Birth_Record.pdf", True, "2.3 MB"),
                    ("Parent_Marriage_Certificate.pdf", True, "1.6 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=2), "Application submitted online"),
                    (now - timedelta(days=1), "Document pre-check passed"),
                ],
            },
            # ── COMPLETED application ────────────────────────────────────────
            {
                "number": "REV-24-0952",
                "name": "Deepa Mehta",
                "contact": "+91 98765 43210",
                "service": "Domicile Certificate",
                "dept": "Revenue & Land Records",
                "district": "Central District",
                "stage": "Completed",
                "submitted": now - timedelta(days=12),
                "sla": 15,
                "status": ApplicationStatus.APPROVED.value,
                "verif": VerificationStatus.VERIFIED.value,
                "officer_idx": 0,
                "purpose": "State Government Job Application",
                "aadhaar": "Biometric Authenticated",
                "income": "₹ 4,50,000",
                "docs": [
                    ("Residence_Proof_10_Years.pdf", True, "3.4 MB"),
                    ("Voter_Card_Copy.pdf", True, "1.2 MB"),
                    ("Electricity_Bill_Address.pdf", True, "900 KB"),
                ],
                "timeline": [
                    (now - timedelta(days=12), "Application submitted"),
                    (now - timedelta(days=10), "Assigned to verification desk"),
                    (now - timedelta(days=6), "Field verification completed"),
                    (now - timedelta(days=3), "Approved by Tahsildar Rahul Sharma"),
                    (now - timedelta(days=3), "Digital certificate issued to citizen"),
                ],
            },
            # ── CRITICAL: Inactive + pending + 1 day ────────────────────────
            {
                "number": "REV-24-1180",
                "name": "Mohammed Farhan Sheikh",
                "contact": "+91 97009 22345",
                "service": "Property Registration",
                "dept": "Revenue & Land Records",
                "district": "North District",
                "stage": "Document Verification",
                "submitted": now - timedelta(days=28),
                "sla": 30,
                "status": ApplicationStatus.DOCUMENTS_REQUIRED.value,
                "verif": VerificationStatus.NEEDS_CORRECTION.value,
                "officer_idx": 2,
                "purpose": "Residential Property Transfer & Stamp Duty",
                "aadhaar": "Pending Verification",
                "income": "₹ 8,50,000",
                "docs": [
                    ("Sale_Agreement_Notarized.pdf", True, "5.2 MB"),
                    ("Encumbrance_Certificate.pdf", False, "2.1 MB"),
                    ("Property_Tax_Receipt.pdf", False, "1.4 MB"),
                    ("Seller_NOC_Society.pdf", False, "1.8 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=28), "Application for property registration"),
                    (now - timedelta(days=24), "Assigned to Vikram Singh for field verification"),
                    (now - timedelta(days=15), "Documents found incomplete — correction requested"),
                    (now - timedelta(days=7), "No response from applicant — documents still pending"),
                ],
            },
            # ── MEDIUM: Documents required ──────────────────────────────────
            {
                "number": "REV-24-1195",
                "name": "Priyanka Reddy",
                "contact": "+91 98765 11233",
                "service": "Marriage Certificate",
                "dept": "Revenue & Land Records",
                "district": "Central District",
                "stage": "Documents Required",
                "submitted": now - timedelta(days=7),
                "sla": 15,
                "status": ApplicationStatus.DOCUMENTS_REQUIRED.value,
                "verif": VerificationStatus.PENDING.value,
                "officer_idx": 4,
                "purpose": "Spouse Visa Application (Germany)",
                "aadhaar": "DigiLocker Verified",
                "income": "N/A",
                "docs": [
                    ("Marriage_Invitation_Card.pdf", True, "3.1 MB"),
                    ("Wedding_Photographs.pdf", True, "8.5 MB"),
                    ("Witness_Affidavit.pdf", False, "1.2 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=7), "Application submitted"),
                    (now - timedelta(days=5), "Assigned for verification"),
                    (now - timedelta(days=2), "Additional witness affidavit required"),
                ],
            },
            # ── LOW: Recently submitted ──────────────────────────────────────
            {
                "number": "REV-24-1250",
                "name": "Rajesh Khatri",
                "contact": "+91 88765 99012",
                "service": "Caste Certificate",
                "dept": "Social Justice & Welfare",
                "district": "West District",
                "stage": "Submission",
                "submitted": now - timedelta(days=1),
                "sla": 10,
                "status": ApplicationStatus.SUBMITTED.value,
                "verif": VerificationStatus.PENDING.value,
                "officer_idx": 4,
                "purpose": "Government Scholarship Application",
                "aadhaar": "DigiLocker Verified",
                "income": "₹ 2,10,000",
                "docs": [
                    ("Parent_Caste_Certificate.pdf", True, "1.8 MB"),
                    ("School_Records.pdf", True, "2.2 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=1), "Application submitted online"),
                ],
            },
            # ── COMPLETED: Within SLA ────────────────────────────────────────
            {
                "number": "REV-24-0910",
                "name": "Sunita Bai Yadav",
                "contact": "+91 91234 56789",
                "service": "Income Certificate",
                "dept": "Revenue & Land Records",
                "district": "South District",
                "stage": "Completed",
                "submitted": now - timedelta(days=10),
                "sla": 15,
                "status": ApplicationStatus.COMPLETED.value,
                "verif": VerificationStatus.VERIFIED.value,
                "officer_idx": 0,
                "purpose": "Subsidized Housing Scheme Application",
                "aadhaar": "Biometric Authenticated",
                "income": "₹ 1,20,000",
                "docs": [
                    ("Income_Proof_Employer.pdf", True, "1.5 MB"),
                    ("Ration_Card.pdf", True, "2.0 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=10), "Application submitted"),
                    (now - timedelta(days=7), "Verification completed"),
                    (now - timedelta(days=3), "Approved and certificate issued"),
                ],
            },
            # ── HIGH: Escalated application ──────────────────────────────────
            {
                "number": "REV-24-1160",
                "name": "Gopal Narayan Joshi",
                "contact": "+91 94567 88901",
                "service": "Land Mutation",
                "dept": "Revenue & Land Records",
                "district": "East District",
                "stage": "Escalated",
                "submitted": now - timedelta(days=25),
                "sla": 30,
                "status": ApplicationStatus.ESCALATED.value,
                "verif": VerificationStatus.IN_PROGRESS.value,
                "officer_idx": 3,
                "purpose": "Inheritance Land Transfer after Father's Demise",
                "aadhaar": "DigiLocker Verified",
                "income": "N/A (Inheritance)",
                "docs": [
                    ("Death_Certificate_Father.pdf", True, "1.9 MB"),
                    ("Legal_Heir_Certificate.pdf", True, "2.3 MB"),
                    ("Land_Revenue_Records.pdf", False, "4.5 MB"),
                ],
                "timeline": [
                    (now - timedelta(days=25), "Application filed for inheritance mutation"),
                    (now - timedelta(days=20), "Assigned to North District office"),
                    (now - timedelta(days=10), "Dispute raised by neighboring plot owner"),
                    (now - timedelta(days=3), "Escalated to District Collector for resolution"),
                ],
            },
        ]

        created_apps = []
        for app_data in applications_data:
            application = Application(
                application_number=app_data["number"],
                applicant_name=app_data["name"],
                applicant_contact=app_data["contact"],
                service_type=app_data["service"],
                department=app_data["dept"],
                district=app_data["district"],
                stage=app_data["stage"],
                submission_date=app_data["submitted"],
                sla_days=app_data["sla"],
                status=app_data["status"],
                verification_status=app_data["verif"],
                assigned_officer_id=officers[app_data["officer_idx"]].id,
                purpose=app_data["purpose"],
                aadhaar_status=app_data["aadhaar"],
                annual_income=app_data["income"],
                last_action_date=app_data["timeline"][-1][0] if app_data["timeline"] else now,
                created_at=app_data["submitted"],
                updated_at=now,
            )
            db.add(application)
            db.flush()

            # Add documents
            for doc_name, verified, size in app_data["docs"]:
                doc = Document(
                    application_id=application.id,
                    name=doc_name,
                    verified=verified,
                    size=size,
                )
                db.add(doc)

            # Add timeline events
            for event_date, event_title in app_data["timeline"]:
                timeline = TimelineEvent(
                    application_id=application.id,
                    title=event_title,
                    date_label=event_date.strftime("%d %b %Y"),
                    created_at=event_date,
                )
                db.add(timeline)

            # Add initial audit log
            audit = AuditLog(
                application_id=application.id,
                action="Application created",
                new_value=app_data["number"],
                remarks=f"Seeded: {app_data['service']} application",
                timestamp=app_data["submitted"],
            )
            db.add(audit)

            created_apps.append(application)

        db.flush()

        # ── Calculate SLA, Risk, Priority, and Generate Alerts ───────────────
        print("[SLAngel Seed] Calculating SLA, risk, predictions, and alerts...")
        for app in created_apps:
            # Reload to get relationships
            db.refresh(app)
            update_application_sla(app)
            update_application_prediction(app, db)
            update_application_priority(app)
            generate_alerts_for_application(app, db)

        db.commit()

        # ── Print Summary ────────────────────────────────────────────────────
        print("\n" + "=" * 60)
        print("  SLAngel Database Seeded Successfully!")
        print("=" * 60)
        print(f"  Users:        {len(users)}")
        print(f"  Officers:     {len(officers)}")
        print(f"  Applications: {len(created_apps)}")

        alert_count = db.query(Alert).count()
        print(f"  Alerts:       {alert_count}")

        print("\n  Demo Login Credentials:")
        print("  ─────────────────────────────────────")
        print("  Admin:      rahul.sharma / admin123")
        print("  Officer:    ananya.rao / officer123")
        print("  Inspector:  vikram.singh / officer123")
        print("  Collector:  priya.mehta / admin123")
        print("  Assistant:  meera.sen / officer123")
        print("=" * 60)

        # Print risk summary
        print("\n  Application Risk Summary:")
        print("  ─────────────────────────────────────")
        for app in created_apps:
            print(f"  {app.application_number}: {app.risk_level:8s} (score: {app.risk_score:5.1f}) | {app.days_remaining}d rem | {app.status}")
        print("=" * 60 + "\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
