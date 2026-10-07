import time
import os
import random
import uuid
import asyncio
from datetime import datetime
from typing import List, Dict
import httpx
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from .models import PaymentRequest, PaymentResponse, ChaosConfig
from .metrics import (
    HTTP_REQUESTS_TOTAL,
    HTTP_REQUEST_DURATION_SECONDS,
    PAYMENT_TRANSACTIONS_TOTAL,
    PAYMENT_VOLUME_USD_TOTAL,
    CIRCUIT_BREAKER_STATE,
    ACTIVE_CHAOS_MODE,
    DOWNSTREAM_FRAUD_LATENCY_SECONDS,
    generate_latest,
    CONTENT_TYPE_LATEST
)

app = FastAPI(
    title="FinTech Payment Gateway Microservice",
    version="1.0.0",
    description="Core payment processing microservice with Prometheus instrumentation & SRE hooks."
)

# Enable CORS for frontend UI dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Downstream Fraud Service URL
FRAUD_SERVICE_URL = os.getenv("FRAUD_SERVICE_URL", "http://fraud_service:8001")

# In-memory storage for transaction history
transactions_db: List[Dict] = []

# SRE Chaos Injection State
chaos_state = ChaosConfig(
    chaos_mode_enabled=False,
    injected_latency_ms=0,
    injected_failure_rate=0.0,
    force_fraud_spike=False
)

# Circuit Breaker state (0=Closed, 1=Half-Open, 2=Open)
circuit_state = 0 # 0=Closed
consecutive_failures = 0
FAILURE_THRESHOLD = 3

@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    start_time = time.time()
    endpoint = request.url.path
    method = request.method
    
    # Process request
    try:
        response = await call_next(request)
        status_code = str(response.status_code)
    except Exception as exc:
        status_code = "500"
        HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
        duration = time.time() - start_time
        HTTP_REQUEST_DURATION_SECONDS.labels(method=method, endpoint=endpoint).observe(duration)
        raise exc

    duration = time.time() - start_time
    HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
    HTTP_REQUEST_DURATION_SECONDS.labels(method=method, endpoint=endpoint).observe(duration)
    return response

@app.get("/health", tags=["Health & SRE"])
def health_check():
    """Liveness and readiness probe for Kubernetes / Docker orchestrators."""
    return {
        "status": "UP",
        "service": "payment-gateway",
        "timestamp": datetime.utcnow().isoformat(),
        "circuit_breaker": "CLOSED" if circuit_state == 0 else "OPEN",
        "chaos_active": chaos_state.chaos_mode_enabled
    }

