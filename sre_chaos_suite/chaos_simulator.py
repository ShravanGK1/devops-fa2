#!/usr/bin/env python3
"""
SRE Chaos Engineering Simulator
Demonstrates resilience testing, fault injection, and SRE incident response.
"""
import sys
import time
import requests
import argparse

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def inject_chaos(host="http://localhost:8000", latency_ms=450, failure_rate=0.4, fraud_spike=True, duration_sec=30):
    print("=" * 65)
    print("[SRE CHAOS] INJECTION EXPERIMENT STARTED")
    print("=" * 65)
    print(f"Target Service: {host}")
    print("Faults to Inject:")
    print(f"  - Artificial Network Latency: {latency_ms} ms")
    print(f"  - Synthetic 500 Error Rate:   {failure_rate * 100}%")
    print(f"  - Fraud Spike Anomaly:        {fraud_spike}")
    print(f"  - Chaos Experiment Duration:  {duration_sec} seconds")
    print("-" * 65)

    payload = {
        "chaos_mode_enabled": True,
        "injected_latency_ms": latency_ms,
        "injected_failure_rate": failure_rate,
        "force_fraud_spike": fraud_spike
    }

    try:
        res = requests.post(f"{host}/api/v1/chaos/configure", json=payload, timeout=5)
        if res.status_code == 200:
            print("[ACTIVE] Chaos injected into Payment Gateway!")
            print("Watch Grafana dashboards (:3000) and Alertmanager (:9093).")
            print(f"Running experiment for {duration_sec} seconds...")
            
            for i in range(duration_sec, 0, -5):
                print(f"   [{i}s remaining in active chaos window...]")
                time.sleep(5)
            
            # Reset
            print("\n[RESTORING] Resetting system to nominal state...")
            reset_res = requests.post(f"{host}/api/v1/chaos/reset", timeout=5)
            if reset_res.status_code == 200:
                print("[RESOLVED] All chaos faults cleared. SRE Error budget stabilized.")
        else:
            print(f"[FAIL] Failed to configure chaos: HTTP {res.status_code}")
    except Exception as e:
        print(f"[ERROR] Error communicating with Payment Gateway: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SRE Chaos Simulator")
    parser.add_argument("--host", default="http://localhost:8000", help="Payment Gateway URL")
    parser.add_argument("--latency", type=int, default=400, help="Injected latency in ms")
    parser.add_argument("--failure-rate", type=float, default=0.35, help="Failure rate (0.0 - 1.0)")
    parser.add_argument("--fraud", action="store_true", default=True, help="Force fraud spike")
    parser.add_argument("--duration", type=int, default=20, help="Experiment duration in seconds")
    args = parser.parse_args()

    inject_chaos(args.host, args.latency, args.failure_rate, args.fraud, args.duration)
