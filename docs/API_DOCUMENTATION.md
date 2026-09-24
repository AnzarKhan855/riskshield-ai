# 🌐 RiskShield AI — Enterprise REST API Specification

RiskShield AI provides an enterprise-ready, high-throughput REST API adhering to OpenAPI 3.1 specifications. All requests and responses use strict JSON payloads with RFC 7807 problem details for errors.

**Base URL**: `http://localhost:8000/api/v1`  
**Interactive Swagger UI**: `http://localhost:8000/api/v1/docs`  
**Interactive ReDoc**: `http://localhost:8000/api/v1/redoc`

---

## 1. Authentication & Security

All API endpoints (except `/auth/login`, `/auth/signup`, `/auth/forgot-password`, and `/health`) require an HTTP Bearer token in the `Authorization` header:

```http
Authorization: Bearer <YOUR_JWT_ACCESS_TOKEN>
```

### Standard Response Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "error": null,
  "meta": {
    "correlation_id": "c1b04a92-be77-46d3-bda3-c8fd298d23f5",
    "timestamp": "2026-09-02T07:15:51.174399Z"
  }
}
```

---

## 2. Core API Endpoints

### 2.1 Health & Telemetry
```http
GET /api/v1/health
```
Returns platform operational status, active environment, and uptime.

---

### 2.2 Autonomous Decision Engine
```http
POST /api/v1/decisions/evaluate
```
Evaluates an incoming payment transaction in real time (<15ms).

#### Request Headers
| Header | Type | Description |
| :--- | :--- | :--- |
| `Content-Type` | `string` | `application/json` |
| `Authorization` | `string` | `Bearer <JWT>` |
| `Idempotency-Key`| `string` | Optional unique client transaction key |

#### Request Body
```json
{
  "transaction_id": "TXN-2026-9901",
  "merchant_id": "47673ee8-b4cf-4166-8443-744add184f42",
  "customer_id": "d78e314d-2e24-4a99-bef6-97b8a7e02d59",
  "payment_method": "Credit Card",
  "card_network": "Visa",
  "card_bin": "411111",
  "amount": 2500.00,
  "currency": "USD",
  "country": "United States",
  "device_ip": "198.51.100.42",
  "user_agent": "Mozilla/5.0"
}
```

#### Response Payload (200 OK)
```json
{
  "success": true,
  "data": {
    "decision_id": "DEC-8F192A",
    "decision": "APPROVE",
    "composite_risk_score": 14.8,
    "decision_confidence": 0.994,
    "execution_time_ms": 12.4,
    "triggered_rules": [],
    "model_scores": {
      "xgboost": 0.082,
      "onnx": 0.041,
      "isolation_anomaly": -0.12
    }
  }
}
```

---

### 2.3 Policy Rule Studio
- `GET /api/v1/rules`: List active policy rules.
- `POST /api/v1/rules`: Author and deploy a new AST rule.
- `POST /api/v1/rules/simulate`: Backtest a rule against historical datasets.

---

### 2.4 Investigation Cases
- `GET /api/v1/cases`: Retrieve priority case triage queue.
- `GET /api/v1/cases/{id}`: Fetch complete case dossier, evidence, and timeline.
- `POST /api/v1/cases/{id}/close`: Formally close case with analyst resolution notes.

---

### 2.5 Explainability & SHAP
- `GET /api/v1/explanations/{decision_id}`: Retrieve TreeSHAP attribution waterfall and adverse action codes.

---

### 2.6 AI Copilot & Forensics
- `POST /api/v1/ai/copilot`: Grounded conversational threat inquiries.
- `POST /api/v1/ai/root-cause-analysis`: Deep causal synthesis for an anomaly cluster.
