"use client";

import { PageType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FileText, Kanban, Table, X } from "lucide-react";
import { useState } from "react";

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: PageType) => void;
}

const PAGE_TYPES: { type: PageType; label: string; icon: React.ElementType; description: string }[] = [
  { 
    type: 'table', 
    label: 'Table', 
    icon: Table, 
    description: 'Manage tasks in a structured spreadsheet-like view.' 
  },
  { 
    type: 'board', 
    label: 'Board', 
    icon: Kanban, 
    description: 'Visualize work items on a Kanban board.' 
  },
  { 
    type: 'document', 
    label: 'Document', 
    icon: FileText, 
    description: 'Write specifications, notes, and documentation.' 
  },
];

export function CreatePageModal({ isOpen, onClose, onSubmit }: CreatePageModalProps) {
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<PageType>('table');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title, selectedType);
      setTitle("");
      setSelectedType('table');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-border-subtle rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">Create New Page</h2>
        <p className="text-sm text-zinc-500 mb-6">Add a new page to your workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Page Title</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Q1 Roadmap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-surface-elevated border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700">Page Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PAGE_TYPES.map((item) => (
                <div
                  key={item.type}
                  onClick={() => setSelectedType(item.type)}
                  className={cn(
                    "cursor-pointer p-3 rounded-xl border transition-all flex flex-col items-center text-center gap-2",
                    selectedType === item.type
                      ? "bg-accent-primary/5 border-accent-primary ring-1 ring-accent-primary"
                      : "bg-surface-elevated border-border-subtle hover:border-border-highlight"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedType === item.type ? "bg-accent-primary text-white" : "bg-white text-zinc-500"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className={cn("text-xs font-semibold", selectedType === item.type ? "text-accent-primary" : "text-foreground")}>
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2 bg-accent-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
