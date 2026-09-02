"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import DeviceTable from "@/components/devices/DeviceTable";
import { useDevices, useDeleteDevice } from "@/hooks/useDevices";
import { Device, DeviceFilterParams } from "@/types/device";
import { Smartphone, Search, WifiOff, ShieldAlert, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function DevicesPage() {
  const [filters, setFilters] = useState<DeviceFilterParams>({
    page: 1,
    size: 10,
    search: "",
  });

  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);

  const { data, isLoading } = useDevices(filters);
  const deleteMutation = useDeleteDevice();

  const handleFilterChange = (newFilters: Partial<DeviceFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleDeleteConfirm = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingDevice(null),
    });
  };

  // Telemetry Aggregates
  const totalDevices = data?.total || 0;
  const vpnCount = data?.items ? data.items.filter((d) => d.vpn_detected).length : 0;
  const rootedCount = data?.items
    ? data.items.filter((d) => d.rooted_device || d.jailbroken || d.emulator).length
    : 0;

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gold-400 mb-1">
                <Smartphone className="w-4 h-4" />
                <span>Device Intelligence Engine</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Device Fingerprint Registry
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Hardware fingerprinting, VPN detection, rooted/jailbroken device telemetry, and location tracking.
              </p>
            </div>
          </div>

          {/* Security Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Total Tracked Devices</span>
                <Smartphone className="w-4 h-4 text-gold-400" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-2">{totalDevices}</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">VPN Active Devices</span>
                <WifiOff className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-extrabold text-rose-400 mt-2">{vpnCount}</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Rooted / Emulators</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-400 mt-2">{rootedCount}</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search Fingerprint, IP, OS, Browser..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({ search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={filters.vpn_detected === undefined ? "" : String(filters.vpn_detected)}
                onChange={(e) =>
                  handleFilterChange({
                    vpn_detected: e.target.value === "" ? undefined : e.target.value === "true",
                    page: 1,
                  })
                }
                className="px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">All Connections</option>
                <option value="true">VPN Detected Only</option>
                <option value="false">Non-VPN Direct</option>
              </select>

              <select
                value={filters.rooted_device === undefined ? "" : String(filters.rooted_device)}
                onChange={(e) =>
                  handleFilterChange({
                    rooted_device: e.target.value === "" ? undefined : e.target.value === "true",
                    page: 1,
                  })
                }
                className="px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">All Integrity</option>
                <option value="true">Rooted / Modified</option>
                <option value="false">Stock Device OS</option>
              </select>
            </div>
          </div>

          {/* Device Table */}
          <DeviceTable
            devices={data?.items || []}
            isLoading={isLoading}
            onDeleteClick={(d) => setDeletingDevice(d)}
          />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total devices)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={data.page <= 1}
                  onClick={() => handleFilterChange({ page: data.page - 1 })}
                  className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 disabled:opacity-40 text-graphite-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={data.page >= data.pages}
                  onClick={() => handleFilterChange({ page: data.page + 1 })}
                  className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 disabled:opacity-40 text-graphite-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
