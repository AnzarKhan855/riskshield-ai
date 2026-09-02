"use client";

import { useState, useMemo } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import GraphCanvas from "@/components/graph/GraphCanvas";
import GraphToolbar from "@/components/graph/GraphToolbar";
import NodeDetailsPanel from "@/components/graph/NodeDetailsPanel";
import { useExpandNode, useGraphSnapshot } from "@/hooks/useGraph";
import { GraphNodeRecord } from "@/types/graph";
import { Network, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function RelationshipGraphWorkspacePage() {
  const [limit, setLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState("ALL");
  const [layout, setLayout] = useState<"force" | "circular" | "tree">("force");
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNodeRecord | null>(null);

  const { data: snapshot, isLoading, refetch } = useGraphSnapshot({ limit });
  const expandMutation = useExpandNode();
  const { showToast } = useToast();

  const filteredNodes = useMemo(() => {
    if (!snapshot?.nodes) return [];
    return snapshot.nodes.filter((node) => {
      const matchesSearch =
        searchQuery === "" ||
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedNodeType === "ALL" || node.type.toUpperCase() === selectedNodeType.toUpperCase();

      return matchesSearch && matchesType;
    });
  }, [snapshot?.nodes, searchQuery, selectedNodeType]);

  const filteredEdges = useMemo(() => {
    if (!snapshot?.edges) return [];
    const validNodeIds = new Set(filteredNodes.map((n) => n.id));
    return snapshot.edges.filter(
      (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
    );
  }, [snapshot?.edges, filteredNodes]);

  const handleExpandNode = (nodeId: string) => {
    expandMutation.mutate(
      { nodeId, depth: 1 },
      {
        onSuccess: () => {
          showToast(`Graph node expanded successfully!`, "success");
          refetch();
        },
      }
    );
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-graphite-950 rounded-xl border border-graphite-800 overflow-hidden shadow-2xl">
          {/* Top Toolbar Controls */}
          <GraphToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedNodeType={selectedNodeType}
            onNodeTypeChange={setSelectedNodeType}
            layout={layout}
            onLayoutChange={setLayout}
            zoom={zoom}
            onZoomIn={() => setZoom((prev) => Math.min(prev + 0.15, 2.0))}
            onZoomOut={() => setZoom((prev) => Math.max(prev - 0.15, 0.5))}
            onResetZoom={() => setZoom(1)}
            onRefresh={refetch}
            isLoading={isLoading}
            onExportJson={() => {
              if (snapshot) {
                const dataStr =
                  "data:text/json;charset=utf-8," +
                  encodeURIComponent(JSON.stringify(snapshot, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `RiskShield_Graph_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                showToast("Exported Graph payload JSON!", "info");
              }
            }}
          />

          {/* Main Canvas & Inspection Panel */}
          <div className="flex-1 flex overflow-hidden relative">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-graphite-950 text-graphite-400 font-mono text-xs animate-pulse">
                <Network className="w-6 h-6 text-copper-400 mr-2 animate-spin" />
                <span>Rendering dynamic relationship graph...</span>
              </div>
            ) : snapshot ? (
              <GraphCanvas
                nodes={filteredNodes}
                edges={filteredEdges}
                selectedNodeId={selectedNode?.id || null}
                onSelectNode={(nodeId: string) => {
                  const found = snapshot.nodes.find((n) => n.id === nodeId);
                  setSelectedNode(found || null);
                }}
                layout={layout}
                zoom={zoom}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-graphite-950 text-graphite-400 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-400 mr-2" />
                <span>Failed to load relationship graph snapshot.</span>
              </div>
            )}

            {/* Right Node Details Inspection Drawer */}
            <NodeDetailsPanel
              node={selectedNode}
              edges={snapshot?.edges || []}
              onClose={() => setSelectedNode(null)}
              onExpandNode={handleExpandNode}
            />
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
