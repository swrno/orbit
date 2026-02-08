"use client";

import React from "react";
import { CheckSquare, Circle, Clock, ArrowRight } from "lucide-react";
import { McpPromptButton } from "@/components/tambo/mcp-components";

interface TaskItem {
  _id?: string;
  id?: string;
  task: string;
  status: string;
  type?: string;
  estimatedSP?: number;
  sprint?: string;
}

interface TaskListProps {
  tasks: TaskItem[];
}

export default function TaskList({ tasks }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 text-center text-sm text-zinc-500">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tasks</h3>
        <span className="text-xs text-zinc-500">{tasks.length} items</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((item) => {
            const id = item._id || item.id || "";
            return (
                <div
                    key={id}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 overflow-hidden">
                            <div className="mt-0.5 shrink-0 text-blue-500">
                                <CheckSquare className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate block">
                                    {item.task}
                                </span>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                        {item.status}
                                    </span>
                                    {item.type && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                            {item.type}
                                        </span>
                                    )}
                                    {item.estimatedSP !== undefined && (
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{item.estimatedSP} SP</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                         <McpPromptButton 
                            value={`Start working on task ${id}`}
                            onInsertText={() => {}}
                            className="text-xs py-1 px-2 h-auto min-h-0 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        >
                            Start
                        </McpPromptButton>
                        <McpPromptButton 
                            value={`Complete task ${id}`}
                            onInsertText={() => {}}
                            className="text-xs py-1 px-2 h-auto min-h-0 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        >
                            Complete
                        </McpPromptButton>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
