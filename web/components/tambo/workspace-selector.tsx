"use client";

import { useAppStore } from "@/lib/store";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceSelectorProps {
  label?: string;
  className?: string;
}

export function WorkspaceSelector({
  label = "Workspace",
  className
}: WorkspaceSelectorProps) {
  const { workspaces, currentWorkspaceId, selectWorkspace } = useAppStore();

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Briefcase className="h-3 w-3" />
        {label}
      </label>
      <div className="relative">
        <select
          value={currentWorkspaceId || ""}
          onChange={(e) => selectWorkspace(e.target.value)}
          className="w-full px-2 py-1.5 pl-8 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <div
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
          style={{ backgroundColor: workspaces.find(w => w.id === currentWorkspaceId)?.color || '#0052CC' }}
        />
      </div>
    </div>
  );
}
