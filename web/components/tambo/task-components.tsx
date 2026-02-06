"use client";

import { useState } from "react";
import { useAppStore, TaskStatus, TaskPriority, Task, TeamMember } from "@/lib/store";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  Loader2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "@/components/tambo/workspace-selector";

// --- Task Creator ---

interface TaskCreatorProps {
  defaultTitle?: string;
  defaultDescription?: string;
}

export function TaskCreator({ defaultTitle = "", defaultDescription = "" }: TaskCreatorProps) {
  const { currentWorkspaceId, addTask, workspaces } = useAppStore();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [status, setStatus] = useState<TaskStatus>("Todo");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [owner, setOwner] = useState<string>("");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(currentWorkspaceId || (workspaces[0]?.id ?? ""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const workspace = workspaces.find(w => w.id === targetWorkspaceId);
  const teamMembers = workspace?.teamMembers || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId || !title.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // UX delay

    addTask(targetWorkspaceId, {
      title,
      description,
      status,
      priority,
      owner: owner || undefined,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-green-700 animate-in fade-in zoom-in duration-300">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="font-medium">Task Created Successfully!</p>
        <button 
          onClick={() => { setIsSuccess(false); setTitle(""); setDescription(""); }}
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
          <CheckCircle2 className="h-4 w-4 text-primary" />
          New Task
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <WorkspaceSelector 
          value={targetWorkspaceId} 
          onChange={setTargetWorkspaceId} 
        />

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Assignee</label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

// --- Task Card ---

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const statusColors: Record<TaskStatus, string> = {
    "Todo": "bg-slate-100 text-slate-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "In Review": "bg-purple-100 text-purple-700",
    "Done": "bg-green-100 text-green-700",
    "Blocked": "bg-red-100 text-red-700",
  };

  const priorityColors: Record<TaskPriority, string> = {
    "Low": "text-slate-500",
    "Medium": "text-blue-500",
    "High": "text-orange-500",
    "Critical": "text-red-500",
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {task.key}
              </span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider", statusColors[task.status])}>
                {task.status}
              </span>
            </div>
            <h4 className="font-medium text-sm text-foreground leading-tight">
              {task.title}
            </h4>
          </div>
          {task.priority && (
            <AlertCircle className={cn("h-4 w-4 shrink-0", priorityColors[task.priority])} />
          )}
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.owner && (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{task.owner}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Task Editor ---

interface TaskEditorProps {
  taskId: string;
}

export function TaskEditor({ taskId }: TaskEditorProps) {
  const { currentWorkspaceId, workspaces, updateTask } = useAppStore();
  
  const workspace = workspaces.find(w => w.id === currentWorkspaceId);
  const task = workspace?.tasks.find(t => t.id === taskId || t.key === taskId);
  const teamMembers = workspace?.teamMembers || [];

  const [updates, setUpdates] = useState<Partial<Task>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!task || !currentWorkspaceId) {
    return (
      <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Task not found
      </div>
    );
  }

  const handleUpdate = (field: keyof Task, value: any) => {
    setUpdates(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    updateTask(currentWorkspaceId, task.id, updates);
    setIsSaving(false);
    setUpdates({});
    setIsExpanded(false);
  };

  const hasChanges = Object.keys(updates).length > 0;

  return (
    <div className="bg-card border border-border rounded-lg w-full max-w-sm overflow-hidden">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{task.key}</span>
          <span className="font-medium text-sm truncate max-w-[180px]">{task.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && <span className="h-2 w-2 rounded-full bg-blue-500" />}
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-border space-y-3 bg-muted/10 animate-in slide-in-from-top-2">
             <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <input
              value={updates.title ?? task.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={updates.status ?? task.status}
                onChange={(e) => handleUpdate('status', e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
              >
                {["Todo", "In Progress", "In Review", "Done", "Blocked"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
               <select
                value={updates.priority ?? task.priority ?? "Medium"}
                onChange={(e) => handleUpdate('priority', e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
              >
                {["Low", "Medium", "High", "Critical"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

           <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Assignee</label>
            <select
              value={updates.owner ?? task.owner ?? ""}
              onChange={(e) => handleUpdate('owner', e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
