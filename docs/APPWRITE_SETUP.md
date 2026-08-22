# Appwrite Cloud Integration Guide for SLAngel

This guide explains how to integrate Appwrite Cloud as a supplementary backend service alongside the existing FastAPI backend.

## Overview

The SLAngel backend is built with FastAPI + SQLite (locally) and can use Appwrite Cloud for:
- **Authentication** (OAuth providers like Google)
- **File Storage** (document uploads)
- **Realtime** (live dashboard updates)

The core SLA Engine, Risk Prediction, and ML Pipeline remain in FastAPI since they require complex computations not suited for Appwrite Functions.

---

## Step 1: Create Appwrite Cloud Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Click **Create Project**
3. Name it `SLAngel`
4. Note your **Project ID** and **API Endpoint**

## Step 2: Install Appwrite SDK

### Backend (Python)
```bash
pip install appwrite
```

### Frontend (JavaScript)
```bash
cd frontend
npm install appwrite
```

## Step 3: Configure Environment Variables

Add to your `.env`:
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

## Step 4: Set Up OAuth Authentication

### In Appwrite Console:
1. Go to **Auth** → **Settings**
2. Enable **Email/Password** auth
3. To add Google OAuth:
   - Go to **Auth** → **Settings** → **OAuth2 Providers**
   - Enable **Google**
   - Add your Google OAuth Client ID and Secret
   - Set redirect URLs:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)

> **Note**: If you've hit the Google Cloud project limit, delete unused projects at [console.cloud.google.com](https://console.cloud.google.com) before creating new OAuth credentials.

### Frontend Integration:
```javascript
import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('your-project-id');

const account = new Account(client);

// Google OAuth Login
async function loginWithGoogle() {
    account.createOAuth2Session(
        'google',
        'http://localhost:3000',      // Success URL
        'http://localhost:3000/login'  // Failure URL
    );
}

// Email/Password Login (uses existing FastAPI backend)
async function loginWithEmail(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
    });
    return response.json();
}
```

## Step 5: Set Up Database Collections (Optional)

If you want to migrate from SQLite to Appwrite Database:

### Create Collections:
1. **applications** — All application fields
2. **officers** — Officer profiles
3. **alerts** — System alerts
4. **audit_logs** — Action history

### Example Collection Attributes for `applications`:
| Attribute | Type | Required |
|-----------|------|----------|
| application_number | String (50) | Yes |
| applicant_name | String (255) | Yes |
| service_type | String (255) | Yes |
| department | String (255) | Yes |
| status | String (30) | Yes |
| risk_score | Float | No |
| risk_level | String (20) | No |
| sla_days | Integer | Yes |
| days_remaining | Integer | No |

> **Recommendation**: Keep using FastAPI + SQLite/PostgreSQL for the main database. The prediction engine and risk calculations require complex SQL queries that are easier with SQLAlchemy.

## Step 6: File Storage for Documents

### In Appwrite Console:
1. Go to **Storage** → **Create Bucket**
2. Name it `application-documents`
3. Set file size limit (e.g., 10MB)
4. Set allowed file extensions: `pdf, jpg, png, doc, docx`

### Frontend Upload:
```javascript
import { Storage } from 'appwrite';

const storage = new Storage(client);

async function uploadDocument(file, applicationId) {
    const result = await storage.createFile(
        'application-documents',  // Bucket ID
        'unique()',               // File ID
        file,
        [`user:${applicationId}`] // Permissions
    );
    return result;
}
```

## Step 7: Realtime Updates (Optional)

Enable live dashboard updates:

```javascript
import { Client } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('your-project-id');

// Subscribe to application changes
const unsubscribe = client.subscribe(
    'databases.slangel.collections.applications.documents',
    (response) => {
        console.log('Application updated:', response.payload);
        // Trigger dashboard refresh
        fetchDashboardData();
    }
);
```

## Architecture with Appwrite

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│  FastAPI Backend  │────▶│  SQLite / Postgres │
│  (React)     │     │  (Core Logic)     │     │  (Main Database)   │
│              │     │                   │     └─────────────────┘
│              │     │  • SLA Engine     │
│              │     │  • Risk Engine    │
│              │     │  • ML Prediction  │
│              │     │  • Alert Engine   │
│              │     └──────────────────┘
│              │
│              │────▶┌──────────────────┐
│              │     │  Appwrite Cloud   │
│              │     │                   │
│              │     │  • OAuth (Google) │
│              │     │  • File Storage   │
│              │     │  • Realtime       │
│              │     └──────────────────┘
└─────────────┘
```

## Troubleshooting

### Google OAuth Issues
- **Project limit reached**: Delete unused projects at [console.cloud.google.com](https://console.cloud.google.com)
- **OAuth consent screen**: Must be configured before creating credentials
- **Redirect URI mismatch**: Ensure the redirect URIs in Google Console match your Appwrite settings

### Appwrite Connection Issues
- Check that your Project ID and API key are correct
- Ensure CORS is configured in Appwrite for your frontend domain
- Check network tab in browser DevTools for specific errors
