"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { PlusIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceCreatorProps {
  defaultName?: string;
}

export function WorkspaceCreator({ defaultName = "" }: WorkspaceCreatorProps) {
  const [name, setName] = useState(defaultName);
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const createWorkspace = useAppStore((state) => state.createWorkspace);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    createWorkspace(name);
    
    setIsCreating(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-green-700 animate-in fade-in zoom-in duration-300">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckIcon className="h-6 w-6" />
        </div>
        <p className="font-medium">Workspace "{name}" Created!</p>
        <p className="text-xs text-green-600">You can find it in your sidebar.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <PlusIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-sm">Create New Workspace</h3>
          <p className="text-xs text-muted-foreground">Start a new project space</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="workspace-name" className="sr-only">
            Workspace Name
          </label>
          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing Campaign, Q3 Goals..."
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim() || isCreating}
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
