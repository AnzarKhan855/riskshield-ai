"use client";

import React from "react";
import { Search, ZoomIn, ZoomOut, Maximize2, Download, RefreshCw, Network, Filter, Layers } from "lucide-react";

interface GraphToolbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedNodeType?: string;
  onNodeTypeChange?: (t: string) => void;
  layout?: "force" | "circular" | "tree";
  onLayoutChange?: (l: "force" | "circular" | "tree") => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onExportJson?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function GraphToolbar({
  searchQuery = "",
  onSearchChange,
  selectedNodeType = "ALL",
  onNodeTypeChange,
  layout = "force",
  onLayoutChange,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExportJson,
  onRefresh,
  isLoading = false,
}: GraphToolbarProps) {
  return (
    <div className="bg-graphite-900 border-b border-graphite-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-sm">
      {/* Title & Search */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-copper-400 font-mono font-bold">
          <Network className="w-4 h-4" />
          <span>Graph Intelligence</span>
        </div>

        {onSearchChange && (
          <div className="relative w-40 sm:w-56">
            <input
              type="text"
              placeholder="Search nodes & IDs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-xs placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
            />
            <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        )}

        {onNodeTypeChange && (
          <div className="flex items-center space-x-1.5 bg-graphite-950 border border-graphite-700 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-graphite-400" />
            <select
              value={selectedNodeType}
              onChange={(e) => onNodeTypeChange(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="CUSTOMER">Customer</option>
              <option value="MERCHANT">Merchant</option>
              <option value="TRANSACTION">Transaction</option>
              <option value="DEVICE">Device</option>
              <option value="CARD">Card</option>
              <option value="IP">IP Address</option>
            </select>
          </div>
        )}

        {onLayoutChange && (
          <div className="flex items-center space-x-1.5 bg-graphite-950 border border-graphite-700 rounded-lg px-2 py-1">
            <Layers className="w-3.5 h-3.5 text-graphite-400" />
            <select
              value={layout}
              onChange={(e) => onLayoutChange(e.target.value as "force" | "circular" | "tree")}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="force">Force Grid</option>
              <option value="circular">Circular Ring</option>
            </select>
          </div>
        )}
      </div>

      {/* Action Controls & Zoom */}
      <div className="flex items-center space-x-2">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-graphite-950 border border-graphite-700 rounded-lg p-1">
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="p-1 text-graphite-400 hover:text-white rounded hover:bg-graphite-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="px-1.5 font-mono text-[11px] text-copper-400 font-bold min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="p-1 text-graphite-400 hover:text-white rounded hover:bg-graphite-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}
          {onResetZoom && (
            <button
              onClick={onResetZoom}
              className="p-1 text-graphite-400 hover:text-white rounded hover:bg-graphite-800 transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-graphite-950 border border-graphite-700 hover:bg-graphite-800 text-copper-400 transition-colors disabled:opacity-50"
            title="Refresh Graph Snapshot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        )}

        {onExportJson && (
          <button
            onClick={onExportJson}
            className="px-3 py-1.5 rounded-lg bg-copper-500/10 border border-copper-500/30 hover:bg-copper-500/20 text-copper-400 font-semibold transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        )}
      </div>
    </div>
  );
}
