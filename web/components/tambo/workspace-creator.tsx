"use client";

import { useState } from "react";
import { Briefcase, Loader2Icon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface WorkspaceCreatorProps {
  defaultName?: string;
  onSuccess?: (workspaceId: string) => void;
}

export function WorkspaceCreator({ defaultName = "", onSuccess }: WorkspaceCreatorProps) {
  const [name, setName] = useState(defaultName);
  const [key, setKey] = useState("");
  const [plan, setPlan] = useState<'Free' | 'Pro'>('Free');
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createWorkspace = useAppStore((state) => state.createWorkspace);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      setError("Name and key are required");
      return;
    }

    setError(null);
    setIsCreating(true);
    
    try {
      // Generate workspace ID
      const workspaceId = `ws-${Date.now()}`;
      
      // Create workspace in local store
      // Note: Workspaces are managed client-side via Zustand
      // MongoDB is used for tasks, bugs, sprints, etc.
      createWorkspace(name, workspaceId);
      
      // Update workspace with additional details
      useAppStore.getState().updateWorkspace(workspaceId, {
        key: key.toUpperCase(),
        plan: plan
      });
      
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      setIsCreating(false);
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess(workspaceId);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
      setIsCreating(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-green-700 animate-in fade-in zoom-in duration-300">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckIcon className="h-6 w-6" />
        </div>
        <p className="font-medium">Workspace "{name}" Created!</p>
        <p className="text-xs text-green-600">Ready to start managing your work.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm w-full max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Create New Workspace</h3>
          <p className="text-xs text-muted-foreground">Set up a new project workspace</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="workspace-name" className="block text-sm font-medium mb-1.5">
            Workspace Name *
          </label>
          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing Campaign, Product Development"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="workspace-key" className="block text-sm font-medium mb-1.5">
            Project Key *
          </label>
          <input
            id="workspace-key"
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder="e.g. PROJ, TEAM, MKT"
            maxLength={10}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used for task IDs (e.g., {key || 'PROJ'}-123)
          </p>
        </div>

        <div>
          <label htmlFor="workspace-plan" className="block text-sm font-medium mb-1.5">
            Plan
          </label>
          <select
            id="workspace-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as 'Free' | 'Pro')}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !key.trim() || isCreating}
          className={cn(
            "w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          )}
        >
          {isCreating ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Workspace"
          )}
        </button>
      </form>
    </div>
  );
}
