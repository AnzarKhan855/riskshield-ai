"use client";

import React from "react";
import Link from "next/link";
import { Eye, Trash2, Smartphone, ShieldAlert, WifiOff, Lock } from "lucide-react";
import { Device } from "@/types/device";
import { cn } from "@/lib/utils";

interface DeviceTableProps {
  devices: Device[];
  isLoading: boolean;
  onDeleteClick: (device: Device) => void;
}

export default function DeviceTable({
  devices,
  isLoading,
  onDeleteClick,
}: DeviceTableProps) {
  if (isLoading) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-graphite-800/50 rounded-lg w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-graphite-400 flex items-center justify-center mx-auto">
          <Smartphone className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Device Profiles Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No device fingerprints match your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-graphite-300">
          <thead className="bg-graphite-950/80 uppercase tracking-wider text-[10px] font-semibold text-graphite-400 border-b border-graphite-800">
            <tr>
              <th className="px-6 py-4">Device Fingerprint & Type</th>
              <th className="px-6 py-4">Environment (OS & Browser)</th>
              <th className="px-6 py-4">IP Address & Location</th>
              <th className="px-6 py-4">Security Telemetry</th>
              <th className="px-6 py-4">Txn Activity</th>
              <th className="px-6 py-4">Last Seen</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {devices.map((d) => (
              <tr
                key={d.id}
                className="hover:bg-graphite-800/40 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white">
                  <div className="flex flex-col">
                    <span className="font-semibold font-mono text-sm text-gold-400">
                      {d.device_fingerprint}
                    </span>
                    <span className="text-[11px] text-graphite-400">{d.device_type}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-graphite-200">{d.operating_system}</span>
                    <span className="text-graphite-400 text-[11px]">{d.browser}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-graphite-200 font-mono">{d.ip_address}</span>
                    <span className="text-graphite-400 text-[11px]">
                      {d.country} {d.city ? `(${d.city})` : ""}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {d.vpn_detected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        VPN
                      </span>
                    )}
                    {d.rooted_device && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        Rooted
                      </span>
                    )}
                    {d.jailbroken && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        Jailbroken
                      </span>
                    )}
                    {d.emulator && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gold-500/10 border border-gold-500/30 text-gold-400">
                        Emulator
                      </span>
                    )}
                    {!d.vpn_detected && !d.rooted_device && !d.jailbroken && !d.emulator && (
                      <span className="text-[11px] text-emerald-400 font-medium">Clean Device</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-graphite-200 font-medium">
                  {d.transaction_count} txns ({d.failed_attempts} failed)
                </td>

                <td className="px-6 py-4 text-graphite-400 text-[11px]">
                  {new Date(d.last_seen).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/devices/${d.id}`}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-gold-400 transition-colors"
                      title="View Device Telemetry & Timeline"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDeleteClick(d)}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-rose-900/40 text-graphite-400 hover:text-rose-400 transition-colors"
                      title="Soft Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
