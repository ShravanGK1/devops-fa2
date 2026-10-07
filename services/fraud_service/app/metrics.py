from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

FRAUD_EVALUATIONS_TOTAL = Counter(
    'fraud_evaluations_total',
    'Total fraud evaluations processed',
    ['decision', 'payment_method']
)

FRAUD_RISK_SCORE_HISTOGRAM = Histogram(
    'fraud_risk_score_distribution',
    'Distribution of computed fraud risk scores',
    buckets=[0.1, 0.25, 0.5, 0.75, 0.9, 1.0]
)

FRAUD_HTTP_REQUESTS_TOTAL = Counter(
    'fraud_http_requests_total',
    'Total HTTP requests to Fraud microservice',
    ['method', 'endpoint', 'status_code']
)

FRAUD_PROCESSING_DURATION_SECONDS = Histogram(
    'fraud_processing_duration_seconds',
    'Fraud detection compute duration in seconds',
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5]
)
