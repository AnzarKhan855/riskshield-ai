import asyncio
import os
import sys
import json
import time
import uuid

script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{os.path.join(backend_dir, 'riskshield.db').replace('\\', '/')}"

from sqlalchemy import select, func, text
from app.core.database import AsyncSessionFactory
from app.models.user import User, UserRole, UserStatus
from app.models.transaction import Transaction, TransactionStatus, PaymentMethod, TransactionType
from app.models.decision import Decision
from app.models.decision_rule import DecisionRule
from app.models.investigation_case import InvestigationCase
from app.models.case_comment import CaseComment
from app.models.audit_log import AuditLog

results = {
    "summary": {"total_tests": 0, "passed": 0, "failed": 0},
    "details": []
}

def log_result(name, passed, detail=""):
    results["summary"]["total_tests"] += 1
    if passed:
        results["summary"]["passed"] += 1
        print(f"[PASS] {name}" + (f" -> {detail}" if detail else ""))
    else:
        results["summary"]["failed"] += 1
        print(f"[FAIL] {name} -> {detail}")
    results["details"].append({"test": name, "passed": passed, "detail": detail})

async def run_db_audit():
    print("================================================================================")
    print("        RISKSHIELD AI — DATABASE INTEGRITY & ACID AUDIT SUITE                   ")
    print("================================================================================")

    async with AsyncSessionFactory() as session:
        # 1. Verify Database Connection & Engine Type
        try:
            res = await session.execute(text("SELECT 1"))
            val = res.scalar()
            log_result("Database Connectivity Check", val == 1, "Session active and querying successfully")
        except Exception as e:
            log_result("Database Connectivity Check", False, str(e))
            return

        # 2. Table Row Count Checks
        tables = [
            ("Users", User),
            ("Transactions", Transaction),
            ("Decisions", Decision),
            ("DecisionRules", DecisionRule),
            ("InvestigationCases", InvestigationCase),
            ("AuditLogs", AuditLog),
        ]
        for tbl_name, model in tables:
            try:
                cnt_res = await session.execute(select(func.count()).select_from(model))
                count = cnt_res.scalar()
                log_result(f"Table Row Count: {tbl_name}", True, f"{count} records found")
            except Exception as e:
                log_result(f"Table Row Count: {tbl_name}", False, str(e))

        # 3. Relational Foreign Key Integrity Check
        try:
            # Check Case -> Transaction link consistency
            cases_res = await session.execute(select(InvestigationCase))
            cases = cases_res.scalars().all()
            valid_cases = True
            for c in cases:
                if c.transaction_id:
                    txn_check = await session.execute(
                        select(Transaction).where(Transaction.transaction_id == c.transaction_id)
                    )
                    if not txn_check.scalar_one_or_none():
                        valid_cases = False
                        log_result("Foreign Key Integrity: Case -> Transaction", False, f"Case {c.case_id} points to non-existent txn {c.transaction_id}")
                        break
            if valid_cases:
                log_result("Foreign Key Integrity: Case -> Transaction", True, "All case references link to valid transaction records")
        except Exception as e:
            log_result("Foreign Key Integrity: Case -> Transaction", False, str(e))

        # 4. ACID Transaction Rollback Verification
        try:
            async with session.begin_nested():
                dummy_user = User(
                    id=uuid.uuid4(),
                    first_name="Rollback",
                    last_name="Tester",
                    email=f"rollback_{uuid.uuid4().hex[:8]}@test.com",
                    password_hash="hashed_pw_test",
                    role=UserRole.ANALYST,
                    status=UserStatus.ACTIVE,
                    email_verified=True,
                )
                session.add(dummy_user)
                await session.flush()
                # Explicitly raise exception to force rollback
                raise ValueError("Simulated failure for ACID rollback test")
        except ValueError:
            # Expected error caught
            check_user = await session.execute(select(User).where(User.first_name == "Rollback"))
            found = check_user.scalar_one_or_none()
            log_result("ACID Rollback Compliance", found is None, "Rollback cleanly purged uncommitted state from DB")
        except Exception as e:
            log_result("ACID Rollback Compliance", False, f"Unexpected error during rollback: {e}")

        # 5. Audit Log Entry Verification
        try:
            audit_res = await session.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(10))
            logs = audit_res.scalars().all()
            log_result("Audit Log Subsystem", len(logs) > 0, f"{len(logs)} recent audit trail events recorded")
        except Exception as e:
            log_result("Audit Log Subsystem", False, str(e))

    os.makedirs("scratch", exist_ok=True)
    with open("scratch/database_acid_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\n================================================================================")
    print(f"DATABASE AUDIT SUMMARY: Total: {results['summary']['total_tests']} | Passed: {results['summary']['passed']} | Failed: {results['summary']['failed']}")
    print("================================================================================")

if __name__ == "__main__":
    asyncio.run(run_db_audit())
