"""SLAngel Database Configuration — SQLAlchemy + SQLite (PostgreSQL-compatible schema)"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import shutil
from dotenv import load_dotenv

load_dotenv()

is_vercel = os.getenv("VERCEL") == "1"

if is_vercel:
    db_path = "/tmp/slangel.db"
    if not os.path.exists(db_path):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        source_db = os.path.join(base_dir, "slangel.db")
        if os.path.exists(source_db):
            shutil.copy2(source_db, db_path)
else:
    db_path = "./slangel.db"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# SQLite needs connect_args for thread safety
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency injection for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables."""
    from app.models.models import (
        User, Officer, Application, Document,
        Verification, AuditLog, Alert, TimelineEvent
    )
    Base.metadata.create_all(bind=engine)
