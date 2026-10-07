#!/usr/bin/env python3
"""
Continuous Background Traffic Generator
Generates realistic user transaction traffic across multiple payment methods to feed Prometheus & Grafana metrics.
"""
import time
import random
import requests
import argparse
import threading
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

ACCOUNTS = [f"ACC-{i:05d}" for i in range(1000, 1050)]
RECIPIENTS = [f"REC-{i:05d}" for i in range(5000, 5030)]
PAYMENT_METHODS = ["CREDIT_CARD", "DEBIT_CARD", "BANK_WIRE", "CRYPTO", "PREPAID_CARD"]

stop_flag = False

def send_worker(host, worker_id, delay):
    global stop_flag
    while not stop_flag:
        amount = round(random.choice([15.5, 49.99, 120.0, 350.0, 950.0, 4500.0, 12500.0]), 2)
        payload = {
            "account_id": random.choice(ACCOUNTS),
            "recipient_id": random.choice(RECIPIENTS),
            "amount": amount,
            "currency": "USD",
            "payment_method": random.choice(PAYMENT_METHODS)
        }
        
        try:
            res = requests.post(f"{host}/api/v1/payments", json=payload, timeout=5)
            if res.status_code == 200:
                data = res.json()
                print(f"[Worker {worker_id}] Txn {data['transaction_id']}: ${amount} | {data['status']} | {data['latency_ms']}ms")
            else:
                print(f"[Worker {worker_id}] [WARN] Error HTTP {res.status_code}")
        except Exception as e:
            print(f"[Worker {worker_id}] [FAIL] Connection error: {e}")

        time.sleep(delay + random.uniform(0.1, 0.5))

def start_generator(host="http://localhost:8000", concurrency=3, delay=0.4, runtime=0):
    global stop_flag
    print("=" * 65)
    print(f"[TRAFFIC] Starting FinTech Traffic Generator ({concurrency} workers)")
    print(f"Target Gateway: {host}")
    print("Press Ctrl+C to stop traffic generation.")
    print("=" * 65)

    threads = []
    for i in range(concurrency):
        t = threading.Thread(target=send_worker, args=(host, i + 1, delay))
        t.daemon = True
        t.start()
        threads.append(t)

    try:
        start_time = time.time()
        while True:
            time.sleep(1)
            if runtime > 0 and (time.time() - start_time) >= runtime:
                print("\n[DONE] Reached configured runtime limit.")
                break
    except KeyboardInterrupt:
        print("\nStopping traffic generator...")
    finally:
        stop_flag = True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FinTech Traffic Generator")
    parser.add_argument("--host", default="http://localhost:8000", help="Payment Gateway URL")
    parser.add_argument("--concurrency", type=int, default=3, help="Number of concurrent traffic workers")
    parser.add_argument("--delay", type=float, default=0.4, help="Base delay between requests")
    parser.add_argument("--runtime", type=int, default=0, help="Total runtime in seconds (0 = infinite)")
    args = parser.parse_args()

    start_generator(args.host, args.concurrency, args.delay, args.runtime)
