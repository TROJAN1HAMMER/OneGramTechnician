"""
WebSocket Connection Manager for real-time telemetry broadcast.

Maintains a set of active WebSocket connections and broadcasts
new telemetry data to all connected web clients instantly.
"""

import json
import logging
from typing import Any, Dict, List
from fastapi import WebSocket

logger = logging.getLogger("gramone.websocket")


class ConnectionManager:
    """Manages WebSocket connections for real-time telemetry push."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            f"WebSocket client connected. Total clients: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(
            f"WebSocket client disconnected. Total clients: {len(self.active_connections)}"
        )

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a JSON message to all connected WebSocket clients."""
        if not self.active_connections:
            return

        data = json.dumps(message, default=str)
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                disconnected.append(connection)

        # Clean up broken connections
        for conn in disconnected:
            self.disconnect(conn)


# Singleton instance used across the application
ws_manager = ConnectionManager()
