#!/usr/bin/env python3
"""
Post-Deployment Smoke Test Suite
Validates that newly deployed services are healthy, responsive, and processing transactions correctly.
"""
import sys
import argparse
import requests
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def run_smoke_tests(base_url="http://localhost:8000"):
    print("=" * 60)
    print(f"[Smoke Test] Executing Post-Deployment Smoke Tests against {base_url}")
    print("=" * 60)

    # 1. Test Payment Health Check
    print("1. Checking Payment Gateway Health Endpoint...")
    try:
        res = requests.get(f"{base_url}/health", timeout=5)
        assert res.status_code == 200
        assert res.json().get("status") == "UP"
        print("   [PASS] Payment Gateway is Healthy and UP.")
    except Exception as e:
        print(f"   [FAIL] Health Check Failed: {e}")
        return 1

    # 2. Test Metrics Endpoint
    print("2. Checking Prometheus Scrape /metrics Endpoint...")
    try:
        res = requests.get(f"{base_url}/metrics", timeout=5)
        assert res.status_code == 200
        assert "payment_http_requests_total" in res.text
        print("   [PASS] Prometheus Metrics Endpoint is responding.")
    except Exception as e:
        print(f"   [FAIL] Metrics Endpoint Failed: {e}")
        return 1

    # 3. Test End-to-End Payment Processing Flow
    print("3. Testing End-to-End Payment API Execution...")
    try:
        payload = {
            "account_id": "ACC-SMOKE-001",
            "recipient_id": "REC-SMOKE-999",
            "amount": 75.50,
            "currency": "USD",
            "payment_method": "CREDIT_CARD"
        }
        res = requests.post(f"{base_url}/api/v1/payments", json=payload, timeout=5)
        assert res.status_code == 200
        data = res.json()
        assert "transaction_id" in data
        assert data["status"] in ["SUCCESS", "BLOCKED_FRAUD"]
        print(f"   [PASS] Payment processed successfully. Txn ID: {data['transaction_id']}, Status: {data['status']}")
    except Exception as e:
        print(f"   [FAIL] Payment Processing Failed: {e}")
        return 1

    print("\n[SUCCESS] ALL POST-DEPLOYMENT SMOKE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
    return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run CI/CD Smoke Tests")
    parser.add_argument("--host", default="http://localhost:8000", help="Base URL for Payment Service")
    args = parser.parse_args()
    sys.exit(run_smoke_tests(args.host))
