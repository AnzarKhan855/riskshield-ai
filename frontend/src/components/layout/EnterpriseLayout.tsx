"use client";

import React from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/layout/Sidebar";
import CommandPalette from "@/components/layout/CommandPalette";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import WorkflowPipelineRibbon from "@/components/common/WorkflowPipelineRibbon";
import AICopilotDrawer from "@/components/ai/AICopilotDrawer";

interface EnterpriseLayoutProps {
  children: React.ReactNode;
}

export default function EnterpriseLayout({ children }: EnterpriseLayoutProps) {
  return (
    <div className="h-screen w-full bg-graphite-950 text-graphite-100 flex overflow-hidden antialiased select-auto">
      {/* Permanent Left Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Fixed Top Header */}
        <Header />

        {/* Scrollable Content Container (The ONLY vertical scroll on the page) */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="max-w-[1800px] w-full min-w-0 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <Breadcrumbs />
            <WorkflowPipelineRibbon />
            {children}
          </div>
        </main>
      </div>

      {/* Global Cmd+K Command Palette */}
      <CommandPalette />

      {/* Global AI Copilot Assistant */}
      <AICopilotDrawer />
    </div>
  );
}

