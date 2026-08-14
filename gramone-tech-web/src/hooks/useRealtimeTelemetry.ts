import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Real-time telemetry WebSocket hook.
 *
 * Connects to the backend WebSocket at ws://<host>/ws/telemetry.
 * When a new telemetry message arrives, it invalidates the relevant
 * React Query cache keys so the UI refetches and updates instantly.
 *
 * Auto-reconnects with exponential backoff on disconnect.
 */

const WS_URL = 'ws://127.0.0.1:8000/ws/telemetry';

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

// Maps telemetry type from backend to React Query cache keys
const QUERY_KEY_MAP: Record<string, string[][]> = {
  water: [['water-latest'], ['water-history']],
  bin: [['bin-latest'], ['bin-history']],
  environment: [['environment-latest'], ['environment-history']],
  rfid: [['dashboard']],
  emergency: [['alerts'], ['dashboard']],
};

export function useRealtimeTelemetry() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Don't create duplicate connections
    if (wsRef.current?.readyState === WebSocket.CONNECTING ||
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to telemetry stream');
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const type = message.type as string;

          // Invalidate matching React Query keys
          const keysToInvalidate = QUERY_KEY_MAP[type];
          if (keysToInvalidate) {
            keysToInvalidate.forEach((queryKey) => {
              queryClient.invalidateQueries({ queryKey });
            });
          }

          // Always refresh dashboard on any telemetry
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected. Reconnecting...');
        scheduleReconnect();
      };

      ws.onerror = (err) => {
        console.warn('[WS] Error:', err);
        ws.close();
      };
    } catch (err) {
      console.warn('[WS] Connection failed:', err);
      scheduleReconnect();
    }
  }, [queryClient]);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    const delay = reconnectDelayRef.current;
    console.log(`[WS] Reconnecting in ${delay / 1000}s...`);

    reconnectTimerRef.current = setTimeout(() => {
      reconnectDelayRef.current = Math.min(
        reconnectDelayRef.current * 2,
        MAX_RECONNECT_DELAY
      );
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
