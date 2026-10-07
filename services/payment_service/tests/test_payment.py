import pytest
from fastapi.testclient import TestClient
from services.payment_service.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"
    assert response.json()["service"] == "payment-gateway"

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "payment_http_requests_total" in response.text

def test_process_payment_success():
    payload = {
        "account_id": "ACC-TEST-101",
        "recipient_id": "REC-TEST-202",
        "amount": 250.0,
        "currency": "USD",
        "payment_method": "CREDIT_CARD"
    }
    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 250.0
    assert "transaction_id" in data
    assert data["status"] in ["SUCCESS", "BLOCKED_FRAUD"]

def test_chaos_injection_configuration():
    chaos_payload = {
        "chaos_mode_enabled": True,
        "injected_latency_ms": 100,
        "injected_failure_rate": 0.0,
        "force_fraud_spike": False
    }
    response = client.post("/api/v1/chaos/configure", json=chaos_payload)
    assert response.status_code == 200
    assert response.json()["current_config"]["chaos_mode_enabled"] is True

    # Reset chaos
    reset_res = client.post("/api/v1/chaos/reset")
    assert reset_res.status_code == 200
