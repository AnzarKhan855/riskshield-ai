# Import all the models so Alembic can discover them for migrations
import logging
from typing import Optional
from app.models.base import Base  # noqa: F401
import motor.motor_asyncio
import pymongo
from app.core.config import settings

logger = logging.getLogger("riskshield.mongo")

_async_mongo_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
_sync_mongo_client: Optional[pymongo.MongoClient] = None

def get_async_mongo_client() -> Optional[motor.motor_asyncio.AsyncIOMotorClient]:
    global _async_mongo_client
    if _async_mongo_client is None and settings.EFFECTIVE_MONGODB_URL:
        try:
            _async_mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.EFFECTIVE_MONGODB_URL,
                serverSelectionTimeoutMS=5000,
            )
        except Exception as e:
            logger.warning(f"Async Motor client connection warning: {e}")
    return _async_mongo_client

def get_sync_mongo_client() -> Optional[pymongo.MongoClient]:
    global _sync_mongo_client
    if _sync_mongo_client is None and settings.EFFECTIVE_MONGODB_URL:
        try:
            _sync_mongo_client = pymongo.MongoClient(
                settings.EFFECTIVE_MONGODB_URL,
                serverSelectionTimeoutMS=5000,
            )
        except Exception as e:
            logger.warning(f"Sync PyMongo client connection warning: {e}")
    return _sync_mongo_client

def get_mongo_db():
    client = get_async_mongo_client()
    if client:
        return client["riskshield_ai"]
    return None
