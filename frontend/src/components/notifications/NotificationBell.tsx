"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications, useNotificationWebSocket } from "@/hooks/useNotifications";

export default function NotificationBell() {
  const { data } = useNotifications({ size: 1 });
  useNotificationWebSocket();

  const unreadCount = data?.unread_count || 0;

  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
      title="Notification Center & Event Feed"
    >
      <Bell className="w-4 h-4 text-copper-400" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse border border-graphite-950">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
