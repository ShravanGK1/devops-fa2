from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# 1. RED Metrics: Rate, Errors, Duration
HTTP_REQUESTS_TOTAL = Counter(
    'payment_http_requests_total',
    'Total HTTP requests handled by payment service',
    ['method', 'endpoint', 'status_code']
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    'payment_http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.5, 5.0]
)

# 2. Domain / Business Metrics
PAYMENT_TRANSACTIONS_TOTAL = Counter(
    'payment_transactions_total',
    'Total transactions processed',
    ['status', 'currency', 'payment_method']
)

PAYMENT_VOLUME_USD_TOTAL = Counter(
    'payment_volume_usd_total',
    'Total payment volume processed in USD',
    ['status']
)

# 3. SRE & Resilience Metrics
CIRCUIT_BREAKER_STATE = Gauge(
    'payment_circuit_breaker_state',
    'Circuit breaker state for downstream fraud service (0=CLOSED, 1=HALF_OPEN, 2=OPEN)'
)

ACTIVE_CHAOS_MODE = Gauge(
    'payment_chaos_mode_active',
    'Indicates if chaos engineering injection is currently active (0=inactive, 1=active)'
)

DOWNSTREAM_FRAUD_LATENCY_SECONDS = Histogram(
    'payment_downstream_fraud_latency_seconds',
    'Latency of calls to downstream Fraud Detection Service',
    buckets=[0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0]
)
