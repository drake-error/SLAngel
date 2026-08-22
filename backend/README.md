# SLAngel Backend

**Government SLA Intelligence & Delay Prediction System**

> Don't just detect delays after they happen. Predict and prevent delays before they happen.

## Overview

SLAngel is a smart government application-management system that helps government officers track, prioritize, and predict delays in service applications. The backend provides a complete REST API with:

- **SLA Engine** — Real-time deadline tracking and status classification
- **Risk Engine** — Multi-factor transparent risk scoring (0-100)
- **ML Prediction** — RandomForest classifier for delay prediction with rule-based fallback
- **Alert Engine** — Early warning system for critical/high-risk applications
- **Priority Engine** — Automatic priority calculation
- **Analytics** — Dashboard statistics, department performance, officer workload
- **JWT Auth** — Role-based authentication (Admin, Officer, Supervisor)

## Architecture

```
backend/
├── app/
│   ├── api/                    # FastAPI route handlers
│   │   ├── alerts.py           # Alert management endpoints
│   │   ├── analytics_routes.py # Analytics & reporting
│   │   ├── applications.py     # Application CRUD & workflow
│   │   ├── auth.py             # Login, register, JWT
│   │   ├── dashboard.py        # Dashboard summary stats
│   │   ├── import_data.py      # CSV/JSON bulk import
│   │   ├── officers.py         # Officer workload & management
│   │   └── verification.py     # Document verification workflow
│   ├── auth/
│   │   └── auth.py             # JWT + bcrypt auth utilities
│   ├── models/
│   │   └── models.py           # SQLAlchemy ORM models
│   ├── schemas/
│   │   └── schemas.py          # Pydantic validation schemas
│   ├── services/
│   │   ├── alert_engine.py     # Alert generation & deduplication
│   │   ├── analytics.py        # Statistics & reporting queries
│   │   ├── prediction.py       # ML + rule-based delay prediction
│   │   ├── priority_engine.py  # Priority calculation
│   │   ├── risk_engine.py      # Multi-factor risk scoring
│   │   └── sla_engine.py       # SLA deadline tracking
│   ├── database.py             # SQLAlchemy engine & session
│   └── main.py                 # FastAPI app entry point
├── scripts/
│   ├── seed.py                 # Demo data seeding
│   └── train_model.py          # ML model training pipeline
├── tests/
│   ├── test_alerts.py
│   ├── test_applications.py
│   ├── test_auth.py
│   ├── test_risk.py
│   └── test_sla.py
├── ml_model/                   # Trained ML model (generated)
├── .env.example                # Environment variable template
└── requirements.txt            # Python dependencies
```

## Installation

### Prerequisites
- Python 3.10+
- pip

### Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
```

## Environment Variables

Create a `.env` file from `.env.example`:

```env
DATABASE_URL=sqlite:///./slangel.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
FRONTEND_URL=http://localhost:3000
MODEL_PATH=./ml_model/delay_model.pkl
```

## Database Setup

The database is automatically created on first run. To seed with demo data:

```bash
cd backend
python scripts/seed.py
```

This creates:
- 5 officers across departments
- 20+ applications spanning all risk levels
- Pre-generated alerts
- Audit trail entries

## Running the Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## ML Model Training

Train the delay prediction model:

```bash
cd backend
python scripts/train_model.py --samples 2000
```

This generates synthetic training data and saves the trained model to `ml_model/delay_model.pkl`. The backend automatically loads the model on startup and falls back to rule-based prediction if no model is available.

## Running Tests

```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/register` | Register new officer |
| GET | `/api/auth/me` | Get current user info |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List with pagination, search, filters |
| POST | `/api/applications` | Create new application |
| GET | `/api/applications/{id}` | Full details + timeline + alerts |
| PUT | `/api/applications/{id}` | Update application |
| PATCH | `/api/applications/{id}/status` | Status transition |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Aggregated statistics |
| GET | `/api/dashboard/risk-distribution` | Risk level breakdown |
| GET | `/api/dashboard/status-distribution` | Status breakdown |
| GET | `/api/dashboard/department-performance` | Per-department metrics |
| GET | `/api/dashboard/recent-applications` | Latest applications |
| GET | `/api/dashboard/urgent-applications` | High priority items |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts with filters |
| GET | `/api/alerts/unread` | Unread alerts |
| PATCH | `/api/alerts/{id}/read` | Mark as read |
| PATCH | `/api/alerts/{id}/resolve` | Resolve alert |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications/{id}/verification` | Start/complete/reject verification |

### Officers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/officers` | List all officers |
| GET | `/api/officers/workload` | Officer workload details |

### Import
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/import/csv` | Import from CSV file |
| POST | `/api/import/json` | Import from JSON |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/sla-compliance` | SLA compliance metrics |
| GET | `/api/analytics/processing-times` | Average processing times |
| GET | `/api/analytics/trends` | Application trends |

## Frontend Integration

The frontend connects to the backend via Vite's dev proxy:

```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  }
}
```

### Default Login Credentials (Demo)
- **Username**: `rahul.sharma`
- **Password**: `admin123`

## Prediction Engine

### Hybrid Approach
1. **ML Model** (RandomForest) — trained on synthetic historical data
2. **Rule-Based Fallback** — always available, uses transparent risk factors

### Risk Factors
| Factor | Max Score | Description |
|--------|-----------|-------------|
| SLA Pressure | 35 | Deadline proximity |
| Application State | 20 | Status & verification |
| Inactivity | 20 | Days since last action |
| Officer Workload | 10 | Active case count |
| Document Status | 10 | Unverified documents |
| SLA Breach | 5 | Already breached |

### Risk Levels
| Level | Score Range | Action |
|-------|------------|--------|
| LOW | 0-30 | Normal processing |
| MEDIUM | 31-60 | Monitor closely |
| HIGH | 61-80 | Prioritize & investigate |
| CRITICAL | 81-100 | Immediate intervention required |

## Deployment

### Production Considerations
1. Replace SQLite with PostgreSQL: `DATABASE_URL=postgresql://user:pass@host/db`
2. Set a strong `SECRET_KEY`
3. Configure CORS origins for your domain
4. Use gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`
5. Train and deploy the ML model: `python scripts/train_model.py`
