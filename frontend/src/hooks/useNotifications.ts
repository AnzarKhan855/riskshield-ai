import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/useAuthStore";
import {
  EventLogRecord,
  NotificationFilterParams,
  NotificationRecord,
  PaginatedEventLogs,
  PaginatedNotifications,
} from "@/types/notification";
import { APIResponse } from "@/types/auth";

export function useNotifications(params: NotificationFilterParams = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery<PaginatedNotifications>({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedNotifications>>("/notifications", {
        params,
      });
      return response.data.data!;
    },
    enabled: isAuthenticated,
  });
}

export function useEventLogs(params: { event_type?: string; search?: string; page?: number; size?: number } = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery<PaginatedEventLogs>({
    queryKey: ["event_logs", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedEventLogs>>("/notifications/events", {
        params,
      });
      return response.data.data!;
    },
    enabled: isAuthenticated,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await apiClient.post<APIResponse<{ updated_count: number }>>("/notifications/read", {
        notification_ids: notificationIds,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast("Notifications marked as read!", "success");
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: { event_type: string; source?: string; payload?: Record<string, any> }) => {
      const response = await apiClient.post<APIResponse<EventLogRecord>>("/notifications/events/publish", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["event_logs"] });
      showToast("System event published and broadcasted!", "success");
    },
  });
}

export function useNotificationWebSocket(onMessageReceived?: (msg: any) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const accessToken = useAuthStore.getState().accessToken;
    const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const host = rawApiUrl.replace(/^https?:\/\//, "").replace(/\/api\/v1\/?$/, "");
    const wsUrl = `${protocol}//${host}/api/v1/notifications/ws${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""}`;

    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      try {
        socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["event_logs"] });
            if (onMessageReceived) {
              onMessageReceived(data);
            }
          } catch (e) {
            // text message
          }
        };

        socket.onclose = () => {
          if (!isUnmounted) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };

        socket.onerror = () => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      } catch (e) {
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        } else if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => socket?.close();
        }
      }
    };
  }, [queryClient, onMessageReceived]);
}
