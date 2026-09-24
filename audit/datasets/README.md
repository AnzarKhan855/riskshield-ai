# RiskShield AI — Enterprise Production Demo Dataset

## 1. Dataset Overview
This dataset provides a fully reproducible, deterministic synthetic ground-truth dataset designed to validate, benchmark, and stress-test RiskShield AI under production and high-scale conditions.

- **Reproducibility Seed**: `42`
- **Generation Timestamp**: `2026-09-20T13:43:25.843221+00:00`
- **Target Scale**: 10,000 Registered Users / 50,000 Financial Transactions

## 2. Record Inventory
| Entity Collection | Total Records | File Format | Path |
| :--- | :---: | :---: | :--- |
| **Users** | 10,000 | JSONL & JSON | `demo_data/users.jsonl`, `demo_data/users_sample_1k.json` |
| **Merchants** | 1,000 | JSON & JSONL | `demo_data/merchants.json`, `demo_data/merchants.jsonl` |
| **Device Fingerprints** | 5,000 | JSON & JSONL | `demo_data/devices.jsonl`, `demo_data/devices_sample_1k.json` |
| **Transactions** | 50,000 | JSONL & JSON | `demo_data/transactions.jsonl`, `demo_data/transactions_sample_1k.json` |
| **Investigation Cases** | 2,500 | JSON | `demo_data/cases.json` |
| **Evidence Items** | 2,500 | JSON | `demo_data/evidence.json` |
| **Audit Logs** | 10,000 | JSON | `demo_data/audit_logs.json` |

## 3. Ground Truth Risk Distribution
| Ground Truth Category | Expected Decision | Count | Percentage |
| :--- | :---: | :---: | :---: |
| **Normal Transactions** | `ALLOW` | 40,050 | 80.1% |
| **Suspicious Transactions** | `REVIEW` | 7,377 | 14.75% |
| **Clearly Fraudulent Scenarios** | `BLOCK` | 2,573 | 5.15% |

## 4. Controlled Fraud Scenarios Modeled
1. **Impossible Travel**: Transactions originating from high-risk or disparate geographic coordinates within minutes of local activity.
2. **Velocity Spikes**: Rapid-fire payment attempts exceeding velocity thresholds (e.g. >5 txns in 2 minutes).
3. **Tor & Anonymized Exploits**: Transactions routed via verified Tor exit nodes and proxy networks.
4. **Card Testing / BIN Attacks**: Automated bursts of small-to-escalating amounts testing compromised card ranges.
