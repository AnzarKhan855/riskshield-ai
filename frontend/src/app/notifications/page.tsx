"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import NotificationList from "@/components/notifications/NotificationList";
import EventTimeline from "@/components/notifications/EventTimeline";
import LiveToastContainer from "@/components/notifications/LiveToastContainer";
import {
  useEventLogs,
  useNotifications,
  usePublishEvent,
} from "@/hooks/useNotifications";
import { EventType, NotificationFilterParams } from "@/types/notification";
import { Bell, Activity, Send } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function NotificationsCenterPage() {
  const [activeTab, setActiveTab] = useState<"notifications" | "events">("notifications");
  const [filters, setFilters] = useState<NotificationFilterParams>({ page: 1, size: 15 });
  const [eventTypeInput, setEventTypeInput] = useState<EventType>("HIGH_RISK_TRANSACTION");
  const [showPublishModal, setShowPublishModal] = useState(false);

  const notificationsQuery = useNotifications(filters);
  const eventsQuery = useEventLogs({ page: 1, size: 20 });
  const publishMutation = usePublishEvent();
  const { showToast } = useToast();

  const handlePublishCustomEvent = () => {
    publishMutation.mutate(
      {
        event_type: eventTypeInput,
        source: "Notification Studio",
        payload: {
          transaction_id: "TXN-9821849A",
          amount: 4500.0,
          risk_score: 96.5,
          timestamp: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          setShowPublishModal(false);
        },
      }
    );
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 w-full">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Bell className="w-4 h-4 text-copper-400 shrink-0" />
                <span className="truncate">Real-Time Event & Notification Platform</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                Notification Center & Event Feed
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Real-time WebSocket event streaming, user notifications, and platform activity logs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono font-bold text-emerald-400 text-xs">LIVE WEBSOCKET STREAM</span>
              </div>

              <button
                onClick={() => setShowPublishModal(true)}
                className="px-4 py-2 bg-copper-500 hover:bg-copper-600 text-graphite-950 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-2 shadow-md shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Event</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-graphite-800 space-x-4 sm:space-x-6 overflow-x-auto custom-scrollbar w-full max-w-full">
            <button
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "pb-3 text-xs font-bold transition-colors flex items-center space-x-2 border-b-2",
                activeTab === "notifications"
                  ? "border-copper-400 text-copper-400"
                  : "border-transparent text-graphite-400 hover:text-white"
              )}
            >
              <Bell className="w-4 h-4" />
              <span>User Notifications</span>
              {notificationsQuery.data?.unread_count ? (
                <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                  {notificationsQuery.data.unread_count}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={cn(
                "pb-3 text-xs font-bold transition-colors flex items-center space-x-2 border-b-2",
                activeTab === "events"
                  ? "border-copper-400 text-copper-400"
                  : "border-transparent text-graphite-400 hover:text-white"
              )}
            >
              <Activity className="w-4 h-4" />
              <span>System Event Log Stream</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "notifications" ? (
            <NotificationList
              items={notificationsQuery.data?.items || []}
              isLoading={notificationsQuery.isLoading}
            />
          ) : (
            <EventTimeline
              events={eventsQuery.data?.items || []}
              isLoading={eventsQuery.isLoading}
            />
          )}

          {/* Simulate Event Modal */}
          {showPublishModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Simulate System Event Broadcast</h3>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="text-graphite-400 hover:text-white text-xs font-mono"
                  >
                    ESC
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-graphite-400 font-semibold block mb-1">Select Event Type</label>
                    <select
                      value={eventTypeInput}
                      onChange={(e) => setEventTypeInput(e.target.value as EventType)}
                      className="w-full bg-graphite-950 border border-graphite-700 rounded-lg p-2 text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                    >
                      <option value="HIGH_RISK_TRANSACTION">HIGH_RISK_TRANSACTION</option>
                      <option value="DECISION_GENERATED">DECISION_GENERATED</option>
                      <option value="CASE_CREATED">CASE_CREATED</option>
                      <option value="RULE_PUBLISHED">RULE_PUBLISHED</option>
                      <option value="TRANSACTION_FAILED">TRANSACTION_FAILED</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-graphite-800">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 bg-graphite-800 hover:bg-graphite-700 text-graphite-300 font-semibold text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublishCustomEvent}
                    disabled={publishMutation.isPending}
                    className="px-4 py-2 bg-copper-500 hover:bg-copper-600 text-graphite-950 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish & Broadcast</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <LiveToastContainer />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
