"""Gunicorn configuration file for RiskShield AI production deployment.

Dynamically configures workers, port binding, and timeouts based on environment variables
provided by container runtimes such as Render, AWS ECS, Google Cloud Run, and Kubernetes.
"""

import multiprocessing
import os

# 1. Port and Network Interface Binding
# Render automatically injects $PORT (defaults to 10000 on Render Web Services, 8000 for local Docker)
port = os.getenv("PORT", "8000")
bind = f"0.0.0.0:{port}"

# 2. Worker Concurrency
# Render Starter/Free tiers inject WEB_CONCURRENCY=1 based on available CPU/RAM.
# For low-memory instances (512MB RAM), 1 worker prevents OOM kills during ML model loading.
env_workers = os.getenv("WEB_CONCURRENCY")
if env_workers:
    try:
        workers = max(1, int(env_workers))
    except ValueError:
        workers = 1
else:
    workers = min(2, (multiprocessing.cpu_count() * 2) + 1)

# 3. ASGI Worker Class
worker_class = "uvicorn.workers.UvicornWorker"

# 4. Process Life-Cycle and Timeouts
# ML inference or cold starts may take several seconds; generous timeout avoids premature worker kill
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
keepalive = int(os.getenv("GUNICORN_KEEPALIVE", "5"))
graceful_timeout = int(os.getenv("GUNICORN_GRACEFUL_TIMEOUT", "30"))

# 5. Logging Configuration
accesslog = "-"  # stdout
errorlog = "-"   # stderr
loglevel = os.getenv("LOG_LEVEL", "info").lower()

# 6. Server Mechanics
preload_app = False  # Allows clean independent initialization per worker
max_requests = int(os.getenv("GUNICORN_MAX_REQUESTS", "1000"))
max_requests_jitter = int(os.getenv("GUNICORN_MAX_REQUESTS_JITTER", "100"))
