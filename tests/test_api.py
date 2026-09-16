"""
Integration tests for FloodSight FastAPI endpoints.
Tests responses, status codes, schemas, and error boundaries.
"""
import pytest
from fastapi.testclient import TestClient
from floodsight.backend.main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "HEALTHY"
    assert "FloodSight" in data["service"]


def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "SIH26192" in data["problem_statement"]


def test_get_all_wards_risk():
    resp = client.get("/api/v1/risk/all")
    assert resp.status_code == 200
    wards = resp.json()
    assert len(wards) >= 20
    first = wards[0]
    assert "ward_id" in first
    assert "risk_score" in first
    assert "alert_level" in first
    assert "alert_color" in first


def test_get_specific_ward_risk():
    # Mandi Sadar
    resp = client.get("/api/v1/risk/HP-MND-01")
    assert resp.status_code == 200
    data = resp.json()
    assert data["ward_id"] == "HP-MND-01"
    assert data["ward_name"] == "Mandi Sadar (Beas Valley)"
    assert "factor_contributions" in data
    assert len(data["factor_contributions"]) == 9
    assert "features_summary" in data


def test_get_invalid_ward_risk():
    resp = client.get("/api/v1/risk/INVALID-WARD-999")
    assert resp.status_code == 404
    data = resp.json()
    assert "detail" in data


def test_get_district_risk():
    resp = client.get("/api/v1/risk/district/Mandi")
    assert resp.status_code == 200
    data = resp.json()
    assert data["district_name"] == "Mandi"
    assert data["wards_count"] >= 8
    assert "mean_risk_score" in data
    assert "wards" in data


def test_get_history_timeseries():
    resp = client.get("/api/v1/history/HP-MND-01?hours=24")
    assert resp.status_code == 200
    data = resp.json()
    assert data["ward_id"] == "HP-MND-01"
    assert len(data["points"]) == 25  # 24 hours + current hour
    assert "rainfall_mm" in data["points"][0]
    assert "risk_score" in data["points"][0]


def test_model_info_endpoint():
    resp = client.get("/api/v1/model/info")
    assert resp.status_code == 200
    data = resp.json()
    assert data["model_name"] == "FloodSight_RandomForest_v1"
    assert "literature_benchmark" in data
    assert data["literature_benchmark"]["reported_accuracy"] == 0.906
    assert "measured_validation_metrics" in data
    assert data["measured_validation_metrics"]["recall"] > 0.80


def test_validation_events_endpoint():
    resp = client.get("/api/v1/events/validation")
    assert resp.status_code == 200
    events = resp.json()
    assert len(events) >= 6
    # Verify Thunag cloudburst event
    thunag = next((e for e in events if "Thunag" in e["location"]), None)
    assert thunag is not None
    assert thunag["date"] == "2025-07-28"
    assert thunag["flood_occurred"] == 1
    assert thunag["prediction_accurate"] is True


def test_sources_status_endpoint():
    resp = client.get("/api/v1/sources/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["system_status"] == "OPERATIONAL"
    assert len(data["adapters"]) >= 4


def test_ingest_sensor_telemetry():
    payload = {
        "node_id": "ESP32-KLU-01",
        "ward_id": "HP-KLU-01",
        "source": "sensor",
        "water_level_cm": 420.0,
        "water_level_rate_cm_per_hr": 35.0,
        "tilt_angle_deg": 2.5,
        "battery_level_pct": 95.0
    }
    resp = client.post("/api/v1/ingest/sensor", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["received"] is True
    assert data["anomaly_detected"] is True

    # Verify that telemetry updated the ward state
    ward_resp = client.get("/api/v1/risk/HP-KLU-01")
    assert ward_resp.status_code == 200
    w_data = ward_resp.json()
    assert w_data["live_sensor_telemetry"] is not None
    assert w_data["live_sensor_telemetry"]["water_level_cm"] == 420.0


def test_trigger_alert():
    payload = {
        "ward_id": "HP-MND-02",
        "phone_numbers": ["+919876543210"],
        "custom_instruction": "Test alert for Seraj Valley disaster team"
    }
    resp = client.post("/api/v1/alerts/trigger", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["dispatches_count"] == 1
    assert data["dispatches"][0]["status"] == "SENT"


def test_geojson_endpoint():
    resp = client.get("/api/v1/wards/geojson?district=Mandi")
    assert resp.status_code == 200
    geo = resp.json()
    assert geo["type"] == "FeatureCollection"
    assert len(geo["features"]) >= 8
    assert geo["features"][0]["geometry"]["type"] == "Polygon"


def test_shelters_endpoint():
    resp = client.get("/api/v1/shelters?district=Mandi")
    assert resp.status_code == 200
    shelters = resp.json()
    assert len(shelters) >= 3
    first = shelters[0]
    assert "shelter_id" in first
    assert "elevation_m" in first
    assert "capacity_persons" in first
    assert "helpline_contact" in first


def test_sitrep_endpoint():
    resp = client.get("/api/v1/sitrep")
    assert resp.status_code == 200
    data = resp.json()
    assert "sitrep_number" in data
    assert "summary_statistics" in data
    assert data["summary_statistics"]["total_monitored_wards"] >= 20
    assert "critical_wards_details" in data


def test_sensors_endpoint():
    resp = client.get("/api/v1/sensors")
    assert resp.status_code == 200
    sensors = resp.json()
    assert len(sensors) == 4
    first = sensors[0]
    assert "node_id" in first
    assert "water_level_cm" in first
    assert "tilt_angle_deg" in first
    assert "battery_level_pct" in first


def test_ping_sensor_node():
    resp = client.post("/api/v1/sensors/ESP32-MND-01/ping")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ONLINE"
    assert data["node_id"] == "ESP32-MND-01"

    # Non-existent node
    resp_bad = client.post("/api/v1/sensors/ESP32-NONEXISTENT/ping")
    assert resp_bad.status_code == 404


def test_alerts_history_endpoint():
    resp = client.get("/api/v1/alerts/history")
    assert resp.status_code == 200
    history = resp.json()
    assert isinstance(history, list)

