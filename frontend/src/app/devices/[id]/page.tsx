"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import DeviceTimeline from "@/components/devices/DeviceTimeline";
import { useDevice, useDeviceTimeline } from "@/hooks/useDevices";
import { Smartphone, ShieldAlert, Globe, Monitor, MapPin, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DeviceDetailsPageProps {
  params: { id: string };
}

export default function DeviceDetailsPage({ params }: DeviceDetailsPageProps) {
  const { id } = params;
  const { data: device, isLoading, error } = useDevice(id);
  const { data: timeline = [], isLoading: isTimelineLoading } = useDeviceTimeline(id);

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-8 space-y-4 animate-pulse">
              <div className="h-8 bg-graphite-800 rounded w-1/3" />
              <div className="h-64 bg-graphite-800/50 rounded-xl" />
            </div>
          ) : error || !device ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Device Profile Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested device fingerprint could not be located or has been archived.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back & Fingerprint Header */}
              <div className="flex items-center space-x-3">
                <Link
                  href="/devices"
                  className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-gold-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold font-mono text-gold-400">{device.device_fingerprint}</h1>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-graphite-800 text-white border border-graphite-700">
                      {device.device_type}
                    </span>
                  </div>
                  <p className="text-xs text-graphite-400 mt-0.5">
                    First seen {new Date(device.first_seen).toLocaleDateString()} &bull; Last active {new Date(device.last_seen).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Security Telemetry Badges */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                  className={cn(
                    "bg-graphite-900 border rounded-xl p-4 flex items-center justify-between",
                    device.vpn_detected ? "border-rose-500/40 bg-rose-500/5 text-rose-400" : "border-graphite-800 text-emerald-400"
                  )}
                >
                  <span className="text-xs font-semibold">VPN / Proxy</span>
                  <span className="text-sm font-bold">{device.vpn_detected ? "DETECTED" : "CLEAN"}</span>
                </div>

                <div
                  className={cn(
                    "bg-graphite-900 border rounded-xl p-4 flex items-center justify-between",
                    device.rooted_device ? "border-amber-500/40 bg-amber-500/5 text-amber-400" : "border-graphite-800 text-emerald-400"
                  )}
                >
                  <span className="text-xs font-semibold">Rooted OS</span>
                  <span className="text-sm font-bold">{device.rooted_device ? "ROOTED" : "STOCK"}</span>
                </div>

                <div
                  className={cn(
                    "bg-graphite-900 border rounded-xl p-4 flex items-center justify-between",
                    device.jailbroken ? "border-amber-500/40 bg-amber-500/5 text-amber-400" : "border-graphite-800 text-emerald-400"
                  )}
                >
                  <span className="text-xs font-semibold">Jailbroken</span>
                  <span className="text-sm font-bold">{device.jailbroken ? "YES" : "NO"}</span>
                </div>

                <div
                  className={cn(
                    "bg-graphite-900 border rounded-xl p-4 flex items-center justify-between",
                    device.emulator ? "border-gold-500/40 bg-gold-500/5 text-gold-400" : "border-graphite-800 text-emerald-400"
                  )}
                >
                  <span className="text-xs font-semibold">Emulator</span>
                  <span className="text-sm font-bold">{device.emulator ? "EMULATOR" : "PHYSICAL"}</span>
                </div>
              </div>

              {/* Geo & Environment Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gold-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">IP & Geo Location</h4>
                    <p className="text-xs text-graphite-400">
                      {device.ip_address} &bull; {device.country} {device.city ? `(${device.city})` : ""}
                    </p>
                  </div>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gold-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Software Environment</h4>
                    <p className="text-xs text-graphite-400">
                      {device.operating_system} &bull; {device.browser}
                    </p>
                  </div>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gold-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Geo Coordinates</h4>
                    <p className="text-xs text-graphite-400">
                      {device.latitude && device.longitude
                        ? `${device.latitude}, ${device.longitude}`
                        : "No GPS lock"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Device Transaction Timeline */}
              <DeviceTimeline
                transactions={timeline}
                isLoading={isTimelineLoading}
              />
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
