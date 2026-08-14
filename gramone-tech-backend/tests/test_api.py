import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.db.init_db import init_db

# Use an in-memory SQLite database with StaticPool for test isolation
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    init_db(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def tech_token(client):
    response = client.post(
        "/auth/login",
        json={"email": "tech@gramone.org", "password": "GramOneTech2026!"},
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


@pytest.fixture
def auth_headers(tech_token):
    return {"Authorization": f"Bearer {tech_token}"}


# 1. Successful login
def test_successful_login(client):
    response = client.post(
        "/auth/login",
        json={"email": "tech@gramone.org", "password": "GramOneTech2026!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "tech@gramone.org"


# 2. Unauthorized technician endpoint access
def test_unauthorized_access(client):
    response = client.get("/technician/dashboard")
    assert response.status_code == 401


# 3. Water CRITICAL alert
def test_water_critical_alert(client, auth_headers):
    payload = {"device_code": "WATER-001", "water_level": 15.0, "battery_level": 95.0}
    response = client.post("/telemetry/water", json=payload)
    assert response.status_code == 201
    assert response.json()["alerts_generated"] == 1

    alerts_res = client.get("/technician/alerts", headers=auth_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["severity"] == "CRITICAL"
    assert alerts[0]["alert_type"] == "WATER_LEVEL_CRITICAL"


# 4. Water WARNING alert
def test_water_warning_alert(client, auth_headers):
    payload = {"device_code": "WATER-001", "water_level": 30.0, "battery_level": 90.0}
    response = client.post("/telemetry/water", json=payload)
    assert response.status_code == 201
    assert response.json()["alerts_generated"] == 1

    alerts_res = client.get("/technician/alerts", headers=auth_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["severity"] == "WARNING"
    assert alerts[0]["alert_type"] == "WATER_LEVEL_WARNING"


# 5. Bin CRITICAL alert
def test_bin_critical_alert(client, auth_headers):
    payload = {"device_code": "BIN-001", "fill_level": 92.0}
    response = client.post("/telemetry/bin", json=payload)
    assert response.status_code == 201
    assert response.json()["alerts_generated"] == 1

    alerts_res = client.get("/technician/alerts", headers=auth_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["severity"] == "CRITICAL"
    assert alerts[0]["alert_type"] == "BIN_OVERFLOW_CRITICAL"


# 6. Environment WARNING alerts
def test_environment_warning_alerts(client, auth_headers):
    payload = {"device_code": "ENV-001", "temperature": 42.0, "humidity": 88.0}
    response = client.post("/telemetry/environment", json=payload)
    assert response.status_code == 201
    # Temperature > 40 and Humidity > 85 generate 2 alerts
    assert response.json()["alerts_generated"] == 2

    alerts_res = client.get("/technician/alerts", headers=auth_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 2


# 7. Dashboard aggregation
def test_dashboard_aggregation(client, auth_headers):
    client.post("/telemetry/water", json={"device_code": "WATER-001", "water_level": 15.0})
    response = client.get("/technician/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "online_devices" in data
    assert "active_alerts" in data
    assert data["online_devices"] >= 1
    assert data["active_alerts"] >= 1


# 8. Alert acknowledge
def test_alert_acknowledge(client, auth_headers):
    client.post("/telemetry/water", json={"device_code": "WATER-001", "water_level": 10.0})
    alerts = client.get("/technician/alerts", headers=auth_headers).json()
    alert_id = alerts[0]["id"]

    ack_res = client.patch(f"/technician/alerts/{alert_id}/acknowledge", headers=auth_headers)
    assert ack_res.status_code == 200
    ack_data = ack_res.json()
    assert ack_data["alert"]["status"] == "ACKNOWLEDGED"


# 9. Alert resolve
def test_alert_resolve(client, auth_headers):
    client.post("/telemetry/water", json={"device_code": "WATER-001", "water_level": 10.0})
    alerts = client.get("/technician/alerts", headers=auth_headers).json()
    alert_id = alerts[0]["id"]

    res_res = client.patch(f"/technician/alerts/{alert_id}/resolve", headers=auth_headers)
    assert res_res.status_code == 200
    res_data = res_res.json()
    assert res_data["alert"]["status"] == "RESOLVED"


# 10. Device latest telemetry retrieval
def test_device_latest_telemetry_retrieval(client, auth_headers):
    client.post("/telemetry/water", json={"device_code": "WATER-001", "water_level": 55.0})
    client.post("/telemetry/bin", json={"device_code": "BIN-001", "fill_level": 40.0})
    client.post("/telemetry/environment", json={"device_code": "ENV-001", "temperature": 25.0, "humidity": 60.0})

    water_res = client.get("/technician/water/latest", headers=auth_headers)
    assert water_res.status_code == 200
    assert water_res.json()["water_level"] == 55.0

    bin_res = client.get("/technician/bin/latest", headers=auth_headers)
    assert bin_res.status_code == 200
    assert bin_res.json()["fill_level"] == 40.0

    env_res = client.get("/technician/environment/latest", headers=auth_headers)
    assert env_res.status_code == 200
    assert env_res.json()["temperature"] == 25.0
    assert env_res.json()["humidity"] == 60.0


# 11. RFID scan event creation
def test_rfid_scan_event_creation(client):
    payload = {"device_code": "RFID-001", "card_uid": "AB12CD34"}
    response = client.post("/telemetry/rfid-scan", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "event_id" in data
    assert data["event_id"] >= 1


# 12. Emergency button alert creation
def test_emergency_button_alert_creation(client, auth_headers):
    payload = {"device_code": "RFID-001", "emergency_pressed": True}
    response = client.post("/telemetry/emergency", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "alert_id" in data

    alerts_res = client.get("/technician/alerts", headers=auth_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["alert_type"] == "EMERGENCY_BUTTON"
    assert alerts[0]["severity"] == "CRITICAL"


# 13. Emergency alert appears in dashboard counts
def test_emergency_alert_appears_in_dashboard(client, auth_headers):
    client.post("/telemetry/emergency", json={"device_code": "RFID-001", "emergency_pressed": True})
    dashboard_res = client.get("/technician/dashboard", headers=auth_headers)
    assert dashboard_res.status_code == 200
    db_data = dashboard_res.json()
    assert db_data["active_alerts"] >= 1

