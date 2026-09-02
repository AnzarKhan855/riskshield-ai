from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    cases,
    customers,
    decisions,
    devices,
    explanations,
    features,
    graph,
    health,
    ingestion,
    merchants,
    models,
    notifications,
    orchestrator,
    predictions,
    rules,
    transactions,
    ai,
)

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Authorization"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["Enterprise Data Ingestion & Onboarding"])
api_router.include_router(merchants.router, prefix="/merchants", tags=["Merchant Management"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transaction Management"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customer Intelligence"])
api_router.include_router(devices.router, prefix="/devices", tags=["Device Intelligence"])
api_router.include_router(features.router, prefix="/features", tags=["Feature Engineering Platform"])
api_router.include_router(models.router, prefix="/models", tags=["Model Registry"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["ML Predictions & Inference Engine"])
api_router.include_router(orchestrator.router, prefix="/orchestrator", tags=["AI Orchestration Platform"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["Decision Intelligence Platform"])
api_router.include_router(rules.router, prefix="/rules", tags=["Rule Studio & Policy Management"])
api_router.include_router(cases.router, prefix="/cases", tags=["Enterprise Investigation & Case Management"])
api_router.include_router(graph.router, prefix="/graph", tags=["Enterprise Relationship Graph Intelligence"])
api_router.include_router(explanations.router, prefix="/explanations", tags=["Enterprise AI Explainability Center"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Real-Time Event & Notification Platform"])
api_router.include_router(ai.router, prefix="/ai", tags=["Enterprise AI Copilot & Forensics"])

