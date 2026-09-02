"use client";

import React from "react";
import { NotificationRecord } from "@/types/notification";
import { useMarkNotificationsRead } from "@/hooks/useNotifications";
import { Bell, CheckCheck, ShieldAlert, Cpu, AlertTriangle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationListProps {
  items: NotificationRecord[];
  isLoading: boolean;
}

export default function NotificationList({ items, isLoading }: NotificationListProps) {
  const markReadMutation = useMarkNotificationsRead();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-graphite-900/60 border border-graphite-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
          <Bell className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">No System Notifications</h3>
        <p className="text-xs text-graphite-400">
          All platform notifications and alerts have been processed.
        </p>
      </div>
    );
  }

  const unreadIds = items.filter((n) => !n.is_read).map((n) => n.notification_id);

  return (
    <div className="space-y-4">
      {unreadIds.length > 0 && (
        <div className="flex items-center justify-between bg-graphite-900 border border-graphite-800 rounded-xl p-3 px-4">
          <span className="text-xs text-graphite-300">
            You have <strong className="text-copper-400">{unreadIds.length}</strong> unread notifications.
          </span>
          <button
            onClick={() => markReadMutation.mutate(unreadIds)}
            disabled={markReadMutation.isPending}
            className="px-3 py-1 bg-graphite-800 hover:bg-graphite-700 text-copper-400 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((n) => {
          const isCritical = n.priority === "CRITICAL" || n.priority === "HIGH";
          return (
            <div
              key={n.id}
              className={cn(
                "bg-graphite-900 border rounded-xl p-4 transition-all space-y-2",
                !n.is_read ? "border-copper-500/40 bg-graphite-900/90" : "border-graphite-800 opacity-80"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-copper-400 animate-pulse" />}
                  <span className="font-bold text-white text-xs font-mono">{n.notification_id}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold font-mono border",
                      isCritical
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}
                  >
                    {n.priority}
                  </span>
                </div>

                <span className="text-[10px] text-graphite-400 font-mono">
                  {new Date(n.created_at).toLocaleTimeString()}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">{n.title}</h4>
                <p className="text-xs text-graphite-300 mt-0.5">{n.message}</p>
              </div>

              {!n.is_read && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => markReadMutation.mutate([n.notification_id])}
                    className="text-[11px] text-copper-400 hover:underline flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark as Read</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
