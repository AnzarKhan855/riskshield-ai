import uuid
from typing import AsyncGenerator, Optional
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import AuthenticationException
from app.core.security import decode_token
from app.models.user import User, UserStatus
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.comment_repository import CommentRepository
from app.repositories.composite_repository import CompositePredictionRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.decision_repository import DecisionRepository
from app.repositories.device_repository import DeviceRepository
from app.repositories.event_log_repository import EventLogRepository
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.execution_repository import DecisionExecutionRepository
from app.repositories.explanation_repository import ExplanationRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.graph_repository import GraphRepository
from app.repositories.investigation_repository import InvestigationRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.model_repository import ModelRegistryRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.prediction_repository import PredictionHistoryRepository
from app.repositories.rule_repository import DecisionRuleRepository
from app.repositories.timeline_repository import TimelineRepository
from app.repositories.token_repository import TokenRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.user_repository import UserRepository
from app.services.ai_orchestrator import AIOrchestrator
from app.services.auth_service import AuthenticationService
from app.services.customer_service import CustomerService
from app.services.decision_engine import DecisionEngine
from app.services.delivery_service import DeliveryService
from app.services.device_service import DeviceService
from app.services.evidence_service import EvidenceService
from app.services.explanation_service import ExplanationService
from app.services.feature_engineering_service import FeatureEngineeringService
from app.services.graph_service import GraphService
from app.services.inference_service import InferenceService
from app.services.ingestion_service import IngestionService
from app.services.investigation_service import InvestigationService
from app.services.merchant_service import MerchantService
from app.services.model_registry_service import ModelRegistryService
from app.services.notification_service import NotificationService
from app.services.rule_service import DecisionRuleService
from app.services.timeline_service import CommentService, TimelineService
from app.services.transaction_service import TransactionService

_ingestion_service_instance = IngestionService()


def get_ingestion_service() -> IngestionService:
    return _ingestion_service_instance

security_scheme = HTTPBearer(auto_error=False)


def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_token_repo(db: AsyncSession = Depends(get_db)) -> TokenRepository:
    return TokenRepository(db)


def get_audit_repo(db: AsyncSession = Depends(get_db)) -> AuditLogRepository:
    return AuditLogRepository(db)


def get_merchant_repo(db: AsyncSession = Depends(get_db)) -> MerchantRepository:
    return MerchantRepository(db)


def get_transaction_repo(db: AsyncSession = Depends(get_db)) -> TransactionRepository:
    return TransactionRepository(db)


def get_customer_repo(db: AsyncSession = Depends(get_db)) -> CustomerRepository:
    return CustomerRepository(db)


def get_device_repo(db: AsyncSession = Depends(get_db)) -> DeviceRepository:
    return DeviceRepository(db)


def get_feature_repo(db: AsyncSession = Depends(get_db)) -> FeatureStoreRepository:
    return FeatureStoreRepository(db)


def get_model_repo(db: AsyncSession = Depends(get_db)) -> ModelRegistryRepository:
    return ModelRegistryRepository(db)


def get_prediction_repo(db: AsyncSession = Depends(get_db)) -> PredictionHistoryRepository:
    return PredictionHistoryRepository(db)


def get_composite_repo(db: AsyncSession = Depends(get_db)) -> CompositePredictionRepository:
    return CompositePredictionRepository(db)


def get_decision_repo(db: AsyncSession = Depends(get_db)) -> DecisionRepository:
    return DecisionRepository(db)


def get_rule_repo(db: AsyncSession = Depends(get_db)) -> DecisionRuleRepository:
    return DecisionRuleRepository(db)


def get_execution_repo(db: AsyncSession = Depends(get_db)) -> DecisionExecutionRepository:
    return DecisionExecutionRepository(db)


def get_investigation_repo(db: AsyncSession = Depends(get_db)) -> InvestigationRepository:
    return InvestigationRepository(db)


def get_evidence_repo(db: AsyncSession = Depends(get_db)) -> EvidenceRepository:
    return EvidenceRepository(db)


def get_comment_repo(db: AsyncSession = Depends(get_db)) -> CommentRepository:
    return CommentRepository(db)


