import random

def evaluate_fraud_risk(account_id: str, amount: float, payment_method: str, force_fraud: bool = False) -> tuple[float, str, list[str]]:
    """
    Evaluates transaction risk based on financial heuristics and rules.
    Returns: (risk_score, decision, reasons)
    """
    if force_fraud:
        return 0.95, "REJECT", ["Chaos: Forced High Risk Anomaly Pattern Injected"]

    reasons = []
    base_score = 0.05

    # High Value Transaction Check
    if amount > 10000:
        base_score += 0.65
        reasons.append(f"High single transaction amount (${amount})")
    elif amount > 3000:
        base_score += 0.30
        reasons.append("Moderate-high transaction amount")

    # Payment Method Risk Heuristics
    if payment_method == "CRYPTO":
        base_score += 0.25
        reasons.append("High-volatility payment instrument")
    elif payment_method == "PREPAID_CARD":
        base_score += 0.15
        reasons.append("Anonymous / prepaid card profile")

    # Random anomaly baseline (simulates rare suspicious behavioral pattern)
    if random.random() < 0.04:
        base_score += 0.45
        reasons.append("Velocity spike or geo-location velocity anomaly detected")

    risk_score = min(round(base_score, 3), 1.0)
    decision = "REJECT" if risk_score >= 0.75 else "APPROVE"

    return risk_score, decision, reasons
