"use client";

import { useAppStore } from "@/lib/store";
import { Plus, LayoutGrid, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const { workspaces, createWorkspace, selectWorkspace } = useAppStore();
  const router = useRouter();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
      setIsCreating(false);
    }
  };

  const handleSelect = (id: string) => {
    selectWorkspace(id);
    router.push(`/${id}`);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                <LayoutGrid className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-heading font-bold tracking-tight">Welcome to ForgeAI</h1>
            <p className="text-slate-500 text-lg">Select a workspace to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              className="group relative bg-surface p-6 rounded-2xl border border-border-subtle hover:border-accent-primary/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                 <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-accent-primary font-bold text-lg group-hover:bg-accent-primary group-hover:text-white transition-colors">
                    {ws.title.charAt(0)}
                 </div>
                 {ws.plan === 'Pro' && (
                     <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold uppercase tracking-wider border border-indigo-100">
                         PRO
                     </span>
                 )}
              </div>
              
              <h3 className="text-xl font-bold mb-1">{ws.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{ws.groups.length} Groups • {ws.groups.reduce((acc, g) => acc + g.pages.length, 0)} Pages</p>
              
              <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-accent-primary transition-colors">
                  Open Workspace <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          ))}

          {/* Create New Card */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="bg-surface p-6 rounded-2xl border border-dashed border-border-highlight flex flex-col justify-center gap-4">
              <input
                autoFocus
                placeholder="Workspace Name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full bg-surface-elevated px-4 py-2 rounded-lg border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              />
              <div className="flex gap-2">
                 <button type="submit" className="flex-1 bg-accent-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Create</button>
                 <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-surface-elevated border border-dashed border-border-highlight p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-accent-primary hover:border-accent-primary/30 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Create New Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
