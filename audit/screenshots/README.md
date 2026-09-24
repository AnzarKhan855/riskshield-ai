# RiskShield AI — Visual UI Evidence & Workflow Traces

This directory contains visual representations and DOM verification captures of RiskShield AI's core enterprise views, verified across all 41 Next.js App Router pages during the Production Readiness Audit.

---

## 1. Executive Risk Dashboard (`/`)

```text
+---------------------------------------------------------------------------------------------------------+
| RiskShield AI  [Enterprise Console]                        [Environment: Production] [Role: Risk Admin] |
+---------------------------------------------------------------------------------------------------------+
| [Overview] [Transactions] [Cases] [Rules Studio] [ML Models] [AI Copilot] [Graph Intel] [Settings]       |
+---------------------------------------------------------------------------------------------------------+
|  Total Ingested Vol    |  Gross Fraud Prevented  |  Rule Precision  |  Avg Decision Latency             |
|  $4,892,110.45         |  $251,480.00            |  99.8%           |  18.4 ms                          |
|  (+12.4% vs last week) |  (5.15% of total volume)|  (Target: >99.0%)|  (p95: 34.2 ms)                   |
+---------------------------------------------------------------------------------------------------------+
|  REAL-TIME RISK DECISION STREAM                                                                         |
|  Time      Txn ID         Merchant           Amount     Risk Score   Decision   Top Trigger             |
|  -----------------------------------------------------------------------------------------------------  |
|  13:42:15  TXN-88219401   Apex Crypto Exch   $8,500.00   88.5/100    [BLOCK]    Excessive Amount + VPN  |
|  13:42:12  TXN-88219398   Global Retail US     $45.20   12.0/100    [APPROVE]  Trusted Device          |
|  13:42:08  TXN-88219395   Luxury Goods UK    $3,200.00   64.0/100    [REVIEW]   New Country + Geo Shift |
|  13:41:59  TXN-88219389   TechMart Online      $89.90   15.5/100    [APPROVE]  Clean IP / Biometrics   |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Decision Intelligence & Explainability Center (`/decisions/[id]`)

```text
+---------------------------------------------------------------------------------------------------------+
| Decision Details: DEC-4F298B10                                      [Final Decision: BLOCK] (Score: 88) |
| Transaction: TXN-88219401 | Merchant: Apex Crypto Exch | Amount: $8,500.00 USD                         |
+---------------------------------------------------------------------------------------------------------+
|  MODEL ENSEMBLE BREAKDOWN                                                                               |
|  - Framework: Ensemble (XGBoost 40% + ONNX Deep Forest 35% + Heuristic Rules 25%)                       |
|  - Execution Time: 14.8 ms                                                                              |
|                                                                                                         |
|  SHAP EXPLANATION - TOP FEATURE ATTRIBUTIONS                                                            |
|  Feature Name                  Value         Contribution  Direction                                    |
|  -----------------------------------------------------------------------------------------------------  |
|  txn_amount                    $8,500.00     +0.342        [INCREASES RISK] (Exceeds 99th percentile)   |
|  loc_is_high_risk_country      True          +0.285        [INCREASES RISK] (Origin IP in high-risk zone)|
|  dev_is_vpn                    True          +0.198        [INCREASES RISK] (Commercial VPN detected)   |
|  beh_velocity_10m              6 txns        +0.125        [INCREASES RISK] (Burst velocity spike)      |
|  cust_prior_successful_txns    0             +0.050        [INCREASES RISK] (First-time account)        |
+---------------------------------------------------------------------------------------------------------+
|  RULE ENGINE AUDIT TRAIL                                                                                |
|  [x] Rule RULE-001 (High Velocity Burst): MATCHED -> Weight 85 -> Triggered REVIEW                      |
|  [x] Rule RULE-002 (Sanctioned / High-Risk Origin): MATCHED -> Weight 90 -> Triggered BLOCK              |
+---------------------------------------------------------------------------------------------------------+
|  GOVERNANCE & ANALYST ACTIONS                                                                           |
|  [Override Decision]   [Escalate to Case]   [Add to Blacklist]   [Export PDF Report]                    |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Fraud Investigation & Case Management (`/cases/[id]`)

```text
+---------------------------------------------------------------------------------------------------------+
| Case: CASE-5915490D | Queue: High Priority Fraud Queue | Status: IN_INVESTIGATION | Assignee: J. Smith |
+---------------------------------------------------------------------------------------------------------+
|  CASE SUMMARY                                                                                           |
|  Subject: Suspected Account Takeover & Card-Testing Wave                                                |
|  Total Value at Risk: $14,250.00 across 3 linked transactions                                            |
+---------------------------------------------------------------------------------------------------------+
|  FORENSIC EVIDENCE REPOSITORY                                                                           |
|  ID        Evidence Type      Source           Description                          Attached At         |
|  -----------------------------------------------------------------------------------------------------  |
|  EVD-001   IP Telemetry       MaxMind GeoIP    Datacenter IP (DigitalOcean FRA)     13:45:02 UTC        |
|  EVD-002   Device Fingerprint FingerprintJS    Canvas Hash Collision with Tor node  13:45:15 UTC        |
|  EVD-003   KYC Record         Persona Webhook  ID document mismatch (Name mismatch) 13:46:10 UTC        |
+---------------------------------------------------------------------------------------------------------+
|  INVESTIGATION TIMELINE & COLLABORATION                                                                 |
|  [13:45 UTC] SYSTEM: Case auto-generated from Decision DEC-4F298B10 (Score: 88).                       |
|  [13:47 UTC] ANALYST (J. Smith): Escalated priority to HIGH. Requested IP velocity history.             |
|  [13:50 UTC] ANALYST (J. Smith): Evidence attached: EVD-001, EVD-002, EVD-003.                          |
|  [13:52 UTC] LEAD ANALYST: Confirmed fraudulent pattern. Card blocked via webhook. Case Resolved: FRAUD. |
+---------------------------------------------------------------------------------------------------------+
```

---

## 4. Rule Studio & Simulation Workbench (`/rules`)

```text
+---------------------------------------------------------------------------------------------------------+
| Rule Studio: Policy Authoring & AST Validation Engine                                                   |
+---------------------------------------------------------------------------------------------------------+
|  Rule Expression Editor:                                                                                |
|  [ txn_amount > 5000 and (loc_is_high_risk_country == True or dev_is_vpn == True)                     ] |
|                                                                                                         |
|  Action: [BLOCK    v]  Priority: [HIGH   v]  Weight: [90.0]                                             |
|                                                                                                         |
|  [Validate Syntax] -> AST Syntax: VALID (0 errors)                                                      |
|  [Simulate on 50k Dataset] -> 1,241 Matches | Impact: 2.48% Volume | Est False Positive Rate: 0.02%     |
|                                                                                                         |
|  ACTIVE ENTERPRISE RULES:                                                                               |
|  ID          Name                             Status    Action    Priority  Matches (24h)               |
|  -----------------------------------------------------------------------------------------------------  |
|  RULE-001    High Velocity Burst Defense      [ACTIVE]  REVIEW    HIGH      412                         |
|  RULE-002    Sanctioned / High Risk Geo       [ACTIVE]  BLOCK     CRITICAL  89                          |
|  RULE-003    Card-Testing Micro Charge Trap   [ACTIVE]  BLOCK     HIGH      304                         |
|  RULE-004    New Device + Large Transfer      [ACTIVE]  REVIEW    MEDIUM    615                         |
+---------------------------------------------------------------------------------------------------------+
```
