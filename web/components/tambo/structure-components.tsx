"use client";

import { useState } from "react";
import { useAppStore, PageType, Group } from "@/lib/store";
import { 
  FilePlus, 
  FolderPlus, 
  Loader2, 
  Layout, 
  List, 
  FileText, 
  BarChart, 
  Calendar,
  GanttChartIcon,
  Map,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "@/components/tambo/workspace-selector";

// --- Page Creator ---

interface PageCreatorProps {
  defaultTitle?: string;
}

export function PageCreator({ defaultTitle = "" }: PageCreatorProps) {
  const { currentWorkspaceId, workspaces, addPage, addGroup } = useAppStore();
  const [title, setTitle] = useState(defaultTitle);
  const [type, setType] = useState<PageType>("board");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(currentWorkspaceId || (workspaces[0]?.id ?? ""));
  const [groupId, setGroupId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const workspace = workspaces.find(w => w.id === targetWorkspaceId);
  const groups = workspace?.groups || [];

  // If no group is selected and groups exist, select the first one by default
  if (!groupId && groups.length > 0) {
    setGroupId(groups[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId || !title.trim()) return;

    let targetGroupId = groupId;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    // If no group exists or selected, create a default "General" group first
    if (!targetGroupId) {
       // Fallback logic handled by UI validation or store if needed
    }

    if (targetGroupId) {
        addPage(targetWorkspaceId, targetGroupId, title, type);
        setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };

  const typeIcons: Record<PageType, React.ReactNode> = {
    board: <Layout className="h-4 w-4" />,
    table: <List className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    gantt: <GanttChartIcon className="h-4 w-4" />,
    roadmap: <Map className="h-4 w-4" />,
    calendar: <Calendar className="h-4 w-4" />,
    chart: <BarChart className="h-4 w-4" />,
    list: <List className="h-4 w-4" />
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-green-700 animate-in fade-in zoom-in duration-300">
        <FilePlus className="h-8 w-8 text-green-600 mb-2" />
        <p className="font-medium">Page Created!</p>
        <button 
          onClick={() => { setIsSuccess(false); setTitle(""); }}
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
          <FilePlus className="h-4 w-4 text-primary" />
          Create New Page
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <WorkspaceSelector 
          value={targetWorkspaceId} 
          onChange={(newId) => {
            setTargetWorkspaceId(newId);
            setGroupId(""); // Reset group on workspace change
          }} 
        />

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Page Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Roadmap"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(typeIcons) as PageType[]).map((t) => (
               <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-md border transition-all text-[10px] capitalize",
                  type === t 
                    ? "bg-primary/10 border-primary text-primary font-medium" 
                    : "bg-background border-border hover:bg-muted text-muted-foreground"
                )}
                title={t}
              >
                {typeIcons[t]}
                <span className="truncate w-full text-center">{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Folder / Group</label>
           <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
            >
               {groups.length === 0 && <option value="">No groups found. Create one first.</option>}
               {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting || !groupId}
           className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Page"}
        </button>
      </form>
    </div>
  );
}

// --- Group Creator ---

export function GroupCreator() {
  const { currentWorkspaceId, workspaces, addGroup } = useAppStore();
  const [title, setTitle] = useState("");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(currentWorkspaceId || (workspaces[0]?.id ?? ""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId || !title.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    addGroup(targetWorkspaceId, title, "Folder"); // Default icon

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
       <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-green-700 animate-in fade-in zoom-in duration-300">
        <FolderPlus className="h-8 w-8 text-green-600 mb-2" />
        <p className="font-medium">Group Created!</p>
        <button 
          onClick={() => { setIsSuccess(false); setTitle(""); }}
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
          <FolderPlus className="h-4 w-4 text-primary" />
          New Group/Folder
        </h3>
      </div>
       <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <WorkspaceSelector 
          value={targetWorkspaceId} 
          onChange={setTargetWorkspaceId} 
        />
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Group Name</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Marketing, Development..."
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
           className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Group"}
        </button>
      </form>
    </div>
  );
}

// --- Doc Editor ---

interface DocEditorProps {
  pageId?: string;
}

export function DocEditor({ pageId }: DocEditorProps) {
  const { currentWorkspaceId, workspaces, updatePage } = useAppStore();
  
  // Helper to find page and its group
  const findPageData = () => {
    if (!pageId) return null;
    const ws = workspaces.find(w => w.id === currentWorkspaceId);
    if (!ws) return null;
    
    for (const group of ws.groups) {
      const page = group.pages.find(p => p.id === pageId);
      if (page) return { page, group };
    }
    return null;
  };

  const data = findPageData();
  
  const [content, setContent] = useState(data?.page.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  if (!data && pageId) {
    return (
      <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
        <Loader2 className="h-4 w-4" />
        Page not found or loading...
      </div>
    );
  }

  // Handle case where no pageId is provided - effectively "New Draft" mode or similar, 
  // but since we need a page to save to, we might just show a placeholder or let them select.
  // For now, simpler: if no pageId, we can't edit.
  if (!pageId) {
      return (
        <div className="p-4 rounded-md bg-muted text-sm text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">No document selected</p>
            <p className="text-xs text-muted-foreground mt-1">Please specify which document you want to edit.</p>
        </div>
      );
  }

  // Ensure data exists before destructuring (TypeScript safety)
  if (!data) return null;

  const { page, group } = data;

  const handleSave = async () => {
    if (!currentWorkspaceId) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updatePage(currentWorkspaceId, group.id, page.id, { content });
    
    setIsSaving(false);
    setLastSaved(new Date());
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-md overflow-hidden flex flex-col">
      <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium text-sm leading-none">{page.title}</span>
            <span className="text-[10px] text-muted-foreground mt-1">in {group.title}</span>
          </div>
        </div>
        {lastSaved && (
          <span className="text-[10px] text-green-600 flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (lastSaved) setLastSaved(null);
          }}
          placeholder="Start writing..."
          className="w-full h-48 p-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono leading-relaxed"
        />
        
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">Markdown supported</p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Content"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