@app.get("/metrics", tags=["Observability"])
def metrics():
    """Prometheus metrics scrape endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/v1/payments", response_model=PaymentResponse, tags=["Payments"])
async def process_payment(payment: PaymentRequest):
    """Processes financial payments with downstream fraud detection and SRE fault tolerance."""
    global circuit_state, consecutive_failures
    start_time = time.time()

    # 1. Chaos Engineering Fault Injection (Latency & 500 Spike)
    if chaos_state.chaos_mode_enabled:
        ACTIVE_CHAOS_MODE.set(1)
        if chaos_state.injected_latency_ms > 0:
            await asyncio.sleep(chaos_state.injected_latency_ms / 1000.0)
        
        if random.random() < chaos_state.injected_failure_rate:
            PAYMENT_TRANSACTIONS_TOTAL.labels(status="FAILED_ERROR", currency=payment.currency, payment_method=payment.payment_method).inc()
            PAYMENT_VOLUME_USD_TOTAL.labels(status="FAILED_ERROR").inc(payment.amount)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Simulated Chaos: Internal Payment Gateway Database/Gateway Timeout!"
            )
    else:
        ACTIVE_CHAOS_MODE.set(0)

    # 2. Downstream Fraud Detection Check with Circuit Breaker
    risk_score = 0.05
    fraud_decision = "APPROVE"
    fraud_latency = 0.0

    if circuit_state == 2: # OPEN
        # Fallback to local heuristic when circuit breaker is tripped
        risk_score = 0.5 if payment.amount > 5000 else 0.1
        fraud_decision = "APPROVE" if risk_score < 0.75 else "REJECT"
    else:
        fraud_start = time.time()
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                fraud_payload = {
                    "account_id": payment.account_id,
                    "amount": payment.amount,
                    "payment_method": payment.payment_method,
                    "force_fraud": chaos_state.force_fraud_spike
                }
                res = await client.post(f"{FRAUD_SERVICE_URL}/api/v1/fraud/evaluate", json=fraud_payload)
                if res.status_code == 200:
                    data = res.json()
                    risk_score = data.get("risk_score", 0.1)
                    fraud_decision = data.get("decision", "APPROVE")
                    consecutive_failures = 0
                    circuit_state = 0
                    CIRCUIT_BREAKER_STATE.set(0)
                else:
                    consecutive_failures += 1
        except Exception:
            consecutive_failures += 1
            if consecutive_failures >= FAILURE_THRESHOLD:
                circuit_state = 2 # Trip circuit breaker to OPEN
                CIRCUIT_BREAKER_STATE.set(2)
        finally:
            fraud_latency = time.time() - fraud_start
            DOWNSTREAM_FRAUD_LATENCY_SECONDS.observe(fraud_latency)

    # 3. Final Payment Decision Logic
    txn_status = "SUCCESS"
    details = "Payment approved and settled."
    if fraud_decision == "REJECT" or risk_score >= 0.8:
        txn_status = "BLOCKED_FRAUD"
        details = f"Transaction blocked by Fraud Detection System (Risk Score: {risk_score:.2f})"

    total_latency_ms = round((time.time() - start_time) * 1000, 2)
    txn_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"

    # Track Prometheus Domain Metrics
    PAYMENT_TRANSACTIONS_TOTAL.labels(
        status=txn_status,
        currency=payment.currency,
        payment_method=payment.payment_method
    ).inc()
    PAYMENT_VOLUME_USD_TOTAL.labels(status=txn_status).inc(payment.amount)

    record = {
        "transaction_id": txn_id,
        "account_id": payment.account_id,
        "recipient_id": payment.recipient_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": txn_status,
        "risk_score": risk_score,
        "latency_ms": total_latency_ms,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "details": details
    }
    transactions_db.insert(0, record)
    if len(transactions_db) > 100:
        transactions_db.pop()

    return PaymentResponse(**record)

@app.get("/api/v1/transactions", tags=["Payments"])
def get_transactions():
    """Retrieves recent transactions for real-time frontend visualization."""
    return {"transactions": transactions_db[:30], "total_count": len(transactions_db)}

@app.post("/api/v1/chaos/configure", tags=["SRE & Chaos Simulation"])
def configure_chaos(config: ChaosConfig):
    """Dynamically adjust fault injection for SRE chaos experiments and demo."""
    global chaos_state
    chaos_state = config
    ACTIVE_CHAOS_MODE.set(1 if config.chaos_mode_enabled else 0)
    return {
        "message": "Chaos configuration updated successfully",
        "current_config": chaos_state.model_dump()
    }

@app.get("/api/v1/chaos/status", tags=["SRE & Chaos Simulation"])
def get_chaos_status():
    """Returns current chaos simulation configuration."""
    return chaos_state.model_dump()

@app.post("/api/v1/chaos/reset", tags=["SRE & Chaos Simulation"])
def reset_chaos():
    """Resets all chaos fault injection to normal baseline operation."""
    global chaos_state, circuit_state, consecutive_failures
    chaos_state = ChaosConfig(
        chaos_mode_enabled=False,
        injected_latency_ms=0,
        injected_failure_rate=0.0,
        force_fraud_spike=False
    )
    circuit_state = 0
    consecutive_failures = 0
    CIRCUIT_BREAKER_STATE.set(0)
    ACTIVE_CHAOS_MODE.set(0)
    return {"message": "All chaos faults cleared. System restored to nominal performance."}
