"use client";

import React, { useState } from "react";
import { useNotificationWebSocket } from "@/hooks/useNotifications";
import { Bell, X, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LiveToastContainer() {
  const [activeToasts, setActiveToasts] = useState<any[]>([]);

  useNotificationWebSocket((msg) => {
    if (msg && msg.title) {
      const toastItem = {
        id: msg.event_id || Math.random().toString(),
        title: msg.title,
        message: msg.message,
        priority: msg.priority || "MEDIUM",
      };
      setActiveToasts((prev) => [toastItem, ...prev.slice(0, 4)]);
      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== toastItem.id));
      }, 5000);
    }
  });

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {activeToasts.map((t) => {
        const isCritical = t.priority === "CRITICAL" || t.priority === "HIGH";
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start space-x-3 transition-all animate-bounce-in",
              isCritical
                ? "bg-graphite-900 border-rose-500/50 text-white"
                : "bg-graphite-900 border-copper-500/50 text-white"
            )}
          >
            <ShieldAlert className={cn("w-5 h-5 flex-shrink-0 mt-0.5", isCritical ? "text-rose-400" : "text-copper-400")} />
            <div className="flex-1 space-y-0.5">
              <h5 className="text-xs font-bold">{t.title}</h5>
              <p className="text-[11px] text-graphite-300">{t.message}</p>
            </div>
            <button
              onClick={() => setActiveToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-graphite-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
