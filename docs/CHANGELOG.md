# 📜 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-02

### Added
- **Core Platform**: Enterprise autonomous transaction decisioning platform powered by FastAPI and Next.js 14.
- **Decision Engine**: Hybrid AST deterministic policy compiler alongside parallel multi-model ML inference mesh (XGBoost, LightGBM, ONNX, Isolation Forest).
- **Explainability**: TreeSHAP feature attribution engine with regulatory reason codes (FCRA / GDPR Article 22 compliant).
- **AI Hub**: Natural language threat copilot and root cause forensics powered by Groq Llama-3.
- **Forensic Graph**: Interactive force-directed node-link relationship graph canvas for syndicated ring detection.
- **Feature Store**: Dual-tier streaming vector cache (Redis 7 online, SQL offline) computing 61 real-time velocity features.
- **Case Management**: End-to-end investigation workspace with evidence attachment, audit timeline, and decision override actions.
- **Automation Suite**: Headless Playwright script capturing 87 verified production screenshots across 4 responsive breakpoints.
- **Documentation**: 14 enterprise whitepapers and architectural specifications in `docs/`.

### Security
- Stateless JWT authentication with Bcrypt password hashing.
- Token-bucket rate limiting middleware (500 requests/minute).
- HMAC-SHA256 cryptographic signing for immutable decision audit logs.
