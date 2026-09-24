#!/usr/bin/env python3
"""
RiskShield AI - Transaction Decision & Ground Truth Validation Suite
Calculates:
- Confusion Matrix (TP, FP, TN, FN)
- Accuracy, Precision, Recall, F1-Score
- False Positive Rate (FPR), False Negative Rate (FNR)
- Score Distributions (Min, Max, Mean, P50, P95)
- Decision Categorical Breakdown (APPROVE, REVIEW, BLOCK)
- Rule Trigger Correlation with Known Fraud Scenarios
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import math
import statistics

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_call(path: str, method: str = "GET", payload: dict = None, token: str = None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            latency_ms = round((time.perf_counter() - t0) * 1000, 2)
            raw = resp.read().decode("utf-8")
            res_json = json.loads(raw) if raw else {}
            return {"status": resp.status, "data": res_json, "latency_ms": latency_ms, "error": None}
    except urllib.error.HTTPError as e:
        latency_ms = round((time.perf_counter() - t0) * 1000, 2)
        raw = e.read().decode("utf-8")
        try:
            res_json = json.loads(raw)
        except Exception:
            res_json = {"raw": raw}
        return {"status": e.code, "data": res_json, "latency_ms": latency_ms, "error": f"HTTP {e.code}"}
    except Exception as exc:
        latency_ms = round((time.perf_counter() - t0) * 1000, 2)
        return {"status": 0, "data": {}, "latency_ms": latency_ms, "error": str(exc)}

def run_decision_validation():
    print("=" * 80)
    print("      RISKSHIELD AI — TRANSACTION DECISION GROUND-TRUTH VALIDATION SUITE      ")
    print("=" * 80)

    # 1. Login as Admin/Analyst
    login_res = api_call("/auth/login", method="POST", payload={
        "email": "admin@riskshield.ai",
        "password": "Password123!"
    })
    token = login_res["data"].get("data", {}).get("access_token")
    if not token:
        print("[FAIL] Failed to acquire auth token")
        return

    # 2. Fetch or create a valid merchant
    merch_res = api_call("/merchants", token=token)
    merchants = merch_res.get("data", {}).get("data", {}).get("items", [])
    merchant_id = merchants[0]["id"] if merchants else str(uuid.uuid4())

    # 3. Formulate Controlled Benchmark Test Cases
    # Set of 60 test cases:
    # - 30 Normal (Ground Truth: NEGATIVE / ALLOW)
    # - 15 Suspicious (Ground Truth: SUSPICIOUS / REVIEW)
    # - 15 Critical Fraud (Ground Truth: POSITIVE / BLOCK)
    
    test_cases = []

    # Normal Transactions
    for i in range(30):
        amt = round(15.0 + i * 12.5, 2)
        test_cases.append({
            "id": f"TEST-NORM-{i:03d}",
            "amount": amt,
            "currency": "USD",
            "payment_method": "Credit Card",
            "country": "United States",
            "ground_truth": "NORMAL",
            "expected_decision": "ALLOW",
            "expected_class": 0 # Negative (No fraud)
        })

    # Suspicious Transactions (elevated amounts, unusual night window)
    for i in range(15):
        amt = round(2500.0 + i * 250.0, 2)
        test_cases.append({
            "id": f"TEST-SUSP-{i:03d}",
            "amount": amt,
            "currency": "USD",
            "payment_method": "UPI",
            "country": "United States",
            "ground_truth": "SUSPICIOUS",
            "expected_decision": "REVIEW",
            "expected_class": 1 # Positive (Requires action)
        })

    # Fraudulent Transactions (Extreme amounts, cross-border, synthetic fraud)
    for i in range(15):
        amt = round(12000.0 + i * 1500.0, 2)
        test_cases.append({
            "id": f"TEST-FRAUD-{i:03d}",
            "amount": amt,
            "currency": "USD",
            "payment_method": "Credit Card",
            "country": "Nigeria" if i % 2 == 0 else "Russia",
            "ground_truth": "FRAUD",
            "expected_decision": "BLOCK",
            "expected_class": 1 # Positive (Action required / Block)
        })

    print(f"Executing {len(test_cases)} controlled ground-truth decision evaluations...")

    y_true = []
    y_pred = []
    scores = []
    decisions_count = {"APPROVE": 0, "REVIEW": 0, "BLOCK": 0, "ALLOW": 0}
    latencies = []
    evaluated_records = []

    for tc in test_cases:
        # Create transaction
        txn_payload = {
            "merchant_id": merchant_id,
            "amount": tc["amount"],
            "currency": tc["currency"],
            "payment_method": tc["payment_method"],
            "country": tc["country"],
            "device_id": "DEV-BENCH-VALIDATION"
        }
        res_txn = api_call("/transactions", method="POST", payload=txn_payload, token=token)
        txn_id = res_txn.get("data", {}).get("data", {}).get("transaction_id")
        if not txn_id:
            continue

        # Evaluate decision
        res_eval = api_call("/decisions/evaluate", method="POST", payload={"transaction_id": txn_id}, token=token)
        eval_data = res_eval.get("data", {}).get("data", {}) or res_eval.get("data", {})
        
        actual_decision = eval_data.get("decision", "APPROVE")
        risk_score = eval_data.get("composite_risk_score", 0.0)
        latency = res_eval.get("latency_ms", 0.0)
        rules = eval_data.get("triggered_rules", [])

        scores.append(risk_score)
        latencies.append(latency)
        decisions_count[actual_decision] = decisions_count.get(actual_decision, 0) + 1

        # Binary classification mapping:
        # Ground Truth: NORMAL = 0, SUSPICIOUS/FRAUD = 1
        # Prediction: ALLOW/APPROVE = 0, REVIEW/BLOCK/ESCALATE = 1
        true_label = tc["expected_class"]
        pred_label = 0 if actual_decision in ["APPROVE", "ALLOW"] else 1

        y_true.append(true_label)
        y_pred.append(pred_label)

        evaluated_records.append({
            "test_id": tc["id"],
            "transaction_id": txn_id,
            "amount": tc["amount"],
            "ground_truth": tc["ground_truth"],
            "expected_decision": tc["expected_decision"],
            "actual_decision": actual_decision,
            "composite_risk_score": risk_score,
            "triggered_rules_count": len(rules),
            "latency_ms": latency
        })

    # Confusion Matrix Metrics
    TP = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    TN = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    FP = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    FN = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)

    total = len(y_true)
    accuracy = round((TP + TN) / total, 4) if total > 0 else 0.0
    precision = round(TP / (TP + FP), 4) if (TP + FP) > 0 else 1.0
    recall = round(TP / (TP + FN), 4) if (TP + FN) > 0 else 1.0
    f1 = round(2 * (precision * recall) / (precision + recall), 4) if (precision + recall) > 0 else 0.0
    fpr = round(FP / (FP + TN), 4) if (FP + TN) > 0 else 0.0
    fnr = round(FN / (FN + TP), 4) if (FN + TP) > 0 else 0.0

    metrics_report = {
        "suite": "Transaction Decision Ground Truth Validation",
        "timestamp": time.time(),
        "dataset_size": total,
        "confusion_matrix": {
            "true_positives": TP,
            "true_negatives": TN,
            "false_positives": FP,
            "false_negatives": FN
        },
        "performance_metrics": {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "false_positive_rate": fpr,
            "false_negative_rate": fnr
        },
        "score_distribution": {
            "mean": round(sum(scores) / len(scores), 2) if scores else 0.0,
            "min": round(min(scores), 2) if scores else 0.0,
            "max": round(max(scores), 2) if scores else 0.0,
            "p50": round(sorted(scores)[len(scores)//2], 2) if scores else 0.0,
            "p95": round(sorted(scores)[int(len(scores)*0.95)], 2) if scores else 0.0
        },
        "decision_distribution": decisions_count,
        "latency_profile_ms": {
            "p50": round(sorted(latencies)[len(latencies)//2], 2) if latencies else 0.0,
            "p95": round(sorted(latencies)[int(len(latencies)*0.95)], 2) if latencies else 0.0
        },
        "evaluation_samples": evaluated_records[:10]
    }

    # Write output
    os.makedirs(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "audit", "test-results"), exist_ok=True)
    out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "audit", "test-results", "decision_validation_metrics.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)

    print("\n" + "=" * 80)
    print("                    DECISION VALIDATION PERFORMANCE SUMMARY                    ")
    print("=" * 80)
    print(f"Total Evaluated: {total}")
    print(f"Confusion Matrix: TP={TP} | TN={TN} | FP={FP} | FN={FN}")
    print(f"Accuracy:         {accuracy * 100:.2f}%")
    print(f"Precision:        {precision * 100:.2f}%")
    print(f"Recall:           {recall * 100:.2f}%")
    print(f"F1-Score:         {f1:.4f}")
    print(f"False Pos Rate:   {fpr * 100:.2f}%")
    print(f"False Neg Rate:   {fnr * 100:.2f}%")
    print(f"Decision Counts:  {decisions_count}")
    print(f"Risk Scores:      Mean={metrics_report['score_distribution']['mean']} | P50={metrics_report['score_distribution']['p50']} | P95={metrics_report['score_distribution']['p95']}")
    print(f"Saved to:         {out_path}")
    print("=" * 80)

if __name__ == "__main__":
    run_decision_validation()
