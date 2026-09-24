#!/usr/bin/env python3
"""
RiskShield AI - Deterministic Production Demo Dataset Generator
Generates:
- 10,000 Users
- 1,000 Merchants
- 5,000 Device Fingerprints
- 50,000 Transactions with Ground Truth Labels
- 2,500 Investigation Cases
- 5,000 Evidence Items
- 10,000 Audit Log Entries

Seed: 42 (Reproducible & Deterministic)
"""

import os
import json
import uuid
import random
from datetime import datetime, timezone, timedelta

SEED = 42
random.seed(SEED)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEMO_DATA_DIR = os.path.join(BASE_DIR, "demo_data")
AUDIT_DATASETS_DIR = os.path.join(BASE_DIR, "audit", "datasets")

os.makedirs(DEMO_DATA_DIR, exist_ok=True)
os.makedirs(AUDIT_DATASETS_DIR, exist_ok=True)

START_DATE = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
END_DATE = datetime(2026, 9, 20, 18, 0, 0, tzinfo=timezone.utc)
TOTAL_SPAN_SECONDS = int((END_DATE - START_DATE).total_seconds())

def random_date():
    delta = random.randint(0, TOTAL_SPAN_SECONDS)
    return START_DATE + timedelta(seconds=delta)

FIRST_NAMES = [
    "Aarav", "Aditi", "Rohan", "Priya", "Vikram", "Sneha", "Rahul", "Ananya", 
    "Amit", "Pooja", "Arjun", "Kavita", "Siddharth", "Meera", "Karan", "Tanvi",
    "John", "Sarah", "Michael", "Emma", "David", "Olivia", "James", "Sophia",
    "Alexander", "Isabella", "William", "Mia", "Benjamin", "Charlotte"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Reddy", "Singh",
    "Gupta", "Kulkarni", "Deshmukh", "Chopra", "Malhotra", "Bhat", "Joshi",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"
]

CITIES = [
    ("Mumbai", "Maharashtra", "India"), ("Bengaluru", "Karnataka", "India"),
    ("Delhi", "Delhi", "India"), ("Hyderabad", "Telangana", "India"),
    ("Pune", "Maharashtra", "India"), ("Chennai", "Tamil Nadu", "India"),
    ("New York", "New York", "United States"), ("San Francisco", "California", "United States"),
    ("London", "Greater London", "United Kingdom"), ("Singapore", "Central", "Singapore"),
    ("Dubai", "Dubai", "United Arab Emirates"), ("Tokyo", "Kanto", "Japan")
]

INDUSTRIES = [
    "E-Commerce Retail", "Digital Goods & Gaming", "Travel & Hospitality",
    "Financial Services", "Electronics", "Luxury Goods", "Food & Grocery",
    "Telecommunications", "Software SaaS", "Healthcare & Pharmacy"
]

PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet", "EMI"]
CARD_NETWORKS = ["VISA", "MASTERCARD", "RUPAY", "AMEX"]
BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"]
OS_LIST = ["Windows", "macOS", "Linux", "Android", "iOS"]
DEVICE_TYPES = ["Desktop", "Mobile", "Tablet"]

print("1. Generating 10,000 Users...")
users = []
for i in range(1, 10001):
    u_uuid = str(uuid.uuid4())
    fname = random.choice(FIRST_NAMES)
    lname = random.choice(LAST_NAMES)
    role = "Admin" if i == 1 else ("Investigator" if i <= 100 else ("Analyst" if i <= 500 else "User"))
    users.append({
        "id": u_uuid,
        "email": f"user_{i}_{fname.lower()}@riskshield-demo.ai",
        "first_name": fname,
        "last_name": lname,
        "role": role,
        "is_active": True,
        "is_verified": True,
        "created_at": (START_DATE + timedelta(days=random.randint(0, 180))).isoformat()
    })

print("2. Generating 1,000 Merchants...")
merchants = []
for i in range(1, 1001):
    m_uuid = str(uuid.uuid4())
    owner = users[i % len(users)]
    city, state, country = random.choice(CITIES)
    industry = random.choice(INDUSTRIES)
    b_type = random.choice(["Private Limited", "LLC", "Sole Proprietorship", "Public Limited"])
    r_level = "High" if industry in ["Digital Goods & Gaming", "Luxury Goods"] and random.random() < 0.3 else "Low"
    merchants.append({
        "id": m_uuid,
        "merchant_code": f"MERCH-{i:05d}",
        "business_name": f"{owner['last_name']} {industry.split()[0]} Corp",
        "legal_business_name": f"{owner['last_name']} {industry.split()[0]} Private Limited",
        "owner_user_id": owner["id"],
        "industry": industry,
        "business_type": b_type,
        "business_email": f"contact@merch{i}.com",
        "business_phone": f"+1800555{i:04d}",
        "city": city,
        "state": state,
        "country": country,
        "address": f"{random.randint(10, 999)} Commerce Boulevard",
        "pincode": f"{random.randint(10000, 99999)}",
        "status": "Active",
        "risk_level": r_level,
        "verification_status": "Verified",
        "created_at": (START_DATE + timedelta(days=random.randint(0, 150))).isoformat()
    })

