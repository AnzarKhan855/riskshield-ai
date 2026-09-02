"use client";

import React, { useState, useEffect, useRef } from "react";
import { GraphNodeRecord, GraphEdgeRecord } from "@/types/graph";
import { Network } from "lucide-react";

interface GraphCanvasProps {
  nodes: GraphNodeRecord[];
  edges: GraphEdgeRecord[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  layout: "force" | "circular" | "tree";
  zoom: number;
}

interface PosNode extends GraphNodeRecord {
  x: number;
  y: number;
}

export default function GraphCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  layout,
  zoom,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positionedNodes, setPositionedNodes] = useState<PosNode[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Compute Layout Positions (Circular / Force Simulation stub)
  useEffect(() => {
    if (!nodes || nodes.length === 0) {
      setPositionedNodes([]);
      return;
    }

    const width = 900;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const updated: PosNode[] = nodes.map((node, i) => {
      if (layout === "circular") {
        const angle = (i / nodes.length) * 2 * Math.PI;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      } else {
        // Grid / Force layout simulation
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const col = i % cols;
        const row = Math.floor(i / cols);
        const spacingX = width / (cols + 1);
        const spacingY = height / (Math.ceil(nodes.length / cols) + 1);
        return {
          ...node,
          x: (col + 1) * spacingX,
          y: (row + 1) * spacingY,
        };
      }
    });

    setPositionedNodes(updated);
  }, [nodes, layout]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-graphite-950 border border-graphite-800 rounded-xl flex flex-col items-center justify-center space-y-3">
        <Network className="w-10 h-10 text-copper-400 opacity-50" />
        <h4 className="text-sm font-bold text-white">No Graph Data Loaded</h4>
        <p className="text-xs text-graphite-400">Select entity filters or search for nodes to render investigation canvas.</p>
      </div>
    );
  }

  const posMap = new Map<string, PosNode>(positionedNodes.map((n) => [n.id, n]));

  // Node Color Mapper
  const getNodeColor = (node: GraphNodeRecord) => {
    if (node.id === selectedNodeId) return "#f59e0b"; // Amber highlight
    if (node.risk_level === "CRITICAL") return "#f43f5e"; // Rose / Ruby
    if (node.risk_level === "HIGH") return "#fbbf24"; // Amber
    if (node.type === "MERCHANT") return "#38bdf8"; // Sky blue
    if (node.type === "CUSTOMER") return "#c084fc"; // Purple
    if (node.type === "TRANSACTION") return "#34d399"; // Emerald
    return "#a1a1aa"; // Graphite / Slate
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] bg-graphite-950 border border-graphite-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center"
    >
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox="0 0 900 600"
        style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="22"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#71717a" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge) => {
          const src = posMap.get(edge.source);
          const tgt = posMap.get(edge.target);
          if (!src || !tgt) return null;

          const isConnected =
            hoveredNodeId === edge.source ||
            hoveredNodeId === edge.target ||
            selectedNodeId === edge.source ||
            selectedNodeId === edge.target;

          return (
            <g key={edge.id}>
              <line
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={isConnected ? "#f59e0b" : "#3f3f46"}
                strokeWidth={isConnected ? 2.5 : 1.2}
                strokeDasharray={isConnected ? "4" : "none"}
                markerEnd="url(#arrowhead)"
              />
              {/* Edge Label */}
              <text
                x={(src.x + tgt.x) / 2}
                y={(src.y + tgt.y) / 2 - 4}
                fill={isConnected ? "#fbbf24" : "#71717a"}
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {edge.relationship}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {positionedNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isHovered = node.id === hoveredNodeId;
          const color = getNodeColor(node);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => onSelectNode(node.id)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              {/* Node Outer Ring */}
              <circle
                r={isSelected ? 18 : isHovered ? 16 : 14}
                fill="#18181b"
                stroke={color}
                strokeWidth={isSelected ? 3 : 2}
              />
              {/* Inner Circle */}
              <circle r={isSelected ? 8 : 6} fill={color} />

              {/* Node Label */}
              <text
                y={26}
                fill={isSelected ? "#fbbf24" : "#e4e4e7"}
                fontSize="10"
                fontFamily="monospace"
                fontWeight={isSelected ? "bold" : "normal"}
                textAnchor="middle"
              >
                {node.label.length > 15 ? `${node.label.substring(0, 13)}..` : node.label}
              </text>

              {/* Type Badge */}
              <text
                y={36}
                fill="#a1a1aa"
                fontSize="8"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {node.type}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Mini Map Overlay */}
      <div className="absolute bottom-4 left-4 bg-graphite-900 border border-graphite-800 rounded-lg p-2 text-[10px] font-mono text-graphite-400 shadow-lg">
        Canvas: 900x600 &bull; {nodes.length} Nodes &bull; {edges.length} Edges
      </div>
    </div>
  );
}
