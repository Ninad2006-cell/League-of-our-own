import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("cdms.realtime")


class ConnectionManager:
    """
    Manages active WebSocket connections grouped by match_id for sub-2-second live updates.
    """

    def __init__(self):
        # Maps match_id -> Set of active WebSocket connections
        self.active_rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, match_id: str, websocket: WebSocket):
        await websocket.accept()
        if match_id not in self.active_rooms:
            self.active_rooms[match_id] = set()
        self.active_rooms[match_id].add(websocket)
        logger.info(f"Client connected to match {match_id}. Room count: {len(self.active_rooms[match_id])}")

    def disconnect(self, match_id: str, websocket: WebSocket):
        if match_id in self.active_rooms:
            self.active_rooms[match_id].discard(websocket)
            if not self.active_rooms[match_id]:
                del self.active_rooms[match_id]
        logger.info(f"Client disconnected from match {match_id}")

    async def broadcast(self, match_id: str, payload: dict):
        """Broadcasts payload to all clients connected to match_id room."""
        if match_id not in self.active_rooms:
            return

        dead_sockets = set()
        for connection in self.active_rooms[match_id]:
            try:
                await connection.send_json(payload)
            except Exception as e:
                logger.warning(f"Failed to send to client in match {match_id}: {e}")
                dead_sockets.add(connection)

        # Cleanup any disconnected or faulted sockets
        for dead in dead_sockets:
            self.active_rooms[match_id].discard(dead)


# Global singleton instance
manager = ConnectionManager()
