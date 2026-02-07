"use client";

import { useState } from "react";
import { Calendar, Loader2Icon, CheckIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SprintCreatorProps {
  defaultName?: string;
  workspaceId: string;
  teamId: string;
  pageId: string;
  onSuccess?: (sprint: any) => void;
}

export function SprintCreator({
  defaultName = "",
  workspaceId,
  teamId,
  pageId,
  onSuccess
}: SprintCreatorProps) {
  const { user } = useAuth();
  const [sprint, setSprint] = useState(defaultName);
  const [sprintGoals, setSprintGoals] = useState("");
  const [activeSprintStatus, setActiveSprintStatus] = useState<'Active' | 'Planned' | 'Completed'>('Planned');
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [sprintEndDate, setSprintEndDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint.trim() || !sprintStartDate || !sprintEndDate) {
      setError("Sprint name, start date, and end date are required");
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprint: sprint.trim(),
          sprintGoals,
          activeSprintStatus,
          sprintTimeline: {
            start: new Date(sprintStartDate),
            end: new Date(sprintEndDate)
          },
          sprintStartDate: new Date(sprintStartDate),
          sprintEndDate: new Date(sprintEndDate),
          connectedTasks: [],
          completed: false,
          workspaceId,
          teamId,
          pageId,
          owner: {
            id: user?.uid || 'anonymous',
            name: user?.displayName || 'Unknown User',
            email: user?.email || '',
            avatar: user?.photoURL || '',
            role: 'member'
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sprint');
      }

      setIsCreating(false);
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess(data.data);
      }

      setTimeout(() => {
        setSprint("");
        setSprintGoals("");
        setActiveSprintStatus('Planned');
        setSprintStartDate("");
        setSprintEndDate("");
        setIsSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create sprint");
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm w-full max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-600">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Create New Sprint</h3>
          <p className="text-xs text-muted-foreground">Plan a sprint for your team</p>
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
          Sprint created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sprint-name" className="block text-sm font-medium mb-1.5">
            Sprint Name *
          </label>
          <input
            id="sprint-name"
            type="text"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            placeholder="e.g. Sprint 1, Q1 Sprint"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="sprint-goals" className="block text-sm font-medium mb-1.5">
            Sprint Goals
          </label>
          <textarea
            id="sprint-goals"
            value={sprintGoals}
            onChange={(e) => setSprintGoals(e.target.value)}
            placeholder="What do you want to achieve in this sprint?"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="sprint-status" className="block text-sm font-medium mb-1.5">
            Status
          </label>
          <select
            id="sprint-status"
            value={activeSprintStatus}
            onChange={(e) => setActiveSprintStatus(e.target.value as any)}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sprint-start" className="block text-sm font-medium mb-1.5">
              Start Date *
            </label>
            <input
              id="sprint-start"
              type="date"
              value={sprintStartDate}
              onChange={(e) => setSprintStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="sprint-end" className="block text-sm font-medium mb-1.5">
              End Date *
            </label>
            <input
              id="sprint-end"
              type="date"
              value={sprintEndDate}
              onChange={(e) => setSprintEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!sprint.trim() || !sprintStartDate || !sprintEndDate || isCreating}
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
            "Create Sprint"
          )}
        </button>
      </form>
    </div>
  );
}
