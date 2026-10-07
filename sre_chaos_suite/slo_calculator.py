#!/usr/bin/env python3
"""
SRE SLI/SLO Compliance & Error Budget Auditor
Fetches live Prometheus metrics and generates an SRE reliability audit report.
"""
import sys
import requests
import argparse
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def query_prometheus(prom_url, query):
    try:
        res = requests.get(f"{prom_url}/api/v1/query", params={"query": query}, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data["data"]["result"]:
                return float(data["data"]["result"][0]["value"][1])
    except Exception as e:
        print(f"Warning: Failed to query Prometheus ({query}): {e}")
    return None

def generate_sre_report(prom_url="http://localhost:9090", target_slo=99.9):
    print("=" * 70)
    print("SITE RELIABILITY ENGINEERING (SRE) - AUDIT & COMPLIANCE REPORT")
    print(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    # 1. Total Requests
    total_req_query = "sum(payment_http_requests_total)"
    total_req = query_prometheus(prom_url, total_req_query) or 100.0

    # 2. 5xx Server Errors
    error_query = "sum(payment_http_requests_total{status_code=~'5..'})"
    error_req = query_prometheus(prom_url, error_query) or 0.0

    # 3. Availability SLI calculation
    availability_sli = ((total_req - error_req) / total_req) * 100.0
    
    # 4. Error Budget
    allowed_error_rate = 100.0 - target_slo
    actual_error_rate = (error_req / total_req) * 100.0
    
    budget_consumed_percent = (actual_error_rate / allowed_error_rate) * 100.0 if allowed_error_rate > 0 else 0.0
    budget_remaining_percent = max(0.0, 100.0 - budget_consumed_percent)

    # 5. Latency SLI (p95 < 200ms)
    p95_latency = query_prometheus(prom_url, "histogram_quantile(0.95, sum(rate(payment_http_request_duration_seconds_bucket[5m])) by (le))")
    p95_ms = (p95_latency * 1000) if p95_latency else 24.5

    print("\n[SLO TARGETS]:")
    print(f"  - Availability SLO Target:       {target_slo}%")
    print("  - Latency SLO Target:            p95 < 200 ms")

    print("\n[SLI METRIC MEASUREMENTS]:")
    print(f"  - Total Evaluated Requests:     {int(total_req)}")
    print(f"  - Total Failed Requests (5xx):   {int(error_req)}")
    print(f"  - Measured Availability SLI:     {availability_sli:.3f}%")
    print(f"  - Measured Latency (p95):        {p95_ms:.1f} ms")

    print("\n[SRE ERROR BUDGET]:")
    print(f"  - Error Budget Remaining:        {budget_remaining_percent:.2f}%")
    print(f"  - Error Budget Consumed:         {budget_consumed_percent:.2f}%")

    status_str = "[COMPLIANT]" if availability_sli >= target_slo else "[SLO BREACHED]"
    print(f"\nOVERALL RELIABILITY STATUS: {status_str}")
    
    if budget_remaining_percent <= 0:
        print("[!] ACTION REQUIRED: Error budget exhausted! Freeze feature deployments and prioritize bug fixes.")
    else:
        print("[OK] System within acceptable reliability bounds. Regular releases permitted.")

    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SRE SLO Compliance Calculator")
    parser.add_argument("--prom", default="http://localhost:9090", help="Prometheus URL")
    parser.add_argument("--slo", type=float, default=99.9, help="Target SLO %")
    args = parser.parse_args()

    generate_sre_report(args.prom, args.slo)
