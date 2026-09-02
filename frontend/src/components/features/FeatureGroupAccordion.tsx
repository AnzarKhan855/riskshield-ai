"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Layers, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureGroupAccordionProps {
  payload: Record<string, any>;
}

export default function FeatureGroupAccordion({ payload }: FeatureGroupAccordionProps) {
  // Group keys by prefix
  const groups: Record<string, Record<string, any>> = {
    "Transaction Features": {},
    "Customer Features": {},
    "Merchant Features": {},
    "Device Features": {},
    "Velocity Features": {},
    "Behaviour Features": {},
    "Location Features": {},
    "Historical Features": {},
    "Payment Features": {},
    "Risk Features": {},
    "Other Features": {},
  };

  Object.entries(payload || {}).forEach(([key, val]) => {
    if (key.startsWith("txn_")) groups["Transaction Features"][key] = val;
    else if (key.startsWith("cust_")) groups["Customer Features"][key] = val;
    else if (key.startsWith("merchant_")) groups["Merchant Features"][key] = val;
    else if (key.startsWith("dev_")) groups["Device Features"][key] = val;
    else if (key.startsWith("velocity_")) groups["Velocity Features"][key] = val;
    else if (key.startsWith("beh_")) groups["Behaviour Features"][key] = val;
    else if (key.startsWith("loc_")) groups["Location Features"][key] = val;
    else if (key.startsWith("hist_")) groups["Historical Features"][key] = val;
    else if (key.startsWith("pay_")) groups["Payment Features"][key] = val;
    else if (key.startsWith("risk_")) groups["Risk Features"][key] = val;
    else groups["Other Features"][key] = val;
  });

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Transaction Features": true,
    "Velocity Features": true,
    "Risk Features": true,
  });

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([groupTitle, features]) => {
        const count = Object.keys(features).length;
        if (count === 0) return null;
        const isOpen = !!openGroups[groupTitle];

        return (
          <div
            key={groupTitle}
            className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => toggleGroup(groupTitle)}
              className="w-full px-5 py-3.5 bg-graphite-950 flex items-center justify-between hover:bg-graphite-800/60 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4 text-copper-400" />
                <span className="text-sm font-semibold text-white">{groupTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-graphite-800 text-copper-400 font-mono font-medium">
                  {count} features
                </span>
              </div>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-graphite-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-graphite-400" />
              )}
            </button>

            {isOpen && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-graphite-800/80 bg-graphite-900">
                {Object.entries(features).map(([fKey, fVal]) => (
                  <div
                    key={fKey}
                    className="p-3 bg-graphite-950/80 border border-graphite-800 rounded-lg flex flex-col justify-between space-y-1"
                  >
                    <span className="text-[11px] font-mono text-graphite-400 flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-copper-500" />
                      <span className="truncate">{fKey}</span>
                    </span>

                    <span className="font-mono text-xs font-bold text-white truncate">
                      {typeof fVal === "boolean"
                        ? fVal
                          ? "TRUE"
                          : "FALSE"
                        : typeof fVal === "number"
                        ? fVal.toString()
                        : String(fVal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