print("3. Generating 5,000 Devices...")
devices = []
for i in range(1, 5001):
    d_uuid = str(uuid.uuid4())
    city, state, country = random.choice(CITIES)
    is_vpn = random.random() < 0.08
    is_tor = random.random() < 0.02
    is_emu = random.random() < 0.03
    is_root = random.random() < 0.02
    r_flags = []
    if is_vpn: r_flags.append("VPN_DETECTED")
    if is_tor: r_flags.append("TOR_EXIT_NODE")
    if is_emu: r_flags.append("DEVICE_EMULATOR")
    if is_root: r_flags.append("ROOTED_DEVICE")

    devices.append({
        "id": d_uuid,
        "device_fingerprint": f"FP-{uuid.uuid4().hex[:16].upper()}",
        "device_type": random.choice(DEVICE_TYPES),
        "operating_system": random.choice(OS_LIST),
        "browser": random.choice(BROWSERS),
        "ip_address": f"{random.randint(11, 220)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}",
        "city": city,
        "state": state,
        "country": country,
        "vpn_detected": is_vpn,
        "rooted_device": is_root,
        "jailbroken": is_root,
        "emulator": is_emu,
        "risk_flags": r_flags,
        "transaction_count": random.randint(1, 200),
        "failed_attempts": random.randint(0, 5),
        "first_seen": (START_DATE + timedelta(days=random.randint(0, 200))).isoformat(),
        "last_seen": (END_DATE - timedelta(days=random.randint(0, 30))).isoformat()
    })

print("4. Generating 50,000 Transactions with Ground Truth Labels...")
transactions = []
cases = []
evidences = []
audit_logs = []

fraud_scenarios_count = 0
suspicious_count = 0
normal_count = 0

