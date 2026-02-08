"use client";

import React from "react";
import { Bug, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { McpPromptButton } from "@/components/tambo/mcp-components";

interface BugItem {
  _id?: string;
  id?: string;
  bug: string;
  status: string;
  priority: string;
  reporter?: { name: string };
}

interface BugListProps {
  bugs: BugItem[];
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority.toLowerCase()) {
    case "critical":
    case "high":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "medium":
      return <Circle className="w-4 h-4 text-yellow-500" />;
    case "low":
      return <Circle className="w-4 h-4 text-blue-500" />;
    default:
      return <Circle className="w-4 h-4 text-zinc-400" />;
  }
};

const StatusIcon = ({ status }: { status: string }) => {
    if (status.toLowerCase().includes("done") || status.toLowerCase().includes("resolved") || status.toLowerCase().includes("fixed")) {
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <Bug className="w-4 h-4 text-zinc-500" />;
}

export default function BugList({ bugs }: BugListProps) {
  if (!bugs || bugs.length === 0) {
    return (
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 text-center text-sm text-zinc-500">
        No bugs found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Bugs</h3>
        <span className="text-xs text-zinc-500">{bugs.length} items</span>
      </div>
      <div className="flex flex-col gap-2">
        {bugs.map((item) => {
            const id = item._id || item.id || "";
            return (
                <div
                    key={id}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 overflow-hidden">
                            <div className="mt-0.5 shrink-0">
                                <StatusIcon status={item.status} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate block">
                                    {item.bug}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                        <PriorityIcon priority={item.priority} />
                                        <span>{item.priority}</span>
                                    </div>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                         <McpPromptButton 
                            value={`Mark bug ${id} as Resolved`}
                            onInsertText={() => {}} 
                            className="text-xs py-1 px-2 h-auto min-h-0 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        >
                            Resolve
                        </McpPromptButton>
                        <McpPromptButton 
                            value={`Update priority of bug ${id} to High`}
                            onInsertText={() => {}}
                            className="text-xs py-1 px-2 h-auto min-h-0 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        >
                            Mark High Priority
                        </McpPromptButton>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
