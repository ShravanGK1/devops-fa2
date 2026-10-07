import time
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from .rules import evaluate_fraud_risk
from .metrics import (
    FRAUD_EVALUATIONS_TOTAL,
    FRAUD_RISK_SCORE_HISTOGRAM,
    FRAUD_HTTP_REQUESTS_TOTAL,
    FRAUD_PROCESSING_DURATION_SECONDS,
    generate_latest,
    CONTENT_TYPE_LATEST
)

app = FastAPI(
    title="FinTech Fraud Detection Microservice",
    version="1.0.0",
    description="Risk evaluation microservice for real-time transaction scoring."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FraudEvalRequest(BaseModel):
    account_id: str
    amount: float
    payment_method: str = "CREDIT_CARD"
    force_fraud: bool = False

class FraudEvalResponse(BaseModel):
    account_id: str
    risk_score: float
    decision: str # APPROVE or REJECT
    reasons: List[str]
    processing_time_ms: float
    evaluated_at: str

@app.middleware("http")
async def record_metrics(request: Request, call_next):
    start = time.time()
    endpoint = request.url.path
    method = request.method
    response = await call_next(request)
    duration = time.time() - start
    
    FRAUD_HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status_code=str(response.status_code)).inc()
    return response

@app.get("/health", tags=["Health"])
def health():
    return {"status": "UP", "service": "fraud-detection-engine", "timestamp": datetime.utcnow().isoformat()}

@app.get("/metrics", tags=["Observability"])
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/v1/fraud/evaluate", response_model=FraudEvalResponse, tags=["Fraud Engine"])
def evaluate(req: FraudEvalRequest):
    start_time = time.time()
    
    risk_score, decision, reasons = evaluate_fraud_risk(
        account_id=req.account_id,
        amount=req.amount,
        payment_method=req.payment_method,
        force_fraud=req.force_fraud
    )
    
    elapsed = time.time() - start_time
    FRAUD_PROCESSING_DURATION_SECONDS.observe(elapsed)
    FRAUD_RISK_SCORE_HISTOGRAM.observe(risk_score)
    FRAUD_EVALUATIONS_TOTAL.labels(decision=decision, payment_method=req.payment_method).inc()

    return FraudEvalResponse(
        account_id=req.account_id,
        risk_score=risk_score,
        decision=decision,
        reasons=reasons,
        processing_time_ms=round(elapsed * 1000, 2),
        evaluated_at=datetime.utcnow().isoformat()
    )
