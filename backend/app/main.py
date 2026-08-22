"""
SLAngel — FastAPI Backend Entry Point
Government SLA Intelligence & Delay Prediction System
"""

import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database import init_db, SessionLocal
from app.services.prediction import load_ml_model
from app.services.sla_engine import batch_update_sla
from app.services.prediction import update_application_prediction
from app.services.priority_engine import update_application_priority
from app.services.alert_engine import batch_generate_alerts
from app.models.models import Application, ApplicationStatus

# ─── Import API Routers ─────────────────────────────────────────────────────

from app.api.auth import router as auth_router
from app.api.applications import router as applications_router
from app.api.verification import router as verification_router
from app.api.alerts import router as alerts_router
from app.api.dashboard import router as dashboard_router
from app.api.analytics_routes import router as analytics_router
from app.api.officers import router as officers_router
from app.api.import_data import router as import_router


# ─── Background SLA Recalculation ───────────────────────────────────────────

async def background_sla_recalculation():
    """Periodically recalculate SLA, risk, and alerts for all active applications."""
    while True:
        try:
            await asyncio.sleep(300)  # Run every 5 minutes
            db = SessionLocal()
            try:
                active_apps = db.query(Application).filter(
                    Application.status.notin_([
                        ApplicationStatus.COMPLETED.value,
                        ApplicationStatus.APPROVED.value,
                        ApplicationStatus.REJECTED.value,
                    ])
                ).all()

                if active_apps:
                    batch_update_sla(active_apps)
                    for app in active_apps:
                        update_application_prediction(app, db)
                        update_application_priority(app)
                    batch_generate_alerts(active_apps, db)
                    db.commit()
                    print(f"[SLAngel] Background recalculation completed for {len(active_apps)} applications")
            finally:
                db.close()
        except Exception as e:
            print(f"[SLAngel] Background task error: {e}")


# ─── Application Lifespan ───────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print("[SLAngel] Initializing database...")
    init_db()

    print("[SLAngel] Loading ML model...")
    load_ml_model()

    # Start background task
    task = asyncio.create_task(background_sla_recalculation())
    print("[SLAngel] Background SLA recalculation task started")
    print("[SLAngel] Backend is ready! API docs at /docs")

    yield

    # Shutdown
    task.cancel()
    print("[SLAngel] Shutting down...")


# ─── FastAPI Application ────────────────────────────────────────────────────

app = FastAPI(
    title="SLAngel API",
    description="Government SLA Intelligence & Delay Prediction System — Predict and prevent delays before they happen.",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS Configuration ─────────────────────────────────────────────────────

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ───────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(verification_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)
app.include_router(analytics_router)
app.include_router(officers_router)
app.include_router(import_router)


# ─── Root Endpoint ──────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "SLAngel API",
        "version": "1.0.0",
        "description": "Government SLA Intelligence & Delay Prediction System",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "healthy", "service": "SLAngel Backend"}
