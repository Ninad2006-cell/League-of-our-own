import { useState, useEffect, useRef } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

export function useLiveMatch(matchId, initialScorecard = null) {
  const [scorecard, setScorecard] = useState(initialScorecard);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!matchId) return;

    let isMounted = true;

    function connect() {
      const wsUrl = `${WS_BASE_URL}/matches/${matchId}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          setLastEvent(payload.event);

          if (payload.scorecard) {
            setScorecard(payload.scorecard);
          }
        } catch (e) {
          console.warn('[WebSocket] Error parsing live event:', e);
        }
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted) connect();
        }, 3000);
      };

      socket.onerror = (err) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [matchId]);

  return {
    scorecard,
    setScorecard,
    isConnected,
    lastEvent
  };
}

export default useLiveMatch;
