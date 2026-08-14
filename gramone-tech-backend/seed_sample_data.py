"""
seed_sample_data.py — Injects sample telemetry into the running backend via HTTP.
Run AFTER the backend is up: python seed_sample_data.py
"""
import requests
import time
import random
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

# ─── Login ───────────────────────────────────────────────────────────────────
print("🔐 Authenticating as tech@gramone.org...")
login_resp = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "tech@gramone.org", "password": "GramOneTech2026!"},
)
if login_resp.status_code != 200:
    print(f"❌ Login failed: {login_resp.text}")
    exit(1)

token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"✅ Authenticated. Token acquired.\n")


def post(path, payload):
    resp = requests.post(f"{BASE_URL}{path}", json=payload, headers=headers)
    return resp.status_code, resp.json() if resp.ok else resp.text


# ─── Water Telemetry (WATER-001) ──────────────────────────────────────────────
print("💧 Seeding Water Tank telemetry (WATER-001)...")
water_levels = [72, 65, 58, 50, 42, 38, 30, 25, 18, 10]  # declining → triggers alerts
for level in water_levels:
    status, resp = post("/telemetry/water", {
        "device_code": "WATER-001",
        "water_level": level
    })
    print(f"   Water Level {level:3d}% → HTTP {status}")
    time.sleep(0.2)

print()

# ─── Bin Telemetry (BIN-001) ──────────────────────────────────────────────────
print("🗑️  Seeding Smart Bin telemetry (BIN-001)...")
fill_levels = [20, 35, 48, 60, 72, 80, 87, 91, 95]  # filling → triggers alert
for level in fill_levels:
    status, resp = post("/telemetry/bin", {
        "device_code": "BIN-001",
        "fill_level": level
    })
    print(f"   Fill Level  {level:3d}% → HTTP {status}")
    time.sleep(0.2)

print()

# ─── Environment Telemetry (ENV-001) ──────────────────────────────────────────
print("🌡️  Seeding Environment telemetry (ENV-001)...")
env_readings = [
    (28.0, 55.0),
    (30.5, 60.2),
    (32.1, 65.8),
    (34.0, 70.0),
    (36.5, 75.5),
    (38.0, 80.1),
    (40.2, 84.0),  # temp threshold crossed
    (41.5, 86.0),  # both thresholds crossed
    (39.0, 88.0),  # humidity threshold
]
for temp, humidity in env_readings:
    status, resp = post("/telemetry/environment", {
        "device_code": "ENV-001",
        "temperature": temp,
        "humidity": humidity
    })
    print(f"   Temp {temp:.1f}°C  Humidity {humidity:.1f}% → HTTP {status}")
    time.sleep(0.2)

print()

# ─── Dashboard Summary ────────────────────────────────────────────────────────
print("📊 Fetching Dashboard Summary...")
summary = requests.get(f"{BASE_URL}/technician/dashboard", headers=headers).json()
print(f"   Online Devices  : {summary.get('online_devices', 0)}")
print(f"   Offline Devices : {summary.get('offline_devices', 0)}")
print(f"   Active Alerts   : {summary.get('active_alerts', 0)}")
print(f"   Last Sync       : {summary.get('last_sync', 'N/A')}")

print()

# ─── Alert Count ──────────────────────────────────────────────────────────────
alerts = requests.get(f"{BASE_URL}/technician/alerts", headers=headers).json()
print(f"🔔 Total Alerts Generated: {len(alerts)}")
for a in alerts[:6]:
    print(f"   [{a['severity']:8s}] {a['device_code']:10s} — {a['message']}")

print()
print("✅ Sample data seeded successfully!")
print("   Web Dashboard:  http://localhost:5173")
print("   Backend API:    http://127.0.0.1:8000/docs")
print("   Login:          tech@gramone.org / GramOneTech2026!")
