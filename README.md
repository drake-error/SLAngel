# 🛡️ SLAngel — Smart Support for Smart Officers

**Government SLA Intelligence, Delay Prediction & Citizen Transparency Platform**

> *"Don't just detect delays after they happen. Predict and prevent delays before they happen."*

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [The 5-Step Core Workflow](#-the-5-step-core-workflow)
3. [Quick Start Guide (Run Locally)](#-quick-start-guide-run-locally)
4. [Demo Credentials](#-demo-credentials)
5. [Website User Guide & Step-by-Step Walkthrough](#-website-user-guide--step-by-step-walkthrough)
6. [Live Demonstration Script (5-Minute Demo)](#-live-demonstration-script-5-minute-demo)
7. [System Architecture](#-system-architecture)
8. [API Endpoints Summary](#-api-endpoints-summary)
9. [Running Automated Tests](#-running-automated-tests)

---

## 🌟 Overview

**SLAngel** is an AI-powered government workflow intelligence platform designed to eliminate public service delays. Built for department officers, administrators, and citizens, SLAngel continuously analyzes service turnaround times, predicts potential Service Level Agreement (SLA) breaches before they occur, recommends targeted remedial actions, and automatically keeps citizens informed with plain-language updates.

---

## ⚡ The 5-Step Core Workflow

Every application in SLAngel moves through a real-time reactive intelligence cycle:

```
┌─────────────────┐     ┌───────────────────────┐     ┌──────────────────────┐
│  1. File Upload  │ ──► │  2. SLA Risk Predict  │ ──► │ 3. Risk Prioritise   │
│  CSV/JSON/Excel │     │  ML + 6 Risk Factors  │     │ Priority Queue #1..N │
└─────────────────┘     └───────────────────────┘     └──────────────────────┘
                                                                 │
                                                                 ▼
┌─────────────────────────┐     ┌────────────────────────────────────┐
│ 5. Citizen Message Gen  │ ◄── │ 4. Recommended Actions for Officer │
│ Plain Language Updates  │     │ Escalate / Reassign / Prioritise   │
└─────────────────────────┘     └────────────────────────────────────┘
```

| Step | Feature | Description |
|------|---------|-------------|
| **1** | **File & Data Upload** | Bulk import applications via CSV, Excel (`.xlsx`), or JSON with strict schema validation and error reporting. |
| **2** | **SLA Risk Prediction** | Multi-factor hybrid AI (RandomForest + Rule Engine) evaluates elapsed days, inactivity, officer load, and unverified documents to generate a Risk Score (0–100) and predict delay days. |
| **3** | **Risk Prioritisation** | Orders cases dynamically by Risk Level (Critical → High → Medium → Low) followed by statutory SLA deadline proximity. |
| **4** | **Recommended Actions** | Analyzes bottlenecks and suggests actionable steps (`Escalate to Supervisor`, `Reassign Officer`, `Fast-Track Processing`) with one-click action buttons. |
| **5** | **Citizen Communication** | Translates internal government workflows into simple, human-friendly SMS status updates with next steps. |

---

## 🚀 Quick Start Guide (Run Locally)

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** & `npm`
- Git

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/drake-error/SLAngel.git
cd SLAngel
```

---

### Step 2: Setup & Start Backend
Open a terminal:

```bash
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On macOS/Linux

# Install backend dependencies
pip install -r requirements.txt

# Initialize database and seed demo data
python scripts/seed.py

# (Optional) Train the delay prediction ML model
python scripts/train_model.py

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```
> 🌐 **Backend API**: `http://localhost:8000`  
> 📑 **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Step 3: Setup & Start Frontend
Open a **second terminal**:

```bash
cd frontend

# Install frontend dependencies
npm install

# Start Vite dev server on port 5173 / 3000
npm run dev
```
> 💻 **Frontend Web App**: `http://localhost:5173` (or `http://localhost:3000`)

---

## 🔑 Demo Credentials

Use any of the following accounts on the Login Screen:

| Role | Username | Password | Purpose |
|------|----------|----------|---------|
| **Admin / Supervisor** | `rahul.sharma` | `admin123` | Full department access, reassignments & metrics |
| **Verification Officer** | `ananya.rao` | `officer123` | Case review, document verification, status approvals |
| **Field Officer** | `vikram.singh` | `officer123` | Field verification queue |

---

## 🖥️ Website User Guide & Step-by-Step Walkthrough

### 1. Dashboard Tab
- **6 Key Performance Indicators (KPIs)**: Total Applications, High Risk Amber Cases, Critical Red Cases, Pending Officer Actions, SLA Breach Rate, and Average Processing Days.
- **Recent Applications Table**: Live feed of incoming citizen applications with instant risk badges.
- **Bottleneck Stage Breakdown**: Visual progress bars showing where applications are currently held up (e.g. Document Verification, Field Inspection, Approval).
- **Early-Warning SLA Alerts**: Real-time ticker of urgent and critical alerts.

---

### 2. Data Import Tab (Feature #1: File Upload)
- **Drag-and-Drop Interface**: Drop CSV, Excel (`.xlsx`), or JSON files directly onto the upload zone.
- **Sample Datasets Included**: You can test immediately using:
  - [`sample_data/applications_demo.csv`](file:///c:/Users/Darwin/OneDrive/Desktop/SLAngel/sample_data/applications_demo.csv)
  - [`sample_data/applications_demo.json`](file:///c:/Users/Darwin/OneDrive/Desktop/SLAngel/sample_data/applications_demo.json)
- **Validation**:
  - Requires `applicant_name`, `service_type`, and `department`.
  - Supports optional fields: `sla_days`, `stage`, `status`, `applicant_contact`, `district`, `purpose`.
- **Upload Report**: Displays total records, successfully processed count, failure count, and row-by-row error details.

---

### 3. Applications Tab
- Full searchable and filterable registry of all citizen applications.
- Filter by **Risk Level** (`Critical`, `High`, `Medium`, `Low`) or search by Citizen Name, Application ID, or Service Type.
- Click **"Review"** on any application to open the comprehensive officer modal.

---

### 4. Priority Queue Tab (Feature #3: Risk Prioritisation)
- Automatically ranks applications using **Risk-First Sorting** (Critical → High → Medium → Low), followed by **SLA Deadline Urgency**.
- **Numbered Badges (`#1`, `#2`, `#3`...)**: Highlight the exact order officers should address applications to prevent SLA breaches.
- **Action Column**: Displays the real-time AI Recommendation for each case.

---

### 5. Review Modal & Recommendations (Feature #2 & #4: Risk Prediction & Recommendations)
Clicking **"Review"** on any application displays:
- **Statutory SLA vs Days Elapsed vs Days Remaining**.
- **Transparent AI Risk Score & Predicted Delay Days**.
- **Recommended Action Card**:
  - `⚡ Escalate to Supervisor` — if the application is stalled or SLA breached.
  - `⚡ Reassign Officer` — if the assigned officer is overloaded.
  - `⚡ Fast-Track Processing` — if approaching deadline.
  - `⚡ Continue Monitoring` — for healthy, on-track applications.
- **Interactive Action Buttons**: Click to instantly execute an escalation or fast-track.
- **Documents Checklist**: View verified vs pending documents.
- **Approve & Issue Certificate**: Completes the case and notifies the citizen.

---

### 6. Citizen Updates Tab (Feature #5: Citizen Communication)
- Translates internal processing state into **clean, empathetic, citizen-facing language**.
- **Context-Specific Templates**:
  - *Normal Progress*: "Your application is currently being processed and is progressing within the expected timeline."
  - *Delay Detected*: "Your application is taking longer than expected. Our team is working to complete it as soon as possible."
  - *Prioritised*: "Your application has been prioritised for faster processing."
  - *Documents Required*: "Your application requires additional documents or corrections."
  - *Approved / Completed*: "Your application has been successfully processed."
- **One-Click Actions**:
  - **Copy SMS**: Copies ready-to-send SMS text to clipboard.
  - **Send Update**: Dispatches citizen notification.

---

### 7. Verification Tab
- Dedicated queue for applications in `PENDING` or `IN_PROGRESS` verification.
- Action buttons to **Start**, **Complete**, or **Reject** verification.

---

### 8. Analytics Tab
- SLA compliance percentages, breach rates, average processing times, and individual **Officer Workload Distribution**.

---

## 🎯 Live Demonstration Script (5-Minute Demo)

Follow these steps for a complete demonstration:

| Time | Step | Action to Perform | Key Point to Highlight |
|------|------|-------------------|------------------------|
| **0:00 - 0:45** | **Login & Dashboard** | Log in with `rahul.sharma` / `admin123`. View top KPI cards and SLA alerts. | Show proactive early-warning indicators rather than reactive reports. |
| **0:45 - 1:45** | **1. Upload Data** | Go to **Data Import** tab. Drag & drop `sample_data/applications_demo.csv`. Click **Upload & Process**. | Show how 8 new citizen applications are validated, ingested, and computed instantly. |
| **1:45 - 2:45** | **2. Risk Prediction & 3. Prioritisation** | Click on **Priority Queue** tab. Point out numbered ranks `#1`, `#2`, `#3`. | Demonstrate risk-first ordering (Critical cases first, then closest deadline). |
| **2:45 - 3:45** | **4. Recommended Actions** | Click **Review** on the `#1` ranked application. View the AI Recommendation Card. Click **⚡ Fast-Track Processing**. | Show how officers are given clear instructions and one-click actions to prevent delays. |
| **3:45 - 4:45** | **5. Citizen Communication** | Navigate to **Citizen Updates** tab. Search for an applicant and click **Copy SMS**. | Show how technical jargon is converted into transparent, reassuring citizen messages. |
| **4:45 - 5:00** | **Approve & Complete** | Open an application, click **Approve & Issue Certificate**. | Case moves to Completed, alerts resolve, and citizen message updates to "Completed". |

---

## 🏗️ System Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons.
- **Backend API**: FastAPI (Python 3.11/3.14) + SQLAlchemy + Pydantic v2.
- **Database**: SQLite (local/dev) / PostgreSQL (production).
- **Intelligence Engine**:
  - `sla_engine.py`: Dynamic statutory SLA countdowns & status tracking.
  - `risk_engine.py`: Transparent 6-factor risk scoring algorithm (0–100).
  - `prediction.py`: RandomForest ML delay classifier with rule-based fallback.
  - `recommendation_engine.py`: Action selector (Escalate, Reassign, Prioritise, Monitor).
  - `citizen_message.py`: Plain-language citizen messaging generator.
  - `alert_engine.py`: Deduplicated threshold-based notification alerts.

---

## 🔌 API Endpoints Summary

| Group | Method | Endpoint | Description |
|-------|--------|----------|-------------|
| **Auth** | `POST` | `/api/auth/login` | Officer / Admin login |
| | `GET` | `/api/auth/me` | Current user profile |
| **Applications**| `GET` | `/api/applications` | List applications with filters & pagination |
| | `POST` | `/api/applications` | Create a single intake |
| | `GET` | `/api/applications/{id}` | Full case file, SLA metrics & prediction |
| | `PATCH`| `/api/applications/{id}/status` | Update stage/status with audit trail |
| | `GET` | `/api/applications/{id}/recommendation` | AI-recommended action & reasons |
| | `GET` | `/api/applications/{id}/citizen-message` | Plain-language citizen status message |
| **Data Import** | `POST` | `/api/import/csv` | Bulk CSV import with field validation |
| | `POST` | `/api/import/json` | Bulk JSON import |
| | `POST` | `/api/import/excel`| Bulk Excel (`.xlsx`) import |
| **Alerts** | `GET` | `/api/alerts/unread` | Active early-warning alerts |
| | `PATCH`| `/api/alerts/{id}/resolve` | Resolve an alert |
| **Dashboard** | `GET` | `/api/dashboard/summary` | Aggregated SLA compliance metrics |

---

## 🧪 Running Automated Tests

To run the complete test suite (51 passing unit and integration tests):

```bash
# From the project root
pytest backend/tests/ -v
```

```
======================== 51 passed in 8.25s ========================
```

---

## 👥 Contributors & Brand
**SLAngel** — *Smart Support for Smart Officers*  
*Government SLA Intelligence & Citizen Transparency Platform*
