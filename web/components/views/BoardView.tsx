"use client";

import { Plus } from "lucide-react";

export function BoardView() {
  return (
    <div className="flex gap-6 h-full p-6 overflow-x-auto">
      {/* Column 1 */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium text-zinc-500">To Do</span>
          <span className="text-xs text-zinc-500 bg-surface-elevated px-2 py-0.5 rounded-full border border-border-subtle">
            3
          </span>
        </div>
        {/* Card */}
        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm hover:border-border-highlight transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-zinc-500 font-mono">
              ENG-1024
            </span>
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-3 group-hover:text-accent-primary transition-colors">
            Design new sidebar navigation interactions
          </h4>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 border border-border-subtle px-1.5 py-0.5 rounded">
              <div className="w-3 h-3 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center">
                S
              </div>
              <span>Space</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-surface-elevated" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm hover:border-border-highlight transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-zinc-500 font-mono">
              ENG-1025
            </span>
            <div className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-3">
            Fix authentication redirect loop
          </h4>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 border border-border-subtle px-1.5 py-0.5 rounded">
              <div className="w-3 h-3 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center">
                B
              </div>
              <span>Backend</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-surface-elevated" />
          </div>
        </div>
      </div>

      {/* Column 2 */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium text-zinc-500">In Progress</span>
          <span className="text-xs text-zinc-500 bg-surface-elevated px-2 py-0.5 rounded-full border border-border-subtle">
            1
          </span>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-accent-primary/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.1)] hover:border-accent-primary/40 transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-accent-primary font-mono">ENG-998</span>
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-3">
            Integrate OpenAI Stream API
          </h4>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 border border-border-subtle px-1.5 py-0.5 rounded">
              <div className="w-3 h-3 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                A
              </div>
              <span>API</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-surface-elevated ring-2 ring-accent-primary/30" />
          </div>
        </div>
      </div>

      {/* Add Column */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4 opacity-50 hover:opacity-100 transition-opacity">
        <div className="h-10 border border-dashed border-border-highlight rounded-lg flex items-center justify-center text-sm text-zinc-500 hover:bg-surface-hover cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Add Group
        </div>
      </div>
    </div>
  );
}
