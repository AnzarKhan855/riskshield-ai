import asyncio
import logging
import uuid
from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionFactory
from app.core.security import get_password_hash
from app.models.user import User, UserRole, UserStatus
from app.models.merchant import Merchant, BusinessType, MerchantStatus, RiskLevel, VerificationStatus, KYCStatus
from app.models.customer import Customer
from app.models.device import Device
from app.models.transaction import Transaction, PaymentMethod, TransactionStatus, TransactionType
from app.models.model_registry import ModelRegistry, ModelType, ModelFramework, ModelStatus
from app.models.decision_rule import DecisionRule
from app.models.investigation_case import InvestigationCase
from app.models.notification import Notification
from app.models.event_log import EventLog

logger = logging.getLogger("riskshield.seed")

async def seed_database_if_empty():
    """Seeds the initial enterprise dataset if the database has no admin user."""
    if not AsyncSessionFactory:
        logger.warning("No AsyncSessionFactory available for database seed.")
        return

    try:
        async with AsyncSessionFactory() as session:
            # 1. Check if admin exists
            res = await session.execute(select(func.count()).select_from(User))
            user_count = res.scalar() or 0
            if user_count > 0:
                logger.info(f"Database already seeded with {user_count} users. Skipping seed.")
                return

            logger.info("Seeding initial enterprise dataset into database...")

            # 2. Seed Admin and Analyst Users
            admin_user = User(
                id=uuid.uuid4(),
                email="admin@riskshield.ai",
                password_hash=get_password_hash("Password123!"),
                first_name="Enterprise",
                last_name="Admin",
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                email_verified=True,
            )
            analyst_user = User(
                id=uuid.uuid4(),
                email="analyst@riskshield.ai",
                password_hash=get_password_hash("Password123!"),
                first_name="Risk",
                last_name="Analyst",
                role=UserRole.ANALYST,
                status=UserStatus.ACTIVE,
                email_verified=True,
            )
            session.add_all([admin_user, analyst_user])
            await session.flush()

            # 3. Seed Merchants with all required fields
            m1 = Merchant(
                id=uuid.uuid4(),
                business_name="Acme Global Commerce",
                legal_business_name="Acme Global Commerce LLC",
                merchant_code="MERCH-GLOBAL-01",
                owner_user_id=admin_user.id,
                business_type=BusinessType.PRIVATE_LIMITED,
                industry="E-Commerce & Retail",
                business_email="compliance@acmeglobal.com",
                business_phone="+1-800-555-0199",
                country="United States",
                state="California",
                city="San Francisco",
                address="100 Market Street",
                pincode="94105",
                status=MerchantStatus.ACTIVE,
                risk_level=RiskLevel.LOW,
                verification_status=VerificationStatus.VERIFIED,
                kyc_status=KYCStatus.APPROVED,
                website="https://acmeglobal.com",
            )
            m2 = Merchant(
                id=uuid.uuid4(),
                business_name="Nova Cloud SaaS",
                legal_business_name="Nova Technologies Inc",
                merchant_code="MERCH-FINTECH-02",
                owner_user_id=admin_user.id,
                business_type=BusinessType.LLC,
                industry="Cloud Software & SaaS",
                business_email="billing@novacloud.io",
                business_phone="+1-800-555-0288",
                country="United States",
                state="New York",
                city="New York",
                address="250 Broadway",
                pincode="10007",
                status=MerchantStatus.ACTIVE,
                risk_level=RiskLevel.MEDIUM,
                verification_status=VerificationStatus.VERIFIED,
                kyc_status=KYCStatus.APPROVED,
                website="https://novacloud.io",
            )
            session.add_all([m1, m2])
            await session.flush()

            # 4. Seed Customers
            c1 = Customer(
                id=uuid.uuid4(),
                customer_id="CUST-883901",
                merchant_id=m1.id,
                full_name="Alice Smith",
                email="alice.smith@example.com",
                lifetime_value=Decimal("4250.00"),
                total_transactions=18,
                successful_transactions=18,
                failed_transactions=0,
                chargebacks=0,
                refunds=0,
                average_transaction_value=Decimal("236.11"),
                highest_transaction_value=Decimal("890.00"),
                risk_flags=[],
            )
            c2 = Customer(
                id=uuid.uuid4(),
                customer_id="CUST-499102",
                merchant_id=m1.id,
                full_name="Unknown Actor",
                email="suspicious.actor@tempmail.com",
                lifetime_value=Decimal("9800.00"),
                total_transactions=6,
                successful_transactions=2,
                failed_transactions=4,
                chargebacks=2,
                refunds=1,
                average_transaction_value=Decimal("1633.33"),
                highest_transaction_value=Decimal("4999.00"),
                risk_flags=["HIGH_CHARGEBACK_RATE"],
            )
            session.add_all([c1, c2])
            await session.flush()

            # 5. Seed Devices
            d1 = Device(
                id=uuid.uuid4(),
                device_fingerprint="DEV-FP-IPHONE-15-SECURE",
                device_type="Mobile",
                operating_system="iOS 17.4",
                browser="Safari Mobile",
                ip_address="192.168.1.101",
                vpn_detected=False,
                rooted_device=False,
                jailbroken=False,
                emulator=False,
                transaction_count=22,
                failed_attempts=0,
                risk_flags=[],
            )
            d2 = Device(
                id=uuid.uuid4(),
                device_fingerprint="DEV-FP-EMULATOR-VPN-TOR",
                device_type="Desktop",
                operating_system="Linux",
                browser="HeadlessChrome",
                ip_address="102.129.144.5",
                vpn_detected=True,
                rooted_device=True,
                jailbroken=False,
                emulator=True,
                transaction_count=5,
                failed_attempts=3,
                risk_flags=["VPN", "EMULATOR", "ROOTED"],
            )
            session.add_all([d1, d2])
            await session.flush()

            # 6. Seed Key Transactions including TXN-ML-PRED-991
            t1 = Transaction(
                id=uuid.uuid4(),
                transaction_id="TXN-ML-PRED-991",
                merchant_id=m1.id,
                customer_id=c1.customer_id,
                customer_profile_id=c1.id,
                device_profile_id=d1.id,
                device_id="DEV-IPHONE-15",
                payment_method=PaymentMethod.CREDIT_CARD,
                transaction_type=TransactionType.PAYMENT,
                status=TransactionStatus.PENDING,
                currency="USD",
                amount=Decimal("350.00"),
                fee=Decimal("7.00"),
                tax=Decimal("3.50"),
                net_amount=Decimal("339.50"),
                card_network="Visa",
                card_bin="411111",
                country="United States",
                state="California",
                city="San Francisco",
                ip_address="192.168.1.101",
            )
            t2 = Transaction(
                id=uuid.uuid4(),
                transaction_id="TXN-FRAUD-001",
                merchant_id=m1.id,
                customer_id=c2.customer_id,
                customer_profile_id=c2.id,
                device_profile_id=d2.id,
                device_id="DEV-EMULATOR-99",
                payment_method=PaymentMethod.CREDIT_CARD,
                transaction_type=TransactionType.PAYMENT,
                status=TransactionStatus.FAILED,
                currency="USD",
                amount=Decimal("4999.00"),
                fee=Decimal("99.98"),
                tax=Decimal("49.99"),
                net_amount=Decimal("4849.03"),
                card_network="Mastercard",
                card_bin="550000",
                country="Nigeria",
                city="Lagos",
                ip_address="102.129.144.5",
                failure_reason="High risk automated score violation",
            )
            t3 = Transaction(
                id=uuid.uuid4(),
                transaction_id="TXN-SAFE-002",
                merchant_id=m2.id,
                customer_id=c1.customer_id,
                customer_profile_id=c1.id,
                device_profile_id=d1.id,
                payment_method=PaymentMethod.CREDIT_CARD,
                transaction_type=TransactionType.PAYMENT,
                status=TransactionStatus.SUCCESS,
                currency="USD",
                amount=Decimal("45.00"),
                fee=Decimal("1.50"),
                tax=Decimal("0.45"),
                net_amount=Decimal("43.05"),
                card_network="Visa",
                country="United States",
                city="New York",
            )
            session.add_all([t1, t2, t3])
            await session.flush()

            # 7. Seed Production ML Models
            models_to_seed = [
                ModelRegistry(
                    id=uuid.uuid4(),
                    model_id="MOD-XGB-001",
                    model_name="XGBoost Fraud Classifier v1",
                    model_type=ModelType.FRAUD_DETECTION,
                    framework=ModelFramework.XGBOOST,
                    version="v1.0.0",
                    model_status=ModelStatus.ACTIVE,
                    production_flag=True,
                    description="Gradient boosted decision trees for real-time transaction fraud scoring",
                ),
                ModelRegistry(
                    id=uuid.uuid4(),
                    model_id="MOD-ONNX-002",
                    model_name="ONNX Chargeback Predictor",
                    model_type=ModelType.CHARGEBACK_PREDICTION,
                    framework=ModelFramework.ONNX,
                    version="v1.0.0",
                    model_status=ModelStatus.ACTIVE,
                    production_flag=True,
                    description="Accelerated neural inference for 90-day chargeback probability",
                ),
                ModelRegistry(
                    id=uuid.uuid4(),
                    model_id="MOD-LGBM-003",
                    model_name="LightGBM Merchant Risk Scorer",
                    model_type=ModelType.MERCHANT_RISK,
                    framework=ModelFramework.LIGHTGBM,
                    version="v1.0.0",
                    model_status=ModelStatus.ACTIVE,
                    production_flag=True,
                    description="Merchant portfolio risk evaluation",
                ),
                ModelRegistry(
                    id=uuid.uuid4(),
                    model_id="MOD-RF-004",
                    model_name="Random Forest Customer Profile Scorer",
                    model_type=ModelType.CUSTOMER_RISK,
                    framework=ModelFramework.JOBLIB,
                    version="v1.0.0",
                    model_status=ModelStatus.ACTIVE,
                    production_flag=True,
                    description="Customer profile and velocity analysis",
                ),
                ModelRegistry(
                    id=uuid.uuid4(),
                    model_id="MOD-ISO-005",
                    model_name="Isolation Forest Device Risk Detector",
                    model_type=ModelType.DEVICE_RISK,
                    framework=ModelFramework.JOBLIB,
                    version="v1.0.0",
                    model_status=ModelStatus.ACTIVE,
                    production_flag=True,
                    description="Unsupervised anomaly detection across device fingerprints",
                ),
            ]
            session.add_all(models_to_seed)
            await session.flush()

            # 8. Seed Default Decision Rules
            rules_to_seed = [
                DecisionRule(
                    id=uuid.uuid4(),
                    rule_id="RULE-BLOCK-HIGH-RISK",
                    rule_name="High Composite Risk Score Block Rule",
                    rule_category="REGULATORY",
                    priority=10,
                    version="v1.0.0",
                    status="PUBLISHED",
                    description="Automatically blocks transactions with composite risk score >= 80",
                    expression="composite_risk_score >= 80.0",
                    action="BLOCK",
                    severity="CRITICAL",
                    enabled=True,
                    created_by="Risk Policy Team",
                ),
                DecisionRule(
                    id=uuid.uuid4(),
                    rule_id="RULE-BLOCK-SANCTIONED",
                    rule_name="Sanctioned High Risk Country Block Rule",
                    rule_category="COUNTRY",
                    priority=20,
                    version="v1.0.0",
                    status="PUBLISHED",
                    description="Blocks transactions originating from sanctioned/high-risk countries",
                    expression="loc_is_high_risk_country == True",
                    action="BLOCK",
                    severity="CRITICAL",
                    enabled=True,
                    created_by="Risk Policy Team",
                ),
                DecisionRule(
                    id=uuid.uuid4(),
                    rule_id="RULE-ESCALATE-NIGHT-AMOUNT",
                    rule_name="Unusual Amount & Night Transaction Escalate",
                    rule_category="BEHAVIOUR",
                    priority=30,
                    version="v1.0.0",
                    status="PUBLISHED",
                    description="Escalates unusual amounts processed during night hours",
                    expression="beh_unusual_amount == True and beh_is_night_txn == True",
                    action="ESCALATE",
                    severity="HIGH",
                    enabled=True,
                    created_by="Risk Policy Team",
                ),
                DecisionRule(
                    id=uuid.uuid4(),
                    rule_id="RULE-REVIEW-MEDIUM-RISK",
                    rule_name="Elevated Composite Risk Review Rule",
                    rule_category="TRANSACTION",
                    priority=50,
                    version="v1.0.0",
                    status="PUBLISHED",
                    description="Sends medium risk transactions for analyst manual review",
                    expression="composite_risk_score >= 50.0 and composite_risk_score < 80.0",
                    action="REVIEW",
                    severity="MEDIUM",
                    enabled=True,
                    created_by="Risk Policy Team",
                ),
            ]
            session.add_all(rules_to_seed)
            await session.flush()

            # 9. Seed Investigation Cases
            c_case1 = InvestigationCase(
                id=uuid.uuid4(),
                case_id="CASE-CRIT-901",
                transaction_id=t2.transaction_id,
                case_title="Suspicious High-Value Velocity Burst",
                case_description="Transaction flagged with multiple high-risk indicators: offshore IP, TOR network, emulator device.",
                status="OPEN",
                priority="CRITICAL",
                severity="CRITICAL",
                category="Fraud",
                assigned_analyst_id=analyst_user.id,
                assigned_analyst_name="Risk Analyst",
            )
            c_case2 = InvestigationCase(
                id=uuid.uuid4(),
                case_id="CASE-MED-902",
                transaction_id=t1.transaction_id,
                case_title="Elevated Risk Score Review Required",
                case_description="Routine inspection for elevated volume transaction from newly registered customer device.",
                status="UNDER_INVESTIGATION",
                priority="MEDIUM",
                severity="MEDIUM",
                category="Compliance",
                assigned_analyst_id=analyst_user.id,
                assigned_analyst_name="Risk Analyst",
            )
            session.add_all([c_case1, c_case2])
            await session.flush()

            # 10. Seed Notifications
            n1 = Notification(
                id=uuid.uuid4(),
                notification_id="NOTIF-CRIT-001",
                user_id=admin_user.id,
                title="Critical Anomaly Detected",
                message="High risk transaction TXN-FRAUD-001 automatically blocked by rule engine.",
                type="SECURITY_ALERT",
                priority="CRITICAL",
                payload={"link": "/cases/CASE-CRIT-901"},
            )
            n2 = Notification(
                id=uuid.uuid4(),
                notification_id="NOTIF-INFO-002",
                user_id=analyst_user.id,
                title="New Case Assigned",
                message="Investigation case CASE-MED-902 has been queued for analyst review.",
                type="SYSTEM",
                priority="MEDIUM",
                payload={"link": "/cases/CASE-MED-902"},
            )
            session.add_all([n1, n2])

            # 11. Seed Event Logs
            e1 = EventLog(
                id=uuid.uuid4(),
                event_id="EVT-INIT-001",
                event_type="DECISION_PIPELINE",
                source="riskshield.engine",
                payload={"transaction_id": "TXN-ML-PRED-991", "initiated_by": "System"},
            )
            session.add(e1)

            await session.commit()
            logger.info("Successfully seeded complete RiskShield enterprise dataset!")

    except Exception as e:
        logger.error(f"Error seeding database: {e}", exc_info=True)
