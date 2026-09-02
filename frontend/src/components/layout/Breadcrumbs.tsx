"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-graphite-400 font-mono mb-4 w-full">
      <Link
        href="/operations"
        className="flex items-center space-x-1 hover:text-copper-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Platform</span>
      </Link>

      {segments.map((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const isLast = idx === segments.length - 1;
        const formattedSeg = seg.replace(/-/g, " ");

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3 h-3 text-graphite-600" />
            {isLast ? (
              <span className="font-bold text-white capitalize truncate max-w-xs">
                {formattedSeg}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-copper-400 transition-colors capitalize"
              >
                {formattedSeg}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