def get_timeline_repo(db: AsyncSession = Depends(get_db)) -> TimelineRepository:
    return TimelineRepository(db)


def get_graph_repo(db: AsyncSession = Depends(get_db)) -> GraphRepository:
    return GraphRepository(db)


def get_explanation_repo(db: AsyncSession = Depends(get_db)) -> ExplanationRepository:
    return ExplanationRepository(db)


def get_notification_repo(db: AsyncSession = Depends(get_db)) -> NotificationRepository:
    return NotificationRepository(db)


def get_event_log_repo(db: AsyncSession = Depends(get_db)) -> EventLogRepository:
    return EventLogRepository(db)


_delivery_service_instance = DeliveryService()


def get_delivery_service() -> DeliveryService:
    return _delivery_service_instance


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repo),
    token_repo: TokenRepository = Depends(get_token_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> AuthenticationService:
    return AuthenticationService(user_repo, token_repo, audit_repo)


def get_merchant_service(
    merchant_repo: MerchantRepository = Depends(get_merchant_repo),
    user_repo: UserRepository = Depends(get_user_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> MerchantService:
    return MerchantService(merchant_repo, user_repo, audit_repo)


def get_transaction_service(
    transaction_repo: TransactionRepository = Depends(get_transaction_repo),
    merchant_repo: MerchantRepository = Depends(get_merchant_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> TransactionService:
    return TransactionService(transaction_repo, merchant_repo, audit_repo)


def get_customer_service(
    customer_repo: CustomerRepository = Depends(get_customer_repo),
    merchant_repo: MerchantRepository = Depends(get_merchant_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> CustomerService:
    return CustomerService(customer_repo, merchant_repo, audit_repo)


def get_device_service(
    device_repo: DeviceRepository = Depends(get_device_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> DeviceService:
    return DeviceService(device_repo, audit_repo)


def get_feature_service(
    feature_repo: FeatureStoreRepository = Depends(get_feature_repo),
    transaction_repo: TransactionRepository = Depends(get_transaction_repo),
    merchant_repo: MerchantRepository = Depends(get_merchant_repo),
    customer_repo: CustomerRepository = Depends(get_customer_repo),
    device_repo: DeviceRepository = Depends(get_device_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> FeatureEngineeringService:
    return FeatureEngineeringService(
        feature_repo, transaction_repo, merchant_repo, customer_repo, device_repo, audit_repo
    )


def get_model_registry_service(
    model_repo: ModelRegistryRepository = Depends(get_model_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> ModelRegistryService:
    return ModelRegistryService(model_repo, audit_repo)


def get_inference_service(
    prediction_repo: PredictionHistoryRepository = Depends(get_prediction_repo),
    model_repo: ModelRegistryRepository = Depends(get_model_repo),
    feature_repo: FeatureStoreRepository = Depends(get_feature_repo),
    feature_service: FeatureEngineeringService = Depends(get_feature_service),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> InferenceService:
    return InferenceService(prediction_repo, model_repo, feature_repo, feature_service, audit_repo)


def get_ai_orchestrator_service(
    composite_repo: CompositePredictionRepository = Depends(get_composite_repo),
    model_repo: ModelRegistryRepository = Depends(get_model_repo),
    feature_repo: FeatureStoreRepository = Depends(get_feature_repo),
    feature_service: FeatureEngineeringService = Depends(get_feature_service),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> AIOrchestrator:
    return AIOrchestrator(composite_repo, model_repo, feature_repo, feature_service, audit_repo)


def get_rule_service(
    rule_repo: DecisionRuleRepository = Depends(get_rule_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> DecisionRuleService:
    return DecisionRuleService(rule_repo, audit_repo)


def get_decision_engine(
    decision_repo: DecisionRepository = Depends(get_decision_repo),
    rule_repo: DecisionRuleRepository = Depends(get_rule_repo),
    execution_repo: DecisionExecutionRepository = Depends(get_execution_repo),
    composite_repo: CompositePredictionRepository = Depends(get_composite_repo),
    transaction_repo: TransactionRepository = Depends(get_transaction_repo),
    feature_repo: FeatureStoreRepository = Depends(get_feature_repo),
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator_service),
    rule_service: DecisionRuleService = Depends(get_rule_service),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> DecisionEngine:
    return DecisionEngine(
        decision_repo,
        rule_repo,
        execution_repo,
        composite_repo,
        transaction_repo,
        feature_repo,
        orchestrator,
        rule_service,
        audit_repo,
    )


def get_timeline_service(
    timeline_repo: TimelineRepository = Depends(get_timeline_repo),
) -> TimelineService:
    return TimelineService(timeline_repo)


def get_comment_service(
    comment_repo: CommentRepository = Depends(get_comment_repo),
) -> CommentService:
    return CommentService(comment_repo)


def get_evidence_service(
    evidence_repo: EvidenceRepository = Depends(get_evidence_repo),
    transaction_repo: TransactionRepository = Depends(get_transaction_repo),
    merchant_repo: MerchantRepository = Depends(get_merchant_repo),
    customer_repo: CustomerRepository = Depends(get_customer_repo),
    device_repo: DeviceRepository = Depends(get_device_repo),
    feature_repo: FeatureStoreRepository = Depends(get_feature_repo),
    decision_repo: DecisionRepository = Depends(get_decision_repo),
) -> EvidenceService:
    return EvidenceService(
        evidence_repo, transaction_repo, merchant_repo, customer_repo, device_repo, feature_repo, decision_repo
    )


def get_investigation_service(
    case_repo: InvestigationRepository = Depends(get_investigation_repo),
    evidence_service: EvidenceService = Depends(get_evidence_service),
    timeline_service: TimelineService = Depends(get_timeline_service),
    comment_service: CommentService = Depends(get_comment_service),
    transaction_repo: TransactionRepository = Depends(get_transaction_repo),
    decision_repo: DecisionRepository = Depends(get_decision_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> InvestigationService:
    return InvestigationService(
        case_repo, evidence_service, timeline_service, comment_service, transaction_repo, decision_repo, audit_repo
    )


def get_graph_service(
    graph_repo: GraphRepository = Depends(get_graph_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> GraphService:
    return GraphService(graph_repo, audit_repo)


def get_explanation_service(
    explanation_repo: ExplanationRepository = Depends(get_explanation_repo),
    decision_repo: DecisionRepository = Depends(get_decision_repo),
    feature_repo: FeatureStoreRepository = Depends(get_feature_repo),
    composite_repo: CompositePredictionRepository = Depends(get_composite_repo),
    rule_repo: DecisionRuleRepository = Depends(get_rule_repo),
    audit_repo: AuditLogRepository = Depends(get_audit_repo),
) -> ExplanationService:
    return ExplanationService(
        explanation_repo, decision_repo, feature_repo, composite_repo, rule_repo, audit_repo
    )


def get_notification_service(
    notification_repo: NotificationRepository = Depends(get_notification_repo),
    event_log_repo: EventLogRepository = Depends(get_event_log_repo),
    user_repo: UserRepository = Depends(get_user_repo),
) -> NotificationService:
    return NotificationService(notification_repo, event_log_repo, user_repo)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    user_repo: UserRepository = Depends(get_user_repo),
) -> User:
    """Extract and validate JWT Access Token from Authorization header."""
    if not credentials or not credentials.credentials:
        raise AuthenticationException("Authentication credentials were not provided.")

    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise AuthenticationException("Invalid token type.")
        user_id = uuid.UUID(payload["sub"])
    except Exception:
        raise AuthenticationException("Invalid or expired access token.")

    user = await user_repo.get_by_id(user_id)
    if not user:
        raise AuthenticationException("User specified in token does not exist.")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure authenticated user is active."""
    if current_user.status != UserStatus.ACTIVE:
        raise AuthenticationException("User account is inactive or suspended.")
    return current_user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    user_repo: UserRepository = Depends(get_user_repo),
) -> Optional[User]:
    """Extract and validate JWT Access Token if provided, else return None for onboarding."""
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id = uuid.UUID(payload["sub"])
        user = await user_repo.get_by_id(user_id)
        return user
    except Exception:
        return None

