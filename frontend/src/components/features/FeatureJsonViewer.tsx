"use client";

import React, { useState } from "react";
import { Code, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface FeatureJsonViewerProps {
  payload: Record<string, any>;
}

export default function FeatureJsonViewer({ payload }: FeatureJsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast("Feature JSON payload copied to clipboard!", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-graphite-950 px-5 py-3 border-b border-graphite-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
          <Code className="w-4 h-4" />
          <span>Raw Feature Vector JSON Payload</span>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-graphite-800 hover:bg-graphite-700 text-graphite-200 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy JSON</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-5 font-mono text-xs text-graphite-200 bg-graphite-950 overflow-x-auto max-h-[500px] leading-relaxed">
        {jsonString}
      </pre>
    </div>
  );
}
