# RiskShield AI — Production Audit Evidence Repository

This directory contains the complete, evidence-driven production audit, ground-truth benchmarks, reproducible demo datasets, test execution logs, and scalability load test reports for **RiskShield AI**.

---

## 1. Master Audit Reports

1. [**RISKSHIELD_PRODUCTION_AUDIT.md**](./RISKSHIELD_PRODUCTION_AUDIT.md):  
   The master certification report covering the comprehensive audit verdict, feature inventory, real-user simulation results, confusion matrix, 5-tier database relational tracing, security & secrets scan, chaos engineering, and final scorecard.

2. [**DEMO_DATASET_REPORT.md**](./DEMO_DATASET_REPORT.md):  
   Detailed data engineering report on the deterministic synthetic demo dataset (10,000 registered users, 1,000 merchants, 5,000 devices, 50,000 transactions, 2,500 cases, 2,500 evidence records, 10,000 audit logs).

3. [**LOAD_TEST_REPORT.md**](./LOAD_TEST_REPORT.md):  
   In-depth performance engineering report detailing progressive load testing (100 -> 500 -> 1,000 -> 2,500 -> 5,000 -> 10,000 simulated users) across 6 realistic journeys, saturation analysis, and Kubernetes production sizing.

---

## 2. Evidence Subdirectories

- [`database-validation/`](./database-validation/):  
  Contains [`database_audit_results.json`](./database-validation/database_audit_results.json) verifying the 5-tier relational trace (`User -> Merchant -> Transaction -> Case -> Evidence`), foreign key constraints, ACID rollbacks, and CRUD operations (25/25 PASS).

- [`test-results/`](./test-results/):  
  Contains raw automated test results:
  - [`real_user_simulation_results.json`](./test-results/real_user_simulation_results.json): 21-step end-to-end user workflow execution log (100% PASS).
  - [`decision_validation_metrics.json`](./test-results/decision_validation_metrics.json): 60-scenario ground-truth confusion matrix, F1 score, precision, recall, FPR, FNR.
  - [`frontend_routes_audit.json`](./test-results/frontend_routes_audit.json): Route crawler results verifying all 41 Next.js App Router pages (0 dead links).
  - [`security_governance_results.json`](./test-results/security_governance_results.json): RBAC, privilege escalation prevention, override audit trail, and secret scan results (17/17 PASS).
  - [`chaos_recovery_results.json`](./test-results/chaos_recovery_results.json): Offline AI fallback, ML degraded feature handling, and DB session recovery results (5/5 PASS).

- [`performance-results/`](./performance-results/):  
  Contains [`load_scalability_results.json`](./performance-results/load_scalability_results.json) capturing throughput (RPS), duration, status distributions, and latency percentiles (min, p50, p90, p95, p99, max, mean) across all 6 concurrency tiers.

- [`datasets/`](./datasets/):  
  Full deterministic demo datasets and samples in JSON and JSONL formats (`users`, `merchants`, `devices`, `transactions`, `cases`, `evidence`, `audit_logs`, `manifest.json`).

- [`screenshots/`](./screenshots/):  
  Contains visual wireframes, DOM verification captures, and structured UI traces in [`screenshots/README.md`](./screenshots/README.md).

---

## 3. How to Reproduce All Audit Test Suites

From the repository root with backend virtual environment active:

```bash
# 1. Generate Deterministic Demo Dataset (10k Users, 50k Txns)
python scripts/generate_demo_dataset.py --seed 42 --users 10000 --transactions 50000

# 2. Execute 5-Tier Database Deep Audit
python tests/audit_db_deep.py

# 3. Execute Real-User Simulation (Workflow A, 21 Steps)
python tests/audit_real_user_simulation.py

# 4. Execute ML Ground-Truth Decision Validation
python tests/audit_decision_validation.py

# 5. Execute Frontend Route Crawl (All 41 Next.js Pages)
python tests/audit_frontend_routes.py

# 6. Execute Security, RBAC & Secret Governance Audit
python tests/audit_security_governance.py

# 7. Execute Chaos Engineering & Failure Recovery Audit
python tests/audit_chaos_recovery.py

# 8. Execute Progressive Scalability Load Test (100 -> 10,000 Users)
python tests/audit_load_scalability.py
```
