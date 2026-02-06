"use client";

import { useState } from "react";
import { useAppStore, Sprint, Epic} from "@/lib/store";
import { 
  CalendarDays, 
  Flag, 
  Rocket, 
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "@/components/tambo/workspace-selector";

// --- Sprint Creator ---

interface SprintCreatorProps {
  defaultName?: string;
}

export function SprintCreator({ defaultName = "" }: SprintCreatorProps) {
  const { currentWorkspaceId, workspaces, addSprint } = useAppStore();
  const [name, setName] = useState(defaultName);
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(currentWorkspaceId || (workspaces[0]?.id ?? ""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId || !name.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    addSprint(targetWorkspaceId, {
      name,
      goal,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planning',
      velocity: 0
    });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
     return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-green-700 animate-in fade-in zoom-in duration-300">
        <Rocket className="h-8 w-8 text-green-600 mb-2" />
        <p className="font-medium">Sprint Created!</p>
        <button 
          onClick={() => { setIsSuccess(false); setName(""); setGoal(""); }}
          className="text-xs underline mt-2 hover:text-green-800"
        >
          Plan another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden">
      <div className="p-3 bg-muted/30 border-b border-border">
         <h3 className="font-medium text-sm flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          Plan New Sprint
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <WorkspaceSelector 
          value={targetWorkspaceId} 
          onChange={setTargetWorkspaceId} 
        />

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Sprint Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 24"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Sprint Goal</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What's the main focus?"
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
            />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-muted-foreground">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
           className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Sprint"}
        </button>
      </form>
    </div>
  );
}

// --- Sprint Card ---

interface SprintCardProps {
  sprint: Sprint;
}

export function SprintCard({ sprint }: SprintCardProps) {
  const statusColors = {
    'planning': 'bg-slate-100 text-slate-700',
    'active': 'bg-blue-100 text-blue-700',
    'completed': 'bg-green-100 text-green-700'
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm p-4 relative overflow-hidden group">
      <div className={cn("absolute top-0 left-0 w-1 h-full transition-colors", 
        sprint.status === 'active' ? 'bg-blue-500' : 'bg-slate-200'
      )} />
      
      <div className="pl-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">{sprint.name}</h4>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase", statusColors[sprint.status])}>
            {sprint.status}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-3 italic">
          "{sprint.goal || 'No goal set'}"
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Epic Creator ---

export function EpicCreator() {
  const { currentWorkspaceId, workspaces, addEpic } = useAppStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(currentWorkspaceId || (workspaces[0]?.id ?? ""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId || !name.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    addEpic(targetWorkspaceId, {
      name,
      description,
      color,
      status: 'To Do'
    });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

   if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-green-700 animate-in fade-in zoom-in duration-300">
        <Flag className="h-8 w-8 text-green-600 mb-2" />
        <p className="font-medium">Epic Created!</p>
        <button 
          onClick={() => { setIsSuccess(false); setName(""); setDescription(""); }}
          className="text-xs underline mt-2 hover:text-green-800"
        >
          Create another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden">
      <div className="p-3 bg-muted/30 border-b border-border">
         <h3 className="font-medium text-sm flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          New Epic
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <WorkspaceSelector 
          value={targetWorkspaceId} 
          onChange={setTargetWorkspaceId} 
        />
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Epic Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q1 Marketing Infrastructure"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

         <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="High level objective..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Color Code</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                  color === c ? "ring-2 ring-offset-1 ring-primary scale-110" : "opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
           className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Epic"}
        </button>
      </form>
    </div>
  );
}

// --- Epic Card ---

interface EpicCardProps {
  epic: Epic;
}

export function EpicCard({ epic }: EpicCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm p-4 relative overflow-hidden">
        <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: epic.color }}
      />
      
      <div className="flex items-start justify-between gap-2 mt-1">
        <div>
          <span className="text-[10px] font-mono text-muted-foreground block mb-0.5">{epic.key}</span>
          <h4 className="font-semibold text-sm leading-tight">{epic.name}</h4>
        </div>
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
          epic.status === 'Done' ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"
        )}>
          {epic.status}
        </span>
      </div>

      {epic.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {epic.description}
        </p>
      )}
    </div>
  );
}
