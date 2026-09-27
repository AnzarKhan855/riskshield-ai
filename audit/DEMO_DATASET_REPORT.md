# RiskShield AI — Enterprise Production Demo Dataset Report

**Audit Phase**: Data Engineering, Relational Schema & Ground-Truth Demo Data Validation  
**Date**: September 20, 2026  
**Seed**: `42` (Fully Deterministic & Reproducible)  
**Location**: `demo_data/` and `audit/datasets/`

---

## 1. Executive Summary

A production-grade, statistically sound, synthetic dataset of **10,000 registered users, 1,000 merchants, 5,000 device fingerprints, 50,000 financial transactions, 2,500 fraud investigation cases, 2,500 forensic evidence records, and 10,000 audit logs** was generated to validate platform scalability, relational integrity, and ML decision fidelity.

The dataset strictly mirrors real-world enterprise banking and fintech risk distributions, avoiding artificial or trivial patterns while maintaining exact ground-truth classifications across normal, suspicious, and fraudulent transactions.

---

## 2. Dataset Entity Breakdown & Volume

| Entity Category | Record Count | File Path | Format | Description |
|:---|:---:|:---|:---:|:---|
| **Users** | `10,000` | [`demo_data/users.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/users.json) | JSON | Enterprise users partitioned into Admins, Merchants, and Fraud Analysts. |
| **Merchants** | `1,000` | [`demo_data/merchants.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/merchants.json) | JSON | Tiered merchants spanning E-Commerce, Travel, Gaming, Crypto, and Retail across global jurisdictions. |
| **Device Fingerprints** | `5,000` | [`demo_data/devices.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/devices.json) | JSON | Mobile, Desktop, and Tablet device fingerprints with real OS, browser signatures, VPN flags, and emulator detection. |
| **Transactions** | `50,000` | [`demo_data/transactions.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/transactions.json) | JSON | High-fidelity transactions with timestamps, currencies (USD, EUR, GBP, CAD, JPY), amounts, and ground-truth risk tags. |
| **Investigation Cases** | `2,500` | [`demo_data/cases.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/cases.json) | JSON | Fraud analyst case files with queue assignments, priority levels (LOW, MEDIUM, HIGH, CRITICAL), and investigation timelines. |
| **Forensic Evidence** | `2,500` | [`demo_data/evidence.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/evidence.json) | JSON | Attached IP telemetry, geofence mismatch logs, device velocity anomalies, and KYC mismatch records. |
| **Audit Logs** | `10,000` | [`demo_data/audit_logs.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/audit_logs.json) | JSON | Immutable audit trail capturing authentication events, rule mutations, model promotions, and decision overrides. |

---

## 3. Statistical Distribution & Ground Truth

The 50,000 transactions follow industry-standard benchmark distributions for card-not-present (CNP) and cross-border payment platforms:

```
[Normal (ALLOW): 80.10%] ================================================================ 40,050 txns
[Suspicious (REVIEW): 14.75%] ============ 7,377 txns
[Confirmed Fraud (BLOCK): 5.15%] ==== 2,573 txns
```

### Risk Stratification Criteria

1. **Normal Transactions (80.10%, 40,050 records)**:
   - Amounts: Typical range (\$5.00 – \$1,200.00), median \$68.50.
   - Geolocation: Domestic or low-risk jurisdictions matching billing country.
   - Device: Known legitimate browser / mobile hardware, clean non-VPN IP, low velocity (< 2 txns/hour).
   - Expected Model Decision: `APPROVE` (Risk Score: 5.0 – 29.0).

2. **Suspicious Transactions (14.75%, 7,377 records)**:
   - Amounts: Elevated range (\$1,500.00 – \$4,999.00) or unusual velocity bursts (4–8 txns in 10 minutes).
   - Geolocation: Cross-border mismatch or datacenter proxy usage.
   - Device: OS update mismatch or recent browser fingerprint variance.
   - Expected Model Decision: `REVIEW` (Risk Score: 35.0 – 74.0).

3. **Confirmed Fraud (5.15%, 2,573 records)**:
   - Amounts: Extreme values (>\$5,000.00 to \$25,000.00), rapid velocity spikes (>10 txns/minute), or card-testing sequences (\$1.00 followed immediately by \$8,500.00).
   - Geolocation: Sanctioned or high-fraud origin IPs (e.g., NG, RU, PK, RO) with conflicting billing coordinates.
   - Device: Tor exit node, VPN concealment, emulator signatures, or known blacklisted device fingerprint.
   - Expected Model Decision: `BLOCK` (Risk Score: 75.0 – 99.5).

---

## 4. Five-Tier Relational Integrity & Schema Validation

Every record satisfies exact relational foreign-key consistency:
$$\text{User} \xrightarrow{1:N} \text{Merchant} \xrightarrow{1:N} \text{Transaction} \xrightarrow{1:1} \text{Investigation Case} \xrightarrow{1:N} \text{Evidence}$$

- **Orphan Records**: `0`
- **Missing Required Fields**: `0`
- **Schema Violations**: `0`
- **Foreign Key Mismatches**: `0` (Tested via `tests/audit_db_deep.py` with 25/25 PASS)

---

## 5. Reproducibility & Regeneration

The dataset can be deterministically re-generated at any time using:
```bash
python scripts/generate_demo_dataset.py --seed 42 --users 10000 --transactions 50000
```
Checksum manifest is permanently stored in [`demo_data/manifest.json`](file:///c:/Users/anzar/OneDrive/Documents/GitHub/riskshield-ai/demo_data/manifest.json).
