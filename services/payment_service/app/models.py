from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class PaymentRequest(BaseModel):
    account_id: str = Field(..., example="ACC-98231")
    recipient_id: str = Field(..., example="REC-44102")
    amount: float = Field(..., gt=0, example=150.00)
    currency: str = Field(default="USD", example="USD")
    payment_method: str = Field(default="CREDIT_CARD", example="CREDIT_CARD")
    metadata: Optional[dict] = None

class PaymentResponse(BaseModel):
    transaction_id: str
    account_id: str
    recipient_id: str
    amount: float
    currency: str
    status: str # SUCCESS, BLOCKED_FRAUD, FAILED_ERROR, PENDING
    risk_score: float
    latency_ms: float
    timestamp: str
    details: Optional[str] = None

class ChaosConfig(BaseModel):
    chaos_mode_enabled: bool = False
    injected_latency_ms: int = 0
    injected_failure_rate: float = 0.0 # 0.0 to 1.0 (500 Internal Server Errors)
    force_fraud_spike: bool = False
