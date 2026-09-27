# 🛠️ RiskShield AI — Enterprise Operational Troubleshooting Runbook

This runbook provides diagnostic workflows and remediation procedures for common operational issues encountered in development and production environments.

---

## 1. Quick Diagnostic Checklist

When investigating an anomaly or service degradation, execute these checks first:

```bash
# 1. Verify Backend Health & Telemetry
curl -s http://localhost:8000/api/v1/health | jq .

# 2. Verify Frontend HTTP Response
curl -I http://localhost:3000/

# 3. Check Docker Container Status
docker-compose ps

# 4. Check Redis Connection & Memory
redis-cli ping
redis-cli info memory
```

---

## 2. Common Operational Issues & Remediation

### 2.1 Backend Port 8000 Already in Use
- **Symptom**: `ERROR: [Errno 48] Address already in use: ('0.0.0.0', 8000)`
- **Root Cause**: A stale Uvicorn or Python process is still bound to port 8000.
- **Resolution**:
  - On Windows:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
    ```
  - On Linux/macOS:
    ```bash
    kill -9 $(lsof -t -i:8000)
    ```

---

### 2.2 Database Initialization or Missing Seeds
- **Symptom**: `sqlite3.OperationalError: no such table: users` or login fails with 401.
- **Root Cause**: Database tables were not created on first boot or the seed process did not complete.
- **Resolution**:
  ```bash
  cd backend
  # Run Alembic migrations
  alembic upgrade head
  # The application lifespan automatically seeds admin@riskshield.ai if the user table is empty.
  ```

---

### 2.3 JWT Token Expiration or Invalid Signature
- **Symptom**: `401 Unauthorized: Could not validate credentials`
- **Root Cause**: Access token expired (120-minute default TTL) or `SECRET_KEY` changed.
- **Resolution**:
  - Call `/api/v1/auth/refresh-token` with the refresh token to obtain a fresh access token.
  - Or log in again at `http://localhost:3000/login` with `admin@riskshield.ai` / `Password123!`.

---

### 2.4 Playwright Browser Launch Failures
- **Symptom**: `Error: Failed to launch browser: Chrome not found`
- **Root Cause**: Google Chrome executable path is non-standard on the host OS.
- **Resolution**:
  - Ensure Google Chrome is installed at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
  - Alternatively, install bundled Playwright browsers via: `npx playwright install chromium`.
