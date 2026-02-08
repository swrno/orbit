"use client";

import React from "react";
import { Layers, Calendar } from "lucide-react";
import { McpPromptButton } from "@/components/tambo/mcp-components";

interface EpicItem {
  _id?: string;
  id?: string;
  epic: string;
  status: string;
  priority?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
}

interface EpicListProps {
  epics: EpicItem[];
}

export default function EpicList({ epics }: EpicListProps) {
  if (!epics || epics.length === 0) {
    return (
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 text-center text-sm text-zinc-500">
        No epics found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Epics</h3>
        <span className="text-xs text-zinc-500">{epics.length} items</span>
      </div>
      <div className="flex flex-col gap-2">
        {epics.map((item) => {
            const id = item._id || item.id || "";
            return (
                <div
                    key={id}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 w-full overflow-hidden">
                            <div className="mt-0.5 shrink-0 text-purple-500">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0 w-full">
                                <div className="flex justify-between items-start">
                                     <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate block">
                                        {item.epic}
                                    </span>
                                    {item.priority && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 shrink-0 ml-2">
                                            {item.priority}
                                        </span>
                                    )}
                                </div>
                                
                                {item.progress !== undefined && (
                                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-2">
                                        <div 
                                            className="bg-purple-500 h-1.5 rounded-full" 
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-zinc-500 font-medium">
                                        {item.status}
                                    </span>
                                    {item.endDate && (
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>Due {new Date(item.endDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                         <McpPromptButton 
                            value={`Update progress of epic ${id}`}
                            onInsertText={() => {}}
                            className="text-xs py-1 px-2 h-auto min-h-0 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        >
                            Update Progress
                        </McpPromptButton>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
