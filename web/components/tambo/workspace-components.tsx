"use client";

import { useAppStore } from "@/lib/store";
import { 
  LayoutGrid, Users, Briefcase, ChevronRight, CheckCircle2,
  Calendar, Layers, CheckSquare, Trash2, Pencil, Save, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

// --- Workspace List ---

export function WorkspaceList() {
  const { workspaces, currentWorkspaceId, selectWorkspace, deleteWorkspace } = useAppStore();
  const router = useRouter();
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSwitch = async (id: string) => {
    setSwitchingId(id);
    await new Promise(resolve => setTimeout(resolve, 500)); // Fake delay
    selectWorkspace(id);
    router.push(`/${id}/backlog`);
    setSwitchingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent switching when deleting
    if (confirm("Are you sure you want to delete this workspace? This cannot be undone.")) {
      setDeletingId(id);
      await new Promise(resolve => setTimeout(resolve, 800));
      deleteWorkspace(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-md overflow-hidden flex flex-col">
      <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Your Workspaces
        </h3>
      </div>
      <div className="p-2 space-y-2">
        {workspaces.map((ws) => (
          <div 
             key={ws.id}
             onClick={() => handleSwitch(ws.id)}
             className={cn(
               "p-3 rounded-md border flex items-center justify-between cursor-pointer transition-all group",
               ws.id === currentWorkspaceId
                 ? "bg-primary/5 border-primary shadow-sm"
                 : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
             )}
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-md flex items-center justify-center text-white font-bold shadow-sm"
                style={{ backgroundColor: ws.color || '#0052CC' }}
              >
                {(ws.name || ws.title || "W").charAt(0).toUpperCase()}
              </div>
              <div>
                 <div className="font-medium text-sm flex items-center gap-2">
                   {ws.name}
                   {ws.id === currentWorkspaceId && (
                     <span className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">Current</span>
                   )}
                 </div>
                 <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ws.teamMembers?.length || 1}</span>
                    <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {ws.groups?.length || 0} Groups</span>
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {ws.id !== currentWorkspaceId && (
                 <button
                    onClick={(e) => handleDelete(e, ws.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Workspace"
                 >
                    {deletingId === ws.id ? (
                        <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                 </button>
               )}

               <div className="text-muted-foreground w-6 flex justify-center">
                  {switchingId === ws.id ? (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Workspace Card ---

interface WorkspaceCardProps {
  workspaceId: string;
}

export function WorkspaceCard({ workspaceId }: WorkspaceCardProps) {
  const { workspaces, selectWorkspace, updateWorkspace, deleteWorkspace } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    if (workspace) {
        setEditName(workspace.name || workspace.title);
        setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (workspace && editName.trim()) {
        updateWorkspace(workspace.id, { name: editName, title: editName });
        setIsEditing(false);
    }
  };

  const handleDelete = async () => {
     if (!workspace) return;
     if (workspaces.length <= 1) {
         alert("You cannot delete the only workspace.");
         return;
     }
     if (confirm(`Are you sure you want to delete workspace "${workspace.name}"?`)) {
         setDeleting(true);
         const nextWs = workspaces.find(w => w.id !== workspace.id);
         await new Promise(resolve => setTimeout(resolve, 800));
         deleteWorkspace(workspace.id);
         if (nextWs) {
             selectWorkspace(nextWs.id);
             // Let the store update handle the redirect implicitly or we force it:
             // router.push is imperative, store logic is reactive. 
             // Ideally store updates currentWorkspaceId, and components react.
         }
         // router.refresh() or similar might be needed if strictly routed.
     }
  };

  if (!workspace) {
    return (
       <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
        Workspace not found.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden">
      <div className="relative h-20 bg-muted">
         <div 
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{ backgroundColor: workspace.color || '#0052CC' }}
         />
      </div>
      <div className="px-5 pb-5">
         <div className="-mt-8 mb-3 flex justify-between items-end">
             <div 
                className="h-16 w-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-sm border-4 border-card"
                style={{ backgroundColor: workspace.color || '#0052CC' }}
              >
                {(workspace.name || workspace.title || "W").charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                 {!isEditing && (
                    <>
                        <button onClick={handleEdit} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Rename Workspace">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={handleDelete} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete Workspace">
                            {deleting ? <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                    </>
                 )}
                 <div className="px-2 py-1 bg-muted rounded-md text-xs font-medium border border-border">
                    {workspace.plan} Plan
                 </div>
              </div>
         </div>
         
         {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
                <input 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 text-lg font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                />
                <button onClick={handleSave} className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    <Save className="h-4 w-4" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80">
                    <X className="h-4 w-4" />
                </button>
            </div>
         ) : (
            <h2 className="text-xl font-bold">{workspace.name}</h2>
         )}
         <p className="text-sm text-muted-foreground mt-1">Key: <span className="font-mono bg-muted px-1 rounded">{workspace.key}</span></p>
         
         <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="p-3 rounded-md bg-muted/40 border border-border flex flex-col items-center">
                <CheckSquare className="h-5 w-5 text-green-600 mb-1" />
                <span className="text-2xl font-bold text-foreground">{workspace.tasks?.length || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Tasks</span>
            </div>
            <div className="p-3 rounded-md bg-muted/40 border border-border flex flex-col items-center">
                <Users className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-2xl font-bold text-foreground">{workspace.teamMembers?.length || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Members</span>
            </div>
            <div className="p-3 rounded-md bg-muted/40 border border-border flex flex-col items-center">
                <Calendar className="h-5 w-5 text-purple-600 mb-1" />
                <span className="text-2xl font-bold text-foreground">{workspace.sprints?.length || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Sprints</span>
            </div>
            <div className="p-3 rounded-md bg-muted/40 border border-border flex flex-col items-center">
                <Layers className="h-5 w-5 text-orange-600 mb-1" />
                <span className="text-2xl font-bold text-foreground">{workspace.groups?.length || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Groups</span>
            </div>
         </div>

         <button 
           onClick={() => router.push(`/${workspace.id}/backlog`)}
           className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
         >
           Open Workspace
         </button>
      </div>
    </div>
  );
}
