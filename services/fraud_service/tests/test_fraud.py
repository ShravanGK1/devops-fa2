from fastapi.testclient import TestClient
from services.fraud_service.app.main import app

client = TestClient(app)

def test_fraud_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "UP"

def test_fraud_metrics():
    res = client.get("/metrics")
    assert res.status_code == 200
    assert "fraud_evaluations_total" in res.text

def test_fraud_evaluate_normal():
    payload = {
        "account_id": "ACC-TEST-777",
        "amount": 100.0,
        "payment_method": "CREDIT_CARD",
        "force_fraud": False
    }
    res = client.post("/api/v1/fraud/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] == "APPROVE"
    assert data["risk_score"] < 0.5

def test_fraud_evaluate_forced_anomaly():
    payload = {
        "account_id": "ACC-TEST-999",
        "amount": 25000.0,
        "payment_method": "CRYPTO",
        "force_fraud": True
    }
    res = client.post("/api/v1/fraud/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] == "REJECT"
    assert data["risk_score"] >= 0.8
