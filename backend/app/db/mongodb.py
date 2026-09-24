# RiskShield AI - MongoDB Database Connector Module
from app.db.base import get_async_mongo_client, get_mongo_db, get_sync_mongo_client

__all__ = ["get_mongo_db", "get_async_mongo_client", "get_sync_mongo_client"]