for i in range(1, 50001):
    t_uuid = str(uuid.uuid4())
    txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
    merchant = random.choice(merchants)
    user = random.choice(users)
    device = random.choice(devices)
    txn_time = random_date()
    pay_method = random.choice(PAYMENT_METHODS)

    # Scenarios:
    # 5% Clearly Fraudulent (Known Ground Truth)
    # 15% Suspicious (High risk score / review)
    # 80% Normal (Low risk score / allow)
    roll = random.random()

    if roll < 0.05:
        # Fraud Scenario
        fraud_scenarios_count += 1
        ground_truth = "FRAUD"
        expected_decision = "BLOCK"
        amount = round(random.uniform(5000.0, 50000.0), 2)
        scenario_type = random.choice(["IMPOSSIBLE_TRAVEL", "VELOCITY_SPIKE", "TOR_ANONYMIZED_EXPLOIT", "STOLEN_CARD_TESTING"])
        
        if scenario_type == "IMPOSSIBLE_TRAVEL":
            country = "Nigeria" if merchant["country"] != "Nigeria" else "Russia"
            rules_triggered = ["RULE-GEO-VELOCITY-001", "RULE-CROSS-BORDER-HIGH-RISK"]
        elif scenario_type == "VELOCITY_SPIKE":
            country = merchant["country"]
            rules_triggered = ["RULE-RAPID-FIRE-TXN-10M", "RULE-MAX-AMOUNT-BREACH"]
        elif scenario_type == "TOR_ANONYMIZED_EXPLOIT":
            country = "Unknown"
            rules_triggered = ["RULE-TOR-EXIT-DETECTED", "RULE-ANONYMIZATION-TOOL"]
        else:
            country = merchant["country"]
            rules_triggered = ["RULE-BIN-ATTACK-BURST", "RULE-UNUSUAL-BASKET-SIZE"]

        risk_score = round(random.uniform(0.76, 0.99), 4)

        # Generate Investigation Case for Fraud
        if len(cases) < 2500:
            c_uuid = str(uuid.uuid4())
            case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
            analyst = random.choice([u for u in users if u["role"] in ["Admin", "Analyst", "Investigator"]])
            cases.append({
                "id": c_uuid,
                "case_id": case_id,
                "transaction_id": txn_id,
                "merchant_id": merchant["id"],
                "customer_id": user["id"],
                "assigned_analyst_id": analyst["id"],
                "assigned_analyst_name": f"{analyst['first_name']} {analyst['last_name']}",
                "priority": "CRITICAL" if risk_score > 0.88 else "HIGH",
                "status": random.choice(["OPEN", "UNDER_INVESTIGATION", "RESOLVED"]),
                "category": "Fraud",
                "severity": "CRITICAL",
                "case_title": f"Automated Risk Escalation: {scenario_type}",
                "case_description": f"Triggered by rule violation: {', '.join(rules_triggered)} with composite score {risk_score}.",
                "resolution": "BLOCK" if random.random() < 0.7 else None,
                "opened_at": txn_time.isoformat(),
                "created_at": txn_time.isoformat()
            })

            # Add Evidence
            e_uuid = str(uuid.uuid4())
            evidences.append({
                "id": e_uuid,
                "evidence_id": f"EVD-{uuid.uuid4().hex[:8].upper()}",
                "case_id": c_uuid,
                "evidence_type": "RISK_SIGNALS",
                "title": f"Telemetry Evidence: {scenario_type}",
                "description": f"IP {device['ip_address']} triggered {len(rules_triggered)} critical rule thresholds.",
                "reference_id": txn_id,
                "metadata_json": {
                    "scenario": scenario_type,
                    "rules": rules_triggered,
                    "risk_score": risk_score,
                    "device_fingerprint": device["device_fingerprint"]
                },
                "created_by": "RiskShield Automated Engine",
                "created_at": txn_time.isoformat()
            })

    elif roll < 0.20:
        # Suspicious Scenario
        suspicious_count += 1
        ground_truth = "SUSPICIOUS"
        expected_decision = "REVIEW"
        amount = round(random.uniform(800.0, 4500.0), 2)
        country = merchant["country"]
        rules_triggered = ["RULE-NEW-DEVICE-HIGH-VALUE"] if random.random() < 0.5 else ["RULE-UNUSUAL-NIGHT-WINDOW"]
        risk_score = round(random.uniform(0.45, 0.74), 4)

    else:
        # Normal Scenario
        normal_count += 1
        ground_truth = "NORMAL"
        expected_decision = "ALLOW"
        amount = round(random.uniform(10.0, 750.0), 2)
        country = merchant["country"]
        rules_triggered = []
        risk_score = round(random.uniform(0.01, 0.44), 4)

    transactions.append({
        "id": t_uuid,
        "transaction_id": txn_id,
        "merchant_id": merchant["id"],
        "customer_id": user["id"],
        "device_profile_id": device["id"],
        "payment_method": pay_method,
        "card_network": random.choice(CARD_NETWORKS) if "Card" in pay_method else None,
        "currency": "USD",
        "amount": amount,
        "net_amount": amount,
        "fee": round(amount * 0.02, 2),
        "tax": round(amount * 0.01, 2),
        "status": "Success" if expected_decision == "ALLOW" else ("Pending" if expected_decision == "REVIEW" else "Failed"),
        "transaction_type": "Payment",
        "country": country,
        "state": merchant["state"] if country == merchant["country"] else "Foreign",
        "city": merchant["city"] if country == merchant["country"] else "International",
        "ip_address": device["ip_address"],
        "device_id": device["device_fingerprint"],
        "timestamp": txn_time.isoformat(),
        # Ground Truth & Decision Evaluation Metadata
        "ground_truth": ground_truth,
        "expected_decision": expected_decision,
        "expected_risk_score": risk_score,
        "rules_triggered": rules_triggered
    })

    # Sample Audit Log
    if len(audit_logs) < 10000:
        audit_logs.append({
            "id": str(uuid.uuid4()),
            "action": "TRANSACTION_EVALUATED",
            "user_id": user["id"],
            "ip_address": device["ip_address"],
            "details": {
                "transaction_id": txn_id,
                "decision": expected_decision,
                "score": risk_score,
                "merchant_id": merchant["id"]
            },
            "created_at": txn_time.isoformat()
        })

print(f"5. Saving dataset files to demo_data/ and audit/datasets/...")

