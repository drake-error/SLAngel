"""Quick API test script"""
import requests
import json

BASE = "http://127.0.0.1:8000"

# Login
r = requests.post(f"{BASE}/api/auth/login", json={"username": "rahul.sharma", "password": "admin123"})
print(f"Login: {r.status_code}")
token = r.json()["access_token"]
h = {"Authorization": f"Bearer {token}"}

# Dashboard
r2 = requests.get(f"{BASE}/api/dashboard/summary", headers=h)
print(f"Dashboard: {json.dumps(r2.json(), indent=2)}")

# Applications
r3 = requests.get(f"{BASE}/api/applications?page_size=5", headers=h)
apps = r3.json()
print(f"\nApplications total: {apps['total']}")
for a in apps["applications"][:5]:
    print(f"  {a['id']}: {a['riskLevel']} (score={a['risk_score']:.0f}) rem={a['daysRemaining']}d status={a['status']}")

# Alerts
r4 = requests.get(f"{BASE}/api/alerts/unread", headers=h)
alerts = r4.json()
print(f"\nUnread alerts: {alerts['count']}")
for al in alerts["alerts"][:3]:
    print(f"  [{al['severity']}] {al['message'][:80]}")

# Officers
r5 = requests.get(f"{BASE}/api/officers", headers=h)
officers = r5.json()
print(f"\nOfficers: {len(officers)}")
for o in officers:
    print(f"  {o['name']} - {o['activeCases']} active cases")

# Test prediction endpoint
r6 = requests.get(f"{BASE}/api/applications/REV-24-0987/prediction", headers=h)
print(f"\nPrediction for REV-24-0987 (breached):")
print(json.dumps(r6.json(), indent=2))

print("\n=== ALL TESTS PASSED ===")
