import asyncio
import json
from typing import Dict, List, Set
from fastapi import WebSocket


class DeliveryService:
    """FastAPI WebSocket ConnectionManager for real-time notification streaming."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DeliveryService, cls).__new__(cls)
            cls._instance.active_connections: Set[WebSocket] = set()
        return cls._instance

    async def connect(self, websocket: WebSocket) -> None:
        """Accept WebSocket connection and add to active client pool."""
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove WebSocket connection on client disconnect."""
        self.active_connections.discard(websocket)

    async def broadcast_json(self, data: Dict) -> None:
        """Broadcast JSON payload to all connected WebSocket clients."""
        if not self.active_connections:
            return

        dead_sockets = set()
        message_str = json.dumps(data)

        for connection in list(self.active_connections):
            try:
                await connection.send_text(message_str)
            except Exception:
                dead_sockets.add(connection)

        for dead in dead_sockets:
            self.active_connections.discard(dead)