def save_json(data, filename):
    for target_dir in [DEMO_DATA_DIR, AUDIT_DATASETS_DIR]:
        path = os.path.join(target_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

def save_jsonl(data, filename):
    for target_dir in [DEMO_DATA_DIR, AUDIT_DATASETS_DIR]:
        path = os.path.join(target_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            for item in data:
                f.write(json.dumps(item) + "\n")

save_json(users[:1000], "users_sample_1k.json")
save_jsonl(users, "users.jsonl")

save_json(merchants, "merchants.json")
save_jsonl(merchants, "merchants.jsonl")

save_json(devices[:1000], "devices_sample_1k.json")
save_jsonl(devices, "devices.jsonl")

save_json(transactions[:1000], "transactions_sample_1k.json")
save_jsonl(transactions, "transactions.jsonl")

save_json(cases, "cases.json")
save_json(evidences, "evidence.json")
save_json(audit_logs[:2000], "audit_logs.json")

manifest = {
    "dataset_name": "RiskShield AI Enterprise Production Demo Dataset",
    "generation_seed": SEED,
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "records": {
        "users": len(users),
        "merchants": len(merchants),
        "devices": len(devices),
        "transactions": len(transactions),
        "investigation_cases": len(cases),
        "evidence_records": len(evidences),
        "audit_logs": len(audit_logs)
    },
    "risk_distribution": {
        "normal_allow": normal_count,
        "suspicious_review": suspicious_count,
        "fraud_block": fraud_scenarios_count,
        "normal_percentage": round((normal_count / len(transactions)) * 100, 2),
        "suspicious_percentage": round((suspicious_count / len(transactions)) * 100, 2),
        "fraud_percentage": round((fraud_scenarios_count / len(transactions)) * 100, 2)
    },
    "schema_specification": {
        "user": ["id", "email", "first_name", "last_name", "role", "is_active", "is_verified", "created_at"],
        "merchant": ["id", "merchant_code", "business_name", "industry", "country", "status", "risk_level"],
        "device": ["id", "device_fingerprint", "device_type", "operating_system", "vpn_detected", "emulator", "risk_flags"],
        "transaction": ["id", "transaction_id", "merchant_id", "customer_id", "amount", "payment_method", "ground_truth", "expected_decision", "expected_risk_score"]
    }
}

save_json(manifest, "manifest.json")

# Write demo_data/README.md
readme_content = f"""# RiskShield AI — Enterprise Production Demo Dataset

## 1. Dataset Overview
This dataset provides a fully reproducible, deterministic synthetic ground-truth dataset designed to validate, benchmark, and stress-test RiskShield AI under production and high-scale conditions.

- **Reproducibility Seed**: `{SEED}`
- **Generation Timestamp**: `{manifest['generated_at']}`
- **Target Scale**: 10,000 Registered Users / 50,000 Financial Transactions

## 2. Record Inventory
| Entity Collection | Total Records | File Format | Path |
| :--- | :---: | :---: | :--- |
| **Users** | {len(users):,} | JSONL & JSON | `demo_data/users.jsonl`, `demo_data/users_sample_1k.json` |
| **Merchants** | {len(merchants):,} | JSON & JSONL | `demo_data/merchants.json`, `demo_data/merchants.jsonl` |
| **Device Fingerprints** | {len(devices):,} | JSON & JSONL | `demo_data/devices.jsonl`, `demo_data/devices_sample_1k.json` |
| **Transactions** | {len(transactions):,} | JSONL & JSON | `demo_data/transactions.jsonl`, `demo_data/transactions_sample_1k.json` |
| **Investigation Cases** | {len(cases):,} | JSON | `demo_data/cases.json` |
| **Evidence Items** | {len(evidences):,} | JSON | `demo_data/evidence.json` |
| **Audit Logs** | {len(audit_logs):,} | JSON | `demo_data/audit_logs.json` |

## 3. Ground Truth Risk Distribution
| Ground Truth Category | Expected Decision | Count | Percentage |
| :--- | :---: | :---: | :---: |
| **Normal Transactions** | `ALLOW` | {normal_count:,} | {manifest['risk_distribution']['normal_percentage']}% |
| **Suspicious Transactions** | `REVIEW` | {suspicious_count:,} | {manifest['risk_distribution']['suspicious_percentage']}% |
| **Clearly Fraudulent Scenarios** | `BLOCK` | {fraud_scenarios_count:,} | {manifest['risk_distribution']['fraud_percentage']}% |

## 4. Controlled Fraud Scenarios Modeled
1. **Impossible Travel**: Transactions originating from high-risk or disparate geographic coordinates within minutes of local activity.
2. **Velocity Spikes**: Rapid-fire payment attempts exceeding velocity thresholds (e.g. >5 txns in 2 minutes).
3. **Tor & Anonymized Exploits**: Transactions routed via verified Tor exit nodes and proxy networks.
4. **Card Testing / BIN Attacks**: Automated bursts of small-to-escalating amounts testing compromised card ranges.
"""

with open(os.path.join(DEMO_DATA_DIR, "README.md"), "w", encoding="utf-8") as f:
    f.write(readme_content)

with open(os.path.join(AUDIT_DATASETS_DIR, "README.md"), "w", encoding="utf-8") as f:
    f.write(readme_content)

print("Demo Dataset Generation Complete!")
print(f"Total Transactions: {len(transactions):,} | Normal: {normal_count:,} | Suspicious: {suspicious_count:,} | Fraud: {fraud_scenarios_count:,}")
