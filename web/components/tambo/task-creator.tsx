"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Loader2Icon, CheckIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface TaskCreatorProps {
  defaultTitle?: string;
  defaultDescription?: string;
  workspaceId: string;
  teamId: string;
  pageId: string;
  workspaceKey?: string;
  onSuccess?: (task: any) => void;
}

export function TaskCreator({
  defaultTitle = "",
  defaultDescription = "",
  workspaceId,
  teamId,
  pageId,
  workspaceKey = "TASK",
  onSuccess
}: TaskCreatorProps) {
  const { user } = useAuth();
  const [task, setTask] = useState(defaultTitle);
  const [status, setStatus] = useState<'Ready to start' | 'In Progress' | 'Done'>('Ready to start');
  const [type, setType] = useState<'Bug' | 'Feature' | 'Other'>('Feature');
  const [estimatedSP, setEstimatedSP] = useState(0);
  const [sprint, setSprint] = useState('Backlog');
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("Task name is required");
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task.trim(),
          owner: {
            id: user?.uid || 'anonymous',
            name: user?.displayName || 'Unknown User',
            email: user?.email || '',
            avatar: user?.photoURL || '',
            role: 'member'
          },
          status,
          type,
          estimatedSP,
          sprint,
          group: sprint,
          workspaceId,
          teamId,
          pageId,
          key: workspaceKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      setIsCreating(false);
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess(data.data);
      }

      // Reset form after delay
      setTimeout(() => {
        setTask("");
        setStatus('Ready to start');
        setType('Feature');
        setEstimatedSP(0);
        setSprint('Backlog');
        setIsSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm w-full max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600">
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Create New Task</h3>
          <p className="text-xs text-muted-foreground">Add a task to your workspace</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm flex items-center gap-2">
          <CheckIcon className="h-4 w-4" />
          Task created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-name" className="block text-sm font-medium mb-1.5">
            Task Name *
          </label>
          <input
            id="task-name"
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Implement user authentication"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-status" className="block text-sm font-medium mb-1.5">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Ready to start">Ready to start</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-type" className="block text-sm font-medium mb-1.5">
              Type
            </label>
            <select
              id="task-type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Feature">Feature</option>
              <option value="Bug">Bug</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-sp" className="block text-sm font-medium mb-1.5">
              Story Points
            </label>
            <input
              id="task-sp"
              type="number"
              value={estimatedSP}
              onChange={(e) => setEstimatedSP(Number(e.target.value))}
              min="0"
              max="100"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="task-sprint" className="block text-sm font-medium mb-1.5">
              Sprint/Group
            </label>
            <input
              id="task-sprint"
              type="text"
              value={sprint}
              onChange={(e) => setSprint(e.target.value)}
              placeholder="Backlog"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!task.trim() || isCreating}
          className={cn(
            "w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          )}
        >
          {isCreating ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Task"
          )}
        </button>
      </form>
    </div>
  );
}
