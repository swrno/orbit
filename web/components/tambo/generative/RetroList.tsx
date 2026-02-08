"use client";

import React from "react";
import { MessageSquare, ThumbsUp, Repeat } from "lucide-react";
import { McpPromptButton } from "@/components/tambo/mcp-components";

interface RetroItem {
  _id?: string;
  id?: string;
  feedback: string;
  type: 'Keep' | 'Improve' | 'Discussion';
  repeating?: boolean;
  vote?: number;
  submitter?: { name: string };
}

interface RetroListProps {
  retros: RetroItem[];
}

const TypeBadge = ({ type }: { type: string }) => {
    let colors = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    if (type === 'Keep') colors = "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800";
    if (type === 'Improve') colors = "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800";
    if (type === 'Discussion') colors = "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800";

    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors}`}>
            {type}
        </span>
    );
}

export default function RetroList({ retros }: RetroListProps) {
  if (!retros || retros.length === 0) {
    return (
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 text-center text-sm text-zinc-500">
        No retrospective items found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Retrospective</h3>
        <span className="text-xs text-zinc-500">{retros.length} items</span>
      </div>
      <div className="flex flex-col gap-2">
        {retros.map((item) => {
            const id = item._id || item.id || "";
            return (
                <div
                    key={id}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <TypeBadge type={item.type} />
                            {item.repeating && (
                                <div className="flex items-center gap-1 text-[10px] text-red-500">
                                    <Repeat className="w-3 h-3" />
                                    <span>Repeating</span>
                                </div>
                            )}
                        </div>
                        
                        <p className="text-sm text-zinc-900 dark:text-zinc-100">
                            {item.feedback}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-zinc-500">
                                {item.submitter?.name || 'Anonymous'}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{item.vote || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                         <McpPromptButton 
                            value={`Vote for retro item ${id}`}
                            onInsertText={() => {}}
                            className="text-xs py-1 px-2 h-auto min-h-0 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        >
                            Vote
                        </McpPromptButton>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
